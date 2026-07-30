import { Schema, model } from 'mongoose';

/**
 * Review = avaliação de uma VENDA concluída. Bilateral (comprador e vendedor
 * podem avaliar um ao outro).
 *
 * `_id` agora é composto: `<id_do_item>r<matricula_do_avaliador>`
 * (ex.: "2312345i1r2398765"). Vantagem: como o par (item + avaliador) está no
 * próprio _id, o MongoDB já IMPEDE avaliação duplicada de graça — não precisamos
 * mais de um índice único separado.
 */
export interface IReview {
  _id: string;
  visibility: 'public' | 'private';
  item: string;      // id do item
  reviewer: string;  // matrícula de quem avaliou
  reviewee: string;  // matrícula de quem foi avaliado (recebe XP/rating)
  xpRating: number;  // 0 a 5
  comment?: string;
}

const reviewSchema = new Schema<IReview>(
  {
    _id: { type: String, required: true }, // gerado no service: <itemId>r<matricula>
    visibility: { type: String, enum: ['public', 'private'], default: 'public' },
    item: { type: String, ref: 'Item', required: true },
    reviewer: { type: String, ref: 'User', required: true },
    reviewee: { type: String, ref: 'User', required: true },
    xpRating: { type: Number, required: true, min: 0, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true },
);

export const Review = model<IReview>('Review', reviewSchema);
