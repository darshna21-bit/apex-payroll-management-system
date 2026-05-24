import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { CreditCard, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errType = params.get('error');
    if (errType === 'access_removed') {
      setError('Account not found or access removed');
    }
  }, []);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await login({ email, password });
      if (res && res.success) {
        navigate('/dashboard');
      } else {
        setError(res?.message || 'Invalid email or password');
        setLoading(false);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Invalid email or password');
      setLoading(false);
    }
  };

  // Quick fill utility for reviewers
  const handleQuickFill = (role) => {
    if (role === 'admin') {
      setEmail('admin@payroll.com');
      setPassword('admin123');
    } else {
      setEmail('john@payroll.com');
      setPassword('EMP001123');
    }
  };

  return (
    <div>
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center">
        <div className="rounded-xl bg-blue-600 p-2.5 shadow-lg shadow-blue-500/20">
          <CreditCard className="h-6 w-6 text-white" />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
          Sign in to ApexPayroll
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Enter your corporate credentials below
        </p>
      </div>

      {/* Form */}
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={handleEmailChange}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
            Password
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={handlePasswordChange}
              className="block w-full rounded-lg border border-slate-300 pl-3 pr-10 py-2.5 text-sm placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="flex items-center space-x-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-600 border border-rose-100 mt-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="font-bold">❌ {error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <span>Signing in...</span>
            </div>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Recruiter Quick Fill Panel */}
      <div className="mt-8 border-t border-slate-200 pt-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
          Recruiter Quick Fill
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleQuickFill('admin')}
            className="flex flex-col items-center justify-center rounded-xl border border-blue-100 bg-blue-50/50 p-3 hover:bg-blue-50 transition-colors"
          >
            <span className="text-xs font-bold text-blue-700">Admin Account</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Full access privileges</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('employee')}
            className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/50 p-3 hover:bg-slate-100 transition-colors"
          >
            <span className="text-xs font-bold text-slate-700">Employee Account</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Standard privileges</span>
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-500">
        Need a new company portal?{' '}
        <Link to="/register" className="font-bold text-blue-600 hover:text-blue-500">
          Register here
        </Link>
      </p>
    </div>
  );
};

export default Login;
