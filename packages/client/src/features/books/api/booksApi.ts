import { apiClient } from '../../../lib/apiClient';
import { ENDPOINTS } from '../../../lib/constants';
import type {
  ApiBook,
  ApiBookListResponse,
  ApiBookQuery,
  CreateBookInput,
  UpdateBookInput,
} from '@react-express-library/shared';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    next_page: number | null;
    prev_page: number | null;
  };
}

/**
 * Get all books with filters, search, sort, pagination
 */
export const getAllBooks = async (query: ApiBookQuery = {}): Promise<ApiBookListResponse> => {
  const params = new URLSearchParams();
  
  if (query.page) params.append('page', query.page);
  if (query.limit) params.append('limit', query.limit);
  if (query.search) params.append('search', query.search);
  if (query.orderByTitle) params.append('orderByTitle', query.orderByTitle);
  if (query.orderByPublishDate) params.append('orderByPublishDate', query.orderByPublishDate);
  if (query.condition) params.append('condition', query.condition);

  const response = await apiClient.get<ApiResponse<ApiBook[]>>(
    `${ENDPOINTS.BOOKS}?${params.toString()}`
  );

  return {
    books: response.data.data,
    total: response.data.meta?.total || 0,
  };
};

/**
 * Get book by ID
 */
export const getBookById = async (id: string): Promise<ApiBook> => {
  const response = await apiClient.get<ApiResponse<ApiBook>>(
    ENDPOINTS.BOOK_DETAIL(id)
  );
  return response.data.data;
};

/**
 * Create new book
 */
export const createBook = async (bookData: CreateBookInput): Promise<{ id: string; title: string }> => {
  const response = await apiClient.post<ApiResponse<{ id: string; title: string }>>(
    ENDPOINTS.BOOKS,
    bookData
  );
  return response.data.data;
};

/**
 * Update book (description, price, stock)
 */
export const updateBook = async (
  id: string,
  bookData: UpdateBookInput
): Promise<void> => {
  await apiClient.patch(`${ENDPOINTS.BOOKS}/${id}`, bookData);
};

/**
 * Delete book (soft delete)
 */
export const deleteBook = async (id: string): Promise<void> => {
  await apiClient.delete(`${ENDPOINTS.BOOKS}/${id}`);
};
