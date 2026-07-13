import { useEffect, useState } from 'react';
import axiosInstance from '../components/axiosInstance';

export default function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [nameMap, setNameMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [ordersRes, stocksRes] = await Promise.all([
        axiosInstance.get('/transactions'),
        axiosInstance.get('/stocks'),
      ]);
      setOrders(ordersRes.data.transactions);
      setNameMap(Object.fromEntries(stocksRes.data.stocks.map((s) => [s.symbol, s.name])));
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <h1 className="font-display text-2xl font-semibold mb-6">My Orders</h1>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted">No orders have been placed on the platform yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div
              key={o._id}
              className="rounded-xl border border-line bg-surface p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6"
            >
              <span className="inline-block w-fit rounded-md bg-surface2 px-2.5 py-1 text-xs font-semibold text-brand-light">
                Intraday
              </span>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-7 gap-3 text-sm">
                <div>
                  <p className="text-[11px] text-muted">UserId</p>
                  <p className="font-mono text-xs truncate">{o.user?._id || o.user}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted">Stock name</p>
                  <p className="font-medium">{nameMap[o.symbol] || o.symbol}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted">Symbol</p>
                  <p className="font-mono font-semibold">{o.symbol}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted">Order type</p>
                  <p className={`font-semibold ${o.type === 'BUY' ? 'text-gain' : 'text-loss'}`}>
                    {o.type === 'BUY' ? 'Buy' : 'Sell'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted">Stocks</p>
                  <p className="font-medium">{o.quantity}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted">Order price</p>
                  <p className="font-mono">${o.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted">Order total value</p>
                  <p className="font-mono font-semibold">${o.total.toLocaleString()}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-gain shrink-0">Completed</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
