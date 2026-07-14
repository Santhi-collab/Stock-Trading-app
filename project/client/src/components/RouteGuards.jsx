import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppNavbar from './AppNavbar';

function LoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center bg-ink text-muted text-sm">
      Loading SB Stocks…
    </div>
  );
}

export function ProtectedLayout({ children }) {
  const { user, loading } = useSelector((state) => state.auth);
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-ink">
      <AppNavbar />
      <main>{children}</main>
    </div>
  );
}

export function AdminLayout({ children }) {
  const { user, loading } = useSelector((state) => state.auth);
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/home" replace />;

  return (
    <div className="min-h-screen bg-ink">
      <AppNavbar />
      <main>{children}</main>
    </div>
  );
}
