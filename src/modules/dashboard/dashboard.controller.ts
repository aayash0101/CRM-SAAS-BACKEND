import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { sendSuccess } from '@common/utils/apiResponse.utils';

export class DashboardController {
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getOverview(
        req.user!.organizationId,
        req.user!.id,
        req.user!.role
      );
      sendSuccess(res, data, 'Dashboard overview retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getRecentActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const data = await dashboardService.getRecentActivities(
        req.user!.organizationId,
        req.user!.id,
        req.user!.role,
        limit
      );
      sendSuccess(res, data, 'Recent activities retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getUpcomingActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const data = await dashboardService.getUpcomingActivities(
        req.user!.organizationId,
        req.user!.id,
        req.user!.role,
        limit
      );
      sendSuccess(res, data, 'Upcoming activities retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getSalesPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getSalesPerformance(
        req.user!.organizationId,
        req.user!.id,
        req.user!.role
      );
      sendSuccess(res, data, 'Sales performance retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
