import { z } from 'zod';

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'Le prénom doit contenir au moins 2 caractères')
      .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
      .regex(
        /^[a-zA-ZÀ-ÿ\s'-]+$/,
        'Le prénom ne peut contenir que des lettres, espaces, apostrophes et tirets'
      ),

    lastName: z
      .string()
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(50, 'Le nom ne peut pas dépasser 50 caractères')
      .regex(
        /^[a-zA-ZÀ-ÿ\s'-]+$/,
        'Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets'
      ),

    email: z
      .string()
      .min(1, "L'email est requis")
      .email('Email invalide')
      .toLowerCase(),

    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)'
      ),

    confirmPassword: z.string().min(1, 'La confirmation du mot de passe est requise'),

    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^(\+216|00216)?[2-9]\d{7}$/.test(val),
        'Le numéro de téléphone doit être au format tunisien (+216XXXXXXXX ou XXXXXXXX)'
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email('Email invalide')
    .toLowerCase(),

  password: z.string().min(1, 'Le mot de passe est requis'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
