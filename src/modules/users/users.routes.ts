import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate, authorize } from '@common/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/profile', usersController.getProfile.bind(usersController));
router.patch('/profile', usersController.updateProfile.bind(usersController));

router.post(
  '/invite',
  authorize('ORG_ADMIN'),
  usersController.inviteUser.bind(usersController)
);

router.post('/accept-invite', usersController.acceptInvite.bind(usersController));

router.get(
  '/invitations/all',
  authorize('ORG_ADMIN'),
  usersController.getAllInvitations.bind(usersController)
);

router.get(
  '/',
  authorize('ORG_ADMIN', 'SALES_MANAGER'),
  usersController.getAllUsers.bind(usersController)
);

router.get('/:id', usersController.getUserById.bind(usersController));

router.patch(
  '/:id/role',
  authorize('ORG_ADMIN'),
  usersController.updateUserRole.bind(usersController)
);

router.patch(
  '/:id/status',
  authorize('ORG_ADMIN'),
  usersController.updateUserStatus.bind(usersController)
);

export default router;