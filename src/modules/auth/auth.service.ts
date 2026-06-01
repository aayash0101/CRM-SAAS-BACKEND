import crypto from 'crypto';
import { authRepository } from './auth.repository';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  RefreshTokenInput,
  VerifyEmailInput,
} from './auth.validation';
import { AuthResponseDto, RefreshResponseDto } from './auth.dto';
import { hashPassword, comparePassword } from '@common/utils/password.utils';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '@common/utils/jwt.utils';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '@common/utils/email.utils';
import { AppError } from '@common/middleware/error.middleware';

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResponseDto> {
    const slug = input.organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + crypto.randomBytes(3).toString('hex');

    const hashedPassword = await hashPassword(input.password);

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    const { organization, user } =
      await authRepository.createOrganizationWithAdminAndSubscription({
        name: input.organizationName,
        slug,
        email: input.email,
        adminUser: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          password: hashedPassword,
          emailVerificationToken,
        },
      });

    try {
      await sendVerificationEmail(
        user.email,
        user.firstName,
        emailVerificationToken
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    // 6. Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: organization.id,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      organizationId: organization.id,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
      },
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logoUrl: organization.logoUrl,
      },
    };
  }

  async login(input: LoginInput): Promise<AuthResponseDto> {
    const user = await authRepository.findUserByEmail(input.email);

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.status === 'INACTIVE' || user.status === 'SUSPENDED') {
      throw new AppError('Your account has been suspended. Contact support.', 403);
    }

    if (user.organization.status !== 'ACTIVE') {
      throw new AppError('Your organization account is suspended.', 403);
    }

    const isPasswordValid = await comparePassword(input.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    await authRepository.updateUser(user.id, {
      lastLoginAt: new Date(),
    });

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      organizationId: user.organizationId,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        slug: user.organization.slug,
        logoUrl: user.organization.logoUrl,
      },
    };
  }

  async refreshToken(input: RefreshTokenInput): Promise<RefreshResponseDto> {
    try {
      const payload = verifyRefreshToken(input.refreshToken);

      const user = await authRepository.findUserById(payload.userId);
      if (!user || user.status !== 'ACTIVE') {
        throw new AppError('Invalid refresh token', 401);
      }

      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        firstName: user.firstName,
        lastName: user.lastName,
      });

      return { accessToken };
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  async verifyEmail(input: VerifyEmailInput): Promise<void> {
    const user = await authRepository.findUserByVerificationToken(input.token);

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    await authRepository.updateUser(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
    });
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    const user = await authRepository.findUserByEmail(input.email);

    if (!user) return;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await authRepository.updateUser(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpiresAt: expiresAt,
    });

    try {
      await sendPasswordResetEmail(user.email, user.firstName, resetToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const user = await authRepository.findUserByPasswordResetToken(input.token);

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const hashedPassword = await hashPassword(input.password);

    await authRepository.updateUser(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    });
  }
}

export const authService = new AuthService();