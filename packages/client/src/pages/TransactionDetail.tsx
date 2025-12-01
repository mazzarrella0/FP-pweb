import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/Card/Card';
import { Button } from '../components/Button/Button';
import { transactionAPI } from '../services/api.service';
import type { ApiTransactionDetail } from '@react-express-library/shared/src/types/transaction.types';

export const TransactionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<ApiTransactionDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await transactionAPI.getTransactionById(id!);
      setTransaction(res);
    } catch {
      console.error('Gagal memuat detail transaksi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading)
    return <p className="text-center text-gray-500 mt-10">Memuat detail transaksi...</p>;

  if (!transaction)
    return <p className="text-center text-gray-500 mt-10">Transaksi tidak ditemukan.</p>;

  return (
      <div className="max-w-3xl mx-auto p-6">
        <Card className="p-6">
          <h1 className="text-2xl font-semibold mb-2">Detail Transaksi</h1>
          <p className="text-gray-600 mb-4">ID: {transaction.id}</p>

          <div className="mb-4">
            <h2 className="font-semibold mb-2">Data Pengguna</h2>
            <p>{transaction.user.username} ({transaction.user.email})</p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Daftar Buku</h2>
            {transaction.books.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between border-b border-gray-200 py-2"
              >
                <div>
                  <p className="font-medium">{item.book.title}</p>
                  <p className="text-sm text-gray-500">
                    {item.book.writer} — Rp {item.book.price.toLocaleString()}
                  </p>
                </div>
                <p className="font-semibold">x{item.quantity}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t pt-4">
            <p>Total Buku: {transaction.totalAmount}</p>
            <p className="font-semibold text-lg">
              Total Harga: Rp {transaction.totalPrice.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Dibuat: {new Date(transaction.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="mt-6">
            <Button variant="secondary" onClick={() => history.back()}>
              ← Kembali
            </Button>
          </div>
        </Card>
      </div>
  );
};
