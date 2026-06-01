import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  verifyEmailSchema,
} from './auth.validation';
import { sendSuccess, sendCreated } from '@common/utils/apiResponse.utils';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = registerSchema.parse(req.body);
      const result = await authService.register(input);
      sendCreated(res, result, 'Organization registered successfully');
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = loginSchema.parse(req.body);
      const result = await authService.login(input);
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = refreshTokenSchema.parse(req.body);
      const result = await authService.refreshToken(input);
      sendSuccess(res, result, 'Token refreshed');
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = verifyEmailSchema.parse(req.body);
      await authService.verifyEmail(input);
      sendSuccess(res, null, 'Email verified successfully');
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = forgotPasswordSchema.parse(req.body);
      await authService.forgotPassword(input);
      sendSuccess(res, null, 'If that email exists, a reset link has been sent');
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(input);
      sendSuccess(res, null, 'Password reset successfully');
    } catch (error) {
      next(error);
    }
  }

  async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();