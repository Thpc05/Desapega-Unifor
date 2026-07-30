import { z } from 'zod';

// GET /api/conversation/:id/messages  (só :id)
export const conversationIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid ID'),
  }),
});

// POST /api/conversation/:id/messages  (fallback REST de envio)
export const sendMessageSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid ID'),
  }),
  body: z.object({
    text: z.string().min(1, 'Message text is required').max(2000),
  }),
});
