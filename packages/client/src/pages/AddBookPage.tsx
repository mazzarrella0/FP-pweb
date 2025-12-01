import { MainLayout } from '../components/Layout/MainLayout';
import { AddBookForm } from '../features/books/components/AddBookForm';

export function AddBookPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <AddBookForm />
      </div>
    </MainLayout>
  );
}
