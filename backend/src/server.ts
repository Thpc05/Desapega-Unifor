import 'dotenv/config'; // carrega o .env para dentro de process.env (fica no TOPO de tudo)
import http from 'http';
import app from './app';
import { connectDatabase } from './config/db';
import { initSocket } from './socket';

/**
 * server.ts é o PONTO DE ENTRADA da aplicação.
 *
 * MUDANÇA da Etapa 2c: antes fazíamos `app.listen(...)`. Agora criamos um
 * `http.Server` EXPLÍCITO a partir do app Express e acoplamos o Socket.io nele.
 * Motivo: o WebSocket (Socket.io) e o HTTP (Express) precisam dividir o MESMO
 * servidor/porta — o `app.listen` esconde esse http.Server, então nós o criamos
 * à mão para poder entregá-lo ao Socket.io.
 *
 * Ordem de inicialização:
 *   1. Conecta no banco.
 *   2. Sobe o servidor HTTP (que já tem o Socket.io acoplado).
 */
const PORT = process.env.PORT ?? 3333;

async function start() {
  await connectDatabase();

  // http.createServer(app) = o mesmo servidor que o app.listen criaria por baixo.
  const httpServer = http.createServer(app);

  // Acopla o Socket.io a esse servidor (mesma porta do Express).
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`💬 Socket.io ativo no mesmo endereço`);
  });
}

start();
