import { apiClient } from '../../../lib/apiClient';
import { ENDPOINTS } from '../../../lib/constants';

export interface Genre {
  id: string;
  name: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Get all genres
 */
export const getAllGenres = async (): Promise<Genre[]> => {
  const response = await apiClient.get<ApiResponse<Genre[]>>(ENDPOINTS.GENRES);
  return response.data.data;
};
