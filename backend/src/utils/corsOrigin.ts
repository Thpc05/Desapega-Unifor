/**
 * Origens permitidas no CORS. Lê a variável CORS_ORIGIN (uma ou mais URLs
 * separadas por vírgula, ex.: "https://meu-front.vercel.app,http://localhost:5173").
 *
 * - Definida  → restringe às origens listadas (produção).
 * - Vazia     → libera todas (fallback de DESENVOLVIMENTO) com um aviso no log.
 *
 * Usado tanto pelo Express (app.ts) quanto pelo Socket.io (socket/index.ts) para
 * que a regra de CORS seja a MESMA nos dois canais.
 */
export function corsOrigin(): string[] | boolean {
  const raw = process.env.CORS_ORIGIN;
  if (!raw) {
    console.warn('⚠️  CORS_ORIGIN não definida — liberando todas as origens (ok só em dev).');
    return true; // no `cors`, origin:true reflete/aceita qualquer origem
  }
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
