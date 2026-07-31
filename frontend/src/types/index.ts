/**
 * Tipos do frontend — espelham o que o backend devolve (o "contrato" da API).
 */
export type ItemCategory =
  | 'StudyMaterial'
  | 'Electronics'
  | 'Peripherals'
  | 'Apparel'
  | 'Other';

export type ItemType = 'sale' | 'donation';
export type ItemStatus = 'available' | 'reserved' | 'concluded';

export interface ItemImage {
  url: string;
  publicId: string;
}

/**
 * Dono "populado": nas listagens/detalhe o backend troca a matrícula do owner
 * pelos dados básicos (via .populate). Em outras respostas owner é só a matrícula.
 */
export interface OwnerRef {
  _id: string;
  name: string;
  xp: number;
  avgXpRating?: number;
  course?: string;
  semester?: number;
  bio?: string;
}

export interface Item {
  _id: string;
  title: string;
  description: string;
  category: ItemCategory;
  type: ItemType;
  price?: number;
  images: ItemImage[];
  status: ItemStatus;
  owner: string | OwnerRef; // string quando não populado; OwnerRef nas listagens/detalhe
  buyer?: string | UserRef | null; // populado {name} no detalhe quando concluído
  concludedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  matricula: string;
  name: string;
  bio?: string;
  email?: string;
  phone?: string;
  course?: string;
  semester?: number;
  xp: number;
  avgXpRating: number;
  xpRatingCount: number;
}

export interface Review {
  _id: string;
  visibility: 'public' | 'private';
  item: string | { _id: string; title: string };
  reviewer: string | UserRef; // populado {_id, name}
  reviewee: string | UserRef;
  xpRating: number;
  comment?: string;
  createdAt?: string;
}

export interface PublicProfile {
  matricula: string;
  name: string;
  bio?: string;
  course?: string;
  semester?: number;
  phone?: string;
  xp: number;
  level: number;
  avgXpRating: number;
  xpRatingCount: number;
  salesCount: number;
  donationCount: number;
  createdAt?: string;
  reviews: Review[];
}

/** Referência a um usuário populado (só _id + nome). */
export interface UserRef {
  _id: string;
  name: string;
}

export interface Conversation {
  _id: string;
  item: string | { _id: string; title: string; status: ItemStatus };
  buyer: string | UserRef;
  seller: string | UserRef;
  lastMessageAt?: string;
  lastMessagePreview?: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: string;
  text: string;
  readAt?: string | null;
  createdAt: string;
}
