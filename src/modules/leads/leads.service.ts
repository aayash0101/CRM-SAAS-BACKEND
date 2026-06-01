import { leadsRepository } from './leads.repository';
import { AppError } from '@common/middleware/error.middleware';
import type { CreateLeadInput, UpdateLeadInput, LeadFiltersInput } from './leads.validation';

type CallerRole = string;

export class LeadsService {
    async createLead(
        organizationId: string,
        callerId: string,
        callerRole: CallerRole,
        input: CreateLeadInput
    ) {
        if (callerRole === 'SALES_REP' && input.assignedUserId && input.assignedUserId !== callerId) {
            throw new AppError('Sales reps can only assign leads to themselves', 403);
        }

        const lead = await leadsRepository.create({
            ...input,
            organizationId,
            assignedUserId: input.assignedUserId ?? callerId,
        });

        return lead;
    }

    async getAllLeads(
        organizationId: string,
        callerId: string,
        callerRole: CallerRole,
        filters: LeadFiltersInput
    ) {
        const scopedFilters = callerRole === 'SALES_REP'
            ? { ...filters, assignedUserId: callerId }
            : filters;

        const { leads, total } = await leadsRepository.findAllByOrg(organizationId, scopedFilters);

        const { page = 1, limit = 20 } = filters;

        return {
            leads,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getLeadById(id: string, organizationId: string, callerId: string, callerRole: CallerRole) {
        const lead = await leadsRepository.findByIdAndOrg(id, organizationId);
        if (!lead) throw new AppError('Lead not found', 404);

        if (callerRole === 'SALES_REP' && lead.assignedUserId !== callerId) {
            throw new AppError('You do not have permission to view this lead', 403);
        }

        return lead;
    }

    async updateLead(
        id: string,
        organizationId: string,
        callerId: string,
        callerRole: CallerRole,
        input: UpdateLeadInput
    ) {
        const lead = await leadsRepository.findByIdAndOrg(id, organizationId);
        if (!lead) throw new AppError('Lead not found', 404);

        if (callerRole === 'SALES_REP' && lead.assignedUserId !== callerId) {
            throw new AppError('You do not have permission to update this lead', 403);
        }

        if (callerRole === 'SALES_REP' && input.assignedUserId && input.assignedUserId !== callerId) {
            throw new AppError('Sales reps cannot reassign leads to other users', 403);
        }

        return leadsRepository.update(id, input);
    }

    async deleteLead(
        id: string,
        organizationId: string,
        _callerId: string,      // ← underscore prefix tells TS this is intentionally unused
        callerRole: CallerRole
    ) {
        const lead = await leadsRepository.findByIdAndOrg(id, organizationId);
        if (!lead) throw new AppError('Lead not found', 404);

        if (callerRole === 'SALES_REP') {
            throw new AppError('You do not have permission to delete leads', 403);
        }

        await leadsRepository.delete(id);
    }

    async getLeadStats(organizationId: string) {
        const grouped = await leadsRepository.countByOrg(organizationId);

        const stats: Record<string, number> = {
            NEW: 0,
            CONTACTED: 0,
            QUALIFIED: 0,
            LOST: 0,
        };

        for (const row of grouped) {
            stats[row.status] = row._count.status;
        }

        stats.total = Object.values(stats).reduce((a, b) => a + b, 0);

        return stats;
    }
}

export const leadsService = new LeadsService();