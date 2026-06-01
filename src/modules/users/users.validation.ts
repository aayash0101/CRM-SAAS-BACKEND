import { z } from 'zod';

export const inviteUserSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  role: z.enum(['ORG_ADMIN', 'SALES_MANAGER', 'SALES_REP'], {
    error: 'Invalid role',
  }),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Invitation token is required'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['ORG_ADMIN', 'SALES_MANAGER', 'SALES_REP'], {
    error: 'Invalid role',
  }),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE'], {
    error: 'Invalid status',
  }),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional().nullable(),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;