import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Field';
import { Icon } from '../components/ui/Icon';
import { Avatar } from '../components/ui/Avatar';
import { Loading, ErrorState } from '../components/ui/State';
import { useMessages, useInbox } from '../hooks/queries';
import { useChatSocket } from '../hooks/useChatSocket';
import { useAuth } from '../context/AuthContext';
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
  const threadRef = useRef<HTMLDivElement>(null);

  // Adiciona uma mensagem evitando duplicar (mesmo _id).
  const addMessage = useCallback((m: Message) => {
    setMessages((prev) => (prev.some((x) => x._id === m._id) ? prev : [...prev, m]));
  }, []);

  // Tempo real: entra na sala e recebe as mensagens novas (inclusive as minhas).
  const { sendMessage, connected, error: socketError } = useChatSocket(id, addMessage);

  // Quando o histórico (REST) carrega, semeia a lista local.
  useEffect(() => {
    if (data) setMessages(data);
  }, [data]);

  // Rola pro fim sempre que chega mensagem nova.
  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [messages]);

  // Cabeçalho: acha a conversa no inbox pra mostrar o outro participante + item.
  const convo = inbox.data?.find((c) => c._id === id);
  const otherRef: string | UserRef | null = (() => {
    if (!convo || !user) return null;
    const idOf = (u: string | UserRef) => (typeof u === 'object' ? u._id : u);
    return idOf(convo.buyer) === user.matricula ? convo.seller : convo.buyer;
  })();
  const otherName = otherRef ? (typeof otherRef === 'object' ? otherRef.name : otherRef) : 'Conversa';
  const otherAvatar = otherRef && typeof otherRef === 'object' ? otherRef.avatarUrl : undefined;
  const itemTitle = convo && typeof convo.item === 'object' ? convo.item.title : '';

  function send(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    // Envia pelo socket; a mensagem volta via 'message:new' e é adicionada lá.
    sendMessage(t);
    setText('');
  }

  if (loading) return <Loading label="Abrindo conversa…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className={styles.page}>
      <Panel elevated className={styles.header}>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Voltar"
          icon={<Icon name="page_backward" width={26} height={15} />}
          onClick={() => navigate('/chat')}
        />
        <Avatar url={otherAvatar} name={otherName} size={40} />
        <div className={styles.hMeta}>
          <span className={styles.hName}>{otherName}</span>
          {itemTitle && <span className={styles.hItem}>{itemTitle}</span>}
        </div>
        <span
          className={`${styles.dot} ${connected ? styles.online : styles.offline}`}
          title={connected ? 'Conectado (tempo real)' : 'Conectando…'}
        />
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

      {socketError && <ErrorState message={socketError} />}

      <form className={styles.composer} onSubmit={send}>
        <Input
          className={styles.input}
          placeholder="Escreva uma mensagem..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button type="submit" texture="cobblestone">
          Enviar
        </Button>
      </form>
    </div>
  );
}
