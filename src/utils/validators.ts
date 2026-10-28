import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
});

export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2, 'Informe seu nome'),
  phone: z.string().optional(),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
