import { api } from './client';
import type { Item, ItemCategory, ItemType } from '../types';

/** Filtros da vitrine (todos opcionais; viram query string ?category=...). */
export interface ItemFilters {
  category?: ItemCategory;
  type?: ItemType;
  owner?: string;
}

/** Corpo pra criar/editar um anúncio. */
export interface ItemInput {
  title: string;
  description: string;
  category: ItemCategory;
  type: ItemType;
  price?: number;
  images?: { url: string; publicId: string }[];
}

export const itemsApi = {
  /** Vitrine pública (só disponíveis), com filtros opcionais. */
  async listAvailable(filters: ItemFilters = {}): Promise<Item[]> {
    const { data } = await api.get<Item[]>('/item/available', { params: filters });
    return data;
  },

  async getById(id: string): Promise<Item> {
    const { data } = await api.get<Item>(`/item/${id}`);
    return data;
  },

  /** Anúncios ativos do usuário logado (protegida). */
  async listMine(): Promise<Item[]> {
    const { data } = await api.get<Item[]>('/item/mine');
    return data;
  },

  /** Negócios concluídos do usuário logado (protegida). */
  async listConcluded(): Promise<Item[]> {
    const { data } = await api.get<Item[]>('/item/concluded');
    return data;
  },

  async create(input: ItemInput): Promise<Item> {
    const { data } = await api.post<Item>('/item', input);
    return data;
  },

  async update(id: string, input: Partial<ItemInput>): Promise<Item> {
    const { data } = await api.patch<Item>(`/item/${id}`, input);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/item/${id}`);
  },

  /** Conclui o negócio (opcionalmente com o comprador identificado). */
  async conclude(id: string, buyerId?: string): Promise<Item> {
    const { data } = await api.post<Item>(`/item/${id}/conclude`, { buyerId });
    return data;
  },

  /** Demonstrar interesse → cria/retorna a conversa daquele anúncio. */
  async interest(id: string): Promise<{ _id: string }> {
    const { data } = await api.post<{ _id: string }>(`/item/${id}/interest`, {});
    return data;
  },
};
