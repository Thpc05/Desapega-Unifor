import { Schema, model, Types } from 'mongoose';

/**
 * Message = uma mensagem dentro de uma conversa.
 *
 * Diferente das outras coleções, aqui deixamos o `_id` ser o ObjectId automático
 * do Mongo. Motivo: mensagens são muitas e nunca são referenciadas por um id
 * "legível" em nenhum lugar — então não ganhamos nada com id composto e evitamos
 * um contador a mais. (As referências `conversation` e `sender` continuam String.)
 */
export interface IMessage {
  _id: Types.ObjectId;
  conversation: string; // id da conversa
  sender: string;       // matrícula de quem enviou
  text: string;
  readAt?: Date | null;
  createdAt: Date;      // preenchido pelo timestamps (declarado p/ o TS enxergar)
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversation: { type: String, ref: 'Conversation', required: true, index: true },
    sender: { type: String, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }, // createdAt = quando a mensagem foi enviada
);

export const Message = model<IMessage>('Message', messageSchema);
