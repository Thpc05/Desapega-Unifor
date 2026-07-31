import { Request, Response, NextFunction } from 'express';
import { uploadImage, deleteImage, imageFolderPrefix } from '../utils/cloudinary';

export const imageController = {
  // POST /api/image  -> sobe 1+ imagens e devolve [{ url, publicId }]
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      // O multer coloca os arquivos em req.files (array). Cada um tem .buffer e .mimetype.
      const files = (req.files as Express.Multer.File[] | undefined) ?? [];
      if (files.length === 0) {
        return next({ status: 400, message: 'No image files provided' });
      }

      // Sobe todas em paralelo (Promise.all) e junta os resultados.
      // A matrícula do dono (do token) vai gravada na pasta/public_id.
      const uploaded = await Promise.all(
        files.map((file) => uploadImage(file.buffer, file.mimetype, req.user!.id)),
      );

      res.status(201).json(uploaded); // [{ url, publicId }, ...]
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/image  -> apaga um upload "solto" (ex.: formulário cancelado)
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const publicId: string = req.body.publicId;
      // POSSE: só o dono pode apagar. O dono está gravado no próprio public_id
      // (pasta = matrícula). Comparamos como já fazemos com item.owner === req.user.id.
      if (!publicId.startsWith(imageFolderPrefix(req.user!.id))) {
        return next({ status: 403, message: 'This image is not yours' });
      }
      await deleteImage(publicId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
