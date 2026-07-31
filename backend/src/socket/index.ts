import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import { corsOrigin } from '../utils/corsOrigin';
import { conversationService } from '../services/conversation.service';
import { messageService } from '../services/message.service';

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  SOCKET.IO — a camada de tempo real (WebSocket) do chat.
 * ─────────────────────────────────────────────────────────────────────────
 *  Lembra das DUAS camadas:
 *   - Persistente (MongoDB): a conversa e as mensagens (fonte da verdade).
 *   - Sessão viva (aqui): "salas" na memória. Uma sala existe enquanto alguém
 *     está conectado nela; o Socket.io entra/sai por eventos, sem polling.
 *
 *  O io é acoplado ao MESMO servidor HTTP do Express (mesma porta) — ver server.ts.
 */

// Guardamos a instância para outras partes (ex.: a rota REST de enviar mensagem)
// conseguirem emitir para uma sala também.
let io: Server | null = null;

/** Lê a matrícula que guardamos no socket durante a autenticação. */
function getUserId(socket: Socket): string {
  return (socket.data as { userId: string }).userId;
}

/** Nome da sala de uma conversa. Uma sala por conversa. */
function roomName(conversationId: string): string {
  return `conversation:${conversationId}`;
}

/** Emite uma nova mensagem para todos que estão na sala daquela conversa. */
export function emitNewMessage(conversationId: string, message: unknown): void {
  io?.to(roomName(conversationId)).emit('message:new', message);
}

/** Inicializa o Socket.io sobre o servidor HTTP e registra os handlers. */
export function initSocket(httpServer: HttpServer): Server {
  // Usamos os tipos padrão do Socket.io (permitem qualquer evento). A matrícula do
  // usuário guardamos em socket.data e lemos via getUserId().
  io = new Server(httpServer, {
    cors: { origin: corsOrigin() }, // mesma regra do Express (via CORS_ORIGIN)
  });

  /**
   * MIDDLEWARE DE HANDSHAKE (io.use): roda UMA vez, quando o cliente conecta.
   * É o "authRequired" do socket. O cliente manda o token em `auth.token` ao
   * conectar; validamos e guardamos a matrícula em socket.data.
   */
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Token not provided'));
    try {
      const payload = verifyToken(token);
      (socket.data as { userId: string }).userId = payload.sub;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = getUserId(socket);
    console.log(`🔌 socket conectado — user ${userId} (${socket.id})`);

    /**
     * Entrar na sala de uma conversa. Só entra se for participante (comprador/
     * vendedor). A partir daqui, este socket recebe as mensagens novas em tempo real.
     */
    socket.on('conversation:join', async (payload: { conversationId: string }) => {
      try {
        await conversationService.findForParticipant(payload.conversationId, userId);
        socket.join(roomName(payload.conversationId));
        socket.emit('conversation:joined', { conversationId: payload.conversationId });
        console.log(`➡️  user ${userId} entrou na conversa ${payload.conversationId}`);
      } catch (err) {
        socket.emit('chat:error', normalizeError(err));
      }
    });

    /** Enviar mensagem: persiste no DB (service) e emite para a sala. */
    socket.on('message:send', async (payload: { conversationId: string; text: string }) => {
      try {
        const message = await messageService.send(payload.conversationId, userId, payload.text);
        emitNewMessage(payload.conversationId, message);
      } catch (err) {
        socket.emit('chat:error', normalizeError(err));
      }
    });

    // Sair da sala (opcional; o disconnect também remove automaticamente).
    socket.on('conversation:leave', (payload: { conversationId: string }) => {
      socket.leave(roomName(payload.conversationId));
    });

    // disconnect é automático: o Socket.io tira o socket de todas as salas.
    socket.on('disconnect', (reason: string) => {
      console.log(`🔌 socket desconectado — user ${userId} (${socket.id}) — ${reason}`);
    });
  });

  return io;
}

/** Deixa os erros dos services ({status, message}) num formato simples para o cliente. */
function normalizeError(err: unknown): { message: string } {
  if (err && typeof err === 'object' && 'message' in err) {
    return { message: String((err as { message: unknown }).message) };
  }
  return { message: 'Unexpected error' };
}
