import { z } from 'zod';

export const updateOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100)
    .optional(),
  phone: z.string().max(20).optional().nullable(),
  website: z.string().url('Invalid website URL').optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  logoUrl: z.string().url('Invalid logo URL').optional().nullable(),
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;