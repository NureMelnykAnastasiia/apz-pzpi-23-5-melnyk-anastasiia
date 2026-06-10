import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const createReadingSchema = z.object({
  sensorId: z.string().uuid().openapi({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'ID сенсора' }),
  type: z.enum(['SOIL_MOISTURE', 'AIR_TEMPERATURE', 'AIR_HUMIDITY', 'LIGHT_INTENSITY', 'BATTERY_LEVEL'])
    .openapi({ example: 'SOIL_MOISTURE', description: 'Тип показника' }),
  value: z.number().openapi({ example: 45.5, description: 'Значення (число)' }),
  recordedAt: z.string().datetime().optional().openapi({ example: '2025-12-06T12:00:00Z', description: 'Час запису (якщо пусто - поточний)' }),
}).openapi('CreateReadingRequest');

export const updateReadingSchema = createReadingSchema.partial().openapi('UpdateReadingRequest');


export const createIoTReadingSchema = z.object({
  macAddress: z.string().openapi({ example: 'AA:BB:CC:DD:EE:FF', description: 'MAC-адреса фізичного пристрою' }),
  type: z.enum(['SOIL_MOISTURE', 'AIR_TEMPERATURE', 'AIR_HUMIDITY', 'LIGHT_INTENSITY', 'BATTERY_LEVEL']),
  value: z.number(),
  recordedAt: z.string().datetime().optional(),
}).openapi('CreateIoTReadingRequest');

export type CreateReadingDto = z.infer<typeof createReadingSchema>;
export type UpdateReadingDto = z.infer<typeof updateReadingSchema>;
export type CreateIoTReadingDto = z.infer<typeof createIoTReadingSchema>;