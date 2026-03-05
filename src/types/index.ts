export type UserRole = 'GUEST' | 'COMPANY' | 'TPP_ADMIN' | 'GOV_USER';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
}

export type CompanyStatus = 'ON_MODERATION' | 'VERIFIED' | 'BLOCKED';

export interface Company {
  id: number;
  owner_user_id: number;
  inn: string;
  ogrn?: string;
  full_name: string;
  short_name?: string;
  status: CompanyStatus;
  region_id: number;
  is_tpp_member: boolean;
  has_quality_mark: boolean;
  created_at: string;
}

export interface CompanyProfile {
  company_id: number;
  description?: string;
  industry_code?: string;
  city?: string;
  website?: string;
  logo_url?: string;
  is_exporter: boolean;
  tags?: string[]; // stored as JSON string in DB, parsed to array here
  phone?: string;
  email?: string;
  address?: string;
  ceo_name?: string;
  employees_count?: number;
  founding_year?: number;
  annual_turnover?: string;
}

export type PlanType = 'PARTICIPANT' | 'PARTNER' | 'STRATEGIC';

export interface Subscription {
  id: number;
  company_id: number;
  plan_type: PlanType;
  start_date: string;
  end_date?: string;
  is_active: boolean;
}

export type B2BRequestType = 'BUY' | 'SELL' | 'PARTNER' | 'INVEST';
export type B2BRequestStatus = 'MODERATION' | 'PUBLISHED' | 'ARCHIVED';

export interface B2BRequest {
  id: number;
  company_id: number;
  type: B2BRequestType;
  title: string;
  description: string;
  status: B2BRequestStatus;
  visibility: 'PUBLIC' | 'PRIVATE';
  created_at: string;
}

export type VEDRequestStatus = 'NEW' | 'PROCESSING' | 'DONE' | 'REJECTED';

export interface VEDRequest {
  id: number;
  company_id: number;
  target_countries: string[]; // stored as JSON string in DB
  product_desc?: string;
  status: VEDRequestStatus;
  admin_comment?: string;
  created_at: string;
}
