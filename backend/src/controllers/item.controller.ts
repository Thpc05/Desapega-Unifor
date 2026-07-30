import { Request, Response, NextFunction } from 'express';
import { itemService } from '../services/item.service';

/**
 * CONTROLLER = a "ponte" entre o mundo HTTP e a regra de negócio.
 * Responsabilidade dele:
 *   1. Ler o que veio na requisição (req.body, req.params, req.query).
 *   2. Chamar o service certo.
 *   3. Devolver a resposta HTTP com o status correto (res.status().json()).
 *
 * Repare no padrão try/catch: se algo der errado (ex.: banco fora do ar), o
 * `next(err)` empurra o erro para o nosso error.middleware — não tratamos a
 * resposta de erro aqui (princípio: um lugar só para erros).
 */
export const itemController = {
  // POST /api/item  -> cria anúncio (rota protegida: req.user vem do authRequired)
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // O dono vem do token (req.user.id = matrícula), não do cliente. O service
      // gera o _id composto e liga o owner.
      const item = await itemService.create(req.body, req.user!.id);
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/item/available  -> vitrine pública (só disponíveis), filtros opcionais
  async listAvailable(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await itemService.listAvailable({
        category: req.query.category as string | undefined,
        type: req.query.type as string | undefined,
        owner: req.query.owner as string | undefined,
      });
      res.json(items);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/item/concluded  -> negócios concluídos DO usuário logado (vendeu ou comprou)
  async listConcluded(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await itemService.listConcludedForUser(req.user!.id);
      res.json(items);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/item/mine  -> anúncios ATIVOS do usuário logado
  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await itemService.listMineActive(req.user!.id);
      res.json(items);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/item/:id  -> detalhe de um item (com o dono populado)
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await itemService.findByIdPopulated(req.params.id);
      if (!item) {
        return next({ status: 404, message: 'Item not found' });
      }
      res.json(item);
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/item/:id  -> atualiza campos de um item (só o dono)
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const existing = await itemService.findById(req.params.id);
      if (!existing) {
        return next({ status: 404, message: 'Item not found' });
      }
      // Checagem de posse: owner e req.user.id são matrículas (string) — comparação direta.
      if (existing.owner !== req.user!.id) {
        return next({ status: 403, message: 'This item is not yours' });
      }

      const item = await itemService.update(req.params.id, req.body);
      res.json(item);
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/item/:id  -> remove um item (só o dono)
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const existing = await itemService.findById(req.params.id);
      if (!existing) {
        return next({ status: 404, message: 'Item not found' });
      }
      if (existing.owner !== req.user!.id) {
        return next({ status: 403, message: 'This item is not yours' });
      }

      await itemService.remove(req.params.id);
      // 204 = "No Content": deu certo, mas não há corpo para devolver.
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  // POST /api/items/:id/conclude  -> conclui o negócio (aplica XP + históricos)
  async conclude(req: Request, res: Response, next: NextFunction) {
    try {
      // A checagem de posse e as regras ficam no service (concentrar a regra lá).
      const item = await itemService.conclude(
        req.params.id,
        req.user!.id,
        req.body.buyerId,
      );
      res.json(item);
    } catch (err) {
      next(err);
    }
  },
};
