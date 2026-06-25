/**
 * API Services Index
 * Central export for all API services
 */

export { apiClient, setToken, setRefreshToken, clearTokens, handleApiError } from './client';
export { authApi } from './auth';
export { customersApi } from './customers';
export { dealsApi } from './deals';
export { escalationsApi } from './escalations';

export type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from './auth';
export type { CreateCustomerRequest, UpdateCustomerRequest } from './customers';
export type { CreateDealRequest, UpdateDealRequest } from './deals';
export type {
  CreateEscalationRequest,
  UpdateEscalationRequest,
  RecalculateScoreRequest,
} from './escalations';
