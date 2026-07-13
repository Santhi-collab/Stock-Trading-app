import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from './axiosInstance';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', userType: 'Trader' });
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await axiosInstance.post('/users/register', form);
      dispatch(setCredentials({ token: data.token, user: data.user }));
      toast.success('Account created — welcome to SB Stocks');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">Username</label>
        <input
          type="text"
          name="name"
          required
          value={form.name}
          onChange={onChange}
          placeholder="Priya Sharma"
          className="w-full rounded-lg bg-surface2 border border-line px-3.5 py-2.5 text-sm focus-ring outline-none placeholder:text-slate-600"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">Email address</label>
        <input
          type="email"
          name="email"
          required
          value={form.email}
          onChange={onChange}
          placeholder="you@example.com"
          className="w-full rounded-lg bg-surface2 border border-line px-3.5 py-2.5 text-sm focus-ring outline-none placeholder:text-slate-600"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">Password</label>
        <input
          type="password"
          name="password"
          required
          value={form.password}
          onChange={onChange}
          placeholder="••••••••"
          className="w-full rounded-lg bg-surface2 border border-line px-3.5 py-2.5 text-sm focus-ring outline-none placeholder:text-slate-600"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">User type</label>
        <select
          name="userType"
          value={form.userType}
          onChange={onChange}
          className="w-full rounded-lg bg-surface2 border border-line px-3.5 py-2.5 text-sm focus-ring outline-none"
        >
          <option value="Trader">Trader</option>
          <option value="Investor">Investor</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-brand hover:bg-brand-light transition-colors py-2.5 text-sm font-medium disabled:opacity-60 focus-ring"
      >
        {submitting ? 'Signing up…' : `Sign up — start with $${(100000).toLocaleString()}`}
      </button>
      <p className="text-xs text-muted text-center">
        Already registered?{' '}
        <Link to="/login" className="text-brand-light hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}
