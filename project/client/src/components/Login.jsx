import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import axiosInstance from "./axiosInstance";
import { setCredentials } from "../store/authSlice";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await axiosInstance.post("/users/login", form);
      dispatch(setCredentials({ token: data.token, user: data.user }));
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}`);
      navigate(data.user.role === "admin" ? "/admin/home" : "/home");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">
          Email
        </label>
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
        <label className="block text-xs font-medium text-muted mb-1.5">
          Password
        </label>
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
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-brand hover:bg-brand-light transition-colors py-2.5 text-sm font-medium disabled:opacity-60 focus-ring"
      >
        {submitting ? "Logging in…" : "Log in"}
      </button>
      <p className="text-xs text-muted text-center">
        New here?{" "}
        <Link to="/register" className="text-brand-light hover:underline">
          Create an account
        </Link>
      </p>
      <p className="text-[11px] text-slate-600 text-center leading-relaxed">
        Demo admin: admin@sbstocks.demo / Admin@123
      </p>
    </form>
  );
}
