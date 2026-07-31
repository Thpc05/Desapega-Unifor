import { api } from './client';
import type { Review } from '../types';

export interface CreateReviewInput {
  xpRating: number; // 0..5
  comment?: string;
  visibility?: 'public' | 'private';
}

export const reviewsApi = {
  /** Avaliações de um negócio (0 a 2), com os nomes das partes. */
  async listForItem(itemId: string): Promise<Review[]> {
    const { data } = await api.get<Review[]>(`/item/${itemId}/reviews`);
    return data;
  },

  /** Cria a avaliação da contraparte. Devolve { review, grantedXp }. */
  async create(itemId: string, input: CreateReviewInput): Promise<{ review: Review; grantedXp: boolean }> {
    const { data } = await api.post<{ review: Review; grantedXp: boolean }>(
      `/item/${itemId}/reviews`,
      input,
    );
    return data;
  },
};
