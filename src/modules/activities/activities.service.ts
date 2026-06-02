import { activitiesRepository } from './activities.repository';
import { leadsRepository } from '@modules/leads/leads.repository';
import { customersRepository } from '@modules/customers/customers.repository';
import { dealsRepository } from '@modules/deals/deals.repository';
import { AppError } from '@common/middleware/error.middleware';
import type {
  CreateActivityInput,
  UpdateActivityInput,
  UpdateActivityStatusInput,
  ActivityFiltersInput,
} from './activities.validation';

type CallerRole = string;

export class ActivitiesService {
  async createActivity(
    organizationId: string,
    callerId: string,
    callerRole: CallerRole,
    input: CreateActivityInput
  ) {
    const linkedEntities = {
      lead: input.leadId ? await leadsRepository.findByIdAndOrg(input.leadId, organizationId) : null,
      customer: input.customerId
        ? await customersRepository.findByIdAndOrg(input.customerId, organizationId)
        : null,
      deal: input.dealId ? await dealsRepository.findByIdAndOrg(input.dealId, organizationId) : null,
    };

    if (!linkedEntities.lead && !linkedEntities.customer && !linkedEntities.deal) {
      throw new AppError(
        'Activity must be linked to at least one existing lead, customer, or deal',
        400
      );
    }

    // SALES_REP can only create activities for resources they have access to
    if (callerRole === 'SALES_REP') {
      const hasAccess =
        (linkedEntities.lead?.assignedUserId === callerId) ||
        (linkedEntities.deal?.ownerId === callerId) ||
        !!linkedEntities.customer; // SALES_REP can create activities for any customer

      if (!hasAccess) {
        throw new AppError(
          'You do not have permission to create activities for these resources',
          403
        );
      }
    }

    const dueAt =
      typeof input.dueAt === 'string' ? new Date(input.dueAt) : input.dueAt;

    const activity = await activitiesRepository.create({
      organizationId,
      userId: callerId,
      type: input.type,
      title: input.title,
      description: input.description ?? null,
      dueAt,
      leadId: input.leadId ?? null,
      customerId: input.customerId ?? null,
      dealId: input.dealId ?? null,
    });

    return activity;
  }

  async getAllActivities(
    organizationId: string,
    callerId: string,
    callerRole: CallerRole,
    filters: ActivityFiltersInput
  ) {
    let scopedFilters = filters;

    if (callerRole === 'SALES_REP') {
      
      scopedFilters = { ...filters, userId: callerId };
    }

    const { activities, total } = await activitiesRepository.findAllByOrg(
      organizationId,
      scopedFilters
    );

    const { page = 1, limit = 20 } = filters;

    return {
      activities,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getActivityById(
    id: string,
    organizationId: string,
    callerId: string,
    callerRole: CallerRole
  ) {
    const activity = await activitiesRepository.findByIdAndOrg(id, organizationId);
    if (!activity) throw new AppError('Activity not found', 404);

    // Check permissions
    if (callerRole === 'SALES_REP') {
      const hasAccess =
        activity.userId === callerId ||
        (activity.lead?.assignedUserId === callerId) ||
        (activity.deal?.ownerId === callerId) ||
        !!activity.customer;

      if (!hasAccess) {
        throw new AppError('You do not have permission to view this activity', 403);
      }
    }

    return activity;
  }

  async updateActivity(
    id: string,
    organizationId: string,
    callerId: string,
    callerRole: CallerRole,
    input: UpdateActivityInput
  ) {
    const activity = await activitiesRepository.findByIdAndOrg(id, organizationId);
    if (!activity) throw new AppError('Activity not found', 404);

    if (callerRole === 'SALES_REP' && activity.userId !== callerId) {
      throw new AppError('You do not have permission to update this activity', 403);
    }

    if (input.leadId !== undefined || input.customerId !== undefined || input.dealId !== undefined) {
      const newLead = input.leadId
        ? await leadsRepository.findByIdAndOrg(input.leadId, organizationId)
        : null;
      const newCustomer = input.customerId
        ? await customersRepository.findByIdAndOrg(input.customerId, organizationId)
        : null;
      const newDeal = input.dealId
        ? await dealsRepository.findByIdAndOrg(input.dealId, organizationId)
        : null;

      const finalLead = input.leadId !== undefined ? newLead : activity.lead;
      const finalCustomer = input.customerId !== undefined ? newCustomer : activity.customer;
      const finalDeal = input.dealId !== undefined ? newDeal : activity.deal;

      if (!finalLead && !finalCustomer && !finalDeal) {
        throw new AppError(
          'Activity must be linked to at least one existing lead, customer, or deal',
          400
        );
      }
    }

    const updateData: any = { ...input };

    if (updateData.dueAt && typeof updateData.dueAt === 'string') {
      updateData.dueAt = new Date(updateData.dueAt);
    }

    const updated = await activitiesRepository.update(id, updateData);
    return updated;
  }

  async updateActivityStatus(
    id: string,
    organizationId: string,
    callerId: string,
    callerRole: CallerRole,
    input: UpdateActivityStatusInput
  ) {
    const activity = await activitiesRepository.findByIdAndOrg(id, organizationId);
    if (!activity) throw new AppError('Activity not found', 404);

    if (callerRole === 'SALES_REP' && activity.userId !== callerId) {
      throw new AppError('You do not have permission to update this activity', 403);
    }

    const validTransitions: Record<string, string[]> = {
      SCHEDULED: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [], 
      CANCELLED: [],
    };

    if (!validTransitions[activity.status]?.includes(input.status)) {
      throw new AppError(
        `Cannot transition from ${activity.status} to ${input.status}`,
        400
      );
    }

    const completedAt = input.status === 'COMPLETED' ? new Date() : null;

    const updated = await activitiesRepository.update(id, {
      status: input.status,
      completedAt,
    });

    return updated;
  }

  async deleteActivity(
    id: string,
    organizationId: string,
    _callerId: string,
    callerRole: CallerRole
  ) {
    const activity = await activitiesRepository.findByIdAndOrg(id, organizationId);
    if (!activity) throw new AppError('Activity not found', 404);

    if (callerRole === 'SALES_REP') {
      throw new AppError('You do not have permission to delete activities', 403);
    }

    await activitiesRepository.delete(id);
  }

  async getActivityStats(organizationId: string) {
    const [byStatus, byType] = await Promise.all([
      activitiesRepository.countByOrg(organizationId),
      activitiesRepository.countByOrgAndType(organizationId),
    ]);

    const statusStats: Record<string, number> = {
      SCHEDULED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    const typeStats: Record<string, number> = {
      CALL: 0,
      EMAIL: 0,
      MEETING: 0,
      TASK: 0,
    };

    for (const row of byStatus) {
      statusStats[row.status] = row._count.status;
    }

    for (const row of byType) {
      typeStats[row.type] = row._count.type;
    }

    statusStats.total = Object.values(statusStats).reduce((a, b) => a + b, 0);
    typeStats.total = Object.values(typeStats).reduce((a, b) => a + b, 0);

    return { byStatus: statusStats, byType: typeStats };
  }
}

export const activitiesService = new ActivitiesService();
