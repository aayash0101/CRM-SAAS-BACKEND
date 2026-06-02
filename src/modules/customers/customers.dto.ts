export interface CustomerDto {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerData {
  organizationId: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  notes?: string | null;
}

export interface UpdateCustomerData {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  notes?: string | null;
}

export interface CustomerFilters {
  search?: string;
  page?: number;
  limit?: number;
}