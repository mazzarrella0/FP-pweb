import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select } from '../../../components';
import { BookCard } from './BookCard';
import { getAllBooks } from '../api/booksApi';
import type { ApiBook, BookCondition } from '@react-express-library/shared';

export const BooksList = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<ApiBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [condition, setCondition] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 9; // 9 books per page (3x3 grid)

  const fetchBooks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const query: any = {
        page: page.toString(),
        limit: limit.toString(),
      };

      if (search) query.search = search;
      if (condition) query.condition = condition as BookCondition;
      
      // Handle sorting
      if (sortBy === 'title-asc') query.orderByTitle = 'asc';
      if (sortBy === 'title-desc') query.orderByTitle = 'desc';
      if (sortBy === 'year-asc') query.orderByPublishDate = 'asc';
      if (sortBy === 'year-desc') query.orderByPublishDate = 'desc';

      const result = await getAllBooks(query);
      setBooks(result.books);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load books');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page, search, condition, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1); // Reset to page 1 on new search
  };

  const handleClearFilters = () => {
    setSearch('');
    setSearchInput('');
    setCondition('');
    setSortBy('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-dark-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading books...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Failed to Load Books</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchBooks}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-blue">Books Catalog</h1>
          <p className="text-gray-600 mt-1">
            {total} {total === 1 ? 'book' : 'books'} available
          </p>
        </div>
        <Button onClick={() => navigate('/books/add')} size="lg">
          + Add New Book
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <Input
                type="text"
                placeholder="Search by title..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Button type="submit" fullWidth>
              🔍 Search
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Condition Filter */}
            <Select
              value={condition}
              onChange={(e) => {
                setCondition(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Conditions' },
                { value: 'NEW', label: 'New' },
                { value: 'LIKE_NEW', label: 'Like New' },
                { value: 'USED', label: 'Used' },
              ]}
            />

            {/* Sort */}
            <Select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'Default Sorting' },
                { value: 'title-asc', label: 'Title (A-Z)' },
                { value: 'title-desc', label: 'Title (Z-A)' },
                { value: 'year-asc', label: 'Year (Oldest)' },
                { value: 'year-desc', label: 'Year (Newest)' },
              ]}
            />

            {/* Clear Filters */}
            <Button
              type="button"
              variant="outline"
              onClick={handleClearFilters}
              fullWidth
            >
              Clear Filters
            </Button>
          </div>
        </form>
      </div>

      {/* Empty State */}
      {books.length === 0 ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Books Found</h3>
            <p className="text-gray-600 mb-4">
              {search || condition
                ? 'Try adjusting your filters'
                : 'Start by adding your first book'}
            </p>
            {!search && !condition && (
              <Button onClick={() => navigate('/books/add')}>Add Your First Book</Button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Previous
              </Button>
              
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  // Show first, last, current, and adjacent pages
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - page) <= 1
                  ) {
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? 'primary' : 'outline'}
                        onClick={() => setPage(pageNum)}
                        className="min-w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  } else if (pageNum === page - 2 || pageNum === page + 2) {
                    return <span key={pageNum} className="px-2">...</span>;
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
