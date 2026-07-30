/**
 * ─────────────────────────────────────────────────────────────────────────
 *  LÓGICA DE XP — FUNÇÕES PURAS
 * ─────────────────────────────────────────────────────────────────────────
 *  "Função pura" = dado a MESMA entrada, sempre devolve a MESMA saída, e NÃO
 *  causa efeito colateral (não grava no banco, não lê a hora, não imprime nada).
 *
 *  Por que isso importa (seu princípio de design)?
 *   - Fácil de TESTAR: é só chamar e comparar o retorno, sem subir banco.
 *   - Fácil de RACIOCINAR: toda a regra de pontuação está num lugar só, previsível.
 *   - REUSÁVEL: o service chama estas funções e só ELE persiste. A regra não se
 *     mistura com I/O.
 *
 *  Aqui a gente só CALCULA números. Quem soma no banco é o service (item/review).
 */

// Tabela central de valores — mexer aqui muda o jogo inteiro, sem caçar números soltos.
export const XP_RULES = {
  ANNOUNCE: 5,                       // anunciar um item
  SALE_BASE: 10,                     // vendedor, por concluir uma venda
  SALE_BUYER_IDENTIFIED_BONUS: 10,   // vendedor, bônus se o comprador foi identificado no app
  BUYER_ON_IDENTIFIED_SALE: 20,      // comprador identificado, por concluir a compra
  DONATION: 35,                      // doador, por concluir uma doação
} as const;

type DealType = 'sale' | 'donation';

/** XP ganho ao anunciar um item. */
export function xpForAnnounce(): number {
  return XP_RULES.ANNOUNCE;
}

/**
 * XP do VENDEDOR/DOADOR ao concluir um negócio.
 * - doação: valor fixo (não há comprador a identificar).
 * - venda: base + bônus se o comprador foi identificado dentro do app.
 */
export function xpForSeller(type: DealType, buyerIdentified: boolean): number {
  if (type === 'donation') return XP_RULES.DONATION;
  return XP_RULES.SALE_BASE + (buyerIdentified ? XP_RULES.SALE_BUYER_IDENTIFIED_BONUS : 0);
}

/**
 * XP do COMPRADOR ao concluir. Só existe em venda com comprador identificado.
 * (Doação tem receptor anônimo → 0; venda sem comprador identificado → 0.)
 */
export function xpForBuyer(type: DealType, buyerIdentified: boolean): number {
  if (type === 'sale' && buyerIdentified) return XP_RULES.BUYER_ON_IDENTIFIED_SALE;
  return 0;
}

/**
 * XP gerado por uma avaliação (só em venda).
 * Fórmula: (estrelas − 2.5) × 10  →  0★ = −25, 2.5★ = 0, 5★ = +25.
 * Pode ser NEGATIVO: uma avaliação ruim tira reputação.
 */
export function xpFromRating(stars: number): number {
  return (stars - 2.5) * 10;
}

/**
 * Nível "visual" (tema Minecraft) derivado do XP total.
 * Curva de raiz quadrada: exige cada vez mais XP para subir de nível.
 * NÃO guardamos o nível no banco — calculamos aqui na hora de exibir, para nunca
 * ficar inconsistente com o XP.
 */
export function computeLevel(xp: number): number {
  if (xp <= 0) return 0;
  return Math.floor(Math.sqrt(xp / 25));
}

/**
 * Recalcula a média de avaliações a partir da lista de notas recebidas.
 * Recebe um array de estrelas e devolve { avg, count }. Puro: sem banco.
 */
export function computeAvgRating(ratings: number[]): { avg: number; count: number } {
  const count = ratings.length;
  if (count === 0) return { avg: 0, count: 0 };
  const sum = ratings.reduce((acc, n) => acc + n, 0);
  return { avg: sum / count, count };
}
