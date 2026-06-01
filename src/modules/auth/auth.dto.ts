export interface AuthUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl: string | null;
  emailVerified: boolean;
}

export interface AuthOrganizationDto {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: AuthUserDto;
  organization: AuthOrganizationDto;
}

export interface RefreshResponseDto {
  accessToken: string;
}