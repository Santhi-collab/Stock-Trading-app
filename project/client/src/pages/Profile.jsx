import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../components/axiosInstance';
import { useDispatch, useSelector } from 'react-redux';
import { refreshUser } from '../store/authSlice';

const PAYMENT_MODES = ['UPI', 'IMPS', 'NEFT', 'Net Banking', 'Card'];

function WalletActionForm({ action, onClose, onDone }) {
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [submitting, setSubmitting] = useState(false);

  const isDeposit = action === 'DEPOSIT';

  const onSubmit = async (e) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setSubmitting(true);
    try {
      const endpoint = isDeposit ? '/wallet/deposit' : '/wallet/withdraw';
      await axiosInstance.post(endpoint, { amount: amt, paymentMode });
      toast.success(isDeposit ? 'Funds added' : 'Withdrawal completed');
      onDone();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl bg-surface border border-line p-6 space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="font-display text-xl font-semibold">{isDeposit ? 'Add Funds' : 'Withdraw'}</h3>
          <button type="button" onClick={onClose} className="text-muted hover:text-white text-lg leading-none focus-ring">
            ×
          </button>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">Amount</label>
          <input
            type="number"
            min="1"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg bg-surface2 border border-line px-3.5 py-2.5 text-sm font-mono focus-ring outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">Payment mode</label>
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            className="w-full rounded-lg bg-surface2 border border-line px-3.5 py-2.5 text-sm focus-ring outline-none"
          >
            {PAYMENT_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-brand hover:bg-brand-light transition-colors py-2.5 text-sm font-medium disabled:opacity-60 focus-ring"
        >
          {submitting ? 'Processing…' : isDeposit ? 'Add Funds' : 'Withdraw'}
        </button>
      </form>
    </div>
  );
}

export default function Profile() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAction, setModalAction] = useState(null); // 'DEPOSIT' | 'WITHDRAW' | null

  const loadWallet = async () => {
    const { data } = await axiosInstance.get('/wallet/me');
    setTransactions(data.transactions);
    setLoading(false);
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const onWalletActionDone = () => {
    dispatch(refreshUser());
    loadWallet();
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <h1 className="font-display text-2xl font-semibold mb-6">My Account</h1>

      <div className="rounded-xl border border-line bg-surface p-6 mb-8">
        <p className="text-sm text-muted mb-4">{user?.name}</p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[11px] text-muted mb-1">Trading balance</p>
            <p className="font-mono text-3xl font-semibold">${user?.balance?.toLocaleString()}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setModalAction('DEPOSIT')}
              className="rounded-lg border border-line hover:border-brand/50 transition-colors px-4 py-2 text-sm font-medium focus-ring"
            >
              + Add Funds
            </button>
            <button
              onClick={() => setModalAction('WITHDRAW')}
              className="rounded-lg border border-line hover:border-brand/50 transition-colors px-4 py-2 text-sm font-medium focus-ring"
            >
              ↓ Withdraw
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-line text-sm">
          <div>
            <p className="text-[11px] text-muted mb-1">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted mb-1">Account type</p>
            <p className="font-medium">{user?.userType || 'Trader'}</p>
          </div>
        </div>
      </div>

      <h2 className="font-display text-lg font-semibold mb-4">Transactions</h2>
      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : transactions.length === 0 ? (
        <p className="text-sm text-muted">No wallet activity yet — add funds to get started.</p>
      ) : (
        <div className="space-y-2">
          {transactions.map((t) => (
            <div
              key={t._id}
              className="rounded-lg border border-line bg-surface px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm"
            >
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

      {modalAction && (
        <WalletActionForm action={modalAction} onClose={() => setModalAction(null)} onDone={onWalletActionDone} />
      )}
    </div>
  );
}
