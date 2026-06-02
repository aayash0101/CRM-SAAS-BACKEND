import { Router } from 'express';
import { customersController } from './customers.controller';
import { authenticate, authorize } from '@common/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get(
  '/stats',
  authorize('ORG_ADMIN', 'SALES_MANAGER'),
  customersController.getCustomerStats.bind(customersController)
);

router.get('/', customersController.getAllCustomers.bind(customersController));

router.post(
  '/',
  authorize('ORG_ADMIN', 'SALES_MANAGER'),
  customersController.createCustomer.bind(customersController)
);

router.get('/:id', customersController.getCustomerById.bind(customersController));

router.patch(
  '/:id',
  authorize('ORG_ADMIN', 'SALES_MANAGER'),
  customersController.updateCustomer.bind(customersController)
);

router.delete(
  '/:id',
  authorize('ORG_ADMIN'),
  customersController.deleteCustomer.bind(customersController)
);

export default router;