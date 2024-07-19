import { z } from 'zod';

export const MessageSchema = z.object({
  id: z.number(),
  message: z.string(),
});

export type Message = z.infer<typeof MessageSchema>;
