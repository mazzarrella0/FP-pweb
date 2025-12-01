import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components';
import type { ApiBook } from '@react-express-library/shared';

interface BookCardProps {
  book: ApiBook;
}

const conditionColors = {
  NEW: 'bg-green-100 text-green-800',
  LIKE_NEW: 'bg-blue-100 text-blue-800',
  USED: 'bg-yellow-100 text-yellow-800',
};

const conditionLabels = {
  NEW: 'New',
  LIKE_NEW: 'Like New',
  USED: 'Used',
};

export const BookCard = ({ book }: BookCardProps) => {
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card hover onClick={() => navigate(`/books/${book.id}`)}>
      {/* Cover Image */}
      <div className="relative h-64 overflow-hidden bg-linear-to-br from-medium-blue to-dark-blue">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-24 h-24 text-white opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        )}
        {/* Condition Badge - Overlay on Image */}
        <span
          className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold shadow-md ${
            conditionColors[book.condition]
          }`}
        >
          {conditionLabels[book.condition]}
        </span>
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-dark-blue line-clamp-2">
            {book.title}
          </h3>
        </div>

        {/* Author & Publisher */}
        <div className="space-y-1 mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Author:</span> {book.writer}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Publisher:</span> {book.publisher}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Year:</span> {book.publicationYear}
          </p>
        </div>

        {/* Genre Badge */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-sky-blue text-white text-xs font-medium rounded-full">
            {book.genre}
          </span>
        </div>

        {/* Price & Stock */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div>
            <p className="text-2xl font-bold text-dark-blue">{formatPrice(book.price)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Stock</p>
            <p
              className={`text-lg font-bold ${
                book.stockQuantity > 10
                  ? 'text-green-600'
                  : book.stockQuantity > 0
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {book.stockQuantity}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
