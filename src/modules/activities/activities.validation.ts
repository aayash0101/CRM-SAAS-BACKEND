import { z } from 'zod';

const activityTypes = ['CALL', 'EMAIL', 'MEETING', 'TASK'] as const;
const activityStatuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED'] as const;

export const createActivitySchema = z.object({
  type: z.enum(activityTypes, { error: 'Invalid activity type' }),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(2000).optional().nullable(),
  dueAt: z.string().datetime('Invalid date format').or(z.date()),
  leadId: z.string().uuid('Invalid lead ID').optional().nullable(),
  customerId: z.string().uuid('Invalid customer ID').optional().nullable(),
  dealId: z.string().uuid('Invalid deal ID').optional().nullable(),
}).refine(
  (data) => data.leadId || data.customerId || data.dealId,
  {
    message: 'Activity must be linked to at least one: leadId, customerId, or dealId',
    path: ['leadId'],
  }
);

export const updateActivitySchema = z.object({
  type: z.enum(activityTypes, { error: 'Invalid activity type' }).optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional().nullable(),
  dueAt: z.string().datetime('Invalid date format').or(z.date()).optional(),
  status: z.enum(activityStatuses, { error: 'Invalid activity status' }).optional(),
  leadId: z.string().uuid('Invalid lead ID').optional().nullable(),
  customerId: z.string().uuid('Invalid customer ID').optional().nullable(),
  dealId: z.string().uuid('Invalid deal ID').optional().nullable(),
}).refine(
  (data) => {
    // At least one of leadId, customerId, dealId must be present if updating
    if (data.leadId !== undefined || data.customerId !== undefined || data.dealId !== undefined) {
      return data.leadId || data.customerId || data.dealId;
    }
    return true;
  },
  {
    message: 'Activity must be linked to at least one: leadId, customerId, or dealId',
    path: ['leadId'],
  }
);

export const updateActivityStatusSchema = z.object({
  status: z.enum(activityStatuses, { error: 'Invalid activity status' }),
});

export const activityFiltersSchema = z.object({
  type: z.enum(activityTypes).optional(),
  status: z.enum(activityStatuses).optional(),
  leadId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  dealId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type UpdateActivityStatusInput = z.infer<typeof updateActivityStatusSchema>;
export type ActivityFiltersInput = z.infer<typeof activityFiltersSchema>;
