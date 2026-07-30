import { Schema, model } from 'mongoose';

/**
 * Conversation = o "fio" de conversa de um comprador interessado em UM anúncio
 * (estilo OLX). É a CAMADA PERSISTENTE do chat (a fonte da verdade). Existe para
 * sempre depois de criada; as salas ao vivo do Socket.io são outra coisa (efêmeras).
 *
 * `_id` composto: `<id_do_item>c<matricula_do_comprador>` (ex.: "2312345i1c2398765").
 * Assim como nas reviews, isso já garante 1 conversa por (item, comprador) de graça.
 */
export interface IConversation {
  _id: string;
  item: string;               // id do anúncio
  buyer: string;              // matrícula do interessado
  seller: string;             // matrícula do dono do anúncio (= item.owner)
  lastMessageAt?: Date;       // ordena a caixa de entrada
  lastMessagePreview?: string; // prévia da última msg (mostra na lista sem carregar tudo)
}

const conversationSchema = new Schema<IConversation>(
  {
    _id: { type: String, required: true }, // gerado no service
    item: { type: String, ref: 'Item', required: true },
    buyer: { type: String, ref: 'User', required: true },
    seller: { type: String, ref: 'User', required: true },
    lastMessageAt: { type: Date },
    lastMessagePreview: { type: String, trim: true },
  },
  { timestamps: true },
);

export const Conversation = model<IConversation>('Conversation', conversationSchema);
