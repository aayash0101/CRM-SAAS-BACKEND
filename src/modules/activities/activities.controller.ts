import { Request, Response, NextFunction } from 'express';
import { activitiesService } from './activities.service';
import { sendSuccess, sendCreated } from '@common/utils/apiResponse.utils';
import {
  createActivitySchema,
  updateActivitySchema,
  updateActivityStatusSchema,
  activityFiltersSchema,
} from './activities.validation';

export class ActivitiesController {
  async createActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createActivitySchema.parse(req.body);
      const data = await activitiesService.createActivity(
        req.user!.organizationId,
        req.user!.id,
        req.user!.role,
        body
      );
      sendCreated(res, data, 'Activity created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = activityFiltersSchema.parse(req.query);
      const { activities, meta } = await activitiesService.getAllActivities(
        req.user!.organizationId,
        req.user!.id,
        req.user!.role,
        filters
      );
      sendSuccess(res, activities, 'Activities retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async getActivityById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await activitiesService.getActivityById(
        req.params.id as string,
        req.user!.organizationId,
        req.user!.id,
        req.user!.role
      );
      sendSuccess(res, data, 'Activity retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const body = updateActivitySchema.parse(req.body);
      const data = await activitiesService.updateActivity(
        req.params.id as string,
        req.user!.organizationId,
        req.user!.id,
        req.user!.role,
        body
      );
      sendSuccess(res, data, 'Activity updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateActivityStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const body = updateActivityStatusSchema.parse(req.body);
      const data = await activitiesService.updateActivityStatus(
        req.params.id as string,
        req.user!.organizationId,
        req.user!.id,
        req.user!.role,
        body
      );
      sendSuccess(res, data, 'Activity status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteActivity(req: Request, res: Response, next: NextFunction) {
    try {
      await activitiesService.deleteActivity(
        req.params.id as string,
        req.user!.organizationId,
        req.user!.id,
        req.user!.role
      );
      sendSuccess(res, null, 'Activity deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getActivityStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await activitiesService.getActivityStats(req.user!.organizationId);
      sendSuccess(res, stats, 'Activity statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const activitiesController = new ActivitiesController();
