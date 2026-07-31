import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

/**
 * MIDDLEWARE DE AUTENTICAÇÃO ("porteiro").
 *
 * Ele é colocado ANTES dos controllers das rotas que exigem login. O trabalho:
 *   1. Ler o cabeçalho "Authorization" da requisição.
 *   2. Esperar o formato:  Authorization: Bearer <token>
 *   3. Verificar o token (assinatura + validade) com verifyToken().
 *   4. Se válido, anexar quem é o usuário em req.user e liberar (next()).
 *   5. Se faltar ou for inválido, responder 401 (Unauthorized) e NÃO seguir.
 *
 * Depois deste middleware, os controllers podem confiar em req.user.id.
 */
export function authRequired(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  // Precisa existir e começar com "Bearer ".
  if (!header || !header.startsWith('Bearer ')) {
    return next({ status: 401, message: 'Token not provided' });
  }

  // header = "Bearer eyJhbGciOi..."  ->  pegamos só a parte do token.
  const token = header.split(' ')[1];

  try {
    const payload = verifyToken(token); // lança erro se inválido/expirado
    req.user = { id: payload.sub };
    next();
  } catch {
    // Cobre token adulterado, assinatura errada ou expirado.
    next({ status: 401, message: 'Invalid or expired token' });
  }
}

/**
 * AUTENTICAÇÃO OPCIONAL: usada em rotas PÚBLICAS que mostram MAIS coisas se você
 * estiver logado (ex.: ver as próprias avaliações privadas). Se houver token
 * válido, seta req.user; se faltar/for inválido, NÃO bloqueia — apenas segue sem
 * usuário. Nunca responde 401.
 */
export function authOptional(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const payload = verifyToken(header.split(' ')[1]);
      req.user = { id: payload.sub };
    } catch {
      // token inválido → segue anônimo (sem req.user), sem erro.
    }
  }
  next();
}
