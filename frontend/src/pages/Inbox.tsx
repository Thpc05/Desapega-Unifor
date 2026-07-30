import { Link } from 'react-router-dom';
import { Panel } from '../components/ui/Panel';
import { Loading, ErrorState, EmptyState } from '../components/ui/State';
import { useInbox } from '../hooks/queries';
import { useAuth } from '../context/AuthContext';
import type { Conversation, UserRef } from '../types';

import styles from './Inbox.module.css';

/** Nome do "outro" participante (não eu) — buyer/seller vêm populados {name}. */
function otherName(c: Conversation, myId: string | undefined): string {
  const idOf = (u: string | UserRef) => (typeof u === 'object' ? u._id : u);
  const other = idOf(c.buyer) === myId ? c.seller : c.buyer;
  return typeof other === 'object' ? other.name : other;
}
function itemTitle(c: Conversation): string {
  return typeof c.item === 'object' ? c.item.title : '';
}

export function Inbox() {
  const { user } = useAuth();
  const { data: conversations, loading, error, refetch } = useInbox();

  if (loading) return <Loading label="Carregando conversas…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className={styles.page}>
      <h1>Conversas</h1>

      {conversations && conversations.length > 0 ? (
        <div className={styles.list}>
          {conversations.map((c) => {
            const name = otherName(c, user?.matricula);
            return (
              <Panel key={c._id} as={Link} to={`/chat/${c._id}`} interactive className={styles.row}>
                <span className={styles.avatar}>{name.charAt(0)}</span>
                <div className={styles.meta}>
                  <span className={styles.name}>{name}</span>
                  <span className={styles.item}>{itemTitle(c)}</span>
                  {c.lastMessagePreview && <span className={styles.preview}>{c.lastMessagePreview}</span>}
                </div>
              </Panel>
            );
          })}
        </div>
      ) : (
        <EmptyState>Nenhuma conversa ainda. Demonstre interesse em um item para começar.</EmptyState>
      )}
    </div>
  );
}
