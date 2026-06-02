export type DealStage = 'PROSPECT' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';

export interface DealDto {
  id: string;
  organizationId: string;
  customerId: string;
  ownerId: string;
  title: string;
  value: number;
  stage: DealStage;
  expectedCloseDate: Date | null;
  closedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDealData {
  organizationId: string;
  customerId: string;
  ownerId: string;
  title: string;
  value?: number;
  stage?: DealStage;
  expectedCloseDate?: Date | null;
  notes?: string | null;
}

export interface UpdateDealData {
  customerId?: string;
  ownerId?: string;
  title?: string;
  value?: number;
  stage?: DealStage;
  expectedCloseDate?: Date | null;
  closedAt?: Date | null;
  notes?: string | null;
}

export interface DealFilters {
  stage?: DealStage;
  ownerId?: string;
  customerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateDealHistoryData {
  dealId: string;
  fromStage: DealStage | null;
  toStage: DealStage;
  note?: string | null;
}