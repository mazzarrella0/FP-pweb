import { apiClient } from '../../../lib/apiClient';
import { ENDPOINTS, TOKEN_KEY } from '../../../lib/constants';
import type { LoginInput, RegisterInput, LoginResponse, RegisterResponse, PublicUser } from '@react-express-library/shared';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Login user
 */
export const login = async (credentials: LoginInput): Promise<string> => {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    ENDPOINTS.LOGIN,
    credentials
  );
  
  const token = response.data.data.access_token;
  
  // Save token to localStorage
  localStorage.setItem(TOKEN_KEY, token);
  
  return token;
};

/**
 * Register new user
 */
export const register = async (userData: RegisterInput): Promise<RegisterResponse> => {
  const response = await apiClient.post<ApiResponse<RegisterResponse>>(
    ENDPOINTS.REGISTER,
    userData
  );
  
  return response.data.data;
};

/**
 * Get current user info
 */
export const getCurrentUser = async (): Promise<PublicUser> => {
  const response = await apiClient.get<ApiResponse<PublicUser>>(ENDPOINTS.ME);
  return response.data.data;
};

/**
 * Logout user (clear local storage)
 */
export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(TOKEN_KEY);
};
