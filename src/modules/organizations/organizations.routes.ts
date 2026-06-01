import { Router } from 'express';
import { organizationsController } from './organizations.controller';
import { authenticate } from '@common/middleware/auth.middleware';
import { authorize } from '@common/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  (req, res, next) => organizationsController.getOrganization(req, res, next)
);

router.patch(
  '/',
  authorize('ORG_ADMIN', 'SUPER_ADMIN'),
  (req, res, next) => organizationsController.updateOrganization(req, res, next)
);

router.get(
  '/stats',
  (req, res, next) => organizationsController.getStats(req, res, next)
);

export default router;