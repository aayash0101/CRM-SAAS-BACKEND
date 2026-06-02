import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '@common/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/overview', dashboardController.getOverview.bind(dashboardController));

router.get(
  '/recent-activities',
  dashboardController.getRecentActivities.bind(dashboardController)
);

router.get(
  '/upcoming-activities',
  dashboardController.getUpcomingActivities.bind(dashboardController)
);

router.get(
  '/sales-performance',
  dashboardController.getSalesPerformance.bind(dashboardController)
);

export default router;
