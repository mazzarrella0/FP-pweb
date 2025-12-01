// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Local Storage Keys
export const TOKEN_KEY = 'auth_token';
export const USER_KEY = 'user_data';

// API Endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ME: '/auth/me',
  
  // Books
  BOOKS: '/books',
  BOOK_DETAIL: (id: string) => `/books/${id}`,
  
  // Genres
  GENRES: '/genre',
  
  // Transactions
  TRANSACTIONS: '/transactions',
  TRANSACTION_DETAIL: (id: string) => `/transactions/${id}`,
} as const;
