import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Field';
import { Loading, ErrorState } from '../components/ui/State';
import { useMessages, useInbox } from '../hooks/queries';
import { useAuth } from '../context/AuthContext';
import { conversationsApi } from '../api/conversations.api';
import { apiErrorMessage } from '../api/client';
import type { Message, UserRef } from '../types';
import styles from './Chat.module.css';

/** ISO → HH:MM (hora local). */
function hhmm(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, error, refetch } = useMessages(id);
  const inbox = useInbox();

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  // Quando o histórico carrega, semeia a lista local.
  useEffect(() => {
    if (data) setMessages(data);
  }, [data]);

  // Rola pro fim sempre que chega mensagem nova.
  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [messages]);

  // Cabeçalho: acha a conversa no inbox pra mostrar nome do outro + título do item.
  const convo = inbox.data?.find((c) => c._id === id);
  const nameOf = (u: string | UserRef | undefined) =>
    !u ? '' : typeof u === 'object' ? u.name : u;
  const otherName =
    convo && user
      ? (typeof convo.buyer === 'object' ? convo.buyer._id : convo.buyer) === user.matricula
        ? nameOf(convo.seller)
        : nameOf(convo.buyer)
      : 'Conversa';
  const itemTitle = convo && typeof convo.item === 'object' ? convo.item.title : '';

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t || !id) return;
    setSending(true);
    setSendError(null);
    try {
      const msg = await conversationsApi.sendMessage(id, t);
      setMessages((prev) => [...prev, msg]);
      setText('');
    } catch (err) {
      setSendError(apiErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  if (loading) return <Loading label="Abrindo conversa…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className={styles.page}>
      <Panel elevated className={styles.header}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/chat')}>
          ←
        </Button>
        <span className={styles.avatar}>{(otherName || '?').charAt(0)}</span>
        <div className={styles.hMeta}>
          <span className={styles.hName}>{otherName}</span>
          {itemTitle && <span className={styles.hItem}>{itemTitle}</span>}
        </div>
      </Panel>

      <div className={styles.thread} ref={threadRef}>
        {messages.map((m) => {
          const mine = m.sender === user?.matricula;
          return (
            <div key={m._id} className={`${styles.msg} ${mine ? styles.mine : styles.theirs}`}>
              {m.text}
              <span className={styles.time}>{hhmm(m.createdAt)}</span>
            </div>
          );
        })}
      </div>

      {sendError && <ErrorState message={sendError} />}

      <form className={styles.composer} onSubmit={send}>
        <Input
          className={styles.input}
          placeholder="Escreva uma mensagem..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button type="submit" texture="cobblestone" loading={sending}>
          Enviar
        </Button>
      </form>
    </div>
  );
}
