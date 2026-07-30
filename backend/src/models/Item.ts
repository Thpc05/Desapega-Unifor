import { Schema, model } from 'mongoose';
import { ITEM_CATEGORIES, type ItemCategory } from '../constants/categories';

/**
 * Interface do item.
 *
 * `_id` agora é uma STRING composta e legível: `<matricula_do_dono>i<n>`
 * (ex.: "2312345i1", "2312345i2"). O `n` vem do contador `itens_anunciados` do
 * usuário, incrementado atomicamente. Assim o próprio id já diz quem criou e qual
 * a ordem — e as referências (owner/buyer) são a matrícula (string).
 */
/** Cada imagem guarda a URL (para exibir) e o public_id (para deletar do Cloudinary). */
export interface IItemImage {
  url: string;
  publicId: string;
}

export interface IItem {
  _id: string;
  title: string;
  description: string;
  category: ItemCategory;
  type: 'sale' | 'donation';
  price?: number;
  images: IItemImage[];
  status: 'available' | 'reserved' | 'concluded';
  owner: string;           // matrícula do dono
  buyer?: string | null;   // matrícula do comprador; null em doação/enquanto não concluído
  concludedAt?: Date;
}

// Subdocumento das imagens. _id:false = cada imagem não ganha um _id próprio.
const imageSchema = new Schema<IItemImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false },
);

const itemSchema = new Schema<IItem>(
  {
    _id: { type: String, required: true }, // gerado no service: <matricula>i<n>
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, enum: ITEM_CATEGORIES, required: true },
    type: { type: String, enum: ['sale', 'donation'], required: true },
    price: {
      type: Number,
      min: 0,
      required: function (this: IItem) {
        return this.type === 'sale';
      },
    },
    images: { type: [imageSchema], default: [] },
    status: {
      type: String,
      enum: ['available', 'reserved', 'concluded'],
      default: 'available',
    },
    owner: { type: String, ref: 'User', required: true },
    buyer: { type: String, ref: 'User', default: null },
    concludedAt: { type: Date },
  },
  { timestamps: true },
);

export const Item = model<IItem>('Item', itemSchema);
