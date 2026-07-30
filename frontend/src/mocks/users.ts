export interface MockReview {
  reviewer: string;
  stars: number; // 0..5
  comment: string;
}

export interface MockProfile {
  matricula: string;
  name: string;
  course: string;
  semester: number;
  bio: string;
  xp: number;
  avgXpRating: number; // 0..5
  xpRatingCount: number;
  salesCount: number;
  donationCount: number;
  reviews: MockReview[];
}

const PROFILES: Record<string, MockProfile> = {
  '2312345': {
    matricula: '2312345', name: 'Thiago', course: 'Ciência da Computação', semester: 3,
    bio: 'Curto tecnologia e economia circular. Desapegando o que não uso mais. ⛏',
    xp: 120, avgXpRating: 4.5, xpRatingCount: 6, salesCount: 4, donationCount: 2,
    reviews: [
      { reviewer: 'Marina', stars: 5, comment: 'Vendedor super tranquilo, entrega combinada certinho!' },
      { reviewer: 'Bruno', stars: 4, comment: 'Item conforme descrito. Recomendo.' },
    ],
  },
  '2398765': {
    matricula: '2398765', name: 'Marina', course: 'Engenharia da Computação', semester: 5,
    bio: 'Apaixonada por eletrônica e maker.',
    xp: 40, avgXpRating: 4, xpRatingCount: 2, salesCount: 1, donationCount: 0,
    reviews: [{ reviewer: 'Thiago', stars: 4, comment: 'Negociação rápida e educada.' }],
  },
  '2345678': {
    matricula: '2345678', name: 'Bruno', course: 'Medicina', semester: 7,
    bio: 'Doando materiais pra quem está começando. 🩺',
    xp: 300, avgXpRating: 5, xpRatingCount: 9, salesCount: 6, donationCount: 5,
    reviews: [{ reviewer: 'Lia', stars: 5, comment: 'Muito gente boa, doou tudo em ótimo estado.' }],
  },
};

/** Retorna o perfil pela matrícula; "me" cai no usuário logado (mock: Thiago). */
export function getMockProfile(id: string | undefined): MockProfile {
  if (!id || id === 'me') return PROFILES['2312345'];
  return PROFILES[id] ?? PROFILES['2312345'];
}
