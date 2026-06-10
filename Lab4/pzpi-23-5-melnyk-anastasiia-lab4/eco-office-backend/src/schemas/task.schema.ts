import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const createTaskSchema = z.object({
  plantId: z.string().uuid().openapi({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'ID рослини' }),
  requiredRole: z.enum(['ADMIN', 'OFFICE_MANAGER', 'FLORIST', 'CLEANER'])
    .openapi({ example: 'CLEANER', description: 'Хто має виконати завдання' }),
  type: z.enum(['WATERING', 'FERTILIZING', 'LIGHT_ADJUSTMENT', 'PEST_CONTROL', 'CLEANING'])
    .openapi({ example: 'WATERING', description: 'Тип завдання' }),
  priority: z.number().int().min(1).max(3).optional().default(1)
    .openapi({ example: 2, description: 'Пріоритет (1-Звичайний, 3-Терміновий)' }),
  description: z.string().optional().openapi({ example: 'Полити 200мл води', description: 'Інструкція' }),
  dueDate: z.string().datetime().optional().openapi({ example: '2025-12-07T10:00:00Z', description: 'Дедлайн' }),
}).openapi('CreateTaskRequest');

export const updateTaskSchema = createTaskSchema.partial().openapi('UpdateTaskRequest');

export const updateTaskStatusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'SKIPPED'])
    .openapi({ example: 'COMPLETED', description: 'Новий статус завдання' }),
}).openapi('UpdateTaskStatusRequest');

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusDto = z.infer<typeof updateTaskStatusSchema>;