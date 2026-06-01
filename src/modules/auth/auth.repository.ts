import { prisma } from '@database/prisma.client';

interface CreateOrgInput {
  name: string;
  slug: string;
  email: string;
  adminUser: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    emailVerificationToken: string;
  };
}

interface UpdateUserInput {
  emailVerified?: boolean;
  emailVerificationToken?: string | null;
  passwordResetToken?: string | null;
  passwordResetExpiresAt?: Date | null;
  password?: string;
  lastLoginAt?: Date;
}

export class AuthRepository {

  async createOrganizationWithAdminAndSubscription(data: CreateOrgInput) {
    const { adminUser, ...orgData } = data;

    const organization = await prisma.organization.create({
      data: orgData,
    });

    try {
      const user = await prisma.user.create({
        data: {
          organizationId: organization.id,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          email: adminUser.email,
          password: adminUser.password,
          role: 'ORG_ADMIN',
          emailVerificationToken: adminUser.emailVerificationToken,
        },
      });

      await prisma.subscription.create({
        data: {
          organizationId: organization.id,
          plan: 'FREE',
          status: 'ACTIVE',
        },
      });

      return { organization, user };
    } catch (error) {
      await prisma.organization.delete({ where: { id: organization.id } });
      throw error;
    }
  }

  async findOrganizationBySlug(slug: string) {
    return prisma.organization.findUnique({ where: { slug } });
  }


  async findUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email },
      include: { organization: true },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { organization: true },
    });
  }

  async findUserByEmailAndOrg(email: string, organizationId: string) {
    return prisma.user.findUnique({
      where: {
        organizationId_email: { organizationId, email },
      },
      include: { organization: true },
    });
  }

  async updateUser(id: string, data: UpdateUserInput) {
    return prisma.user.update({ where: { id }, data });
  }

  async findUserByVerificationToken(token: string) {
    return prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });
  }

  async findUserByPasswordResetToken(token: string) {
    return prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiresAt: { gt: new Date() },
      },
    });
  }
}

export const authRepository = new AuthRepository();