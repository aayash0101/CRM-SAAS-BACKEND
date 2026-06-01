import { Router } from 'express';
import { leadsController } from './leads.controller';
import { authenticate, authorize } from '@common/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get(
  '/stats',
  authorize('ORG_ADMIN', 'SALES_MANAGER'),
  leadsController.getLeadStats.bind(leadsController)
);

router.get('/', leadsController.getAllLeads.bind(leadsController));

router.post('/', leadsController.createLead.bind(leadsController));

router.get('/:id', leadsController.getLeadById.bind(leadsController));

router.patch('/:id', leadsController.updateLead.bind(leadsController));

router.delete(
  '/:id',
  authorize('ORG_ADMIN', 'SALES_MANAGER'),
  leadsController.deleteLead.bind(leadsController)
);

export default router;