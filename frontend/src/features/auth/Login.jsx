import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure } from '../../store/authSlice';
import api from '../../utils/api';
import { Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import Logo from '../../components/Logo';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(authStart());
    try {
      const { data } = await api.post('/auth/login', { email, password });
      dispatch(authSuccess(data));
      
      // Redirect based on role
      if (data.user.role === 'SuperAdmin') {
        navigate('/admin');
      } else if (data.user.role === 'Cashier') {
        navigate('/pos');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      dispatch(authFailure(msg));
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 overflow-hidden">
      
      {/* Background glow animations */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="absolute -right-20 -bottom-20 h-82 w-82 rounded-full bg-violet-600/15 blur-3xl" />

      {/* Glassmorphic Container */}
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-8 shadow-2xl z-10 animate-slide-up">
        
        {/* Header */}
        <div className="text-center">
          <Logo className="mx-auto h-12 w-12 shadow-2xl shadow-brand-500/20 mb-4" />
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to access your business terminal
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Email input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mybusiness.com"
                  className="w-full rounded-xl bg-slate-950/60 border border-slate-800/80 pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase">Password</label>
                <a href="#" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-950/60 border border-slate-800/80 pl-10 pr-10 py-3 text-sm text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-350 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Sign In
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-slate-400 mt-6">
          Don't have a business account?{' '}
          <Link to="/signup" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">
            Register your store
          </Link>
        </div>

      </div>
    </div>
  );
}
