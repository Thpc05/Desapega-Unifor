import type { Item, OwnerRef } from '../types';

/** owner pode vir populado (objeto) ou como matrícula (string). */
export function ownerOf(item: Item): OwnerRef | null {
  return typeof item.owner === 'object' ? item.owner : null;
}

/** Matrícula do dono, populado ou não. */
export function ownerId(item: Item): string {
  return typeof item.owner === 'object' ? item.owner._id : item.owner;
}

/** Primeira imagem do item (ou string vazia se ainda não tem). */
export function itemImage(item: Item): string {
  return item.images?.[0]?.url ?? '';
}
