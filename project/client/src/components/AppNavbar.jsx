import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutAction } from '../store/authSlice';

const USER_LINKS = [
  { to: '/home', label: 'Home' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/history', label: 'History' },
  { to: '/profile', label: 'Profile' },
];

const ADMIN_LINKS = [
  { to: '/admin/home', label: 'Home' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/transactions', label: 'Transactions' },
];

export default function AppNavbar() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const links = isAdmin ? ADMIN_LINKS : USER_LINKS;

  const onLogout = () => {
    dispatch(logoutAction());
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors focus-ring rounded px-1 ${
      isActive ? 'text-brand-light' : 'text-slate-300 hover:text-white'
    }`;

  return (
    <header className="border-b border-line bg-surface">
      <div className="flex items-center justify-between px-6 md:px-10 py-4">
        <div className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="7" fill="#6C5CE7" />
            <path d="M8 22V14M16 22V8M24 22V17" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="font-display font-semibold text-lg tracking-tight">
            SB Stocks{isAdmin ? <span className="text-muted font-normal"> (Admin)</span> : null}
          </span>
        </div>

        <nav className="flex items-center gap-6">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end>
              {l.label}
            </NavLink>
          ))}
          <button
            onClick={onLogout}
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors focus-ring"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
