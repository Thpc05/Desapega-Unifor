import mongoose from 'mongoose';

/**
 * Conexão com o MongoDB Atlas (banco na nuvem).
 *
 * A string de conexão (MONGODB_URI) fica no .env — nunca no código — porque
 * contém usuário e senha do seu banco. Se vazar no git, qualquer um acessa.
 *
 * `Promise<void>` = função assíncrona que não devolve valor, só realiza o efeito
 * de conectar. Se falhar, encerramos o processo (process.exit) porque uma API
 * sem banco não tem como funcionar — melhor falhar cedo e claro.
 */
export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI não definida no .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Conectado ao MongoDB Atlas');
  } catch (err) {
    console.error('❌ Falha ao conectar no MongoDB:', err);
    process.exit(1);
  }
}
