/**
 * ─────────────────────────────────────────────────────────────────────────
 *  MINI-CLIENTE DE CHAT (para testar o Socket.io pelo terminal)
 * ─────────────────────────────────────────────────────────────────────────
 *  Este script NÃO faz parte da API — é só uma ferramenta de teste. Ele conecta
 *  no servidor como se fosse o frontend: manda o token na autenticação, entra na
 *  sala de uma conversa e fica enviando/recebendo mensagens em tempo real.
 *
 *  O código aqui é praticamente o mesmo que o React vai usar na Etapa 3.
 *
 *  USO:
 *    npm run chat-test -- <TOKEN> <CONVERSATION_ID> [URL_DO_SERVIDOR]
 *
 *  Abra DOIS terminais (com tokens de usuários diferentes) e o mesmo
 *  CONVERSATION_ID para ver a troca de mensagens ao vivo.
 */
import { io } from 'socket.io-client';
import readline from 'readline';

// process.argv = ['node', 'script', ...seus_argumentos]. Pegamos do índice 2.
const [token, conversationId, url = 'http://localhost:3333'] = process.argv.slice(2);

if (!token || !conversationId) {
  console.error('Uso: npm run chat-test -- <TOKEN> <CONVERSATION_ID> [URL]');
  process.exit(1);
}

// 1) Conecta mandando o token na "auth" do handshake (o io.use() do servidor lê daqui).
const socket = io(url, { auth: { token } });

// 2) Quando conectar, entra na sala daquela conversa.
socket.on('connect', () => {
  console.log(`\n🔌 Conectado (socket ${socket.id}). Entrando na conversa...`);
  socket.emit('conversation:join', { conversationId });
});

// 3) Confirmação de que entrou na sala → libera a digitação.
socket.on('conversation:joined', (data: { conversationId: string }) => {
  console.log(`✅ Na conversa ${data.conversationId}. Digite e tecle Enter para enviar.\n`);
});

// 4) Mensagem nova chegando (emitida pelo servidor para a sala).
socket.on('message:new', (msg: { sender: string; text: string }) => {
  console.log(`💬 [${msg.sender}] ${msg.text}`);
});

// 5) Erros de negócio vindos do servidor (ex.: não é participante).
socket.on('chat:error', (err: { message: string }) => {
  console.log(`⚠️  ${err.message}`);
});

// 6) Erro de conexão (ex.: token inválido no handshake).
socket.on('connect_error', (err: Error) => {
  console.log(`❌ Falha ao conectar: ${err.message}`);
  process.exit(1);
});

socket.on('disconnect', (reason: string) => {
  console.log(`🔌 Desconectado: ${reason}`);
});

// 7) Lê linhas do teclado e envia cada uma como mensagem (emitindo message:send).
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line: string) => {
  const text = line.trim();
  if (text) socket.emit('message:send', { conversationId, text });
});

// Ctrl+C encerra limpo.
rl.on('SIGINT', () => {
  socket.close();
  process.exit(0);
});
