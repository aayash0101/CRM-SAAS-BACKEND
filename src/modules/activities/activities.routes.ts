import { Router } from 'express';
import { activitiesController } from './activities.controller';
import { authenticate, authorize } from '@common/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get(
  '/stats',
  authorize('ORG_ADMIN', 'SALES_MANAGER'),
  activitiesController.getActivityStats.bind(activitiesController)
);

router.get('/', activitiesController.getAllActivities.bind(activitiesController));

router.post('/', activitiesController.createActivity.bind(activitiesController));

router.get('/:id', activitiesController.getActivityById.bind(activitiesController));

router.patch('/:id', activitiesController.updateActivity.bind(activitiesController));

router.patch(
  '/:id/status',
  activitiesController.updateActivityStatus.bind(activitiesController)
);

router.delete(
  '/:id',
  authorize('ORG_ADMIN', 'SALES_MANAGER'),
  activitiesController.deleteActivity.bind(activitiesController)
);

export default router;
