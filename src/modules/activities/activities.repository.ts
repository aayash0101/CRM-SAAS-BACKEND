import { prisma } from '@database/prisma.client';
import type {
  CreateActivityData,
  UpdateActivityData,
  ActivityFilters,
} from './activities.dto';

export class ActivitiesRepository {
  async create(data: CreateActivityData) {
    return prisma.activity.create({
      data: data as any,
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
            email: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            company: true,
            email: true,
          },
        },
        deal: {
          select: {
            id: true,
            title: true,
            stage: true,
            value: true,
          },
        },
      },
    });
  }

  async findAllByOrg(organizationId: string, filters: ActivityFilters) {
    const {
      type,
      status,
      leadId,
      customerId,
      dealId,
      userId,
      search,
      page = 1,
      limit = 20,
    } = filters;

    const where: any = { organizationId };

    if (type) where.type = type;
    if (status) where.status = status;
    if (leadId) where.leadId = leadId;
    if (customerId) where.customerId = customerId;
    if (dealId) where.dealId = dealId;
    if (userId) where.userId = userId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
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
              email: true,
            },
          },
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              company: true,
              email: true,
            },
          },
          deal: {
            select: {
              id: true,
              title: true,
              stage: true,
              value: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.activity.count({ where }),
    ]);

    return { activities, total };
  }

  async findByIdAndOrg(id: string, organizationId: string) {
    return prisma.activity.findFirst({
      where: { id, organizationId },
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
            email: true,
            assignedUserId: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            company: true,
            email: true,
          },
        },
        deal: {
          select: {
            id: true,
            title: true,
            stage: true,
            value: true,
            ownerId: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateActivityData) {
    return prisma.activity.update({
      where: { id },
      data: data as any,
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
            email: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            company: true,
            email: true,
          },
        },
        deal: {
          select: {
            id: true,
            title: true,
            stage: true,
            value: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.activity.delete({ where: { id } });
  }

  async countByOrg(organizationId: string) {
    return prisma.activity.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: { status: true },
    });
  }

  async countByOrgAndType(organizationId: string) {
    return prisma.activity.groupBy({
      by: ['type'],
      where: { organizationId },
      _count: { type: true },
    });
  }
}

export const activitiesRepository = new ActivitiesRepository();
