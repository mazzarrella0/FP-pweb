import { MainLayout } from '../components';
import { BooksList } from '../features/books/components/BooksList';

export const BooksPage = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BooksList />
      </div>
    </MainLayout>
  );
};
