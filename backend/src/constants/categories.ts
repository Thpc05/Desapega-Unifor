/**
 * Categorias de item — FONTE ÚNICA DA VERDADE.
 *
 * Tanto o schema do Mongoose quanto a validação (Zod) leem daqui.
 * Para adicionar uma categoria nova (ex.: "Furniture"), basta acrescentar
 * uma linha neste array — nada mais precisa mudar. (princípio: extensível)
 */
export const ITEM_CATEGORIES = [
  'StudyMaterial', // Livros, papelaria, apostilas, xerox
  'Electronics',   // Componentes, cabos, Arduino
  'Peripherals',   // Mouse/teclado, calculadoras, instrumentos de eng./lab
  'Apparel',       // Jalecos, uniformes, EPI, vestuário
  'Other',         // O que não se encaixa
] as const;

/**
 * `as const` acima congela o array e faz o TypeScript tratar cada string como
 * um valor literal, não como "string" genérica. Isso permite a linha abaixo
 * gerar um TIPO que só aceita exatamente esses 5 valores.
 *
 * ItemCategory = 'StudyMaterial' | 'Electronics' | 'Peripherals' | 'Apparel' | 'Other'
 */
export type ItemCategory = (typeof ITEM_CATEGORIES)[number];
