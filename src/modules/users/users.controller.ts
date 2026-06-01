import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { sendSuccess, sendCreated } from '@common/utils/apiResponse.utils';

import {
  updateProfileSchema,
  inviteUserSchema,
  acceptInviteSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} from './users.validation';

export class UsersController {
  // ── Profile ───────────────────────────────────────────────────────────────

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await usersService.getProfile(
        req.user!.id,
        req.user!.organizationId
      );
      sendSuccess(res, data, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const body = updateProfileSchema.parse(req.body);
      const data = await usersService.updateProfile(
        req.user!.id,
        req.user!.organizationId,
        body
      );
      sendSuccess(res, data, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // ── Users List ────────────────────────────────────────────────────────────

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await usersService.getAllUsers(req.user!.organizationId);
      sendSuccess(res, data, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await usersService.getUserById(
        req.params.id as string,
        req.user!.organizationId
      );
      sendSuccess(res, data, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ── Invite ────────────────────────────────────────────────────────────────

  async inviteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const body = inviteUserSchema.parse(req.body);
      const data = await usersService.inviteUser(
        req.user!.organizationId,
        req.user!.id,
        body
      );
      sendCreated(res, data, 'Invitation sent successfully');
    } catch (error) {
      next(error);
    }
  }

  async acceptInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const body = acceptInviteSchema.parse(req.body);
      const data = await usersService.acceptInvite(body);
      sendCreated(res, data, 'Invitation accepted successfully');
    } catch (error) {
      next(error);
    }
  }

  // ── Role & Status ─────────────────────────────────────────────────────────

  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const body = updateUserRoleSchema.parse(req.body);
      const data = await usersService.updateUserRole(
        req.params.id as string,
        req.user!.organizationId,
        req.user!.id,
        body
      );
      sendSuccess(res, data, 'User role updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const body = updateUserStatusSchema.parse(req.body);
      const data = await usersService.updateUserStatus(
        req.params.id as string,
        req.user!.organizationId,
        req.user!.id,
        body
      );
      sendSuccess(res, data, 'User status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // ── Invitations List ──────────────────────────────────────────────────────

  async getAllInvitations(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await usersService.getAllInvitations(req.user!.organizationId);
      sendSuccess(res, data, 'Invitations retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();