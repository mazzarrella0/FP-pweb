import { apiClient } from '../lib/apiClient';
import { ENDPOINTS } from '../lib/constants';
import * as booksApi from '../features/books/api/booksApi';

// Adapter to provide the `transactionAPI` and `booksAPI` objects
// that older pages expect (so we don't have to refactor them all at once).

export const transactionAPI = {
  getTransactions: async (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams();
    for (const k in params) {
      if (params[k] !== undefined) qs.append(k, String(params[k]));
    }
    const resp = await apiClient.get(`${ENDPOINTS.TRANSACTIONS}?${qs.toString()}`);
    // normalize to { transactions, total }
    return {
      transactions: resp.data.data || [],
      total: resp.data.meta?.total || 0,
    };
  },

  getTransactionById: async (id: string) => {
    const resp = await apiClient.get(`${ENDPOINTS.TRANSACTION_DETAIL(id)}`);
    return resp.data.data;
  },

  createTransaction: async (input: any) => {
    const resp = await apiClient.post(ENDPOINTS.TRANSACTIONS, input);
    return resp.data.data;
  },
};

export const booksAPI = {
  // Provide getBooks alias used by pages -> delegates to existing booksApi.getAllBooks
  getBooks: async (query: any) => {
    return booksApi.getAllBooks(query);
  },
  getBookById: booksApi.getBookById,
  createBook: booksApi.createBook,
  updateBook: booksApi.updateBook,
  deleteBook: booksApi.deleteBook,
};

export default { transactionAPI, booksAPI };
