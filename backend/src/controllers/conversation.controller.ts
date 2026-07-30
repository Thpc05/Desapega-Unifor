import { Request, Response, NextFunction } from 'express';
import { conversationService } from '../services/conversation.service';
import { messageService } from '../services/message.service';
import { emitNewMessage } from '../socket';

export const conversationController = {
  // POST /api/item/:id/interest  -> comprador demonstra interesse (cria/retorna conversa)
  async createInterest(req: Request, res: Response, next: NextFunction) {
    try {
      const { conversation, created } = await conversationService.createOrGetInterest(
        req.params.id,     // id do item
        req.user!.id,      // matrícula do interessado
      );
      // 201 se criou agora, 200 se já existia (mesma conversa devolvida).
      res.status(created ? 201 : 200).json(conversation);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/conversation  -> caixa de entrada do usuário logado
  async listInbox(req: Request, res: Response, next: NextFunction) {
    try {
      const conversations = await conversationService.listForUser(req.user!.id);
      res.json(conversations);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/conversation/:id/messages  -> histórico da conversa
  async listMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const messages = await messageService.listForConversation(req.params.id, req.user!.id);
      res.json(messages);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/conversation/:id/messages  -> envia msg via REST (fallback do socket)
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const message = await messageService.send(req.params.id, req.user!.id, req.body.text);
      // Emite pela sala também: se o outro participante estiver online, recebe na hora.
      emitNewMessage(req.params.id, message);
      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  },
};
