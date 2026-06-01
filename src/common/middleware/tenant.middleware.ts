import { Request, Response, NextFunction } from 'express';
import { AppError } from '@common/middleware/error.middleware';

export const injectTenant = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user?.organizationId) {
    return next(new AppError('Tenant context missing', 400));
  }
  next();
};