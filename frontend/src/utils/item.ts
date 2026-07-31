import type { Item, OwnerRef } from '../types';

/** owner pode vir populado (objeto) ou como matrícula (string). */
export function ownerOf(item: Item): OwnerRef | null {
  return typeof item.owner === 'object' ? item.owner : null;
}

/** Matrícula do dono, populado ou não. */
export function ownerId(item: Item): string {
  return typeof item.owner === 'object' ? item.owner._id : item.owner;
}

/** Matrícula do comprador (ou '' se não houver). */
export function buyerId(item: Item): string {
  if (!item.buyer) return '';
  return typeof item.buyer === 'object' ? item.buyer._id : item.buyer;
}
/** Nome do comprador (populado no detalhe) ou ''. */
export function buyerName(item: Item): string {
  if (!item.buyer) return '';
  return typeof item.buyer === 'object' ? item.buyer.name : item.buyer;
}

/** O negócio pode ser avaliado? (venda concluída com comprador identificado) */
export function isReviewable(item: Item): boolean {
  return item.type === 'sale' && item.status === 'concluded' && Boolean(item.buyer);
}

/** Primeira imagem do item (ou string vazia se ainda não tem). */
export function itemImage(item: Item): string {
  return item.images?.[0]?.url ?? '';
}
