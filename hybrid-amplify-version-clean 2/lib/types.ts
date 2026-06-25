// Core type definitions for the platform

export type UserRole =
  | 'admin'
  | 'gtm'
  | 'proserv'
  | 'product'
  | 'ux'
  | 'engineering'
  | 'cs'
  | 'support';

export type ICPFit = 'high' | 'medium' | 'low';

export type CustomerStatus = 'prospect' | 'active' | 'churned' | 'paused';

export type DealStatus = 'active' | 'closed-won' | 'closed-lost';

export type GapPriority = 'deal-blocking' | 'nice-to-have' | 'competitive';

export type GapClassification = 'config' | 'custom-config' | 'product-gap';

export type Complexity = 'low' | 'medium' | 'high';

export type ProductPriority = 'p1' | 'p2' | 'p3' | 'p4';

export type ProductTicketStatus = 'backlog' | 'ux-design' | 'engineering' | 'shipped';

export type EscalationClassification = 'bug' | 'feature-gap' | 'config-education';

export type EscalationSeverity = 's1-critical' | 's2-high' | 's3-medium' | 's4-low';

export type WorkaroundQuality = 'none' | 'painful' | 'easy';

export type WorkflowCriticality = 'primary' | 'secondary' | 'tertiary';

export type TeamName = 'gtm' | 'proserv' | 'product' | 'engineering' | 'cs' | 'support';

export type HandoffStatus = 'pending' | 'acknowledged' | 'completed' | 'stalled';

export type NotificationType = 'info' | 'warn' | 'danger' | 'success';

// Entity interfaces

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
}

export interface Customer {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  company_size?: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';
  arr?: number;
  icp_fit?: ICPFit;
  status: CustomerStatus;
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_title?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Deal {
  id: string;
  customer_id: string;
  name: string;
  arr: number;
  icp_fit: ICPFit;
  close_date?: Date;
  champion_name?: string;
  champion_title?: string;
  stage: string;
  status: DealStatus;
  crm_id?: string;
  owner_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface FeatureGap {
  id: string;
  deal_id?: string;
  customer_id?: string;
  title: string;
  verbatim: string;
  description?: string;
  priority?: GapPriority;
  integration_name?: string;
  classification?: GapClassification;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ScopingSpec {
  id: string;
  deal_id?: string;
  gap_id?: string;
  gap_type?: GapClassification;
  hours?: number;
  complexity?: Complexity;
  risk?: string;
  blockers?: string;
  dependencies?: any[];
  notes?: string;
  approved_at?: Date;
  approved_by?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProductTicket {
  id: string;
  spec_id?: string;
  title: string;
  description?: string;
  priority?: ProductPriority;
  quarter?: string;
  ux_scope?: string;
  acceptance_criteria?: string;
  status: ProductTicketStatus;
  assigned_to?: string;
  shipped_at?: Date;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SupportEscalation {
  id: string;
  customer_id: string;
  title: string;
  classification?: EscalationClassification;
  severity?: EscalationSeverity;
  verbatim: string;
  description?: string;
  repro_steps?: string;
  workaround?: string;
  workaround_quality?: WorkaroundQuality;
  score?: number;
  revenue_exposure?: number;
  account_count: number;
  workflow_criticality?: WorkflowCriticality;
  recency_velocity: number;
  support_ticket_id?: string;
  related_gap_id?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
  routed_to_product_at?: Date;
}

export interface HandoffPackage {
  id: string;
  deal_id?: string;
  from_team: TeamName;
  to_team: TeamName;
  status: HandoffStatus;
  context: any;
  created_by?: string;
  created_at: Date;
  acknowledged_at?: Date;
  acknowledged_by?: string;
  completed_at?: Date;
  updated_at: Date;
  sla_hours: number;
  is_overdue?: boolean;
}

export interface OrchestratorEvent {
  id: string;
  event_type: string;
  source: string;
  entity_type?: string;
  entity_id?: string;
  payload: any;
  created_at: Date;
}

export interface Notification {
  id: string;
  type: NotificationType;
  from_agent: string;
  to_user_id?: string;
  to_team?: string;
  message: string;
  action_required: boolean;
  related_entity_type?: string;
  related_entity_id?: string;
  read: boolean;
  read_at?: Date;
  created_at: Date;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuditLogEntry {
  id: string;
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  changes?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

// API request/response types

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: Omit<User, 'password_hash'>;
}

export interface AuthenticatedRequest {
  user: User;
}

// API pagination and filters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
