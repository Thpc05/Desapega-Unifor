import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { getToken } from '../api/client';
import type { Message } from '../types';

// O socket conecta na BASE do servidor (não no /api) — mesma porta do Express.
const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:3333').replace(/\/+$/, '');

/**
 * useChatSocket = a camada de TEMPO REAL do chat.
 *
 * Abre uma conexão WebSocket (autenticada com o token), entra na "sala" da
 * conversa e escuta `message:new`. Envio é via `message:send` — o servidor
 * persiste e reemite pra sala (inclusive pra você), então a mensagem aparece
 * pelo mesmo caminho de quem recebe (sem eco local, sem duplicar).
 */
export function useChatSocket(
  conversationId: string | undefined,
  onMessage: (m: Message) => void,
) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mantém a callback sempre atual sem precisar reconectar o socket a cada render.
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    const token = getToken();
    if (!conversationId || !token) return;

    const socket = io(BASE, { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => {
      setError(null);
      setConnected(true);
      socket.emit('conversation:join', { conversationId });
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('message:new', (m: Message) => onMessageRef.current(m));
    socket.on('chat:error', (e: { message: string }) => setError(e.message));
    socket.on('connect_error', (e) => setError(e.message));

    // Cleanup: fecha a conexão ao sair da conversa/desmontar.
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversationId]);

  function sendMessage(text: string) {
    socketRef.current?.emit('message:send', { conversationId, text });
  }

  return { sendMessage, connected, error };
}
