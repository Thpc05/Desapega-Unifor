import { Review } from '../models/Review';
import { Item } from '../models/Item';
import { User } from '../models/User';
import { xpFromRating, computeAvgRating } from '../utils/xp';

interface CreateReviewInput {
  itemId: string;
  reviewerMatricula: string;
  xpRating: number;
  comment?: string;
  visibility?: 'public' | 'private';
}

/**
 * Janela anti-farm: se o par já concluiu OUTRO negócio nos últimos 30 dias, a
 * avaliação pode ser feita, mas NÃO concede XP (evita farm de reputação).
 */
const ANTI_FARM_DAYS = 30;

export const reviewService = {
  async create(input: CreateReviewInput) {
    const { itemId, reviewerMatricula, xpRating, comment, visibility } = input;

    // 1) Item precisa existir, ser VENDA e estar CONCLUÍDO com comprador.
    const item = await Item.findById(itemId);
    if (!item) throw { status: 404, message: 'Item not found' };
    if (item.type !== 'sale') {
      throw { status: 400, message: 'Only sales can be reviewed' };
    }
    if (item.status !== 'concluded' || !item.buyer) {
      throw { status: 400, message: 'Only concluded deals can be reviewed' };
    }

    // 2) Avaliador precisa ser parte do negócio; a contraparte é o avaliado.
    const ownerMatricula = item.owner;
    const buyerMatricula = item.buyer;
    let revieweeMatricula: string;

    if (reviewerMatricula === ownerMatricula) {
      revieweeMatricula = buyerMatricula;
    } else if (reviewerMatricula === buyerMatricula) {
      revieweeMatricula = ownerMatricula;
    } else {
      throw { status: 403, message: 'You did not take part in this deal' };
    }

    // 3) _id composto = <itemId>r<matricula_do_avaliador>. Já garante 1 review por
    //    par (item, avaliador). Checamos antes para dar erro amigável (409).
    const reviewId = `${itemId}r${reviewerMatricula}`;
    const already = await Review.findById(reviewId);
    if (already) {
      throw { status: 409, message: 'You already reviewed this deal' };
    }

    // 4) Cria a avaliação.
    const review = await Review.create({
      _id: reviewId,
      item: itemId,
      reviewer: reviewerMatricula,
      reviewee: revieweeMatricula,
      xpRating,
      comment,
      visibility: visibility ?? 'public',
    });

    // 5) Anti-farm: houve OUTRO negócio concluído entre o par nos últimos 30 dias?
    const grantsXp = !(await hadRecentDealBetween(
      ownerMatricula,
      buyerMatricula,
      itemId,
    ));

    // 6) Recalcula a média do avaliado e, se permitido, aplica o XP.
    await applyReviewToReviewee(revieweeMatricula, reviewId, xpRating, grantsXp);

    return { review, grantedXp: grantsXp };
  },
};

async function hadRecentDealBetween(
  userA: string,
  userB: string,
  currentItemId: string,
): Promise<boolean> {
  const since = new Date(Date.now() - ANTI_FARM_DAYS * 24 * 60 * 60 * 1000);
  const other = await Item.findOne({
    _id: { $ne: currentItemId },
    status: 'concluded',
    concludedAt: { $gte: since },
    $or: [
      { owner: userA, buyer: userB },
      { owner: userB, buyer: userA },
    ],
  });
  return other !== null;
}

async function applyReviewToReviewee(
  revieweeMatricula: string,
  reviewId: string,
  stars: number,
  grantsXp: boolean,
) {
  const reviews = await Review.find({ reviewee: revieweeMatricula }).select('xpRating');
  const ratings = reviews.map((r) => r.xpRating);
  const { avg, count } = computeAvgRating(ratings);

  const update: Record<string, unknown> = {
    $set: { avgXpRating: avg, xpRatingCount: count },
    $push: { xpRatingHistory: reviewId },
  };
  if (grantsXp) {
    update.$inc = { xp: xpFromRating(stars) };
  }

  await User.findByIdAndUpdate(revieweeMatricula, update);
}
