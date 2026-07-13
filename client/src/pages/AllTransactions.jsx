import { useEffect, useState } from 'react';
import axiosInstance from '../components/axiosInstance';

export default function AllTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/wallet').then(({ data }) => {
      setTransactions(data.transactions);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <h1 className="font-display text-2xl font-semibold mb-6">All transactions</h1>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : transactions.length === 0 ? (
        <p className="text-sm text-muted">No wallet activity across any account yet.</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((t) => (
            <div
              key={t._id}
              className="rounded-xl border border-line bg-surface p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm"
            >
              <div>
                <p className="text-[11px] text-muted">User</p>
                <p className="font-medium">{t.user?.name || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted">Amount</p>
                <p className="font-mono font-semibold">${t.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted">Action</p>
                <p className={`font-medium ${t.action === 'DEPOSIT' ? 'text-gain' : 'text-loss'}`}>
                  {t.action === 'DEPOSIT' ? 'Deposit' : 'Withdraw'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted">Payment mode</p>
                <p className="font-medium">{t.paymentMode}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted">Time</p>
                <p className="text-muted">{new Date(t.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
