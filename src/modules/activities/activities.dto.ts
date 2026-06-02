export type ActivityType = 'CALL' | 'EMAIL' | 'MEETING' | 'TASK';
export type ActivityStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface ActivityDto {
  id: string;
  organizationId: string;
  userId: string;
  leadId: string | null;
  customerId: string | null;
  dealId: string | null;
  type: ActivityType;
  status: ActivityStatus;
  title: string;
  description: string | null;
  dueAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateActivityData {
  organizationId: string;
  userId: string;
  type: ActivityType;
  title: string;
  description?: string | null;
  dueAt: Date;
  leadId?: string | null;
  customerId?: string | null;
  dealId?: string | null;
}

export interface UpdateActivityData {
  type?: ActivityType;
  title?: string;
  description?: string | null;
  dueAt?: Date;
  status?: ActivityStatus;
  leadId?: string | null;
  customerId?: string | null;
  dealId?: string | null;
  completedAt?: Date | null;
}

export interface ActivityFilters {
  type?: ActivityType;
  status?: ActivityStatus;
  leadId?: string;
  customerId?: string;
  dealId?: string;
  userId?: string;
  search?: string;
  page?: number;
  limit?: number;
}
