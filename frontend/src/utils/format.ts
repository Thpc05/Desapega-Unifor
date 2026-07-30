/** Formata o preço em reais, ou "Doação" quando não há preço (type=donation). */
export function formatPrice(price?: number): string {
  if (price === undefined || price === null) return 'Doação';
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
