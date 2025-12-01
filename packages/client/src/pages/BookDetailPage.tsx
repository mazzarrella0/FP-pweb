import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/Layout/MainLayout';
import { Button } from '../components/Button/Button';
import { getBookById, deleteBook } from '../features/books/api/booksApi';
import type { ApiBook } from '@react-express-library/shared';

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<ApiBook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) {
        setError('Book ID not found');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getBookById(id);
        setBook(data);
      } catch (err: any) {
        console.error('Failed to fetch book:', err);
        setError(err.response?.data?.message || 'Failed to load book details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const getConditionBadge = (condition: string) => {
    const badges = {
      NEW: 'bg-green-100 text-green-800',
      LIKE_NEW: 'bg-blue-100 text-blue-800',
      USED: 'bg-gray-100 text-gray-800'
    };
    return badges[condition as keyof typeof badges] || badges.USED;
  };

  const getStockColor = (stock: number) => {
    if (stock > 10) return 'text-green-600';
    if (stock > 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-lg text-medium-blue">Loading book details...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !book) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Book Not Found</h3>
              <p className="text-gray-600 mb-4">{error || 'The book you are looking for does not exist.'}</p>
              <Button onClick={() => navigate('/books')}>Back to Books</Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/books')}>
            ← Back to Books
          </Button>
        </div>

        {/* Book Detail Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {/* Left: Cover Image */}
            <div className="md:col-span-1">
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-auto max-h-[500px] object-contain rounded-lg border-2 border-sky-blue shadow-md"
                />
              ) : (
                <div className="w-full h-[400px] bg-linear-to-br from-sky-blue to-medium-blue rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <svg
                      className="w-24 h-24 mx-auto mb-4 opacity-50"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    <p className="text-lg font-semibold">No Cover Image</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Book Information */}
            <div className="md:col-span-2 space-y-6">
              {/* Title & Condition Badge */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl font-bold text-dark-blue flex-1">{book.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getConditionBadge(book.condition)}`}>
                    {book.condition.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Author & Publisher */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-gray-600 font-medium w-40">Author:</span>
                  <span className="text-gray-800 font-semibold">{book.writer}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 font-medium w-40">Publisher:</span>
                  <span className="text-gray-800">{book.publisher}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 font-medium w-40">Publication Year:</span>
                  <span className="text-gray-800">{book.publicationYear}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 font-medium w-40">Genre:</span>
                  <span className="px-3 py-1 bg-sky-blue text-dark-blue rounded-full text-sm font-medium">
                    {book.genre}
                  </span>
                </div>
              </div>

              {/* Description */}
              {book.description && (
                <div>
                  <h3 className="text-lg font-semibold text-dark-blue mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{book.description}</p>
                </div>
              )}

              {/* Price & Stock */}
              <div className="bg-cream rounded-lg p-4 border-2 border-sky-blue">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Price</p>
                    <p className="text-2xl font-bold text-dark-blue">{formatPrice(book.price)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Stock</p>
                    <p className={`text-2xl font-bold ${getStockColor(book.stockQuantity)}`}>
                      {book.stockQuantity} {book.stockQuantity === 1 ? 'copy' : 'copies'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  variant="primary"
                  onClick={() => navigate(`/books/${id}/edit`)}
                  className="flex-1"
                >
                  ✏️ Edit Book
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex-1"
                >
                  🗑️ Delete Book
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-dark-blue mb-4">
                Confirm Delete
              </h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete "<strong>{book?.title}</strong>"? 
                This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="danger"
                  onClick={async () => {
                    if (!id) return;
                    setIsDeleting(true);
                    try {
                      await deleteBook(id);
                      navigate('/books');
                    } catch (err: any) {
                      console.error('Failed to delete book:', err);
                      alert(err.response?.data?.message || 'Failed to delete book');
                      setShowDeleteConfirm(false);
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
