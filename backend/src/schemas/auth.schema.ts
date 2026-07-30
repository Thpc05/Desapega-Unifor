import { z } from 'zod';
import { UNIFOR_COURSES } from '../constants/courses';

/**
 * Validação das requisições de autenticação.
 * O registro exige os campos obrigatórios do usuário; os opcionais podem faltar.
 */
export const registerSchema = z.object({
  body: z.object({
    matricula: z.string().min(1, 'Enrollment ID is required'),
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(1, 'Phone is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    // Opcionais
    bio: z.string().optional(),
    course: z.enum(UNIFOR_COURSES).optional(),
    semester: z.number().int().min(0).max(10).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    matricula: z.string().min(1, 'Enrollment ID is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});
