import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useStore } from '../store/useStore';
import { Helmet } from 'react-helmet-async';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export default function Login() {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Phone state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useStore(state => state.setUser);

  useEffect(() => {
    if (method === 'phone' && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  }, [method]);

  const handleDataConnectUser = async (user: any) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        const now = new Date().toISOString();
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email || user.phoneNumber || '',
          displayName: user.displayName || 'New Staff',
          photoURL: user.photoURL || '',
          role: (user.email === 'ngisense.inc@gmail.com' || user.phoneNumber === '+1234567890') ? 'owner' : 'employee',
          createdAt: now
        });
      }
    } catch (error) {
      console.error("Firestore Error during login:", error);
    }
    setUser(user);
    navigate('/dashboard');
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let result;
      if (isRegistering) {
        result = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }
      await handleDataConnectUser(result.user);
    } catch (err: any) {
      console.error('Email auth error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!confirmationResult) {
        const appVerifier = window.recaptchaVerifier;
        const result = await signInWithPhoneNumber(auth, phone, appVerifier);
        setConfirmationResult(result);
      } else {
        const result = await confirmationResult.confirm(otp);
        await handleDataConnectUser(result.user);
      }
    } catch (err: any) {
      console.error('Phone auth error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080A0F] flex items-center justify-center p-6 font-sans text-white">
      <Helmet>
        <title>Staff Login | God's Way Enterprise</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0F1117] border border-white/10 rounded-3xl p-10 md:p-12 max-w-[420px] w-full shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] inline-flex items-center justify-center text-3xl mb-5 shadow-[0_8px_32px_rgba(201,168,76,0.2)]">
            🔧
          </div>
          <h2 className="font-serif text-2xl font-bold text-white mb-1.5">God's Way Enterprise</h2>
          <p className="text-[13px] text-white/40">Staff Portal — Abossey Okai, Accra</p>
        </div>

        <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl">
          <button 
            onClick={() => { setMethod('email'); setError(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${method === 'email' ? 'bg-[#C9A84C] text-black' : 'text-white/60 hover:text-white'}`}
          >
            Email
          </button>
          <button 
            onClick={() => { setMethod('phone'); setError(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${method === 'phone' ? 'bg-[#C9A84C] text-black' : 'text-white/60 hover:text-white'}`}
          >
            Phone
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl text-center mb-5">
            {error}
          </div>
        )}

        {method === 'email' ? (
          <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-white/60 mb-1.5 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
                placeholder="staff@godsway.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1.5 uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] text-black py-3.5 rounded-xl text-[15px] font-bold mt-2 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(201,168,76,0.3)] transition-all disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Sign In')}
            </button>
            <button 
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs text-white/40 hover:text-white transition-colors mt-2"
            >
              {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePhoneAuth} className="flex flex-col gap-4">
            {!confirmationResult ? (
              <div>
                <label className="block text-xs text-white/60 mb-1.5 uppercase tracking-wider">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
                  placeholder="+233 24 123 4567"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs text-white/60 mb-1.5 uppercase tracking-wider">Verification Code (OTP)</label>
                <input 
                  type="text" 
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors text-center tracking-[0.5em] font-mono text-lg"
                  placeholder="123456"
                  required
                />
              </div>
            )}
            <div id="recaptcha-container"></div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] text-black py-3.5 rounded-xl text-[15px] font-bold mt-2 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(201,168,76,0.3)] transition-all disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? 'Please wait...' : (!confirmationResult ? 'Send OTP' : 'Verify & Sign In')}
            </button>
          </form>
        )}

        <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/15 rounded-xl p-4 mt-6 text-xs text-white/40 text-center leading-relaxed">
          Authorized staff only.<br />
          Powered by Firebase Auth + Firestore
        </div>

        <button onClick={() => navigate('/')} className="w-full mt-6 text-[13px] text-white/40 hover:text-white/70 transition-colors flex items-center justify-center gap-1.5">
          ← Back to Website
        </button>
      </motion.div>
    </div>
  );
}
