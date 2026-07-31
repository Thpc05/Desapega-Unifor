import { useNavigate, useParams } from 'react-router-dom';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { ItemForm } from '../components/item/ItemForm';
import { Loading, ErrorState } from '../components/ui/State';
import { useItem } from '../hooks/queries';
import { useAuth } from '../context/AuthContext';
import { itemsApi } from '../api/items.api';
import { ownerId } from '../utils/item';
import type { ItemCategory } from '../types';
import styles from './NewItem.module.css';

export function EditItem() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: item, loading, error, refetch } = useItem(itemId);

  if (loading) return <Loading label="Carregando anúncio…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!item) return null;

  // Guardas: só o dono, e só anúncio ativo (não concluído).
  const notMine = !user || ownerId(item) !== user.matricula;
  const isConcluded = item.status === 'concluded';
  if (notMine || isConcluded) {
    return (
      <div className={styles.page}>
        <Panel padded style={{ marginTop: 18 }}>
          <p>
            {notMine
              ? 'Este anúncio não é seu.'
              : 'Não dá pra editar um anúncio já concluído.'}
          </p>
          <Button variant="secondary" onClick={() => navigate(-1)} style={{ marginTop: 12 }}>
            Voltar
          </Button>
        </Panel>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <ItemForm
        heading="Editar anúncio"
        submitLabel="Salvar alterações"
        lockType
        initialValues={{
          title: item.title,
          category: item.category as ItemCategory,
          type: item.type,
          price: item.price != null ? String(item.price) : '',
          description: item.description,
        }}
        initialImages={item.images}
        onSubmit={async (payload) => {
          await itemsApi.update(item._id, payload);
          navigate('/meus');
        }}
      />
    </div>
  );
}
