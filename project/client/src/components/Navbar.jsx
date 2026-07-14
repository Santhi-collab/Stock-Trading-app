import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Navbar() {
  const user = useSelector((state) => state.auth.user);

  return (
    <header className="flex items-center justify-between px-6 md:px-10 py-5">
      <Link to="/" className="flex items-center gap-2">
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="7" fill="#6C5CE7" />
          <path d="M8 22V14M16 22V8M24 22V17" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <span className="font-display font-semibold text-lg tracking-tight">SB Stocks</span>
      </Link>

      <nav className="flex items-center gap-3">
        {user ? (
          <Link
            to={user.role === 'admin' ? '/admin/home' : '/home'}
            className="rounded-lg bg-brand hover:bg-brand-light transition-colors px-4 py-2 text-sm font-medium focus-ring"
          >
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors focus-ring"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-brand hover:bg-brand-light transition-colors px-4 py-2 text-sm font-medium focus-ring"
            >
              Start trading
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
