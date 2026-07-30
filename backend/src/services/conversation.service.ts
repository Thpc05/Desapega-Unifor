import { Conversation, IConversation } from '../models/Conversation';
import { Item } from '../models/Item';

export const conversationService = {
  /**
   * "Demonstrar interesse" = criar (ou reabrir) a conversa do comprador com o dono
   * daquele anúncio. Como o _id é composto e único por (item, comprador), rodar
   * isto duas vezes NÃO cria duplicata — retorna a mesma conversa.
   */
  async createOrGetInterest(itemId: string, buyerMatricula: string) {
    const item = await Item.findById(itemId);
    if (!item) throw { status: 404, message: 'Item not found' };

    // Não faz sentido "ter interesse" no próprio anúncio.
    if (item.owner === buyerMatricula) {
      throw { status: 400, message: 'You cannot start a chat on your own item' };
    }

    const _id = `${itemId}c${buyerMatricula}`;

    // findById pelo id composto: se já existe, é a conversa existente.
    const existing = await Conversation.findById(_id);
    if (existing) return { conversation: existing, created: false };

    const conversation = await Conversation.create({
      _id,
      item: itemId,
      buyer: buyerMatricula,
      seller: item.owner,
    });
    return { conversation, created: true };
  },

  /** Caixa de entrada: conversas em que sou comprador OU vendedor, mais recentes primeiro. */
  async listForUser(matricula: string) {
    return Conversation.find({
      $or: [{ buyer: matricula }, { seller: matricula }],
    })
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .populate('item', 'title status')
      // nomes das duas partes → a UI mostra o nome do "outro" sem request extra
      .populate('buyer', 'name')
      .populate('seller', 'name');
  },

  /**
   * Busca a conversa GARANTINDO que o usuário é participante (comprador ou vendedor).
   * Reutilizada por qualquer rota/evento que mexe na conversa (REST e Socket.io).
   * Lança 404 se não existe, 403 se não é participante.
   */
  async findForParticipant(convoId: string, matricula: string): Promise<IConversation> {
    const convo = await Conversation.findById(convoId);
    if (!convo) throw { status: 404, message: 'Conversation not found' };
    if (convo.buyer !== matricula && convo.seller !== matricula) {
      throw { status: 403, message: 'You are not part of this conversation' };
    }
    return convo;
  },
};
