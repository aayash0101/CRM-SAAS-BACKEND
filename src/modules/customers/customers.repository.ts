import { prisma } from '@database/prisma.client';
import type { CreateCustomerData, UpdateCustomerData, CustomerFilters } from './customers.dto';

export class CustomersRepository {
  async create(data: CreateCustomerData) {
    return prisma.customer.create({
      data: data as any,
    });
  }

  async findAllByOrg(organizationId: string, filters: CustomerFilters) {
    const { search, page = 1, limit = 20 } = filters;

    const where: any = { organizationId };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);

    return { customers, total };
  }

  async findByIdAndOrg(id: string, organizationId: string) {
    return prisma.customer.findFirst({
      where: { id, organizationId },
      include: {
        deals: {
          orderBy: { createdAt: 'desc' },
          take: 10,
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
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async update(id: string, data: UpdateCustomerData) {
    return prisma.customer.update({
      where: { id },
      data: data as any,
    });
  }

  async delete(id: string) {
    return prisma.customer.delete({ where: { id } });
  }

  async countByOrg(organizationId: string) {
    return prisma.customer.count({ where: { organizationId } });
  }
}

export const customersRepository = new CustomersRepository();