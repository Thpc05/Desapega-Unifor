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
