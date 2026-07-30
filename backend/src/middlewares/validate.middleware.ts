import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';

/**
 * MIDDLEWARE = uma função que roda NO MEIO do caminho, entre a requisição chegar
 * e o controller responder. Ela recebe (req, res, next):
 *   - req  = a requisição (o que o cliente mandou)
 *   - res  = a resposta (o que vamos devolver)
 *   - next = uma função que diz "terminei minha parte, pode seguir para a próxima"
 *
 * Este é um middleware GENÉRICO e REUTILIZÁVEL (princípio: reuso): recebe QUALQUER
 * schema Zod e valida a requisição contra ele. Se passar, chama next(). Se falhar,
 * chama next(erro) — e o nosso error.middleware trata a resposta.
 *
 * `validate(schema)` retorna um middleware. Isso se chama "higher-order function":
 * uma função que devolve outra função. Fazemos assim para poder configurar o
 * middleware com o schema certo em cada rota.
 */
export const validate =
  (schema: ZodType) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Validamos body, params e query juntos. Se algo estiver errado, o Zod
      // lança um ZodError e caímos no catch.
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      }) as { body?: unknown; params?: unknown; query?: unknown };

      // Substituímos pelos dados já validados/limpos pelo Zod (sem campos extras).
      if (parsed.body !== undefined) req.body = parsed.body;
      // params e query têm getters somente-leitura no Express 4, então não os
      // reatribuímos aqui — a validação já garantiu que estão corretos.

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        // Passamos adiante um erro "amigável" com status 400 (Bad Request).
        next({
          status: 400,
          message: 'Validation error',
          issues: err.issues.map((i) => ({
            field: i.path.join('.'),
            error: i.message,
          })),
        });
        return;
      }
      next(err);
    }
  };
