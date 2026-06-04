import { prisma } from '@database/prisma.client';

export class DashboardRepository {

  async getTotalLeads(organizationId: string, userId?: string, role?: string) {
    const where: any = { organizationId };

    if (role === 'SALES_REP' && userId) {
      where.assignedUserId = userId;
    }

    return prisma.lead.count({ where });
  }

  async getTotalCustomers(organizationId: string) {
    return prisma.customer.count({ where: { organizationId } });
  }

  async getOpenDeals(organizationId: string, userId?: string, role?: string) {
    const where: any = {
      organizationId,
      stage: { not: 'WON' },
    };

    if (role === 'SALES_REP' && userId) {
      where.ownerId = userId;
    }

    return prisma.deal.count({ where });
  }

  async getPipelineValue(organizationId: string, userId?: string, role?: string) {
    const where: any = {
      organizationId,
      stage: { not: 'WON' },
    };

    if (role === 'SALES_REP' && userId) {
      where.ownerId = userId;
    }

    const result = await prisma.deal.aggregate({
      where,
      _sum: { value: true },
    });

    return result._sum.value || 0;
  }


  async getLeadStats(organizationId: string, userId?: string, role?: string) {
    const where: any = { organizationId };

    if (role === 'SALES_REP' && userId) {
      where.assignedUserId = userId;
    }

    const stats = await prisma.lead.groupBy({
      by: ['status'],
      where,
      _count: { id: true },
    });

    const result: Record<string, number> = {
      NEW: 0,
      CONTACTED: 0,
      QUALIFIED: 0,
      LOST: 0,
    };

    for (const stat of stats) {
      result[stat.status] = stat._count.id;
    }

    return result;
  }

  async getDealStats(organizationId: string, userId?: string, role?: string) {
    const where: any = { organizationId };

    if (role === 'SALES_REP' && userId) {
      where.ownerId = userId;
    }

    const stats = await prisma.deal.groupBy({
      by: ['stage'],
      where,
      _count: { id: true },
      _sum: { value: true },
    });

    const result: any = {
      PROSPECT: { count: 0, value: 0 },
      PROPOSAL: { count: 0, value: 0 },
      NEGOTIATION: { count: 0, value: 0 },
      WON: { count: 0, value: 0 },
      LOST: { count: 0, value: 0 },
    };

    for (const stat of stats) {
      result[stat.stage] = {
        count: stat._count.id,
        value: stat._sum.value || 0,
      };
    }

    return result;
  }

  async getActivityStats(organizationId: string, userId?: string, role?: string) {
    const where: any = { organizationId };

    if (role === 'SALES_REP' && userId) {
      where.userId = userId;
    }

    const stats = await prisma.activity.groupBy({
      by: ['status'],
      where,
      _count: { id: true },
    });

    const result: Record<string, number> = {
      SCHEDULED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    for (const stat of stats) {
      result[stat.status] = stat._count.id;
    }

    return result;
  }


  async getRecentActivities(
    organizationId: string,
    limit: number = 10,
    userId?: string,
    role?: string
  ) {
    const where: any = { organizationId };

    if (role === 'SALES_REP' && userId) {
      where.userId = userId;
    }

    return prisma.activity.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            company: true,
          },
        },
        deal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getUpcomingActivities(
    organizationId: string,
    limit: number = 10,
    userId?: string,
    role?: string
  ) {
    const now = new Date();
    const where: any = {
      organizationId,
      status: 'SCHEDULED',
      dueAt: {
        gte: now,
      },
    };

    if (role === 'SALES_REP' && userId) {
      where.userId = userId;
    }

    return prisma.activity.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            company: true,
          },
        },
        deal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { dueAt: 'asc' },
      take: limit,
    });
  }


  async getSalesPerformance(organizationId: string, userId?: string, role?: string) {
    const where: any = { organizationId };

    if (role === 'SALES_REP' && userId) {
      where.ownerId = userId;
    }

    const deals = await prisma.deal.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (role === 'SALES_REP') {
      const wonDeals = deals.filter((d) => d.stage === 'WON');
      const wonValue = wonDeals.reduce((sum, d) => sum + d.value.toNumber(), 0);
      const totalValue = deals.reduce((sum, d) => sum + d.value.toNumber(), 0);

      return [
        {
          userId,
          totalDeals: deals.length,
          wonDeals: wonDeals.length,
          wonValue,
          totalPipelineValue: totalValue,
          avgDealSize: deals.length > 0 ? totalValue / deals.length : 0,
          conversionRate: deals.length > 0 ? (wonDeals.length / deals.length) * 100 : 0,
        },
      ];
    }

    const grouped: Record<string, any> = {};

    for (const deal of deals) {
      const ownerId = deal.ownerId;
      if (!grouped[ownerId]) {
        grouped[ownerId] = {
          userId: ownerId,
          firstName: deal.owner.firstName,
          lastName: deal.owner.lastName,
          email: deal.owner.email,
          deals: [],
        };
      }
      grouped[ownerId].deals.push(deal);
    }

    return Object.values(grouped)
      .map((user: any) => {
        const wonDeals = user.deals.filter((d: any) => d.stage === 'WON');
        const wonValue = wonDeals.reduce((sum: number, d: any) => sum + d.value.toNumber(), 0);
        const totalValue = user.deals.reduce((sum: number, d: any) => sum + d.value.toNumber(), 0);

        return {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          totalDeals: user.deals.length,
          wonDeals: wonDeals.length,
          wonValue,
          totalPipelineValue: totalValue,
          avgDealSize: user.deals.length > 0 ? totalValue / user.deals.length : 0,
          conversionRate:
            user.deals.length > 0 ? (wonDeals.length / user.deals.length) * 100 : 0,
        };
      })
      .sort((a, b) => b.wonValue - a.wonValue);
  }

  async getOverviewData(organizationId: string, userId?: string, role?: string) {
    const [totalLeads, totalCustomers, openDeals, pipelineValue, leadStats, dealStats, activityStats] =
      await Promise.all([
        this.getTotalLeads(organizationId, userId, role),
        this.getTotalCustomers(organizationId),
        this.getOpenDeals(organizationId, userId, role),
        this.getPipelineValue(organizationId, userId, role),
        this.getLeadStats(organizationId, userId, role),
        this.getDealStats(organizationId, userId, role),
        this.getActivityStats(organizationId, userId, role),
      ]);

    return {
      totalLeads,
      totalCustomers,
      openDeals,
      pipelineValue,
      stats: {
        leads: leadStats,
        deals: dealStats,
        activities: activityStats,
      },
    };
  }
}

export const dashboardRepository = new DashboardRepository();
