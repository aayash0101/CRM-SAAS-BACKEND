import { z } from 'zod';

const dealStages = ['PROSPECT', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'] as const;

export const createDealSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  title: z.string().min(1, 'Title is required').max(200),
  value: z.coerce.number().min(0, 'Value must be positive').optional(),
  stage: z.enum(dealStages, { error: 'Invalid deal stage' }).optional(),
  expectedCloseDate: z.coerce.date().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  ownerId: z.string().uuid('Invalid owner ID').optional(),
});

export const updateDealSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID').optional(),
  ownerId: z.string().uuid('Invalid owner ID').optional(),
  title: z.string().min(1).max(200).optional(),
  value: z.coerce.number().min(0).optional(),
  stage: z.enum(dealStages, { error: 'Invalid deal stage' }).optional(),
  expectedCloseDate: z.coerce.date().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const dealFiltersSchema = z.object({
  stage: z.enum(dealStages).optional(),
  ownerId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
export type DealFiltersInput = z.infer<typeof dealFiltersSchema>;