import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authRequired } from '../middlewares/auth.middleware';
import { registerSchema, loginSchema } from '../schemas/auth.schema';

const router = Router();

/**
 * RATE LIMIT nas rotas sensíveis (login/registro): no máximo 10 tentativas por
 * IP a cada 15 minutos. Freia força-bruta de senha e criação em massa de contas.
 * (O IP real vem do proxy do Render — ver app.set('trust proxy', 1) no app.ts.)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 10,                // 10 requisições por IP na janela
  standardHeaders: true,    // manda os headers RateLimit-* (padrão)
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again later.' },
});

// Públicas (com limite de tentativas)
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// Protegida: só passa quem tiver token válido (authRequired antes do controller).
router.get('/me', authRequired, authController.me);

export default router;
