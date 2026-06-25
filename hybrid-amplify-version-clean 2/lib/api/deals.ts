/**
 * Deals API Service
 */

import apiClient from './client';
import { Deal, PaginatedResponse } from '@/lib/types';

export interface CreateDealRequest {
  customer_id: string;
  name: string;
  arr: number;
  icp_fit: 'high' | 'medium' | 'low';
  close_date?: string;
  champion_name?: string;
  champion_title?: string;
  stage: string;
  status?: 'active' | 'closed-won' | 'closed-lost';
  crm_id?: string;
  owner_id?: string;
}

export interface UpdateDealRequest extends Partial<Omit<CreateDealRequest, 'customer_id'>> {}

export const dealsApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Deal>> => {
    const response = await apiClient.get('/deals', { params });
    return response.data;
  },

  get: async (id: string): Promise<{ deal: Deal; feature_gaps: any[] }> => {
    const response = await apiClient.get(`/deals/${id}`);
    return response.data;
  },

  create: async (data: CreateDealRequest): Promise<{ deal: Deal }> => {
    const response = await apiClient.post('/deals', data);
    return response.data;
  },

  update: async (id: string, data: UpdateDealRequest): Promise<{ deal: Deal }> => {
    const response = await apiClient.patch(`/deals/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/deals/${id}`);
    return response.data;
  },
};
