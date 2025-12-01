import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card/Card';
import { Input } from '../components/Input/Input';
import { Button } from '../components/Button/Button';
import { transactionAPI } from '../services/api.service';
import type { ApiTransaction } from '@react-express-library/shared/src/types/transaction.types';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from "../components";

export const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await transactionAPI.getTransactions({
        page,
        limit: 5,
        search,
        orderById: sort,
      });
      setTransactions(res.transactions);
      setTotal(res.total);
    } catch {
      console.error('Gagal memuat data transaksi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, sort]);

  return (
      <MainLayout>
          <div className="max-w-5xl mx-auto p-6">
              <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-semibold">Riwayat Transaksi</h1>
                  <Button
                      variant="primary"
                      onClick={() => navigate("/checkout")}
                  >
                      + Checkout Baru
                  </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <Input
                      placeholder="Cari ID transaksi..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button variant="secondary" onClick={fetchTransactions}>
                      Cari
                  </Button>
                  <Button
                      variant="outline"
                      onClick={() => setSort(sort === "asc" ? "desc" : "asc")}
                  >
                      Urutkan ID: {sort.toUpperCase()}
                  </Button>
              </div>

              {loading ? (
                  <p className="text-center text-gray-500 mt-10">
                      Memuat data...
                  </p>
              ) : transactions.length === 0 ? (
                  <p className="text-center text-gray-500 mt-10">
                      Belum ada transaksi.
                  </p>
              ) : (
                  <div className="grid gap-4">
                      {transactions.map((t) => (
                          <Card
                              key={t.id}
                              hover
                              onClick={() => navigate(`/transactions/${t.id}`)}
                              className="p-4"
                          >
                              <div className="flex justify-between items-center">
                                  <div>
                                      <p className="text-sm text-gray-600">
                                          ID: {t.id}
                                      </p>
                                      <p className="font-medium text-gray-900">
                                          Total: Rp{" "}
                                          {t.totalPrice.toLocaleString()}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                          Buku: {t.totalAmount} |{" "}
                                          {new Date(
                                              t.createdAt
                                          ).toLocaleString()}
                                      </p>
                                  </div>
                                  <Button variant="secondary" size="sm">
                                      Detail
                                  </Button>
                              </div>
                          </Card>
                      ))}
                  </div>
              )}

              <div className="flex justify-between items-center mt-6">
                  <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                  >
                      ← Sebelumnya
                  </Button>
                  <p className="text-gray-600">Halaman {page}</p>
                  <Button
                      variant="outline"
                      disabled={page * 5 >= total}
                      onClick={() => setPage((p) => p + 1)}
                  >
                      Selanjutnya →
                  </Button>
              </div>
          </div>
      </MainLayout>
  );
};
