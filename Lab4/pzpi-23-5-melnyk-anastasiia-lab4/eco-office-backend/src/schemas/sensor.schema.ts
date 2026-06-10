import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const createSensorSchema = z.object({
  macAddress: z.string().min(12).max(17).openapi({ example: 'AA:BB:CC:11:22:33', description: 'MAC-адреса пристрою (унікальна)' }),
  plantId: z.string().uuid().optional().nullable().openapi({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'ID рослини, до якої прикріплений сенсор' }),
  sensorModel: z.string().optional().openapi({ example: 'ESP32-S2', description: 'Модель сенсора' }),
  firmwareVersion: z.string().optional().openapi({ example: 'v1.0.4', description: 'Версія прошивки' }),
  isActive: z.boolean().optional().default(true).openapi({ example: true, description: 'Чи активний сенсор' }),
}).openapi('CreateSensorRequest');

export const updateSensorSchema = z.object({
  macAddress: z.string().min(12).max(17).optional(),
  plantId: z.string().uuid().nullable().optional(),
  sensorModel: z.string().optional(),
  firmwareVersion: z.string().optional(),
  isActive: z.boolean().optional(),
}).openapi('UpdateSensorRequest');

export type CreateSensorDto = z.infer<typeof createSensorSchema>;
export type UpdateSensorDto = z.infer<typeof updateSensorSchema>;