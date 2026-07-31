import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Price } from '../components/ui/Price';
import { Loading, ErrorState, EmptyState } from '../components/ui/State';
import { Icon } from '../components/ui/Icon';
import { CraftPlus } from '../components/ui/CraftPlus';
import { useMyItems, useConcluded, useInbox } from '../hooks/queries';
import { itemsApi } from '../api/items.api';
import { apiErrorMessage } from '../api/client';
import { itemImage, isReviewable } from '../utils/item';
import { refId, refName } from '../utils/review';
import type { Item } from '../types';
import styles from './MyItems.module.css';

type Tab = 'available' | 'concluded';

export function MyItems() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('available');

  const active = useMyItems();
  const concluded = useConcluded();
  const inbox = useInbox();
  const current = tab === 'available' ? active : concluded;

  const [busyId, setBusyId] = useState<string | null>(null);
  const [choosingFor, setChoosingFor] = useState<string | null>(null); // item escolhendo comprador
  const [actionError, setActionError] = useState<string | null>(null);

  // Interessados num item = minhas conversas daquele anúncio (comprador populado).
  function interestedBuyers(itemId: string) {
    return (inbox.data ?? [])
      .filter((c) => (typeof c.item === 'object' ? c.item._id : c.item) === itemId)
      .map((c) => ({ id: refId(c.buyer), name: refName(c.buyer) }));
  }

  async function conclude(item: Item, buyer?: string) {
    setBusyId(item._id);
    setActionError(null);
    try {
      await itemsApi.conclude(item._id, buyer);
      setChoosingFor(null);
      active.refetch();
      concluded.refetch();
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  function onConcludeClick(item: Item) {
    // Doação conclui direto (receptor anônimo). Venda abre o seletor de comprador.
    if (item.type === 'donation') {
      if (confirm(`Concluir a doação "${item.title}"?`)) conclude(item);
    } else {
      setChoosingFor(choosingFor === item._id ? null : item._id);
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
        <Button variant="plain" icon={<CraftPlus />} onClick={() => navigate('/anunciar')}>
          Anunciar
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
            const buyers = interestedBuyers(item._id);
            return (
              <Panel key={item._id} className={styles.row}>
                <div className={styles.rowMain}>
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

                  <div className={styles.actions}>
                    {isConcluded ? (
                      isReviewable(item) && (
                        <Button size="sm" variant="primary" onClick={() => navigate(`/avaliar/${item._id}`)}>
                          Avaliar +
                        </Button>
                      )
                    ) : (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => navigate(`/editar/${item._id}`)}>
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          icon={<Icon name="checkmark" size={13} />}
                          onClick={() => onConcludeClick(item)}
                          loading={busyId === item._id}
                        >
                          Concluir
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(item)} loading={busyId === item._id}>
                          Excluir
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Seletor de comprador (só venda, ao clicar em Concluir) */}
                {choosingFor === item._id && (
                  <div className={styles.chooser}>
                    <span className={styles.chooserLabel}>Concluir a venda com quem?</span>
                    <div className={styles.chooserOpts}>
                      {buyers.length > 0 ? (
                        buyers.map((b) => (
                          <Button key={b.id} size="sm" variant="secondary" onClick={() => conclude(item, b.id)}>
                            {b.name}
                          </Button>
                        ))
                      ) : (
                        <span className={styles.noBuyers}>Ninguém demonstrou interesse ainda.</span>
                      )}
                      <Button size="sm" variant="plain" onClick={() => conclude(item)}>
                        Concluí por fora (sem comprador)
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setChoosingFor(null)}>
                        Cancelar
                      </Button>
                    </div>
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
