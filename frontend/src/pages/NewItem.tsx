import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Field, Input, Select, Textarea } from '../components/ui/Field';
import { ErrorState } from '../components/ui/State';
import { useForm } from '../hooks/useForm';
import { itemsApi } from '../api/items.api';
import { imagesApi } from '../api/images.api';
import { apiErrorMessage } from '../api/client';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../constants';
import { price, required } from '../utils/validation';
import type { ItemCategory, ItemType } from '../types';
import styles from './NewItem.module.css';

const MAX_IMAGES = 5;

export function NewItem() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const form = useForm(
    { title: '', category: '', type: 'sale', price: '', description: '' },
    (v) => ({
      title: required('Informe o título'),
      category: required('Selecione a categoria'),
      description: required('Descreva o item'),
      ...(v.type === 'sale' ? { price } : {}),
    }),
  );
  const isSale = form.values.type === 'sale';

  // Previews locais (object URLs) — criadas e liberadas quando `files` muda.
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...picked].slice(0, MAX_IMAGES));
    e.target.value = ''; // permite escolher o mesmo arquivo de novo
  }
  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!form.validate()) return;
    setSubmitting(true);
    try {
      // 1) Sobe as imagens pro Cloudinary (via backend) → [{ url, publicId }].
      let images;
      if (files.length > 0) {
        setUploading(true);
        images = await imagesApi.upload(files);
        setUploading(false);
      }
      // 2) Cria o anúncio já com as imagens.
      const { title, description, category, type, price } = form.values;
      await itemsApi.create({
        title,
        description,
        category: category as ItemCategory,
        type: type as ItemType,
        price: type === 'sale' ? Number(price) : undefined,
        images,
      });
      navigate('/meus');
    } catch (err) {
      setServerError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  }

  return (
    <div className={styles.page}>
      <h1>Anunciar item</h1>

      <Panel elevated className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Previews das fotos escolhidas */}
          {previews.length > 0 && (
            <div className={styles.previews}>
              {previews.map((url, i) => (
                <div key={url} className={styles.preview}>
                  <img className={styles.thumb} src={url} alt={`foto ${i + 1}`} />
                  <button type="button" className={styles.removeBtn} onClick={() => removeFile(i)} aria-label="Remover foto">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Seletor de arquivos (some quando chega no máximo) */}
          {files.length < MAX_IMAGES && (
            <label className={styles.dropzone}>
              <img className={styles.dropIcon} src="/bookshelf.png" alt="" />
              <span>Toque para adicionar fotos</span>
              <span className={styles.hint}>
                {files.length}/{MAX_IMAGES} · JPG/PNG
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
            <div className={styles.typeToggle}>
              <Button type="button" variant={isSale ? 'primary' : 'secondary'} onClick={() => form.setField('type', 'sale')}>
                À venda
              </Button>
              <Button type="button" variant={!isSale ? 'primary' : 'secondary'} onClick={() => form.setField('type', 'donation')}>
                Doação
              </Button>
            </div>
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
            {uploading ? 'Enviando fotos…' : 'Publicar anúncio'}
          </Button>
        </form>
      </Panel>
    </div>
  );
}
