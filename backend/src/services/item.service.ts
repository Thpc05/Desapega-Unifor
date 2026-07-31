import { FilterQuery } from 'mongoose';
import { Item, IItem } from '../models/Item';
import { User } from '../models/User';
import { xpForSeller, xpForBuyer } from '../utils/xp';
import { deleteImage } from '../utils/cloudinary';

/**
 * SERVICE = regra de negócio, sem HTTP. Recebe dados limpos e conversa com o banco.
 */

interface ListFilters {
  category?: string;
  type?: string;
  owner?: string;
}

export const itemService = {
  /**
   * Cria um anúncio gerando o _id composto `<matricula>i<n>`.
   *
   * O `n` vem de um INCREMENTO ATÔMICO do contador do usuário: usamos
   * findByIdAndUpdate com $inc e { new: true } para receber o valor JÁ somado.
   * Isso é seguro contra concorrência — dois anúncios simultâneos recebem números
   * diferentes (não dá para dois lerem "o mesmo" antes de somar).
   */
  async create(data: Partial<IItem>, ownerMatricula: string) {
    const owner = await User.findByIdAndUpdate(
      ownerMatricula,
      { $inc: { itens_anunciados: 1 } },
      { new: true },
    );
    if (!owner) throw { status: 404, message: 'User not found' };

    const n = owner.itens_anunciados;
    const _id = `${ownerMatricula}i${n}`;

    return Item.create({ ...data, _id, owner: ownerMatricula });
  },

  /** Vitrine pública: só itens disponíveis (filtros opcionais por categoria/tipo). */
  async listAvailable(filters: ListFilters) {
    const query: FilterQuery<IItem> = { status: 'available' };
    if (filters.category) query.category = filters.category;
    if (filters.type) query.type = filters.type;
    if (filters.owner) query.owner = filters.owner;
    // populate('owner', ...) troca a matrícula do dono pelos campos escolhidos
    // (nome, XP, nota) — o card da vitrine precisa disso sem um 2º request por item.
    return Item.find(query).sort({ createdAt: -1 }).populate('owner', 'name xp avgXpRating avatarUrl');
  },

  /** Anúncios ATIVOS do usuário (disponível/reservado) — tela "Meus anúncios". */
  async listMineActive(matricula: string) {
    return Item.find({ owner: matricula, status: { $ne: 'concluded' } }).sort({ createdAt: -1 });
  },

  /**
   * Negócios concluídos DO usuário: só itens concluídos em que ele foi o vendedor
   * (owner) OU o comprador (buyer). Usado na área logada.
   */
  async listConcludedForUser(matricula: string) {
    return Item.find({
      status: 'concluded',
      $or: [{ owner: matricula }, { buyer: matricula }],
    }).sort({ concludedAt: -1 });
  },

  async findById(id: string) {
    return Item.findById(id);
  },

  /**
   * Igual ao findById, mas com o dono POPULADO (nome, XP, curso...) para a tela
   * de detalhe. Separado do findById porque as checagens de posse (update/remove)
   * comparam `owner` como matrícula (string) — popular ali quebraria a comparação.
   */
  async findByIdPopulated(id: string) {
    return Item.findById(id)
      .populate('owner', 'name xp avgXpRating course semester bio avatarUrl')
      .populate('buyer', 'name'); // null se não concluído/doação
  },

  async update(id: string, data: Partial<IItem>) {
    // Se o update mexe nas imagens, apagamos do Cloudinary as que foram REMOVIDAS
    // (estavam antes e não estão mais) — evita imagens órfãs ocupando a conta.
    if (data.images) {
      const existing = await Item.findById(id).select('images');
      if (existing) {
        const keptIds = new Set(data.images.map((img) => img.publicId));
        const removed = existing.images.filter((img) => !keptIds.has(img.publicId));
        await Promise.all(removed.map((img) => deleteImage(img.publicId)));
      }
    }
    return Item.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  async remove(id: string) {
    const item = await Item.findByIdAndDelete(id);
    // Ao apagar o anúncio, apaga também as imagens dele do Cloudinary.
    if (item && item.images.length > 0) {
      await Promise.all(item.images.map((img) => deleteImage(img.publicId)));
    }
    return item;
  },

  /**
   * CONCLUIR NEGÓCIO — aplica XP e históricos.
   * - Só o dono conclui; só se ainda não estiver concluído.
   * - Venda: pode ter comprador identificado (buyerMatricula) ou não.
   * - Doação: receptor sempre anônimo (buyer = null).
   */
  async conclude(itemId: string, ownerMatricula: string, buyerMatricula?: string) {
    const item = await Item.findById(itemId);
    if (!item) throw { status: 404, message: 'Item not found' };

    if (item.owner !== ownerMatricula) {
      throw { status: 403, message: 'This item is not yours' };
    }
    if (item.status === 'concluded') {
      throw { status: 400, message: 'This deal is already concluded' };
    }

    const isSale = item.type === 'sale';
    const buyerIdentified = isSale && !!buyerMatricula;

    if (buyerIdentified) {
      if (buyerMatricula === ownerMatricula) {
        throw { status: 400, message: 'You cannot be the buyer of your own item' };
      }
      const buyer = await User.findById(buyerMatricula);
      if (!buyer) throw { status: 404, message: 'Buyer not found' };
    }

    // 1) Marca como concluído.
    item.status = 'concluded';
    item.buyer = buyerIdentified ? buyerMatricula! : null;
    item.concludedAt = new Date();
    await item.save();

    // ANTI-FARM (mesma regra da avaliação): se este par (vendedor↔comprador) já
    // concluiu OUTRO negócio nos últimos 30 dias, a conclusão NÃO concede XP —
    // impede dois amigos de "vender" um pro outro em loop só pra farmar pontos.
    // O histórico ainda é registrado; só o XP é bloqueado.
    const grantsXp = buyerIdentified
      ? !(await hadRecentDealBetween(ownerMatricula, buyerMatricula!, itemId))
      : true;

    // 2) Histórico (+ XP se permitido) do VENDEDOR/DOADOR.
    const sellerHistoryField = isSale ? 'salesHistory' : 'donationHistory';
    const sellerUpdate: Record<string, unknown> = { $push: { [sellerHistoryField]: item._id } };
    if (grantsXp) sellerUpdate.$inc = { xp: xpForSeller(item.type, buyerIdentified) };
    await User.findByIdAndUpdate(ownerMatricula, sellerUpdate);

    // 3) Histórico (+ XP se permitido) do COMPRADOR (só venda identificada).
    if (buyerIdentified) {
      const buyerUpdate: Record<string, unknown> = { $push: { purchaseHistory: item._id } };
      if (grantsXp) buyerUpdate.$inc = { xp: xpForBuyer(item.type, buyerIdentified) };
      await User.findByIdAndUpdate(buyerMatricula, buyerUpdate);
    }

    return item;
  },
};

/**
 * Houve OUTRO negócio concluído entre esse par nos últimos 30 dias?
 * (Mesma janela anti-farm usada na avaliação — ver review.service.)
 */
const ANTI_FARM_DAYS = 30;
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
