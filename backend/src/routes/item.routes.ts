import { Router } from 'express';
import { itemController } from '../controllers/item.controller';
import { validate } from '../middlewares/validate.middleware';
import { authRequired, authOptional } from '../middlewares/auth.middleware';
import {
  createItemSchema,
  updateItemSchema,
  concludeItemSchema,
  itemIdSchema,
} from '../schemas/item.schema';
import { reviewController } from '../controllers/review.controller';
import { createReviewSchema } from '../schemas/review.schema';
import { conversationController } from '../controllers/conversation.controller';

/**
 * ROUTES = o "mapa" que liga cada URL + método HTTP ao seu controller.
 *
 * A ordem de leitura de uma rota como:
 *     router.post('/', validate(createItemSchema), itemController.create)
 * é: chegou um POST em "/" -> roda o middleware validate -> se passar, roda o
 * controller.create. É uma "fila" de funções que a requisição atravessa.
 */
const router = Router();

// IMPORTANTE: rotas de caminho FIXO (/available, /concluded) precisam vir ANTES de
// /:id, senão o Express trataria "available" como se fosse um :id.

// Vitrine pública: só itens disponíveis.
router.get('/available', itemController.listAvailable);

// Concluídos DO usuário logado (vendeu ou comprou) — protegida.
router.get('/concluded', authRequired, itemController.listConcluded);

// Anúncios ATIVOS do usuário logado — protegida.
router.get('/mine', authRequired, itemController.listMine);

// Detalhe de um item (público).
router.get('/:id', validate(itemIdSchema), itemController.getById);

// Rotas de ESCRITA exigem login: authRequired roda antes de validar/criar.
// A ordem é: authRequired -> validate -> controller.
router.post('/', authRequired, validate(createItemSchema), itemController.create);
router.patch('/:id', authRequired, validate(updateItemSchema), itemController.update);
router.delete('/:id', authRequired, validate(itemIdSchema), itemController.remove);

// Concluir negócio (aplica XP + históricos).
router.post('/:id/conclude', authRequired, validate(concludeItemSchema), itemController.conclude);

// Listar as avaliações de um negócio (público; privadas só p/ participantes → authOptional).
router.get('/:id/reviews', authOptional, validate(itemIdSchema), reviewController.list);

// Avaliar a contraparte de uma venda concluída.
router.post('/:id/reviews', authRequired, validate(createReviewSchema), reviewController.create);

// Demonstrar interesse num anúncio → cria/retorna a conversa (chat).
router.post('/:id/interest', authRequired, validate(itemIdSchema), conversationController.createInterest);

export default router;
