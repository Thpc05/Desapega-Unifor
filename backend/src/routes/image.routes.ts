import { Router } from 'express';
import { imageController } from '../controllers/image.controller';
import { validate } from '../middlewares/validate.middleware';
import { authRequired } from '../middlewares/auth.middleware';
import { uploadImages } from '../middlewares/upload.middleware';
import { deleteImageSchema } from '../schemas/image.schema';

const router = Router();

// Upload: authRequired -> multer (lê os arquivos) -> controller (sobe pro Cloudinary).
router.post('/', authRequired, uploadImages, imageController.upload);

// Delete de upload solto (precisa do publicId no corpo).
router.delete('/', authRequired, validate(deleteImageSchema), imageController.remove);

export default router;
