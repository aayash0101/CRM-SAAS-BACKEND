import { dashboardRepository } from './dashboard.repository';

type CallerRole = string;

export class DashboardService {
  private getScopedUserId(callerId: string, callerRole: CallerRole): string | undefined {
    return callerRole === 'SALES_REP' ? callerId : undefined;
  }

  async getOverview(organizationId: string, callerId: string, callerRole: CallerRole) {
    return dashboardRepository.getOverviewData(
      organizationId,
      this.getScopedUserId(callerId, callerRole),
      callerRole
    );
  }

  async getRecentActivities(
    organizationId: string,
    callerId: string,
    callerRole: CallerRole,
    limit: number = 10
  ) {
    const finalLimit = Math.min(Math.max(limit, 1), 50);
    return dashboardRepository.getRecentActivities(
      organizationId,
      finalLimit,
      this.getScopedUserId(callerId, callerRole),
      callerRole
    );
  }

  async getUpcomingActivities(
    organizationId: string,
    callerId: string,
    callerRole: CallerRole,
    limit: number = 10
  ) {
    const finalLimit = Math.min(Math.max(limit, 1), 50);
    return dashboardRepository.getUpcomingActivities(
      organizationId,
      finalLimit,
      this.getScopedUserId(callerId, callerRole),
      callerRole
    );
  }

  async getSalesPerformance(
    organizationId: string,
    callerId: string,
    callerRole: CallerRole
  ) {
    return dashboardRepository.getSalesPerformance(
      organizationId,
      this.getScopedUserId(callerId, callerRole),
      callerRole
    );
  }
}

export const dashboardService = new DashboardService();