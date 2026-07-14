import { useEffect, useState } from 'react';
import axiosInstance from '../components/axiosInstance';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/users').then(({ data }) => {
      setUsers(data.users);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <h1 className="font-display text-2xl font-semibold mb-6">All users</h1>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u._id} className="rounded-xl border border-line bg-surface p-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <div>
                <span className="text-muted">User id </span>
                <span className="font-mono text-brand-light">{u._id}</span>
              </div>
              <div>
                <span className="text-muted">Username </span>
                <span className="font-medium text-brand-light">{u.name}</span>
              </div>
              <div>
                <span className="text-muted">Email </span>
                <span className="text-brand-light">{u.email}</span>
              </div>
              <div>
                <span className="text-muted">Balance </span>
                <span className="font-mono text-brand-light">{u.balance.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
