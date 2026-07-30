import { z } from 'zod';
import { UNIFOR_COURSES } from '../constants/courses';

/**
 * Validação da edição do próprio perfil: PATCH /api/users/me
 * Todos os campos são opcionais (o usuário edita só o que quiser). matricula e
 * senha NÃO entram aqui de propósito.
 */
export const updateMeSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    bio: z.string().max(300).optional(),
    email: z.string().email('Invalid email').optional(),
    phone: z.string().min(1).optional(),
    course: z.enum(UNIFOR_COURSES).optional(),
    semester: z.number().int().min(0).max(10).optional(),
  }),
});

// Validação de rota que recebe :id (matrícula) de usuário (GET /api/user/:id)
export const userIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid ID'),
  }),
});
