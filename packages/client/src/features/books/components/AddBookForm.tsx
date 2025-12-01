import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/Input/Input';
import { Select } from '../../../components/Select/Select';
import { Button } from '../../../components/Button/Button';
import { createBook } from '../api/booksApi';
import { getAllGenres } from '../api/genresApi';

interface Genre {
  id: string;
  name: string;
}

const CONDITION_OPTIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'USED', label: 'Used' }
];

export function AddBookForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    writer: '',
    publisher: '',
    publicationYear: '',
    description: '',
    coverImage: '',
    price: '',
    stockQuantity: '',
    genreId: '',
    condition: 'NEW'
  });
  
  // Image preview state for cover image for now is not used.
  // const [imagePreview, setImagePreview] = useState<string>('');

  // Validation errors
  const [errors, setErrors] = useState({
    title: '',
    writer: '',
    publisher: '',
    publicationYear: '',
    price: '',
    stockQuantity: '',
    genreId: '',
    coverImage: '',
  });

  // Fetch genres on component mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await getAllGenres();
        setGenres(data);
      } catch (err) {
        console.error('Failed to fetch genres:', err);
        setError('Failed to load genres. Please try again.');
      } finally {
        setLoadingGenres(false);
      }
    };

    fetchGenres();
  }, []);

  // Validate single field
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'title':
      case 'writer':
      case 'publisher':
        return value.trim() === '' ? 'This field is required' : '';

      case 'publicationYear': {
        if (value.trim() === '') return 'Publication year is required';
        // Check for letters or special characters (except digits)
        if (!/^\d+$/.test(value)) return 'Year must contain only numbers (no letters, no commas)';
        const year = parseInt(value);
        if (isNaN(year)) return 'Must be a valid number';
        if (year < 1000 || year > 9999) return 'Must be a valid 4-digit year';
        if (year > 2025) return 'Year cannot be more than 2025';
        return '';
      }

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

      case 'genreId':
        return value === '' ? 'Please select a genre' : '';

      case 'coverImage':
        if (value.trim() === '') return '';
        try {
          new URL(value); 
          return '';
        } catch (e) {
          return 'Must be a valid URL (e.g., https://example.com/image.png)';
        }

      default:
        return '';
    }
  };

  // Handle input change
  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    setError('');
  };

  // Handle blur for validation
  const handleBlur = (name: string) => {
    const value = formData[name as keyof typeof formData];
    // Only validate string fields
    if (typeof value === 'string') {
      const errorMessage = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: errorMessage }));
    }
  };

  // Handle file upload
  /* const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (PNG, JPG, etc.)');
        return;
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB');
        return;
      }
      setFormData(prev => ({ ...prev, coverImage: file }));
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  }; */

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors = {
      title: validateField('title', formData.title),
      writer: validateField('writer', formData.writer),
      publisher: validateField('publisher', formData.publisher),
      publicationYear: validateField('publicationYear', formData.publicationYear),
      price: validateField('price', formData.price),
      stockQuantity: validateField('stockQuantity', formData.stockQuantity),
      genreId: validateField('genreId', formData.genreId),
      coverImage: validateField('coverImage', formData.coverImage),
    };

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  // Handle form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!validateForm()) {
      setError('Please fix all errors before submitting');
      return;
    }

    setIsLoading(true);

    try {
      // Convert image to base64 if exists
      /* let coverImageData: string | null = null;
      if (formData.coverImage) {
        coverImageData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(formData.coverImage as File);
        });
      } */

      await createBook({
        title: formData.title.trim(),
        writer: formData.writer.trim(),
        publisher: formData.publisher.trim(),
        publicationYear: parseInt(formData.publicationYear),
        description: formData.description.trim() || null,
        coverImage: formData.coverImage.trim() || null,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        genreId: formData.genreId,
        condition: formData.condition as 'NEW' | 'LIKE_NEW' | 'USED'
      } as any);

      // Success! Navigate to books page
      navigate('/books');
    } catch (err: any) {
      console.error('Failed to create book:', err);
      setError(err.response?.data?.message || 'Failed to add book. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/books');
  };

  if (loadingGenres) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg text-medium-blue">Loading...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6 border border-sky-blue">
        <h2 className="text-2xl font-bold text-dark-blue mb-6">Add New Book</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Title */}
          <Input
            label="Title"
            type="text"
            placeholder="Enter book title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            onBlur={() => handleBlur('title')}
            error={errors.title}
            required
          />

          {/* Writer */}
          <Input
            label="Writer"
            type="text"
            placeholder="Enter writer name"
            value={formData.writer}
            onChange={(e) => handleChange('writer', e.target.value)}
            onBlur={() => handleBlur('writer')}
            error={errors.writer}
            required
          />

          {/* Publisher */}
          <Input
            label="Publisher"
            type="text"
            placeholder="Enter publisher name"
            value={formData.publisher}
            onChange={(e) => handleChange('publisher', e.target.value)}
            onBlur={() => handleBlur('publisher')}
            error={errors.publisher}
            required
          />

          {/* Publication Year */}
          <Input
            label="Publication Year"
            type="text"
            placeholder="e.g., 2024"
            value={formData.publicationYear}
            onChange={(e) => {
              // Only allow digits
              const value = e.target.value.replace(/\D/g, '');
              handleChange('publicationYear', value);
            }}
            onBlur={() => handleBlur('publicationYear')}
            error={errors.publicationYear}
            required
            maxLength={4}
          />

          {/* Genre */}
          <Select
            label="Genre"
            value={formData.genreId}
            onChange={(e) => handleChange('genreId', e.target.value)}
            onBlur={() => handleBlur('genreId')}
            options={[
              { value: '', label: 'Select a genre' },
              ...genres.map(genre => ({
                value: genre.id,
                label: genre.name
              }))
            ]}
            error={errors.genreId}
            required
          />

          {/* Condition */}
          <Select
            label="Condition"
            value={formData.condition}
            onChange={(e) => handleChange('condition', e.target.value)}
            options={CONDITION_OPTIONS}
            required
          />

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
              // Only allow digits (no decimals, no letters, no commas)
              const value = e.target.value.replace(/\D/g, '');
              handleChange('stockQuantity', value);
            }}
            onBlur={() => handleBlur('stockQuantity')}
            error={errors.stockQuantity}
            required
          />

          {/* Cover Image (Optional) */}
          <div>
            {/* <label className="block text-sm font-medium text-dark-blue mb-2">
              Cover Image <span className="text-gray-400 text-xs">(Optional - PNG, JPG, max 2MB)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-sky-blue roundelabeld-lg focus:outline-none focus:ring-2 focus:ring-medium-blue focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-sky-blue file:text-dark-blue hover:file:bg-medium-blue hover:file:text-white file:cursor-pointer"
            />
            {imagePreview && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <img 
                  src={imagePreview} 
                  alt="Cover preview" 
                  className="w-40 h-56 object-cover rounded-lg border-2 border-sky-blue"
                />
              </div>
            )} */}
            <Input
              label="Cover Image URL"
              type="text"
              placeholder="https://example.com/image.png"
              value={formData.coverImage}
              onChange={(e) => handleChange('coverImage', e.target.value)}
              onBlur={() => handleBlur('coverImage')}
              error={errors.coverImage}
              helperText="Optional - Paste a URL to an image"
            />
            {formData.coverImage && !errors.coverImage && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <img
                  src={formData.coverImage}
                  alt="Cover preview"
                  className="w-40 h-56 object-cover rounded-lg border-2 border-sky-blue"
                />
              </div>
            )}
          </div>

          {/* Description (Optional) */}
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
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-6">
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Adding Book...' : 'Add Book'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
