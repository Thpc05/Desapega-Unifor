import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export const authController = {
  // POST /api/auth/register
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result); // { user, token }
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { matricula, password } = req.body;
      const result = await authService.login(matricula, password);
      res.json(result); // { user, token }
    } catch (err) {
      next(err);
    }
  },

  // GET /api/auth/me  (rota protegida: req.user vem do authRequired)
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      // O "!" diz ao TS "confie, req.user existe aqui" — porque esta rota só roda
      // depois do middleware authRequired, que garante isso.
      const user = await authService.getById(req.user!.id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },
};
