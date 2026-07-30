export interface MockMessage {
  _id: string;
  sender: string;   // matrícula
  text: string;
  createdAt: string;
}

export interface MockConversation {
  _id: string;
  itemTitle: string;
  otherName: string;      // com quem você fala
  lastMessagePreview: string;
  messages: MockMessage[];
}

const ME = '2312345'; // usuário logado (mock)

export const MOCK_CONVERSATIONS: MockConversation[] = [
  {
    _id: '2398765i1c2312345',
    itemTitle: 'Calculadora HP 50g',
    otherName: 'Marina',
    lastMessagePreview: 'Fechado! Amanhã às 14h no bloco J.',
    messages: [
      { _id: 'm1', sender: ME, text: 'Oi! A HP 50g ainda está disponível?', createdAt: '10:02' },
      { _id: 'm2', sender: '2398765', text: 'Oi! Ainda sim 🙂', createdAt: '10:05' },
      { _id: 'm3', sender: ME, text: 'Consegue por 240 esmeraldas?', createdAt: '10:06' },
      { _id: 'm4', sender: '2398765', text: 'Consigo! Pode buscar na Unifor?', createdAt: '10:08' },
      { _id: 'm5', sender: ME, text: 'Perfeito. Amanhã de tarde serve?', createdAt: '10:09' },
      { _id: 'm6', sender: '2398765', text: 'Fechado! Amanhã às 14h no bloco J.', createdAt: '10:10' },
    ],
  },
  {
    _id: '2345678i1c2312345',
    itemTitle: 'Apostilas de Anatomia (2 vols.)',
    otherName: 'Bruno',
    lastMessagePreview: 'Pode deixar, separo pra você!',
    messages: [
      { _id: 'm1', sender: ME, text: 'As apostilas de anatomia ainda estão de pé?', createdAt: 'Ontem' },
      { _id: 'm2', sender: '2345678', text: 'Estão! É doação, pode pegar.', createdAt: 'Ontem' },
      { _id: 'm3', sender: ME, text: 'Muito obrigado! Passo aí quinta.', createdAt: 'Ontem' },
      { _id: 'm4', sender: '2345678', text: 'Pode deixar, separo pra você!', createdAt: 'Ontem' },
    ],
  },
];

export function getMockConversation(id: string | undefined) {
  return MOCK_CONVERSATIONS.find((c) => c._id === id);
}

export const ME_MATRICULA = ME;
