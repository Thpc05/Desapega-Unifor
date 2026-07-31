import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Field, Input, Select, Textarea } from '../components/ui/Field';
import { ErrorState } from '../components/ui/State';
import { useForm } from '../hooks/useForm';
import { itemsApi } from '../api/items.api';
import { apiErrorMessage } from '../api/client';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../constants';
import { price, required } from '../utils/validation';
import type { ItemCategory, ItemType } from '../types';
import styles from './NewItem.module.css';

export function NewItem() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm(
    { title: '', category: '', type: 'sale', price: '', description: '' },
    // regras dependem dos valores: preço só é exigido quando é VENDA
    (v) => ({
      title: required('Informe o título'),
      category: required('Selecione a categoria'),
      description: required('Descreva o item'),
      ...(v.type === 'sale' ? { price } : {}),
    }),
  );
  const isSale = form.values.type === 'sale';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!form.validate()) return;
    setSubmitting(true);
    try {
      const { title, description, category, type, price } = form.values;
      // Upload de imagens entra na F4; por ora criamos o anúncio só com texto.
      await itemsApi.create({
        title,
        description,
        category: category as ItemCategory,
        type: type as ItemType,
        price: type === 'sale' ? Number(price) : undefined,
      });
      navigate('/meus');
    } catch (err) {
      setServerError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <h1>Anunciar item</h1>

      <Panel elevated className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Upload (visual; Cloudinary entra na F4) */}
          <label className={styles.dropzone}>
            <img className={styles.dropIcon} src="/bookshelf.png" alt="" />
            <span>Toque para adicionar fotos</span>
            <span className={styles.hint}>até 5 imagens · JPG/PNG</span>
            <input type="file" accept="image/*" multiple hidden />
          </label>

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
              <Button
                type="button"
                variant={isSale ? 'primary' : 'secondary'}
                onClick={() => form.setField('type', 'sale')}
              >
                À venda
              </Button>
              <Button
                type="button"
                variant={!isSale ? 'primary' : 'secondary'}
                onClick={() => form.setField('type', 'donation')}
              >
                Doação
              </Button>
            </div>
          </Field>

          {/* Preço só aparece (e só é exigido) na venda */}
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
            Publicar anúncio
          </Button>
        </form>
      </Panel>
    </div>
  );
}
