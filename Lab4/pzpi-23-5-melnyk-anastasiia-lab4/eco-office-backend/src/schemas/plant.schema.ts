import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const createPlantSchema = z.object({
  name: z.string().min(2).optional().openapi({ example: 'Офісний Фікус', description: 'Назва рослини' }),
  qrCodeId: z.string().min(1).openapi({ example: 'QR-12345', description: 'Унікальний ID QR-коду' }),
  speciesId: z.string().uuid().openapi({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'ID виду рослини' }),
  locationId: z.string().uuid().optional().nullable().openapi({ example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', description: 'ID локації' }),
  mapXCoordinate: z.number().int().optional().openapi({ example: 100 }),
  mapYCoordinate: z.number().int().optional().openapi({ example: 200 }),
  photoUrl: z.string().url().optional().nullable().openapi({ example: 'https://example.com/plant.jpg' }),
  healthStatus: z.enum(['HEALTHY', 'NEEDS_ATTENTION', 'CRITICAL']).optional().default('HEALTHY'),
}).openapi('CreatePlantRequest');

export const updatePlantSchema = createPlantSchema.partial().openapi('UpdatePlantRequest');

export type CreatePlantDto = z.infer<typeof createPlantSchema>;
export type UpdatePlantDto = z.infer<typeof updatePlantSchema>;