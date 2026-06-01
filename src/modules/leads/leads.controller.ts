import { Request, Response, NextFunction } from 'express';
import { leadsService } from './leads.service';
import { sendSuccess, sendCreated } from '@common/utils/apiResponse.utils';
import {
  createLeadSchema,
  updateLeadSchema,
  leadFiltersSchema,
} from './leads.validation';

export class LeadsController {
  async createLead(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createLeadSchema.parse(req.body);
      const data = await leadsService.createLead(
        req.user!.organizationId,
        req.user!.id,
        req.user!.role,
        body
      );
      sendCreated(res, data, 'Lead created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllLeads(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = leadFiltersSchema.parse(req.query);
      const { leads, meta } = await leadsService.getAllLeads(
        req.user!.organizationId,
        req.user!.id,
        req.user!.role,
        filters
      );
      sendSuccess(res, leads, 'Leads retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async getLeadById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await leadsService.getLeadById(
        req.params.id as string,
        req.user!.organizationId,
        req.user!.id,
        req.user!.role
      );
      sendSuccess(res, data, 'Lead retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateLead(req: Request, res: Response, next: NextFunction) {
    try {
      const body = updateLeadSchema.parse(req.body);
      const data = await leadsService.updateLead(
        req.params.id as string,
        req.user!.organizationId,
        req.user!.id,
        req.user!.role,
        body
      );
      sendSuccess(res, data, 'Lead updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteLead(req: Request, res: Response, next: NextFunction) {
    try {
      await leadsService.deleteLead(
        req.params.id as string,
        req.user!.organizationId,
        req.user!.id,
        req.user!.role
      );
      sendSuccess(res, null, 'Lead deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getLeadStats(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await leadsService.getLeadStats(req.user!.organizationId);
      sendSuccess(res, data, 'Lead stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const leadsController = new LeadsController();