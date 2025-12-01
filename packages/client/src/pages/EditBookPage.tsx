import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/Layout/MainLayout';
import { Input } from '../components/Input/Input';
import { Button } from '../components/Button/Button';
import { getBookById, updateBook } from '../features/books/api/booksApi';
import type { ApiBook } from '@react-express-library/shared';

export function EditBookPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<ApiBook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state (only editable fields)
  const [formData, setFormData] = useState({
    description: '',
    price: '',
    stockQuantity: ''
  });

  const [errors, setErrors] = useState({
    price: '',
    stockQuantity: ''
  });

  // Fetch book data
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
        setFormData({
          description: data.description || '',
          price: data.price.toString(),
          stockQuantity: data.stockQuantity.toString()
        });
      } catch (err: any) {
        console.error('Failed to fetch book:', err);
        setError(err.response?.data?.message || 'Failed to load book details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  // Validate single field
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'price': {
        if (value.trim() === '') return 'Price is required';
        // Check for non-digit characters (letters, commas, decimals)
        if (!/^\d+$/.test(value)) return 'Price must contain only whole numbers (no commas, no decimals)';
        const price = parseInt(value);
        if (isNaN(price)) return 'Must be a valid number';
        if (price < 1) return 'Price must be at least Rp 1';
        return '';
      }

      case 'stockQuantity': {
        if (value.trim() === '') return 'Stock quantity is required';
        // Check for decimal point, commas, or letters
        if (!/^\d+$/.test(value)) return 'Stock must contain only whole numbers (no decimals, no commas, no letters)';
        const stock = parseInt(value);
        if (isNaN(stock)) return 'Must be a valid number';
        if (stock < 0) return 'Stock cannot be negative';
        return '';
      }

      default:
        return '';
    }
  };

  // Handle input change
  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    setError('');
  };

  // Handle blur for validation
  const handleBlur = (name: string) => {
    const value = formData[name as keyof typeof formData];
    const errorMessage = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: errorMessage }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors = {
      price: validateField('price', formData.price),
      stockQuantity: validateField('stockQuantity', formData.stockQuantity)
    };

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  // Handle form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      setError('Please fix all errors before submitting');
      return;
    }

    if (!id) {
      setError('Book ID not found');
      return;
    }

    setIsSaving(true);

    try {
      await updateBook(id, {
        description: formData.description.trim() || null,
        price: parseInt(formData.price),
        stockQuantity: parseInt(formData.stockQuantity)
      });

      // Success! Navigate back to detail page
      navigate(`/books/${id}`);
    } catch (err: any) {
      console.error('Failed to update book:', err);
      setError(err.response?.data?.message || 'Failed to update book. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(`/books/${id}`);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-lg text-medium-blue">Loading...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error && !book) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Book Not Found</h3>
              <p className="text-gray-600 mb-4">{error}</p>
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
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-sky-blue">
            <h2 className="text-2xl font-bold text-dark-blue mb-6">Edit Book</h2>

            {/* Book Title (Read-only) */}
            <div className="mb-6 p-4 bg-cream rounded-lg border border-sky-blue">
              <h3 className="text-lg font-bold text-dark-blue">{book?.title}</h3>
              <p className="text-sm text-gray-600 mt-1">
                by {book?.writer} • {book?.publisher} ({book?.publicationYear})
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-dark-blue mb-2">
                  Description <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Enter book description"
                  rows={4}
                  className="w-full px-4 py-2 border border-sky-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-medium-blue focus:border-transparent resize-none"
                />
              </div>

              {/* Price */}
              <Input
                label="Price (Rp)"
                type="text"
                placeholder="e.g., 50000"
                value={formData.price}
                onChange={(e) => {
                  // Only allow digits (no commas, no decimals)
                  const value = e.target.value.replace(/\D/g, '');
                  handleChange('price', value);
                }}
                onBlur={() => handleBlur('price')}
                error={errors.price}
                required
              />

              {/* Stock Quantity */}
              <Input
                label="Stock Quantity"
                type="text"
                placeholder="e.g., 10"
                value={formData.stockQuantity}
                onChange={(e) => {
                  // Only allow digits
                  const value = e.target.value.replace(/\D/g, '');
                  handleChange('stockQuantity', value);
                }}
                onBlur={() => handleBlur('stockQuantity')}
                error={errors.stockQuantity}
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-6">
              <Button
                type="submit"
                variant="primary"
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? 'Saving Changes...' : '💾 Save Changes'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={isSaving}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
