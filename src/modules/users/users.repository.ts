import { prisma } from '@database/prisma.client';

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
  role?: string;
  status?: string;
}

interface CreateUserFromInviteData {
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
}

export class UsersRepository {
  async findAllByOrg(organizationId: string) {
    return prisma.user.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdAndOrg(id: string, organizationId: string) {
    return prisma.user.findFirst({
      where: { id, organizationId },
    });
  }

  async update(id: string, data: UpdateUserData) {
    return prisma.user.update({
      where: { id },
      data: data as any,
    });
  }

  async createFromInvite(data: CreateUserFromInviteData) {
    return prisma.user.create({
      data: data as any,
    });
  }

  async createInvitation(data: {
    organizationId: string;
    invitedById: string;
    email: string;
    role: string;
    token: string;
    expiresAt: Date;
  }) {
    return prisma.invitation.create({
      data: data as any,
    });
  }

  async findInvitationByToken(token: string) {
    return prisma.invitation.findUnique({
      where: { token },
      include: { organization: true },
    });
  }

  async findPendingInvitationByEmail(email: string, organizationId: string) {
    return prisma.invitation.findFirst({
      where: {
        email,
        organizationId,
        status: 'PENDING' as any,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async updateInvitation(id: string, data: { status: string; acceptedAt?: Date }) {
    return prisma.invitation.update({
      where: { id },
      data: data as any,
    });
  }

  async findAllInvitationsByOrg(organizationId: string) {
    return prisma.invitation.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const usersRepository = new UsersRepository();