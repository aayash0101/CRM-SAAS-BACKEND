import { dealsRepository } from './deals.repository';
import { customersRepository } from '@modules/customers/customers.repository';
import { AppError } from '@common/middleware/error.middleware';
import type { CreateDealInput, UpdateDealInput, DealFiltersInput } from './deals.validation';
import type { DealStage } from './deals.dto';

type CallerRole = string;

export class DealsService {
  async createDeal(
    organizationId: string,
    callerId: string,
    callerRole: CallerRole,
    input: CreateDealInput
  ) {
    const customer = await customersRepository.findByIdAndOrg(
      input.customerId,
      organizationId
    );
    if (!customer) throw new AppError('Customer not found', 404);

    const ownerId =
      callerRole === 'SALES_REP' ? callerId : (input.ownerId ?? callerId);

    const deal = await dealsRepository.create({
      organizationId,
      customerId: input.customerId,
      ownerId,
      title: input.title,
      value: input.value ?? 0,
      stage: input.stage ?? 'PROSPECT',
      expectedCloseDate: input.expectedCloseDate ?? null,
      notes: input.notes ?? null,
    });

    await dealsRepository.createHistory({
      dealId: deal.id,
      fromStage: null,
      toStage: (input.stage ?? 'PROSPECT') as DealStage,
      note: 'Deal created',
    });

    return deal;
  }

  async getAllDeals(
    organizationId: string,
    callerId: string,
    callerRole: CallerRole,
    filters: DealFiltersInput
  ) {
    const scopedFilters =
      callerRole === 'SALES_REP'
        ? { ...filters, ownerId: callerId }
        : filters;

    const { deals, total } = await dealsRepository.findAllByOrg(
      organizationId,
      scopedFilters
    );

    const { page = 1, limit = 20 } = filters;

    return {
      deals,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDealById(
    id: string,
    organizationId: string,
    callerId: string,
    callerRole: CallerRole
  ) {
    const deal = await dealsRepository.findByIdAndOrg(id, organizationId);
    if (!deal) throw new AppError('Deal not found', 404);

    // SALES_REP can only view their own deals
    if (callerRole === 'SALES_REP' && deal.ownerId !== callerId) {
      throw new AppError('You do not have permission to view this deal', 403);
    }

    return deal;
  }

  async updateDeal(
    id: string,
    organizationId: string,
    callerId: string,
    callerRole: CallerRole,
    input: UpdateDealInput
  ) {
    const deal = await dealsRepository.findByIdAndOrg(id, organizationId);
    if (!deal) throw new AppError('Deal not found', 404);

    if (callerRole === 'SALES_REP' && deal.ownerId !== callerId) {
      throw new AppError('You do not have permission to update this deal', 403);
    }

    if (
      callerRole === 'SALES_REP' &&
      input.ownerId &&
      input.ownerId !== callerId
    ) {
      throw new AppError('Sales reps cannot reassign deals to other users', 403);
    }

    if (input.customerId) {
      const customer = await customersRepository.findByIdAndOrg(
        input.customerId,
        organizationId
      );
      if (!customer) throw new AppError('Customer not found', 404);
    }

    const currentStage = deal.stage as DealStage;
    const newStage = input.stage as DealStage | undefined;

    const updateData: any = { ...input };

    if (newStage && newStage !== currentStage) {
      if (newStage === 'WON' || newStage === 'LOST') {
        updateData.closedAt = new Date();
      } else {
        updateData.closedAt = null;
      }
    }

    const updated = await dealsRepository.update(id, updateData);

    if (newStage && newStage !== currentStage) {
      await dealsRepository.createHistory({
        dealId: id,
        fromStage: currentStage,
        toStage: newStage,
      });
    }

    return updated;
  }

  async deleteDeal(
    id: string,
    organizationId: string,
    callerId: string,
    callerRole: CallerRole
  ) {
    const deal = await dealsRepository.findByIdAndOrg(id, organizationId);
    if (!deal) throw new AppError('Deal not found', 404);

    if (callerRole === 'SALES_REP' && deal.ownerId !== callerId) {
      throw new AppError('You do not have permission to delete this deal', 403);
    }

    await dealsRepository.delete(id);
  }

  async getPipelineStats(organizationId: string) {
    const grouped = await dealsRepository.getPipelineByOrg(organizationId);

    const pipeline: Record<string, { count: number; value: number }> = {
      PROSPECT: { count: 0, value: 0 },
      PROPOSAL: { count: 0, value: 0 },
      NEGOTIATION: { count: 0, value: 0 },
      WON: { count: 0, value: 0 },
      LOST: { count: 0, value: 0 },
    };

    for (const row of grouped) {
      pipeline[row.stage] = {
        count: row._count.stage,
        value: Number(row._sum.value ?? 0),
      };
    }

    const totalValue = Object.values(pipeline).reduce(
      (sum, s) => sum + s.value,
      0
    );
    const totalDeals = Object.values(pipeline).reduce(
      (sum, s) => sum + s.count,
      0
    );

    return { pipeline, totalDeals, totalValue };
  }
}

export const dealsService = new DealsService();