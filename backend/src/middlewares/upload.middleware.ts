import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

/**
 * MULTER = biblioteca que lê uploads no formato "multipart/form-data" (o jeito que
 * navegadores mandam arquivos). Sem ele, req.body não entende arquivos.
 *
 * `memoryStorage` = o arquivo fica em MEMÓRIA (num Buffer), não é gravado em disco.
 * Perfeito aqui: pegamos o buffer e mandamos direto pro Cloudinary, sem lixo no
 * servidor.
 *
 * Limites e filtro protegem contra abuso: só imagens, até 5MB cada, máx. 5 arquivos.
 */
const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB por arquivo
    files: 5,                  // no máximo 5 arquivos por requisição
  },
  fileFilter: (_req, file, cb) => {
    // Aceita só se o mimetype começar com "image/" (image/png, image/jpeg...).
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
}).array('images', 5); // espera o campo "images" com até 5 arquivos

/**
 * Envolve o multer para transformar os erros dele (arquivo grande demais, tipo
 * inválido) num erro 400 amigável, em vez de um 500 cru. Assim o cliente recebe
 * uma mensagem clara do que fez de errado.
 */
export function uploadImages(req: Request, res: Response, next: NextFunction) {
  multerUpload(req, res, (err: unknown) => {
    if (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      return next({ status: 400, message });
    }
    next();
  });
}
