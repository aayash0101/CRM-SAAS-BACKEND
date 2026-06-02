import { prisma } from '@database/prisma.client';
import type {
  CreateDealData,
  UpdateDealData,
  DealFilters,
  CreateDealHistoryData,
} from './deals.dto';

export class DealsRepository {
  async create(data: CreateDealData) {
    return prisma.deal.create({
      data: data as any,
      include: {
        customer: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findAllByOrg(organizationId: string, filters: DealFilters) {
    const { stage, ownerId, customerId, search, page = 1, limit = 20 } = filters;

    const where: any = { organizationId };

    if (stage) where.stage = stage;
    if (ownerId) where.ownerId = ownerId;
    if (customerId) where.customerId = customerId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              company: true,
              email: true,
            },
          },
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.deal.count({ where }),
    ]);

    return { deals, total };
  }

  async findByIdAndOrg(id: string, organizationId: string) {
    return prisma.deal.findFirst({
      where: { id, organizationId },
      include: {
        customer: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
        history: {
          orderBy: { changedAt: 'desc' },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async update(id: string, data: UpdateDealData) {
    return prisma.deal.update({
      where: { id },
      data: data as any,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            company: true,
            email: true,
          },
        },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.deal.delete({ where: { id } });
  }


  async createHistory(data: CreateDealHistoryData) {
    return prisma.dealHistory.create({
      data: data as any,
    });
  }

  // ── Pipeline & Stats ───────────────────────────────────────────────────────

  async getPipelineByOrg(organizationId: string) {
    return prisma.deal.groupBy({
      by: ['stage'],
      where: { organizationId },
      _count: { stage: true },
      _sum: { value: true },
    });
  }

  async countByOrg(organizationId: string) {
    return prisma.deal.count({ where: { organizationId } });
  }
}

export const dealsRepository = new DealsRepository();