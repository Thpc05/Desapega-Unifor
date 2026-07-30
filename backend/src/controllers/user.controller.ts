import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';

export const userController = {
  // GET /api/users/:id  -> perfil público
  async getPublicProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await userService.getPublicProfile(req.params.id);
      res.json(profile);
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/users/me  -> edita o próprio perfil (rota protegida)
  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateMe(req.user!.id, req.body);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },
};
