// Customer Types
export interface Customer {
  id: string;
  name: string;
  industry: string;
  contractValue: number;
  healthScore: number;
  csm: string;
  status: 'active' | 'at_risk' | 'churned' | 'onboarding';
  createdAt: string;
  updatedAt: string;
}

// Deal Types
export interface Deal {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  value: number;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  closeDate: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

// Escalation Types
export interface Escalation {
  id: string;
  title: string;
  description: string;
  customerId: string;
  customerName: string;
  severity: 'S1' | 'S2' | 'S3' | 'S4';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'triaged' | 'in_progress' | 'resolved' | 'closed';
  aiScore: number;
  assignedTo?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Ticket Types
export interface Ticket {
  id: string;
  title: string;
  description: string;
  type: 'bug' | 'feature' | 'enhancement' | 'task';
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignedTo?: string;
  escalationId?: string;
  featureGapId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Handoff Types
export interface Handoff {
  id: string;
  fromTeam: string;
  toTeam: string;
  entityType: 'customer' | 'deal' | 'escalation' | 'ticket';
  entityId: string;
  status: 'pending' | 'accepted' | 'completed' | 'rejected';
  context: string;
  slaDeadline: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Knowledge Base Types
export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  status: 'draft' | 'published' | 'archived';
  viewCount: number;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

// Feature Gap Types
export interface FeatureGap {
  id: string;
  title: string;
  description: string;
  requestedBy: string;
  customerId: string;
  dealId?: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  status: 'new' | 'under_review' | 'planned' | 'in_development' | 'shipped' | 'declined';
  votes: number;
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'escalation' | 'handoff' | 'ticket' | 'deal' | 'system';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// Search Result Types
export interface SearchResult {
  id: string;
  type: 'escalation' | 'ticket' | 'knowledge_base' | 'feature_gap';
  title: string;
  snippet: string;
  similarity: number;
  metadata: Record<string, any>;
}

// AI Agent Types
export interface AIAgentExecution {
  id: string;
  prompt: string;
  response: string;
  context: RAGContext[];
  model: string;
  tokensUsed: number;
  executionTime: number;
  createdAt: string;
}

export interface RAGContext {
  type: 'escalation' | 'ticket' | 'knowledge_base' | 'feature_gap';
  id: string;
  title: string;
  similarity: number;
  content: string;
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter Types
export interface CustomerFilters {
  status?: Customer['status'];
  industry?: string;
  minHealthScore?: number;
  maxHealthScore?: number;
  search?: string;
}

export interface EscalationFilters {
  severity?: Escalation['severity'];
  status?: Escalation['status'];
  customerId?: string;
  assignedTo?: string;
  search?: string;
}

export interface TicketFilters {
  type?: Ticket['type'];
  status?: Ticket['status'];
  priority?: Ticket['priority'];
  assignedTo?: string;
  search?: string;
}

export interface DealFilters {
  stage?: Deal['stage'];
  customerId?: string;
  minValue?: number;
  maxValue?: number;
  search?: string;
}
