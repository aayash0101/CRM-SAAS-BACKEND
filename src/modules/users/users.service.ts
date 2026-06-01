import { usersRepository } from './users.repository';
import { AppError } from '@common/middleware/error.middleware';
import { hashPassword } from '@common/utils/password.utils';
import { sendEmail } from '@common/utils/email.utils';
import { config } from '@config/app.config';
import crypto from 'crypto';

import type {
  UpdateProfileInput,
  InviteUserInput,
  AcceptInviteInput,
  UpdateUserRoleInput,
  UpdateUserStatusInput,
} from './users.validation';

export class UsersService {

  async getProfile(userId: string, organizationId: string) {
    const user = await usersRepository.findByIdAndOrg(userId, organizationId);
    if (!user) throw new AppError('User not found', 404);
    return this.sanitizeUser(user);
  }

  async updateProfile(
    userId: string,
    organizationId: string,
    data: UpdateProfileInput
  ) {
    const user = await usersRepository.findByIdAndOrg(userId, organizationId);
    if (!user) throw new AppError('User not found', 404);

    const updated = await usersRepository.update(userId, data);
    return this.sanitizeUser(updated);
  }


  async getAllUsers(organizationId: string) {
    const users = await usersRepository.findAllByOrg(organizationId);
    return users.map(this.sanitizeUser);
  }

  async getUserById(id: string, organizationId: string) {
    const user = await usersRepository.findByIdAndOrg(id, organizationId);
    if (!user) throw new AppError('User not found', 404);
    return this.sanitizeUser(user);
  }


  async inviteUser(
    organizationId: string,
    invitedById: string,
    data: InviteUserInput
  ) {
    const existing = await usersRepository.findPendingInvitationByEmail(
      data.email,
      organizationId
    );
    if (existing) {
      throw new AppError(
        'An active invitation already exists for this email',
        409
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 

    await usersRepository.createInvitation({
      organizationId,
      invitedById,
      email: data.email,
      role: data.role,
      token,
      expiresAt,
    });

const inviteUrl = `${config.frontend.url}/accept-invite?token=${token}`;
    await sendEmail({
      to: data.email,
      subject: 'You have been invited to join the CRM',
      html: `
        <p>You have been invited to join the CRM platform.</p>
        <p>Your role will be: <strong>${data.role}</strong></p>
        <p>Click the link below to accept your invitation (expires in 7 days):</p>
        <a href="${inviteUrl}">${inviteUrl}</a>
      `,
    });

    return { email: data.email, role: data.role, expiresAt };
  }

  async acceptInvite(data: AcceptInviteInput) {
    const invitation = await usersRepository.findInvitationByToken(data.token);

    if (!invitation) throw new AppError('Invalid invitation token', 400);
    if (invitation.status !== 'PENDING') {
      throw new AppError('This invitation has already been used', 400);
    }
    if (invitation.expiresAt < new Date()) {
      throw new AppError('This invitation has expired', 400);
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await usersRepository.createFromInvite({
      organizationId: invitation.organizationId,
      email: invitation.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: hashedPassword,
      role: invitation.role,
    });

    await usersRepository.updateInvitation(invitation.id, {
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    });

    return this.sanitizeUser(user);
  }


  async updateUserRole(
    id: string,
    organizationId: string,
    requestorId: string,
    data: UpdateUserRoleInput
  ) {
    if (id === requestorId) {
      throw new AppError('You cannot change your own role', 400);
    }

    const user = await usersRepository.findByIdAndOrg(id, organizationId);
    if (!user) throw new AppError('User not found', 404);

    const updated = await usersRepository.update(id, { role: data.role });
    return this.sanitizeUser(updated);
  }

  async updateUserStatus(
    id: string,
    organizationId: string,
    requestorId: string,
    data: UpdateUserStatusInput
  ) {
    if (id === requestorId) {
      throw new AppError('You cannot change your own status', 400);
    }

    const user = await usersRepository.findByIdAndOrg(id, organizationId);
    if (!user) throw new AppError('User not found', 404);

    const updated = await usersRepository.update(id, { status: data.status });
    return this.sanitizeUser(updated);
  }


  async getAllInvitations(organizationId: string) {
    return usersRepository.findAllInvitationsByOrg(organizationId);
  }


  private sanitizeUser(user: any) {
    const { password, ...safe } = user;
    return safe;
  }
}

export const usersService = new UsersService();