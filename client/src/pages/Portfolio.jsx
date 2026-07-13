import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../components/axiosInstance';

export default function Portfolio() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await axiosInstance.get('/orders/portfolio');
    setData(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-10 text-sm text-muted">Loading your portfolio…</div>;

  const { holdings } = data;
  const filtered = search
    ? holdings.filter((h) => h.symbol.toLowerCase().includes(search.toLowerCase()))
    : holdings;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-semibold">My Portfolio</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Enter Stock Symbol…."
          className="w-full sm:w-72 rounded-lg bg-surface2 border border-line px-4 py-2.5 text-sm focus-ring outline-none placeholder:text-slate-600"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-line bg-surface p-8 text-center">
          <p className="text-sm text-muted mb-3">You don't own any stocks yet.</p>
          <Link to="/home" className="text-sm text-brand-light hover:underline focus-ring">
            Browse the watchlist →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((h) => {
            const positive = h.unrealizedPnL >= 0;
            return (
              <div
                key={h.symbol}
                className="rounded-xl border border-line bg-surface p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6"
              >
                <span className="inline-block w-fit rounded-md bg-surface2 px-2.5 py-1 text-xs font-semibold text-brand-light">
                  NASDAQ
                </span>
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                  <div>
                    <p className="text-[11px] text-muted">Symbol</p>
                    <p className="font-mono font-semibold">{h.symbol}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted">Stocks</p>
                    <p className="font-medium">{h.quantity}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted">Stock price</p>
                    <p className="font-mono">${h.currentPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted">Total value</p>
                    <p className="font-mono font-semibold">${h.currentValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted">P&amp;L</p>
                    <p className={`font-mono font-semibold ${positive ? 'text-gain' : 'text-loss'}`}>
                      {positive ? '+' : ''}
                      ${h.unrealizedPnL.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/stocks/${h.symbol}`}
                  className="rounded-lg bg-brand hover:bg-brand-light transition-colors px-4 py-2 text-sm font-semibold text-center focus-ring"
                >
                  View Chart
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
