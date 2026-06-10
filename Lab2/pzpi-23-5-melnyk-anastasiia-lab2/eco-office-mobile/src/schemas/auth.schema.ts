import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Некоректний формат email'),
  password: z.string().min(6, 'Пароль має містити мінімум 6 символів'),
  fullName: z.string().min(2, 'Ім\'я занадто коротке'),
  role: z.enum(['ADMIN', 'OFFICE_MANAGER', 'FLORIST', 'CLEANER']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Некоректний формат email'),
  password: z.string().min(1, 'Пароль є обов\'язковим'),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;