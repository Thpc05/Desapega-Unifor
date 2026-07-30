import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Price } from '../components/ui/Price';
import { Loading, ErrorState, EmptyState } from '../components/ui/State';
import { useMyItems, useConcluded } from '../hooks/queries';
import { itemsApi } from '../api/items.api';
import { apiErrorMessage } from '../api/client';
import { itemImage } from '../utils/item';
import type { Item } from '../types';
import styles from './MyItems.module.css';

type Tab = 'available' | 'concluded';

export function MyItems() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('available');

  const active = useMyItems();
  const concluded = useConcluded();
  const current = tab === 'available' ? active : concluded;
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleConclude(item: Item) {
    if (!confirm(`Concluir "${item.title}"? Isso finaliza o anúncio.`)) return;
    setBusyId(item._id);
    setActionError(null);
    try {
      await itemsApi.conclude(item._id); // sem comprador identificado (fora do app)
      active.refetch();
      concluded.refetch();
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(item: Item) {
    if (!confirm(`Excluir "${item.title}"? Não dá pra desfazer.`)) return;
    setBusyId(item._id);
    setActionError(null);
    try {
      await itemsApi.remove(item._id);
      active.refetch();
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1>Meus anúncios</h1>
        <Button texture="grass_block_side" onClick={() => navigate('/anunciar')}>
          + Anunciar
        </Button>
      </div>

      <div className={styles.actions}>
        <Button size="sm" variant={tab === 'available' ? 'primary' : 'secondary'} onClick={() => setTab('available')}>
          Ativos
        </Button>
        <Button size="sm" variant={tab === 'concluded' ? 'primary' : 'secondary'} onClick={() => setTab('concluded')}>
          Concluídos
        </Button>
      </div>

      {actionError && <ErrorState message={actionError} />}

      {current.loading ? (
        <Loading />
      ) : current.error ? (
        <ErrorState message={current.error} onRetry={current.refetch} />
      ) : current.data && current.data.length > 0 ? (
        <div className={styles.list}>
          {current.data.map((item) => {
            const img = itemImage(item);
            const isConcluded = item.status === 'concluded';
            return (
              <Panel key={item._id} className={styles.row}>
                <Link to={`/item/${item._id}`}>
                  {img ? (
                    <img className={styles.thumb} src={img} alt={item.title} />
                  ) : (
                    <div className={styles.thumb} />
                  )}
                </Link>
                <div className={styles.meta}>
                  <span className={styles.title}>{item.title}</span>
                  <span className={styles.sub}>
                    <Price value={item.type === 'donation' ? undefined : item.price} />
                    <span className={`${styles.status} ${isConcluded ? styles.concluded : styles.available}`}>
                      {isConcluded ? 'Concluído' : 'Disponível'}
                    </span>
                  </span>
                </div>
                {!isConcluded && (
                  <div className={styles.actions}>
                    <Button size="sm" onClick={() => handleConclude(item)} loading={busyId === item._id}>
                      Concluir
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(item)} loading={busyId === item._id}>
                      Excluir
                    </Button>
                  </div>
                )}
              </Panel>
            );
          })}
        </div>
      ) : (
        <EmptyState>
          {tab === 'available' ? 'Você ainda não tem anúncios ativos.' : 'Nenhum negócio concluído ainda.'}
        </EmptyState>
      )}
    </div>
  );
}
