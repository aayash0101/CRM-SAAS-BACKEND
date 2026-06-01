export interface OrganizationDto {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  website: string | null;
  logoUrl: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  status: string;
  createdAt: Date;
}

export interface SubscriptionDto {
  id: string;
  plan: string;
  status: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
}

export interface OrganizationWithSubscriptionDto extends OrganizationDto {
  subscription: SubscriptionDto | null;
}