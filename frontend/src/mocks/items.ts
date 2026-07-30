import type { ItemCategory, ItemType } from '../types';

/**
 * Dados FALSOS (mock) só para montar o visual da F1, antes de conectar na API.
 * Formato enxuto focado nas telas (o Item real do backend é mais completo).
 */
export interface MockItem {
  _id: string;
  title: string;
  description: string;
  category: ItemCategory;
  type: ItemType;
  price?: number;
  image: string;
  sellerName: string;
  sellerMatricula: string;
  sellerXp: number;
}

// picsum.photos = imagens aleatórias (só mock; troca por Cloudinary na F4).
const img = (seed: string) => `https://picsum.photos/seed/${seed}/600/450`;

export const MOCK_ITEMS: MockItem[] = [
  { _id: '2312345i1', title: 'Cálculo Vol. 1 — Guidorizzi', description: 'Livro usado, em bom estado, poucas anotações a lápis. Ótimo para Cálculo I.', category: 'StudyMaterial', type: 'sale', price: 45, image: img('calc'), sellerName: 'Thiago', sellerMatricula: '2312345', sellerXp: 120 },
  { _id: '2312345i2', title: 'Jaleco branco (tam. M)', description: 'Jaleco de laboratório, tamanho M, usado um semestre. Limpo e sem manchas.', category: 'Apparel', type: 'donation', image: img('jaleco'), sellerName: 'Thiago', sellerMatricula: '2312345', sellerXp: 120 },
  { _id: '2398765i1', title: 'Calculadora HP 50g', description: 'Calculadora gráfica HP 50g, funcionando 100%, com capa. Ideal para engenharia.', category: 'Peripherals', type: 'sale', price: 260, image: img('hp50g'), sellerName: 'Marina', sellerMatricula: '2398765', sellerXp: 40 },
  { _id: '2398765i2', title: 'Kit Arduino Uno + sensores', description: 'Arduino Uno original + protoboard, jumpers e ~10 sensores. Tudo testado.', category: 'Electronics', type: 'sale', price: 150, image: img('arduino'), sellerName: 'Marina', sellerMatricula: '2398765', sellerXp: 40 },
  { _id: '2345678i1', title: 'Apostilas de Anatomia (2 vols.)', description: 'Duas apostilas de anatomia, coloridas. Doando para quem for começar Medicina.', category: 'StudyMaterial', type: 'donation', image: img('anatomia'), sellerName: 'Bruno', sellerMatricula: '2345678', sellerXp: 300 },
  { _id: '2345678i2', title: 'Cabo HDMI 2m', description: 'Cabo HDMI 2 metros, novo, na embalagem. Sobrou de uma compra.', category: 'Electronics', type: 'sale', price: 15, image: img('hdmi'), sellerName: 'Bruno', sellerMatricula: '2345678', sellerXp: 300 },
  { _id: '2311111i1', title: 'Óculos de proteção (EPI)', description: 'Óculos de proteção transparente, EPI de laboratório. Doação.', category: 'Apparel', type: 'donation', image: img('epi'), sellerName: 'Lia', sellerMatricula: '2311111', sellerXp: 75 },
  { _id: '2311111i2', title: 'Mochila para notebook', description: 'Mochila com compartimento acolchoado para notebook até 15". Pouco uso.', category: 'Other', type: 'sale', price: 80, image: img('mochila'), sellerName: 'Lia', sellerMatricula: '2311111', sellerXp: 75 },
];
