import { Schema, model } from 'mongoose';
import { UNIFOR_COURSES, type UniforCourse } from '../constants/courses';

/**
 * Interface do usuário.
 *
 * MUDANÇA IMPORTANTE: o `_id` do usuário agora é a PRÓPRIA MATRÍCULA (uma string),
 * não mais o ObjectId aleatório do Mongo. Como a matrícula da Unifor já é pública e
 * única, ela serve de identidade natural — URLs e referências ficam legíveis
 * (`/api/user/2312345`) e a matrícula é inerentemente imutável (o _id não muda).
 *
 * Por isso as referências (owner, buyer, reviewer...) agora são `string` (a matrícula
 * ou o id composto do item), não `ObjectId`.
 */
export interface IUser {
  _id: string; // = matrícula
  name: string;
  bio?: string;
  avatarUrl?: string; // foto de perfil (URL do Cloudinary)
  email: string;
  phone: string;
  passwordHash: string;
  course?: UniforCourse;
  semester?: number;

  // Contador usado para gerar o _id dos itens (<matricula>i<n>). Incrementado
  // atomicamente a cada anúncio criado — nunca decresce (evita reusar id).
  itens_anunciados: number;

  // XP / reputação (tema)
  xp: number;
  avgXpRating: number;
  xpRatingCount: number;
  xpRatingHistory: string[]; // ids de reviews recebidas
  purchaseHistory: string[]; // ids de itens comprados
  salesHistory: string[];    // ids de itens vendidos
  donationHistory: string[]; // ids de itens doados (só doações FEITAS)
}

const userSchema = new Schema<IUser>(
  {
    // _id como String = matrícula. Precisamos informá-lo na criação (não é gerado).
    _id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    bio: { type: String, trim: true },
    avatarUrl: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    course: { type: String, enum: UNIFOR_COURSES },
    semester: { type: Number, min: 0, max: 10 },

    itens_anunciados: { type: Number, default: 0 },

    xp: { type: Number, default: 0 },
    avgXpRating: { type: Number, default: 0, min: 0, max: 5 },
    xpRatingCount: { type: Number, default: 0 },
    // Refs agora são String (apontam para _id String de Review/Item).
    xpRatingHistory: [{ type: String, ref: 'Review' }],
    purchaseHistory: [{ type: String, ref: 'Item' }],
    salesHistory: [{ type: String, ref: 'Item' }],
    donationHistory: [{ type: String, ref: 'Item' }],
  },
  { timestamps: true },
);

export const User = model<IUser>('User', userSchema);
