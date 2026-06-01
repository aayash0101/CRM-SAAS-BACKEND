import { prisma } from '@database/prisma.client';

interface UpdateOrganizationData {
  name?: string;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  logoUrl?: string | null;
}

export class OrganizationsRepository {
  async findById(id: string) {
    return prisma.organization.findUnique({
      where: { id },
      include: { subscription: true },
    });
  }

  async update(id: string, data: UpdateOrganizationData) {
    return prisma.organization.update({
      where: { id },
      data,
      include: { subscription: true },
    });
  }

  async getStats(organizationId: string) {
    const [totalUsers, totalLeads, totalCustomers, totalDeals] =
      await Promise.all([
        prisma.user.count({ where: { organizationId } }),
        prisma.lead.count({ where: { organizationId } }),
        prisma.customer.count({ where: { organizationId } }),
        prisma.deal.count({ where: { organizationId } }),
      ]);

    return { totalUsers, totalLeads, totalCustomers, totalDeals };
  }
}

export const organizationsRepository = new OrganizationsRepository();