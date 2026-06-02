import { dashboardRepository } from './dashboard.repository';
import { AppError } from '@common/middleware/error.middleware';

type CallerRole = string;

export class DashboardService {
  async getOverview(organizationId: string, callerId: string, callerRole: CallerRole) {
    if (callerRole === 'SALES_REP') {
      return dashboardRepository.getOverviewData(organizationId, callerId, callerRole);
    } else if (callerRole === 'SALES_MANAGER' || callerRole === 'ORG_ADMIN') {
      return dashboardRepository.getOverviewData(organizationId, callerId, callerRole);
    } else if (callerRole === 'SUPER_ADMIN') {
      return dashboardRepository.getOverviewData(organizationId, undefined, callerRole);
    }

    throw new AppError('You do not have permission to view dashboard', 403);
  }

  async getRecentActivities(
    organizationId: string,
    callerId: string,
    callerRole: CallerRole,
    limit: number = 10
  ) {
    const finalLimit = Math.min(Math.max(limit, 1), 50);

    if (callerRole === 'SALES_REP') {
      return dashboardRepository.getRecentActivities(
        organizationId,
        finalLimit,
        callerId,
        callerRole
      );
    } else if (callerRole === 'SALES_MANAGER' || callerRole === 'ORG_ADMIN') {
      return dashboardRepository.getRecentActivities(
        organizationId,
        finalLimit,
        callerId,
        callerRole
      );
    } else if (callerRole === 'SUPER_ADMIN') {
      return dashboardRepository.getRecentActivities(organizationId, finalLimit, undefined, callerRole);
    }

    throw new AppError('You do not have permission to view activities', 403);
  }

  async getUpcomingActivities(
    organizationId: string,
    callerId: string,
    callerRole: CallerRole,
    limit: number = 10
  ) {
    const finalLimit = Math.min(Math.max(limit, 1), 50);

    if (callerRole === 'SALES_REP') {
      return dashboardRepository.getUpcomingActivities(
        organizationId,
        finalLimit,
        callerId,
        callerRole
      );
    } else if (callerRole === 'SALES_MANAGER' || callerRole === 'ORG_ADMIN') {
      return dashboardRepository.getUpcomingActivities(
        organizationId,
        finalLimit,
        callerId,
        callerRole
      );
    } else if (callerRole === 'SUPER_ADMIN') {
      return dashboardRepository.getUpcomingActivities(organizationId, finalLimit, undefined, callerRole);
    }

    throw new AppError('You do not have permission to view activities', 403);
  }

  async getSalesPerformance(
    organizationId: string,
    callerId: string,
    callerRole: CallerRole
  ) {
    if (callerRole === 'SALES_REP') {
      return dashboardRepository.getSalesPerformance(organizationId, callerId, callerRole);
    } else if (callerRole === 'SALES_MANAGER' || callerRole === 'ORG_ADMIN') {
      return dashboardRepository.getSalesPerformance(organizationId, callerId, callerRole);
    } else if (callerRole === 'SUPER_ADMIN') {
      return dashboardRepository.getSalesPerformance(organizationId, undefined, callerRole);
    }

    throw new AppError('You do not have permission to view sales performance', 403);
  }
}

export const dashboardService = new DashboardService();
