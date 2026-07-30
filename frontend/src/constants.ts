import type { ItemCategory } from './types';

/** Rótulos em PT das categorias (o enum vem em inglês do backend). */
export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  StudyMaterial: 'Livros & Materiais de estudo',
  Electronics: 'Eletrônicos',
  Peripherals: 'Periféricos & Instrumentos',
  Apparel: 'Roupas',
  Other: 'Outros',
};

/** Rótulos curtos (pra chips de filtro, onde espaço é apertado). */
export const CATEGORY_SHORT: Record<ItemCategory, string> = {
  StudyMaterial: 'Estudos',
  Electronics: 'Eletrônicos',
  Peripherals: 'Periféricos',
  Apparel: 'Roupas',
  Other: 'Outros',
};

/** Textura de bloco associada a cada categoria (usada no selo). */
export const CATEGORY_TEXTURE: Record<ItemCategory, string> = {
  StudyMaterial: 'bookshelf',
  Electronics: 'lapis_block',
  Peripherals: 'iron_block',
  Apparel: 'white_wool',
  Other: 'cobblestone',
};

/** Ordem de exibição das categorias (ex.: em filtros). */
export const CATEGORY_ORDER: ItemCategory[] = [
  'StudyMaterial',
  'Electronics',
  'Peripherals',
  'Apparel',
  'Other',
];

/** Cursos da Unifor (espelha o backend) — usado no cadastro. */
export const COURSES: string[] = [
  'Administração', 'Análise e Desenvolvimento de Sistemas', 'Arquitetura e Urbanismo',
  'Biomedicina', 'Cinema e Audiovisual', 'Ciência da Computação', 'Ciências Contábeis',
  'Ciências Econômicas', 'Comércio Exterior', 'Design', 'Design de Interiores',
  'Design de Moda', 'Direito', 'Educação Física', 'Enfermagem', 'Engenharia Civil',
  'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia da Computação',
  'Engenharia de Produção', 'Energias Renováveis', 'Engenharia Ambiental e Sanitária',
  'Engenharia de Controle e Automação', 'Estética e Cosmética', 'Farmácia', 'Finanças',
  'Fisioterapia', 'Fonoaudiologia', 'Jornalismo', 'Marketing', 'Medicina',
  'Medicina Veterinária', 'Moda', 'Negócios', 'Nutrição', 'Odontologia', 'Psicologia',
  'Publicidade e Propaganda', 'Terapia Ocupacional', 'Gestão Comercial',
  'Gestão da Tecnologia da Informação', 'Gestão de RH', 'Gestão Financeira',
  'Inteligência Artificial', 'Inteligência de Negócios', 'Logística',
  'Marketing Digital', 'Segurança Cibernética',
];
