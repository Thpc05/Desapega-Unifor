import { v2 as cloudinary } from 'cloudinary';

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  CLOUDINARY — armazenamento de imagens na nuvem.
 * ─────────────────────────────────────────────────────────────────────────
 *  Guardamos as imagens no Cloudinary (não no MongoDB — banco é ruim para
 *  arquivos). Salvamos no item apenas a URL (para exibir) e o public_id (para
 *  conseguir apagar depois).
 *
 *  O SDK lê a variável de ambiente CLOUDINARY_URL automaticamente. Ela tem o
 *  formato:  cloudinary://<api_key>:<api_secret>@<cloud_name>
 *  O api_secret NUNCA sai do backend — é ele que autoriza upload/delete.
 *
 *  secure: true força as URLs geradas a serem https.
 */
cloudinary.config({ secure: true });

export interface UploadedImage {
  url: string;      // secure_url — o link https para exibir a imagem
  publicId: string; // identificador no Cloudinary — necessário para deletar
}

/**
 * Sobe uma imagem (recebida como buffer em memória, vinda do multer) para o
 * Cloudinary e devolve { url, publicId }.
 *
 * O Cloudinary aceita um "data URI" (a imagem embutida como base64 numa string).
 * Convertemos o buffer para esse formato e mandamos. `folder` organiza os arquivos
 * dentro da sua conta (aparece no public_id, ex.: "desapego/items/abc123").
 */
export async function uploadImage(
  buffer: Buffer,
  mimetype: string,
): Promise<UploadedImage> {
  const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'desapego/items',
  });
  return { url: result.secure_url, publicId: result.public_id };
}

/**
 * Apaga uma imagem do Cloudinary pelo public_id. Se o id não existir, o Cloudinary
 * responde "not found" sem lançar erro — então é seguro chamar em limpezas.
 */
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
