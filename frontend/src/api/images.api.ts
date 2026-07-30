import { api } from './client';
import type { ItemImage } from '../types';

export const imagesApi = {
  /**
   * Sobe 1+ imagens pro backend (que repassa ao Cloudinary) e recebe
   * [{ url, publicId }]. Usa FormData (multipart) porque são arquivos binários.
   * Campo 'images' = o mesmo nome que o multer espera no backend.
   */
  async upload(files: File[]): Promise<ItemImage[]> {
    const form = new FormData();
    files.forEach((file) => form.append('images', file));
    const { data } = await api.post<ItemImage[]>('/image', form);
    return data;
  },

  /** Remove um upload solto (formulário cancelado). */
  async remove(publicId: string): Promise<void> {
    await api.delete('/image', { data: { publicId } });
  },
};
