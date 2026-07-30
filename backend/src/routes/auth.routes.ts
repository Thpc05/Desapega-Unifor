import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authRequired } from '../middlewares/auth.middleware';
import { registerSchema, loginSchema } from '../schemas/auth.schema';

const router = Router();

// Públicas
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Protegida: só passa quem tiver token válido (authRequired antes do controller).
router.get('/me', authRequired, authController.me);

export default router;
