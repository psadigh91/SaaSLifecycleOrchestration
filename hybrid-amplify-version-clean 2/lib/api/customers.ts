/**
 * Customers API Service
 */

import apiClient from './client';
import { Customer, PaginatedResponse } from '@/lib/types';

export interface CreateCustomerRequest {
  name: string;
  domain?: string;
  industry?: string;
  company_size?: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';
  arr?: number;
  icp_fit?: 'high' | 'medium' | 'low';
  status?: 'prospect' | 'active' | 'churned' | 'paused';
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_title?: string;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {}

export const customersApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Customer>> => {
    const response = await apiClient.get('/customers', { params });
    return response.data;
  },

  get: async (id: string): Promise<{ customer: Customer }> => {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  },

  create: async (data: CreateCustomerRequest): Promise<{ customer: Customer }> => {
    const response = await apiClient.post('/customers', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCustomerRequest): Promise<{ customer: Customer }> => {
    const response = await apiClient.patch(`/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/customers/${id}`);
    return response.data;
  },
};
