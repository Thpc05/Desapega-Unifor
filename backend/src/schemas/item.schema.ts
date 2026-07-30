import { z } from 'zod';
import { ITEM_CATEGORIES } from '../constants/categories';

/**
 * ZOD = biblioteca de validação. A ideia: descrevemos como um dado VÁLIDO
 * deve ser, e o Zod checa em tempo de execução (runtime) se o que chegou na
 * requisição bate com isso. Se não bater, ele gera um erro detalhado.
 *
 * Por que precisamos disso se já temos TypeScript?
 *   - O TypeScript só existe ANTES de rodar (no editor/build). Ele some no build.
 *   - Em runtime, o que chega do cliente (req.body) é um "any" — pode vir QUALQUER
 *     coisa (campo faltando, tipo errado, JSON malformado). O Zod é a "portaria"
 *     que confere isso de verdade, na hora.
 */

// Schema para CRIAR um item (POST /api/items)
export const createItemSchema = z.object({
  body: z
    .object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().min(1, 'Description is required'),
      // z.enum aceita só os valores da nossa lista única de categorias
      category: z.enum(ITEM_CATEGORIES),
      type: z.enum(['sale', 'donation']),
      price: z.number().min(0).optional(),
      images: z
        .array(
          z.object({
            url: z.string().url('Each image must be a valid URL'),
            publicId: z.string().min(1),
          }),
        )
        .optional(),
    })
    // .refine = regra CRUZADA entre campos: se for venda, price é obrigatório.
    .refine((data) => data.type !== 'sale' || data.price !== undefined, {
      message: 'Items for sale require a price',
      path: ['price'],
    }),
});

// Schema para ATUALIZAR um item (PATCH /api/items/:id) — tudo opcional (.partial())
export const updateItemSchema = z.object({
  params: z.object({
    // IDs de item agora são strings compostas (<matricula>i<n>), tamanho variável.
    id: z.string().min(1, 'Invalid ID'),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    category: z.enum(ITEM_CATEGORIES).optional(),
    type: z.enum(['sale', 'donation']).optional(),
    price: z.number().min(0).optional(),
    images: z
      .array(z.object({ url: z.string().url(), publicId: z.string().min(1) }))
      .optional(),
    // Só disponível/reservado por aqui. Concluir é pelo endpoint /conclude,
    // que dispara XP e históricos — não pode ser um PATCH solto.
    status: z.enum(['available', 'reserved']).optional(),
  }),
});

// Schema da conclusão: POST /api/items/:id/conclude
// buyerId é opcional (venda sem comprador identificado / doação anônima).
export const concludeItemSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid ID'),
  }),
  body: z.object({
    // buyerId agora é a matrícula do comprador (string livre).
    buyerId: z.string().min(1, 'Invalid buyer ID').optional(),
  }),
});

// Schema para rotas que só recebem :id (GET /:id e DELETE /:id)
export const itemIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid ID'),
  }),
});
