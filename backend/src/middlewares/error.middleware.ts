import { Request, Response, NextFunction } from 'express';

/**
 * Formato dos erros que a gente propaga com next(...) pela aplicação.
 * Todos os campos opcionais para dar flexibilidade a quem lança o erro.
 */
interface AppError {
  status?: number;
  message?: string;
  issues?: unknown; // detalhes de validação (vem do validate.middleware)
}

/**
 * ERROR MIDDLEWARE = o "balcão central de erros".
 *
 * No Express, um middleware de ERRO é reconhecido por ter 4 parâmetros
 * (err, req, res, next) — essa assinatura de 4 args é o que sinaliza ao Express
 * "isto trata erros". Sempre que qualquer lugar chamar next(algumErro), a execução
 * pula direto para cá.
 *
 * Vantagem: em vez de repetir try/catch com res.status().json() em cada rota,
 * centralizamos a resposta de erro num lugar só (princípio: reuso e um ponto de
 * verdade). Os controllers só precisam "jogar o erro pra cá".
 */
export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  // O `next` precisa existir na assinatura (4 args) mesmo sem uso, senão o
  // Express não reconhece esta função como handler de erro.
  _next: NextFunction,
) => {
  const status = err.status ?? 500; // ?? = "se for null/undefined, usa 500"

  // Loga o erro REAL no servidor (para debugar erros nossos, 5xx).
  if (status >= 500) {
    console.error('[ERRO 500]', err);
  }

  // Ao CLIENTE: só devolvemos a mensagem em erros 4xx (são intencionais e seguras
  // — "campo faltando", "token inválido", etc.). Num 5xx a mensagem pode conter
  // detalhes internos (Mongoose/Cloudinary), então respondemos algo genérico.
  const clientMessage = status >= 500 ? 'Internal server error' : err.message ?? 'Error';

  res.status(status).json({
    error: clientMessage,
    ...(err.issues ? { issues: err.issues } : {}), // detalhes de validação (400) só se existirem
  });
};
