import React, { useState } from 'react';
import { Button } from '../components/Button/Button';
import { Card } from '../components/Card/Card';
import { Input } from '../components/Input/Input';
import { transactionAPI } from '../services/api.service';
import type { BookOrderItem, CreateTransactionInput } from '@react-express-library/shared/src/types/transaction.types';
import { MainLayout } from "../components";


export const Checkout: React.FC = () => {
  const [books, setBooks] = useState<BookOrderItem[]>([{ bookId: '', quantity: 1 }]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState('');

  const handleBookChange = (index: number, field: keyof BookOrderItem, value: string) => {
    const updated = [...books];
    updated[index] = { ...updated[index], [field]: field === 'quantity' ? Number(value) : value };
    setBooks(updated);
  };

  const addBookField = () => setBooks([...books, { bookId: '', quantity: 1 }]);
  const removeBookField = (index: number) => setBooks(books.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResponse(null);

    const valid = books.every((b) => b.bookId.trim() && b.quantity > 0);
    if (!valid) {
      setError('Pastikan setiap buku memiliki ID dan jumlah minimal 1.');
      setLoading(false);
      return;
    }

    try {
      const payload: CreateTransactionInput = { books };
      const res = await transactionAPI.createTransaction(payload);
      setResponse(res);
      setBooks([{ bookId: '', quantity: 1 }]);
    } catch {
      setError('Gagal membuat transaksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-6">
          <h1 className="text-xl font-semibold mb-4">Checkout Buku</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {books.map((book, index) => (
              <div key={index} className="flex items-end gap-3">
                <div className="flex-1">
                  <Input
                    label={`Book ID #${index + 1}`}
                    placeholder="Masukkan ID buku"
                    value={book.bookId}
                    onChange={(e) => handleBookChange(index, 'bookId', e.target.value)}
                    required
                  />
                </div>
                <div className="w-32">
                  <Input
                    label="Qty"
                    type="number"
                    min="1"
                    value={book.quantity}
                    onChange={(e) => handleBookChange(index, 'quantity', e.target.value)}
                    required
                  />
                </div>
                {books.length > 1 && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeBookField(index)}
                  >
                    Hapus
                  </Button>
                )}
              </div>
            ))}

            <div className="flex justify-between items-center">
              <Button type="button" variant="secondary" onClick={addBookField}>
                + Tambah Buku
              </Button>
              <Button type="submit" variant="primary" isLoading={loading}>
                Checkout
              </Button>
            </div>
          </form>

          {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
          {response && (
            <Card className="mt-6 bg-blue-50 border-blue-200 p-4">
              <h2 className="font-semibold text-lg mb-2">Transaksi Berhasil!</h2>
              <p>ID Transaksi: {response.transaction_id}</p>
              <p>Total Buku: {response.total_quantity}</p>
              <p>Total Harga: Rp {response.total_price.toLocaleString()}</p>
            </Card>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};
