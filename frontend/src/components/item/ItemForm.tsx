import { useEffect, useMemo, useState } from 'react';
import { Panel } from '../ui/Panel';
import { Button } from '../ui/Button';
import { Field, Input, Select, Textarea } from '../ui/Field';
import { ErrorState } from '../ui/State';
import { useForm } from '../../hooks/useForm';
import { imagesApi } from '../../api/images.api';
import { apiErrorMessage } from '../../api/client';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../../constants';
import { price, required } from '../../utils/validation';
import type { ItemCategory, ItemImage, ItemType } from '../../types';
import type { ItemInput } from '../../api/items.api';
import styles from './ItemForm.module.css';

const MAX_IMAGES = 5;

export type ItemFormValues = {
  title: string;
  category: string;
  type: string; // 'sale' | 'donation'
  price: string;
  description: string;
};

/**
 * Formulário de anúncio COMPARTILHADO por criar (NewItem) e editar (EditItem).
 * Cuida do estado, da validação e das imagens (as já salvas + as novas), e sobe
 * as novas pro Cloudinary no submit. Quem cria/atualiza de fato é o `onSubmit`.
 */
export function ItemForm({
  heading,
  submitLabel,
  initialValues,
  initialImages = [],
  lockType = false,
  onSubmit,
}: {
  heading: string;
  submitLabel: string;
  initialValues?: Partial<ItemFormValues>;
  initialImages?: ItemImage[];
  lockType?: boolean;
  onSubmit: (payload: ItemInput) => Promise<void>;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Imagens JÁ salvas (Cloudinary) e as NOVAS (arquivos locais, ainda não subidas).
  const [existingImages, setExistingImages] = useState<ItemImage[]>(initialImages);
  const [files, setFiles] = useState<File[]>([]);
  const totalImages = existingImages.length + files.length;

  const form = useForm<ItemFormValues>(
    {
      title: '',
      category: '',
      type: 'sale',
      price: '',
      description: '',
      ...initialValues,
    },
    (v) => ({
      title: required('Informe o título'),
      category: required('Selecione a categoria'),
      description: required('Descreva o item'),
      ...(v.type === 'sale' ? { price } : {}),
    }),
  );
  const isSale = form.values.type === 'sale';

  // Previews das imagens NOVAS (object URLs) — criadas/liberadas quando `files` muda.
  const filePreviews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => filePreviews.forEach((url) => URL.revokeObjectURL(url)), [filePreviews]);

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    const room = MAX_IMAGES - totalImages;
    setFiles((prev) => [...prev, ...picked.slice(0, room)]);
    e.target.value = '';
  }
  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }
  function removeExisting(publicId: string) {
    // Ao tirar uma imagem já salva, ela some do array final → o backend a apaga do Cloudinary.
    setExistingImages((prev) => prev.filter((img) => img.publicId !== publicId));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!form.validate()) return;
    setSubmitting(true);
    try {
      // Sobe só as NOVAS; junta com as que ficaram.
      let uploaded: ItemImage[] = [];
      if (files.length > 0) {
        setUploading(true);
        uploaded = await imagesApi.upload(files);
        setUploading(false);
      }
      const images = [...existingImages, ...uploaded];

      const { title, description, category, type, price } = form.values;
      await onSubmit({
        title,
        description,
        category: category as ItemCategory,
        type: type as ItemType,
        price: type === 'sale' ? Number(price) : undefined,
        images,
      });
    } catch (err) {
      setServerError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  }

  return (
    <div>
      <h1>{heading}</h1>

      <Panel elevated className={styles.card} style={{ marginTop: 18 }}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Previews: primeiro as já salvas, depois as novas */}
          {(existingImages.length > 0 || filePreviews.length > 0) && (
            <div className={styles.previews}>
              {existingImages.map((img) => (
                <div key={img.publicId} className={styles.preview}>
                  <img className={styles.thumb} src={img.url} alt="foto" />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeExisting(img.publicId)}
                    aria-label="Remover foto"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {filePreviews.map((url, i) => (
                <div key={url} className={styles.preview}>
                  <img className={styles.thumb} src={url} alt={`nova foto ${i + 1}`} />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeFile(i)}
                    aria-label="Remover foto"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Seletor de arquivos (some quando chega no máximo) */}
          {totalImages < MAX_IMAGES && (
            <label className={styles.dropzone}>
              <img className={styles.dropIcon} src="/bookshelf.png" alt="" />
              <span>Toque para adicionar fotos</span>
              <span className={styles.hint}>
                {totalImages}/{MAX_IMAGES} · JPG/PNG
              </span>
              <input type="file" accept="image/*" multiple hidden onChange={onPickFiles} />
            </label>
          )}

          <Field label="Título" error={form.errors.title}>
            <Input placeholder="Ex.: Cálculo Vol. 1 — Guidorizzi" {...form.bind('title')} />
          </Field>

          <Field label="Categoria" error={form.errors.category}>
            <Select {...form.bind('category')}>
              <option value="" disabled>
                Selecione
              </option>
              {CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Tipo de anúncio">
            {lockType ? (
              <span className={styles.typeFixed}>{isSale ? 'À venda' : 'Doação'}</span>
            ) : (
              <div className={styles.typeToggle}>
                <Button type="button" variant={isSale ? 'primary' : 'secondary'} onClick={() => form.setField('type', 'sale')}>
                  À venda
                </Button>
                <Button type="button" variant={!isSale ? 'primary' : 'secondary'} onClick={() => form.setField('type', 'donation')}>
                  Doação
                </Button>
              </div>
            )}
          </Field>

          {isSale && (
            <Field label="Preço (em esmeraldas)" error={form.errors.price}>
              <Input type="number" min={0} placeholder="45" {...form.bind('price')} />
            </Field>
          )}

          <Field label="Descrição" error={form.errors.description}>
            <Textarea rows={4} placeholder="Estado, detalhes, ponto de entrega..." {...form.bind('description')} />
          </Field>

          {serverError && <ErrorState message={serverError} />}

          <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
            {uploading ? 'Enviando fotos…' : submitLabel}
          </Button>
        </form>
      </Panel>
    </div>
  );
}
