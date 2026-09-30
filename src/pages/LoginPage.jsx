import React, { useState } from 'react';
import { ArrowUpRight, Mail, Lock, CheckCircle2, Wallet, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      await login(email, password);
      setLoggedIn(true);
      setTimeout(() => {
        onNavigate('/dashboard');
      }, 1000);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 bg-[#FAF8FF] min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md mx-auto px-4 relative z-10">
        
        <div className="rounded-3xl bg-white/90 border border-purple-100 p-8 shadow-xl shadow-purple-900/5 backdrop-blur-xl relative overflow-hidden">
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#5146E5] via-[#7C3AED] to-[#A855F7] flex items-center justify-center text-white mb-3 shadow-md shadow-purple-500/20">
              <ArrowUpRight className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-sans">
              Welcome Back to COIN<span className="text-purple-600">LIFT</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Sign in to manage creator collaborations & active campaigns
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {loggedIn ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-slate-900">Login Successful!</h3>
              <p className="text-xs text-slate-600">Redirecting to platform workspace...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="creator@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white text-xs text-slate-800 pl-10 pr-4 py-3 rounded-xl border border-purple-100 focus:outline-none focus:border-purple-500 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white text-xs text-slate-800 pl-10 pr-4 py-3 rounded-xl border border-purple-100 focus:outline-none focus:border-purple-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded bg-white border-purple-200 text-purple-600 focus:ring-purple-500" defaultChecked />
                  <span>Remember Me</span>
                </label>
                <a href="#" className="hover:text-purple-600 font-medium">Forgot Password?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#5146E5] via-[#7C3AED] to-[#A855F7] text-white font-bold text-xs shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-60"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-purple-100" /></div>
                <span className="relative bg-white px-3 text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Or connect via Web3</span>
              </div>

              <button
                type="button"
                className="w-full py-3 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-purple-900 text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4 text-purple-600" />
                <span>Connect Web3 Wallet (Metamask / Phantom)</span>
              </button>

            </form>
          )}

          <div className="mt-6 pt-4 border-t border-purple-100 text-center text-xs text-slate-600">
            Don't have an account?{' '}
            <button onClick={() => onNavigate('/signup')} className="text-purple-600 font-bold hover:underline">
              Get Started
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
