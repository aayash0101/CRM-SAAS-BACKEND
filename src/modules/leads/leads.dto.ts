export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'LOST';
export type LeadSource =
  | 'WEBSITE'
  | 'REFERRAL'
  | 'SOCIAL_MEDIA'
  | 'EMAIL_CAMPAIGN'
  | 'COLD_CALL'
  | 'TRADE_SHOW'
  | 'OTHER';

export interface LeadDto {
  id: string;
  organizationId: string;
  assignedUserId: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: LeadSource;
  status: LeadStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLeadData {
  organizationId: string;
  assignedUserId?: string | null;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  source?: LeadSource;
  status?: LeadStatus;
  notes?: string | null;
}

export interface UpdateLeadData {
  assignedUserId?: string | null;
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  source?: LeadSource;
  status?: LeadStatus;
  notes?: string | null;
}

export interface LeadFilters {
  status?: LeadStatus;
  source?: LeadSource;
  assignedUserId?: string;
  search?: string;
  page?: number;
  limit?: number;
}