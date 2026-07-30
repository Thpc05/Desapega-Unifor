import jwt, { SignOptions } from 'jsonwebtoken';

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  O QUE É UM JWT (JSON Web Token)?
 * ─────────────────────────────────────────────────────────────────────────
 *  É um "crachá" digital. Depois que o usuário faz login com sucesso, o servidor
 *  emite esse crachá. Em toda requisição seguinte, o cliente mostra o crachá e o
 *  servidor confere se é legítimo — sem precisar consultar o banco toda vez.
 *
 *  Um JWT tem 3 partes separadas por ponto:  HEADER.PAYLOAD.SIGNATURE
 *
 *   1. HEADER    -> diz o algoritmo usado (ex.: HS256).
 *   2. PAYLOAD   -> os dados que queremos carregar (aqui: o id do usuário).
 *                   ATENÇÃO: o payload é apenas CODIFICADO em base64, NÃO é secreto!
 *                   Qualquer um consegue ler. Por isso NUNCA colocamos senha aqui.
 *   3. SIGNATURE -> a "assinatura". É gerada misturando header + payload com um
 *                   SEGREDO que só o servidor conhece (JWT_SECRET), usando HMAC.
 *
 *  A mágica da segurança: se alguém tentar alterar o payload (ex.: trocar o id
 *  para se passar por outro usuário), a assinatura não vai mais bater, porque
 *  quem altera NÃO conhece o segredo. O servidor detecta a fraude na verificação.
 *  => O JWT não esconde os dados; ele GARANTE QUE NÃO FORAM ADULTERADOS.
 */

// O que guardamos dentro do token. `sub` (subject) = "de quem é este token".
export interface JwtPayload {
  sub: string; // id do usuário (string do ObjectId)
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Sem segredo não há como assinar/verificar com segurança. Falha explícita.
    throw new Error('JWT_SECRET não definida no .env');
  }
  return secret;
}

/**
 * Gera (assina) um token para um usuário. Chamado no login/registro.
 * `expiresIn` faz o token "vencer" depois de um tempo (ex.: '7d' = 7 dias),
 * limitando o estrago caso um crachá seja roubado.
 */
export function signToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'],
  };
  return jwt.sign({ sub: userId }, getSecret(), options);
}

/**
 * Verifica um token recebido. Se a assinatura for válida E não estiver expirado,
 * devolve o payload. Caso contrário, o jwt.verify LANÇA um erro (tratamos no
 * middleware de autenticação).
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getSecret()) as JwtPayload;
}
