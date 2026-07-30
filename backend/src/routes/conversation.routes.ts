import { Router } from 'express';
import { conversationController } from '../controllers/conversation.controller';
import { validate } from '../middlewares/validate.middleware';
import { authRequired } from '../middlewares/auth.middleware';
import {
  conversationIdSchema,
  sendMessageSchema,
} from '../schemas/conversation.schema';

const router = Router();

// Todas as rotas de conversa exigem login.
router.get('/', authRequired, conversationController.listInbox);
router.get(
  '/:id/messages',
  authRequired,
  validate(conversationIdSchema),
  conversationController.listMessages,
);
router.post(
  '/:id/messages',
  authRequired,
  validate(sendMessageSchema),
  conversationController.sendMessage,
);

export default router;
