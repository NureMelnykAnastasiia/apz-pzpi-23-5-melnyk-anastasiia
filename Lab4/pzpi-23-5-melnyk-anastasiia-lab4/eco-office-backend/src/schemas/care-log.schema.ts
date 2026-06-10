import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const createCareLogSchema = z.object({
  plantId: z.string().uuid().optional().nullable().openapi({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'ID рослини (обов`язково, якщо немає taskId)' }),
  
  taskId: z.string().uuid().optional().nullable().openapi({ example: 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', description: 'ID завдання (якщо виконується по завданню)' }),
  
  type: z.enum(['WATERING', 'FERTILIZING', 'LIGHT_ADJUSTMENT', 'PEST_CONTROL', 'CLEANING'])
    .optional()
    .openapi({ example: 'WATERING', description: 'Тип дії (обов`язково, якщо немає taskId)' }),
  
  performedByUserId: z.string().uuid().optional().nullable().openapi({ description: 'Ігнорується. Береться з токена.' }),
  
  notes: z.string().optional().openapi({ example: 'Рослина виглядає сухою', description: 'Примітки' }),
  verifiedByScan: z.boolean().optional().default(false).openapi({ example: true, description: 'Чи підтверджено скан-кодом' }),
  performedAt: z.string().datetime().optional().openapi({ example: '2025-12-06T10:00:00Z', description: 'Час виконання' }),
}).openapi('CreateCareLogRequest');

export const updateCareLogSchema = createCareLogSchema.partial().openapi('UpdateCareLogRequest');

export type CreateCareLogDto = z.infer<typeof createCareLogSchema>;
export type UpdateCareLogDto = z.infer<typeof updateCareLogSchema>;