import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';
import { conversationService } from './conversation.service';

export const messageService = {
  /**
   * Envia uma mensagem: valida participação, PERSISTE no banco e atualiza a prévia
   * da conversa. Retorna a mensagem criada.
   *
   * ORDEM IMPORTANTE (persistir antes de emitir): quem chama esta função (a rota
   * REST ou o handler do socket) só emite pela sala DEPOIS que ela retorna. Assim,
   * se o outro participante estiver offline, a mensagem já está salva e ele a verá
   * no histórico ao reabrir — nada se perde.
   */
  async send(convoId: string, senderMatricula: string, text: string) {
    // Garante que quem envia é participante (lança 404/403 se não).
    await conversationService.findForParticipant(convoId, senderMatricula);

    const message = await Message.create({
      conversation: convoId,
      sender: senderMatricula,
      text,
    });

    // Atualiza a prévia/carimbo de tempo para ordenar e exibir na caixa de entrada.
    await Conversation.findByIdAndUpdate(convoId, {
      lastMessageAt: message.createdAt,
      lastMessagePreview: text.slice(0, 80),
    });

    return message;
  },

  /** Histórico de uma conversa (ordem cronológica). Valida participação antes. */
  async listForConversation(convoId: string, requesterMatricula: string) {
    await conversationService.findForParticipant(convoId, requesterMatricula);
    return Message.find({ conversation: convoId }).sort({ createdAt: 1 });
  },
};
