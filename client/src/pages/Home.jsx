import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../components/axiosInstance';

export default function Home() {
  const [stocks, setStocks] = useState([]);
  const [watchlist, setWatchlist] = useState([]); // array of stock objects the user has saved
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const [pendingSymbol, setPendingSymbol] = useState(null);

  const loadStocks = async (q = '') => {
    try {
      const { data } = await axiosInstance.get('/stocks', { params: q ? { search: q } : {} });
      setStocks(data.stocks);
    } finally {
      setLoading(false);
    }
  };

  const loadWatchlist = async () => {
    try {
      const { data } = await axiosInstance.get('/watchlist');
      setWatchlist(data.stocks);
    } finally {
      setWatchlistLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();
    loadWatchlist();
    const interval = setInterval(() => {
      loadStocks(search);
      loadWatchlist();
    }, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    loadStocks(value);
  };

  const watchlistSymbols = useMemo(() => new Set(watchlist.map((w) => w.symbol)), [watchlist]);

  const onAddToWatchlist = async (symbol) => {
    setPendingSymbol(symbol);
    try {
      await axiosInstance.post('/watchlist', { symbol });
      toast.success(`${symbol} added to your watchlist`);
      loadWatchlist();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to watchlist');
    } finally {
      setPendingSymbol(null);
    }
  };

  const onRemoveFromWatchlist = async (symbol) => {
    setPendingSymbol(symbol);
    try {
      await axiosInstance.delete(`/watchlist/${symbol}`);
      toast.success(`${symbol} removed from your watchlist`);
      loadWatchlist();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove from watchlist');
    } finally {
      setPendingSymbol(null);
    }
  };

  // "Trending" = the biggest movers (up or down) among listed stocks
  const trending = useMemo(() => {
    return [...stocks]
      .sort((a, b) => Math.abs(b.changePct || 0) - Math.abs(a.changePct || 0))
      .slice(0, 6);
  }, [stocks]);

  return (
    <div className="px-6 md:px-10 py-8 max-w-6xl mx-auto grid md:grid-cols-[280px_1fr] gap-8">
      {/* Trending stocks */}
      <aside>
        <h2 className="font-display text-xl font-semibold mb-4">Trending stocks</h2>
        <div className="space-y-3">
          {loading && trending.length === 0 ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : (
            trending.map((s) => {
              const positive = s.changePct >= 0;
              return (
                <Link
                  key={s.symbol}
                  to={`/stocks/${s.symbol}`}
                  className="block rounded-xl border border-line bg-surface p-4 hover:border-brand/50 transition-colors"
                >
                  <div className="text-sm">
                    <p className="text-[11px] text-muted">Stock name</p>
                    <p className="font-medium">{s.name}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <div>
                      <p className="text-[11px] text-muted">Symbol</p>
                      <p className="font-mono font-semibold">{s.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-muted">Price</p>
                      <p className={`font-mono font-semibold ${positive ? 'text-gain' : 'text-loss'}`}>
                        ${s.price?.toFixed(2)} ({positive ? '+' : ''}
                        {s.changePct?.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </aside>

      <section>
        {/* My Watchlist — the user's saved list */}
        <div className="mb-10">
          <h1 className="font-display text-2xl font-semibold mb-5">My Watchlist</h1>

          {watchlistLoading ? (
            <p className="text-sm text-muted">Loading your watchlist…</p>
          ) : watchlist.length === 0 ? (
            <p className="text-sm text-muted">
              You haven't added any stocks yet — search below and tap “+ Watchlist” to save one.
            </p>
          ) : (
            <div className="space-y-3">
              {watchlist.map((s) => {
                const positive = s.changePct >= 0;
                return (
                  <div
                    key={s.symbol}
                    className="rounded-xl border border-line bg-surface p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6"
                  >
                    <span className="inline-block w-fit rounded-md bg-surface2 px-2.5 py-1 text-xs font-semibold text-brand-light">
                      {s.exchange}
                    </span>
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-[11px] text-muted">Stock name</p>
                        <p className="font-medium">{s.name}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted">Symbol</p>
                        <p className="font-mono font-semibold">{s.symbol}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted">Price</p>
                        <p className={`font-mono font-semibold ${positive ? 'text-gain' : 'text-loss'}`}>
                          ${s.price?.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted">Change</p>
                        <p className={`font-mono ${positive ? 'text-gain' : 'text-loss'}`}>
                          {positive ? '▲' : '▼'} {Math.abs(s.changePct).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link
                        to={`/stocks/${s.symbol}`}
                        className="rounded-lg bg-brand hover:bg-brand-light transition-colors px-4 py-2 text-sm font-semibold text-center focus-ring"
                      >
                        View Chart
                      </Link>
                      <button
                        onClick={() => onRemoveFromWatchlist(s.symbol)}
                        disabled={pendingSymbol === s.symbol}
                        className="rounded-lg border border-line hover:border-loss/60 hover:text-loss transition-colors px-3 py-2 text-sm font-medium disabled:opacity-50 focus-ring"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Search & add to watchlist */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <h2 className="font-display text-lg font-semibold">Add to watchlist</h2>
            <input
              value={search}
              onChange={onSearchChange}
              placeholder="Enter Stock Symbol…."
              className="w-full sm:w-72 rounded-lg bg-surface2 border border-line px-4 py-2.5 text-sm focus-ring outline-none placeholder:text-slate-600"
            />
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted">Loading listings…</p>
            ) : stocks.length === 0 ? (
              <p className="text-sm text-muted">No stocks match your search.</p>
            ) : (
              stocks.map((s) => {
                const alreadySaved = watchlistSymbols.has(s.symbol);
                return (
                  <div
                    key={s.symbol}
                    className="rounded-xl border border-line bg-surface p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6"
                  >
                    <span className="inline-block w-fit rounded-md bg-surface2 px-2.5 py-1 text-xs font-semibold text-brand-light">
                      {s.exchange}
                    </span>
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-[11px] text-muted">Stock name</p>
                        <p className="font-medium">{s.name}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted">Symbol</p>
                        <p className="font-mono font-semibold">{s.symbol}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted">Stock Type</p>
                        <p className="font-medium">{s.type || 'Common Stock'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link
                        to={`/stocks/${s.symbol}`}
                        className="rounded-lg bg-surface2 border border-line hover:border-brand/50 transition-colors px-4 py-2 text-sm font-semibold text-center focus-ring"
                      >
                        View Chart
                      </Link>
                      <button
                        onClick={() => (alreadySaved ? onRemoveFromWatchlist(s.symbol) : onAddToWatchlist(s.symbol))}
                        disabled={pendingSymbol === s.symbol}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 focus-ring ${
                          alreadySaved
                            ? 'bg-gain/15 text-gain hover:bg-gain/25'
                            : 'bg-brand hover:bg-brand-light text-white'
                        }`}
                      >
                        {alreadySaved ? '✓ Added' : '+ Watchlist'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
