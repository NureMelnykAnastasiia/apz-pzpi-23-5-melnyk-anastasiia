import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const createLocationSchema = z.object({
  name: z.string().min(2).openapi({ example: 'Open Space 1', description: 'Назва кімнати або зони' }),
  floorNumber: z.number().int().optional().openapi({ example: 3, description: 'Номер поверху' }),
  description: z.string().optional().openapi({ example: 'Головна зона відпочинку', description: 'Опис приміщення' }),
  mapImageUrl: z.string().url().optional().nullable().openapi({ example: 'https://example.com/maps/floor3.jpg', description: 'Посилання на карту/схему' }),
}).openapi('CreateLocationRequest');

export const updateLocationSchema = createLocationSchema.partial().openapi('UpdateLocationRequest');

export type CreateLocationDto = z.infer<typeof createLocationSchema>;
export type UpdateLocationDto = z.infer<typeof updateLocationSchema>;