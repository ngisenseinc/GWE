import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowLeft, Loader2, KeyRound, Mail } from 'lucide-react';
import * as authService from '../services/authService';

type AuthMode = 'login' | 'register' | 'forgot';

export default function Login() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useStore(state => state.setUser);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'forgot') {
        await authService.forgotPassword(email);
        toast.success('Password reset link sent! Check your inbox.');
        setMode('login');
        return;
      }

      if (mode === 'register') {
        const data = await authService.register(email, password, name);
        toast.success('Account created successfully!');
        // Set user in store
        setUser({
          ...data.user,
          uid: data.user.id
        });
        navigate('/dashboard');
        return;
      }

      // Login
      const data = await authService.login(email, password);

      if (data.user) {
        // Save refresh token if provided
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }

        // Set user in store
        setUser({
          ...data.user,
          uid: data.user.id
        });

        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080A0F] flex items-center justify-center p-6 font-sans text-white relative overflow-hidden">
      <Helmet>
        <title>Staff Login | God's Way Enterprise</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.08)_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0F1117] border border-white/10 rounded-3xl p-8 sm:p-12 max-w-[440px] w-full shadow-[0_32px_80px_rgba(0,0,0,0.6)] relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] inline-flex items-center justify-center text-3xl mb-5 shadow-[0_8px_32px_rgba(201,168,76,0.25)] hover:scale-105 transition-transform">
              🔧
            </div>
          </Link>
          <h2 className="font-serif text-2xl font-bold text-white mb-1">
            {mode === 'forgot' ? 'Reset Password' : "God's Way Enterprise"}
          </h2>
          <p className="text-[13px] text-white/40">
            {mode === 'login' && 'Staff Portal — Abossey Okai, Accra'}
            {mode === 'register' && 'Create your staff account'}
            {mode === 'forgot' && "We'll send a reset link to your email"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleAuth}
            className="flex flex-col gap-4"
          >
            {mode === 'register' && (
              <div>
                <label className="block text-xs text-white/60 mb-1.5 uppercase tracking-wider font-semibold">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all"
                  placeholder="Kwame Mensah"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-white/60 mb-1.5 uppercase tracking-wider font-semibold">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all"
                  placeholder="staff@godsway.com"
                  required
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs text-white/60 uppercase tracking-wider font-semibold">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-[#C9A84C] hover:text-[#E8C76A] transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] text-black py-3.5 rounded-xl text-[15px] font-bold mt-2 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(201,168,76,0.3)] transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
            </button>

            <div className="flex flex-col gap-2 mt-1">
              {mode !== 'forgot' && (
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  {mode === 'login' ? 'Need an account? Register here' : 'Already have an account? Sign In'}
                </button>
              )}
              {mode === 'forgot' && (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to login
                </button>
              )}
            </div>
          </motion.form>
        </AnimatePresence>

        <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/10 rounded-xl p-4 mt-8 text-xs text-white/30 text-center leading-relaxed">
          🔒 Authorized staff access only.<br />
          Powered by Supabase Auth
        </div>

        <Link to="/" className="w-full mt-4 text-[13px] text-white/30 hover:text-white/60 transition-colors flex items-center justify-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to website
        </Link>
      </motion.div>
    </div>
  );
}
