import { prisma } from '@database/prisma.client';
import type { CreateLeadData, UpdateLeadData, LeadFilters } from './leads.dto';

export class LeadsRepository {
  async create(data: CreateLeadData) {
    return prisma.lead.create({
      data: data as any,
      include: { assignedUser: true },
    });
  }

  async findAllByOrg(organizationId: string, filters: LeadFilters) {
    const { status, source, assignedUserId, search, page = 1, limit = 20 } = filters;

    const where: any = { organizationId };

    if (status) where.status = status;
    if (source) where.source = source;
    if (assignedUserId) where.assignedUserId = assignedUserId;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          assignedUser: {
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
      prisma.lead.count({ where }),
    ]);

    return { leads, total };
  }

  async findByIdAndOrg(id: string, organizationId: string) {
    return prisma.lead.findFirst({
      where: { id, organizationId },
      include: {
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async update(id: string, data: UpdateLeadData) {
    return prisma.lead.update({
      where: { id },
      data: data as any,
      include: {
        assignedUser: {
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
    return prisma.lead.delete({ where: { id } });
  }

  async countByOrg(organizationId: string) {
    return prisma.lead.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: { status: true },
    });
  }
}

export const leadsRepository = new LeadsRepository();