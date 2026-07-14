import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../components/axiosInstance';
import CandleChart from '../components/CandleChart';
import { useDispatch, useSelector } from 'react-redux';
import { refreshUser } from '../store/authSlice';

export default function StockChart() {
  const { symbol } = useParams();
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [detail, setDetail] = useState(null);
  const [holdingQty, setHoldingQty] = useState(0);
  const [mode, setMode] = useState('BUY'); // BUY | SELL
  const [quantity, setQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const { data } = await axiosInstance.get(`/stocks/${symbol}`);
    setDetail(data);
  };

  const loadHolding = async () => {
    try {
      const { data } = await axiosInstance.get('/orders/portfolio');
      const h = data.holdings.find((x) => x.symbol === symbol.toUpperCase());
      setHoldingQty(h?.quantity || 0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    load();
    loadHolding();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  if (!detail) {
    return <div className="p-10 text-sm text-muted">Loading {symbol}…</div>;
  }

  const { stock, quote, history } = detail;
  const positive = quote.changePct >= 0;
  const qty = Number(quantity) || 0;
  const total = +(qty * quote.price).toFixed(2);

  const onTrade = async (e) => {
    e.preventDefault();
    if (!qty || qty <= 0) {
      toast.error('Enter a quantity greater than zero');
      return;
    }
    setSubmitting(true);
    try {
      const endpoint = mode === 'BUY' ? '/transactions/buy' : '/transactions/sell';
      await axiosInstance.post(endpoint, { symbol: stock.symbol, quantity: qty });
      toast.success(`${mode === 'BUY' ? 'Bought' : 'Sold'} ${qty} ${stock.symbol} @ $${quote.price.toFixed(2)}`);
      setQuantity('');
      dispatch(refreshUser());
      loadHolding();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <Link to="/home" className="text-xs text-muted hover:text-white transition-colors focus-ring">
        ← Back to markets
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-4 mb-6">
        <div>
          <p className="font-mono text-sm font-semibold text-slate-300">
            {stock.symbol} <span className="text-muted font-normal">{stock.exchange}</span>
          </p>
          <h1 className="font-display text-2xl font-semibold">{stock.name}</h1>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-semibold">${quote.price.toFixed(2)}</p>
          <p className={`font-mono text-sm ${positive ? 'text-gain' : 'text-loss'}`}>
            {positive ? '▲' : '▼'} {Math.abs(quote.changePct).toFixed(2)}% today
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="rounded-xl border border-line bg-surface p-4">
          <CandleChart candles={history} height={380} />
        </div>

        <div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setMode('BUY')}
              className={`rounded-lg py-3 text-sm font-semibold transition-colors focus-ring ${
                mode === 'BUY' ? 'bg-brand text-white' : 'bg-surface2 text-slate-300 border border-line'
              }`}
            >
              Buy @ ${quote.price.toFixed(2)}
            </button>
            <button
              onClick={() => setMode('SELL')}
              className={`rounded-lg py-3 text-sm font-semibold transition-colors focus-ring ${
                mode === 'SELL' ? 'bg-brand text-white' : 'bg-surface2 text-slate-300 border border-line'
              }`}
            >
              Sell @ ${quote.price.toFixed(2)}
            </button>
          </div>

          <form onSubmit={onTrade} className="rounded-xl border border-line bg-surface p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Product type</label>
              <select
                disabled
                value="Intraday"
                className="w-full rounded-lg bg-surface2 border border-line px-3.5 py-2.5 text-sm outline-none appearance-none"
              >
                <option>Intraday</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Quantity {mode === 'SELL' && holdingQty ? `(you own ${holdingQty})` : ''}
              </label>
              <input
                type="number"
                min="1"
                step="1"
                max={mode === 'SELL' ? holdingQty : undefined}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg bg-surface2 border border-line px-3.5 py-2.5 text-sm font-mono focus-ring outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Total price</label>
              <div className="w-full rounded-lg bg-surface2 border border-line px-3.5 py-2.5 text-sm font-mono text-slate-300">
                ${total.toLocaleString()}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || (mode === 'SELL' && holdingQty === 0)}
              className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-colors disabled:opacity-40 focus-ring ${
                mode === 'BUY' ? 'bg-gain hover:bg-gain/90 text-black' : 'bg-loss hover:bg-loss/90 text-white'
              }`}
            >
              {submitting ? 'Placing order…' : mode === 'BUY' ? 'Buy now' : 'Sell now'}
            </button>

            <p className="text-[11px] text-muted text-center">
              Virtual cash available: <span className="font-mono">${user?.balance?.toLocaleString()}</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
