/**
 * Nível visual a partir do XP — ESPELHA o computeLevel do backend (utils/xp.ts).
 * O nível não é guardado; é sempre calculado a partir do XP (fonte única).
 */
export function computeLevel(xp: number): number {
  if (xp <= 0) return 0;
  return Math.floor(Math.sqrt(xp / 25));
}

/** XP necessário para alcançar um nível: 25 * n². */
export function xpForLevel(n: number): number {
  return 25 * n * n;
}

/**
 * Progresso (0..1) dentro do nível atual — pra desenhar a barra de XP.
 * Ex.: nível 2 vai de 100xp a 225xp; 160xp → (160-100)/(225-100) = 0.48.
 */
export function xpProgress(xp: number): number {
  const level = computeLevel(xp);
  const start = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return Math.min(1, Math.max(0, (xp - start) / (next - start)));
}
