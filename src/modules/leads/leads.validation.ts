import { z } from 'zod';

const leadStatuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'LOST'] as const;
const leadSources = [
  'WEBSITE',
  'REFERRAL',
  'SOCIAL_MEDIA',
  'EMAIL_CAMPAIGN',
  'COLD_CALL',
  'TRADE_SHOW',
  'OTHER',
] as const;

export const createLeadSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email').optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  company: z.string().max(150).optional().nullable(),
  source: z.enum(leadSources, { error: 'Invalid lead source' }).optional(),
  status: z.enum(leadStatuses, { error: 'Invalid lead status' }).optional(),
  notes: z.string().max(2000).optional().nullable(),
  assignedUserId: z.string().uuid('Invalid user ID').optional().nullable(),
});

export const updateLeadSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email('Invalid email').optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  company: z.string().max(150).optional().nullable(),
  source: z.enum(leadSources, { error: 'Invalid lead source' }).optional(),
  status: z.enum(leadStatuses, { error: 'Invalid lead status' }).optional(),
  notes: z.string().max(2000).optional().nullable(),
  assignedUserId: z.string().uuid('Invalid user ID').optional().nullable(),
});

export const leadFiltersSchema = z.object({
  status: z.enum(leadStatuses).optional(),
  source: z.enum(leadSources).optional(),
  assignedUserId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type LeadFiltersInput = z.infer<typeof leadFiltersSchema>;