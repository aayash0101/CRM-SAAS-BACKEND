import { Router } from 'express';
import { dealsController } from './deals.controller';
import { authenticate, authorize } from '@common/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get(
  '/pipeline',
  authorize('ORG_ADMIN', 'SALES_MANAGER'),
  dealsController.getPipelineStats.bind(dealsController)
);

router.get('/', dealsController.getAllDeals.bind(dealsController));

router.post('/', dealsController.createDeal.bind(dealsController));

router.get('/:id', dealsController.getDealById.bind(dealsController));

router.patch('/:id', dealsController.updateDeal.bind(dealsController));

router.delete('/:id', dealsController.deleteDeal.bind(dealsController));

export default router;