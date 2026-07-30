/**
 * Cursos de graduação da Unifor (presenciais + EAD).
 * Fonte: https://unifor.br/web/graduacao/todos-os-cursos
 *
 * Usado como lista fixa de opções no cadastro/edição do usuário (campo `course`).
 * Mesmo padrão extensível das categorias: fonte única, `as const` gera o tipo.
 */
export const UNIFOR_COURSES = [
  // Presenciais
  'Administração',
  'Análise e Desenvolvimento de Sistemas',
  'Arquitetura e Urbanismo',
  'Biomedicina',
  'Cinema e Audiovisual',
  'Ciência da Computação',
  'Ciências Contábeis',
  'Ciências Econômicas',
  'Comércio Exterior',
  'Design',
  'Design de Interiores',
  'Design de Moda',
  'Direito',
  'Educação Física',
  'Enfermagem',
  'Engenharia Civil',
  'Engenharia Elétrica',
  'Engenharia Mecânica',
  'Engenharia da Computação',
  'Engenharia de Produção',
  'Energias Renováveis',
  'Engenharia Ambiental e Sanitária',
  'Engenharia de Controle e Automação',
  'Estética e Cosmética',
  'Farmácia',
  'Finanças',
  'Fisioterapia',
  'Fonoaudiologia',
  'Jornalismo',
  'Marketing',
  'Medicina',
  'Medicina Veterinária',
  'Moda',
  'Negócios',
  'Nutrição',
  'Odontologia',
  'Psicologia',
  'Publicidade e Propaganda',
  'Terapia Ocupacional',
  // EAD
  'Gestão Comercial',
  'Gestão da Tecnologia da Informação',
  'Gestão de RH',
  'Gestão Financeira',
  'Inteligência Artificial',
  'Inteligência de Negócios',
  'Logística',
  'Marketing Digital',
  'Segurança Cibernética',
] as const;

export type UniforCourse = (typeof UNIFOR_COURSES)[number];
