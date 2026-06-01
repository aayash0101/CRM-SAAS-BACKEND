export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

export interface InvitationDto {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: Date;
  createdAt: Date;
}