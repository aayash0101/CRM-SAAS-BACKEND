import jwt from 'jsonwebtoken';
import { config } from '@config/app.config';

export type UserRole = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'SALES_MANAGER' | 'SALES_REP';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId: string;
  firstName: string;
  lastName: string;
}

export interface RefreshTokenPayload {
  userId: string;
  organizationId: string;
}

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (
  payload: RefreshTokenPayload
): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as RefreshTokenPayload;
};