import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../components/axiosInstance';

export default function AdminHome() {
  const user = useSelector((state) => state.auth.user);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [usersRes, ordersRes, walletRes] = await Promise.all([
        axiosInstance.get('/users'),
        axiosInstance.get('/transactions'),
        axiosInstance.get('/wallet'),
      ]);
      setStats({
        users: usersRes.data.users.length,
        orders: ordersRes.data.transactions.length,
        walletTxns: walletRes.data.transactions.length,
      });
    };
    load();
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <h1 className="font-display text-2xl font-semibold mb-2">Welcome, {user?.name}</h1>
      <p className="text-sm text-muted mb-8">SB Stocks admin overview</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-line bg-surface p-5">
          <p className="text-[11px] text-muted mb-1.5">Registered users</p>
          <p className="font-mono text-2xl font-semibold">{stats?.users ?? '—'}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5">
          <p className="text-[11px] text-muted mb-1.5">Stock orders placed</p>
          <p className="font-mono text-2xl font-semibold">{stats?.orders ?? '—'}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5">
          <p className="text-[11px] text-muted mb-1.5">Wallet transactions</p>
          <p className="font-mono text-2xl font-semibold">{stats?.walletTxns ?? '—'}</p>
        </div>
      </div>
    </div>
  );
}
