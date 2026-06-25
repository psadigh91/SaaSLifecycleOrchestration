/**
 * Support Escalations API Service
 */

import apiClient from './client';
import { SupportEscalation, PaginatedResponse } from '@/lib/types';

export interface CreateEscalationRequest {
  customer_id: string;
  title: string;
  classification?: 'bug' | 'feature-gap' | 'config-education';
  severity?: 's1-critical' | 's2-high' | 's3-medium' | 's4-low';
  verbatim: string;
  description?: string;
  repro_steps?: string;
  workaround?: string;
  workaround_quality?: 'none' | 'painful' | 'easy';
  workflow_criticality?: 'primary' | 'secondary' | 'tertiary';
  support_ticket_id?: string;
  related_gap_id?: string;
}

export interface UpdateEscalationRequest extends Partial<Omit<CreateEscalationRequest, 'customer_id'>> {}

export interface RecalculateScoreRequest {
  revenue_exposure?: number;
  account_count?: number;
  workflow_criticality?: 'primary' | 'secondary' | 'tertiary';
  workaround_quality?: 'none' | 'painful' | 'easy';
  recency_velocity?: number;
}

export const escalationsApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    classification?: string;
    severity?: string;
    min_score?: number;
  }): Promise<PaginatedResponse<SupportEscalation>> => {
    const response = await apiClient.get('/escalations', { params });
    return response.data;
  },

  get: async (id: string): Promise<{ escalation: SupportEscalation }> => {
    const response = await apiClient.get(`/escalations/${id}`);
    return response.data;
  },

  create: async (data: CreateEscalationRequest): Promise<{ escalation: SupportEscalation }> => {
    const response = await apiClient.post('/escalations', data);
    return response.data;
  },

  update: async (id: string, data: UpdateEscalationRequest): Promise<{ escalation: SupportEscalation }> => {
    const response = await apiClient.patch(`/escalations/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/escalations/${id}`);
    return response.data;
  },

  recalculateScore: async (
    id: string,
    data: RecalculateScoreRequest
  ): Promise<{
    escalation: SupportEscalation;
    previous_score: number;
    new_score: number;
  }> => {
    const response = await apiClient.post(`/escalations/${id}/recalculate-score`, data);
    return response.data;
  },
};
