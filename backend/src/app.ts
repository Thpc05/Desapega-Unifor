import express from 'express';
import cors from 'cors';
import itemRoutes from './routes/item.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import conversationRoutes from './routes/conversation.routes';
import imageRoutes from './routes/image.routes';
import { errorHandler } from './middlewares/error.middleware';

/**
 * app.ts MONTA a aplicação Express (mas NÃO a sobe — quem sobe é o server.ts).
 * Separar "montar" de "subir" ajuda em testes e deixa cada arquivo com uma função.
 *
 * A ORDEM aqui importa muito. Uma requisição atravessa isto de cima para baixo:
 *   1. cors()            -> libera o front (outra origem) a chamar a API
 *   2. express.json()    -> lê o corpo JSON da requisição e vira req.body
 *   3. rotas             -> a lógica de fato
 *   4. errorHandler      -> SEMPRE por último, para capturar erros de tudo acima
 */
const app = express();

app.use(cors());
app.use(express.json());

// Rota de "saúde": um jeito rápido de testar se a API está no ar.
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Desapego Unifor API is running 🌱' });
});

// Rotas de autenticação (registro, login, dados do usuário logado).
app.use('/api/auth', authRoutes);

// Rotas de usuário (perfil público, editar próprio perfil).
app.use('/api/user', userRoutes);

// Todas as rotas de item ficam sob o prefixo /api/item.
app.use('/api/item', itemRoutes);

// Rotas de conversa/chat (caixa de entrada e mensagens).
app.use('/api/conversation', conversationRoutes);

// Rotas de imagem (upload/remoção no Cloudinary).
app.use('/api/image', imageRoutes);

// Middleware de erro fica por último, depois de todas as rotas.
app.use(errorHandler);

export default app;
