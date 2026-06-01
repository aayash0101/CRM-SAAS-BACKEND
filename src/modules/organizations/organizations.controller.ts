import { Request, Response, NextFunction } from 'express';
import { organizationsService } from './organizations.service';
import { updateOrganizationSchema } from './organizations.validation';
import { sendSuccess } from '@common/utils/apiResponse.utils';
import { AppError } from '@common/middleware/error.middleware';

export class OrganizationsController {
  async getOrganization(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const org = await organizationsService.getOrganization(
        req.user.organizationId
      );
      sendSuccess(res, org, 'Organization retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateOrganization(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const input = updateOrganizationSchema.parse(req.body);
      const org = await organizationsService.updateOrganization(
        req.user.organizationId,
        input
      );
      sendSuccess(res, org, 'Organization updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const stats = await organizationsService.getOrganizationStats(
        req.user.organizationId
      );
      sendSuccess(res, stats, 'Stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const organizationsController = new OrganizationsController();