import { Request, Response, NextFunction } from 'express';
import { dealsService } from './deals.service';
import { sendSuccess, sendCreated } from '@common/utils/apiResponse.utils';
import {
  createDealSchema,
  updateDealSchema,
  dealFiltersSchema,
} from './deals.validation';

export class DealsController {
  async createDeal(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createDealSchema.parse(req.body);
      const data = await dealsService.createDeal(
        req.user!.organizationId,
        req.user!.id,
        req.user!.role,
        body
      );
      sendCreated(res, data, 'Deal created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllDeals(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = dealFiltersSchema.parse(req.query);
      const { deals, meta } = await dealsService.getAllDeals(
        req.user!.organizationId,
        req.user!.id,
        req.user!.role,
        filters
      );
      sendSuccess(res, deals, 'Deals retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async getDealById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dealsService.getDealById(
        req.params.id as string,
        req.user!.organizationId,
        req.user!.id,
        req.user!.role
      );
      sendSuccess(res, data, 'Deal retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateDeal(req: Request, res: Response, next: NextFunction) {
    try {
      const body = updateDealSchema.parse(req.body);
      const data = await dealsService.updateDeal(
        req.params.id as string,
        req.user!.organizationId,
        req.user!.id,
        req.user!.role,
        body
      );
      sendSuccess(res, data, 'Deal updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteDeal(req: Request, res: Response, next: NextFunction) {
    try {
      await dealsService.deleteDeal(
        req.params.id as string,
        req.user!.organizationId,
        req.user!.id,
        req.user!.role
      );
      sendSuccess(res, null, 'Deal deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPipelineStats(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dealsService.getPipelineStats(req.user!.organizationId);
      sendSuccess(res, data, 'Pipeline stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const dealsController = new DealsController();