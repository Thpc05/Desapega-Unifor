import type { UserRef } from '../types';

/** Nome de uma referência de usuário (populada {name} ou matrícula crua). */
export function refName(ref: string | UserRef | null | undefined): string {
  if (!ref) return '';
  return typeof ref === 'object' ? ref.name : ref;
}

/** Matrícula de uma referência de usuário. */
export function refId(ref: string | UserRef | null | undefined): string {
  if (!ref) return '';
  return typeof ref === 'object' ? ref._id : ref;
}

/** _id de uma review = `<itemId>r<matrícula_do_avaliador>` (convenção do backend). */
export function makeReviewId(itemId: string, reviewer: string): string {
  return `${itemId}r${reviewer}`;
}

/** Extrai o itemId de um reviewId (o 'r' separa item e matrícula do avaliador). */
export function itemIdFromReviewId(reviewId: string): string {
  const i = reviewId.indexOf('r');
  return i === -1 ? reviewId : reviewId.slice(0, i);
}
