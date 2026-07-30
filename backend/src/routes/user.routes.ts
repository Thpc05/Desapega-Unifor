import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { validate } from '../middlewares/validate.middleware';
import { authRequired } from '../middlewares/auth.middleware';
import { updateMeSchema, userIdSchema } from '../schemas/user.schema';

const router = Router();

// IMPORTANTE: /me precisa vir ANTES de /:id, senão o Express trataria "me" como
// se fosse um :id. A ordem das rotas importa.
router.patch('/me', authRequired, validate(updateMeSchema), userController.updateMe);

// Perfil público (qualquer um vê).
router.get('/:id', validate(userIdSchema), userController.getPublicProfile);

export default router;
