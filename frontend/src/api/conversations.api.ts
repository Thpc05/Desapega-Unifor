import { api } from './client';
import type { Conversation, Message } from '../types';

export const conversationsApi = {
  /** Caixa de entrada: minhas conversas (comprador ou vendedor), mais recentes 1º. */
  async listInbox(): Promise<Conversation[]> {
    const { data } = await api.get<Conversation[]>('/conversation');
    return data;
  },

  /** Histórico de mensagens de uma conversa. */
  async listMessages(conversationId: string): Promise<Message[]> {
    const { data } = await api.get<Message[]>(`/conversation/${conversationId}/messages`);
    return data;
  },

  /** Envia mensagem via REST (fallback; o tempo real vem pelo socket na F4). */
  async sendMessage(conversationId: string, text: string): Promise<Message> {
    const { data } = await api.post<Message>(`/conversation/${conversationId}/messages`, { text });
    return data;
  },
};
