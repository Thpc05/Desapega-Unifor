import { z } from 'zod';

/**
 * Validação da criação de avaliação: POST /api/item/:id/reviews
 */
export const createReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid ID'),
  }),
  body: z.object({
    xpRating: z
      .number()
      .min(0, 'Minimum rating is 0')
      .max(5, 'Maximum rating is 5'),
    comment: z.string().max(500).optional(),
    visibility: z.enum(['public', 'private']).optional(),
  }),
});
