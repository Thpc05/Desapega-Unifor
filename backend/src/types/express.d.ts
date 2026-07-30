/**
 * AUMENTO DE TIPO (declaration merging).
 *
 * O tipo `Request` do Express, por padrão, não tem um campo `user`. Mas nosso
 * middleware de autenticação vai colocar ali o usuário logado. Sem este arquivo,
 * o TypeScript reclamaria "Property 'user' does not exist on type Request".
 *
 * Aqui a gente "abre" a interface Request do Express e ACRESCENTA um campo
 * opcional `user`. O TS junta (merge) esta declaração com a original.
 */
import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}
