import { useAsync } from './useAsync';
import { itemsApi, type ItemFilters } from '../api/items.api';
import { usersApi } from '../api/users.api';
import { conversationsApi } from '../api/conversations.api';

/** Vitrine (refaz a busca quando um filtro muda). */
export function useItems(filters: ItemFilters) {
  return useAsync(() => itemsApi.listAvailable(filters), [filters.category, filters.type, filters.owner]);
}

/** Detalhe de um item. */
export function useItem(id: string | undefined) {
  return useAsync(() => itemsApi.getById(id!), [id]);
}

/** Perfil público. */
export function useProfile(id: string | undefined) {
  return useAsync(() => usersApi.getProfile(id!), [id]);
}

/** Meus anúncios ativos (protegido). */
export function useMyItems() {
  return useAsync(() => itemsApi.listMine(), []);
}

/** Meus negócios concluídos (protegido). */
export function useConcluded() {
  return useAsync(() => itemsApi.listConcluded(), []);
}

/** Caixa de entrada (protegido). */
export function useInbox() {
  return useAsync(() => conversationsApi.listInbox(), []);
}

/** Mensagens de uma conversa (protegido). */
export function useMessages(conversationId: string | undefined) {
  return useAsync(() => conversationsApi.listMessages(conversationId!), [conversationId]);
}
