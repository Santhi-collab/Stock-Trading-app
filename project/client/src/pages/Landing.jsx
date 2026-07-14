import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Login from '../components/Login';
import Register from '../components/Register';

function Hero() {
  return (
    <section className="px-6 md:px-10 pt-10 md:pt-16 pb-20 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h1 className="font-display text-4xl md:text-5xl font-semibold leading-[1.08] tracking-tight">
          SB Stock Trading
        </h1>
        <p className="mt-5 text-slate-400 text-base leading-relaxed max-w-md">
          Experience seamless stock market trading with our user-friendly platform, offering
          real-time data, advanced analytics, and swift execution to empower traders and
          investors alike.
        </p>
      </div>

      <div className="w-full max-w-sm mx-auto">
        <h2 className="font-display text-2xl font-semibold mb-6 text-center">Login</h2>
        <Login />
      </div>
    </section>
  );
}

function AuthPanel({ mode }) {
  return (
    <section className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h2 className="font-display text-2xl font-semibold mb-6 text-center">
          {mode === 'login' ? 'Login' : 'Register'}
        </h2>
        {mode === 'login' ? <Login /> : <Register />}
      </div>
    </section>
  );
}

export default function Landing({ mode }) {
  const { user, loading } = useSelector((state) => state.auth);

  if (!loading && user && mode !== 'landing') {
    return <Navigate to={user.role === 'admin' ? '/admin/home' : '/home'} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {mode === 'landing' ? <Hero /> : <AuthPanel mode={mode} />}
    </div>
  );
}
