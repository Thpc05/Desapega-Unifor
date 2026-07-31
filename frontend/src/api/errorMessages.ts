/**
 * Tradução das mensagens de erro do backend (que ficam em inglês, por decisão
 * de projeto — inglês é o "contrato" da API) para PT, só na CAMADA DE EXIBIÇÃO.
 *
 * Assim a API continua padronizada em inglês e o usuário vê tudo em português.
 * Se chegar uma mensagem que não está no mapa, mostramos ela como veio (fallback).
 */
const PT: Record<string, string> = {
  // Validação (Zod)
  'Enrollment ID is required': 'Informe a matrícula',
  'Name is required': 'Informe o nome',
  'Invalid email': 'E-mail inválido',
  'Phone is required': 'Informe o telefone',
  'Password must be at least 6 characters': 'A senha deve ter no mínimo 6 caracteres',
  'Password is required': 'Informe a senha',
  'Items for sale require a price': 'Itens à venda precisam de preço',
  'Title is required': 'Informe o título',
  'Description is required': 'Informe a descrição',
  'Invalid ID': 'ID inválido',
  'Validation error': 'Dados inválidos',

  // Autenticação
  'Enrollment ID already registered': 'Essa matrícula já está cadastrada',
  'Invalid enrollment ID or password': 'Matrícula ou senha incorretos',

  // Regras de negócio
  'Item not found': 'Item não encontrado',
  'User not found': 'Usuário não encontrado',
  'Buyer not found': 'Comprador não encontrado',
  'Conversation not found': 'Conversa não encontrada',
  'This item is not yours': 'Este anúncio não é seu',
  'This deal is already concluded': 'Este negócio já foi concluído',
  'Only concluded deals can be reviewed': 'Só negócios concluídos podem ser avaliados',
  'Only sales can be reviewed': 'Só vendas podem ser avaliadas',
  'You already reviewed this deal': 'Você já avaliou este negócio',
  'You are not part of this conversation': 'Você não faz parte desta conversa',
  'You cannot be the buyer of your own item': 'Você não pode comprar o próprio item',
  'You cannot start a chat on your own item': 'Você não pode conversar no seu próprio anúncio',
  'You did not take part in this deal': 'Você não participou deste negócio',
  'Internal server error': 'Erro interno do servidor',
};

/** Traduz uma mensagem do backend; se não conhecer, devolve ela mesma. */
export function translateError(message: string): string {
  return PT[message] ?? message;
}
