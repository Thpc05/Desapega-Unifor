import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/review.service';

export const reviewController = {
  // POST /api/items/:id/reviews
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await reviewService.create({
        itemId: req.params.id,
        reviewerMatricula: req.user!.id,
        xpRating: req.body.xpRating,
        comment: req.body.comment,
        visibility: req.body.visibility,
      });
      // 201 = criado. Devolvemos também se a nota concedeu XP (regra anti-farm).
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
};
