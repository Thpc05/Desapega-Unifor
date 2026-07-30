import { z } from 'zod';

/**
 * Validação do DELETE /api/image — precisa do public_id para saber o que apagar.
 * (O upload em si não usa Zod: o arquivo vem via multer, não como JSON.)
 */
export const deleteImageSchema = z.object({
  body: z.object({
    publicId: z.string().min(1, 'publicId is required'),
  }),
});
