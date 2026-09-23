import React, { useState } from 'react';
import { ArrowUpRight, ShieldCheck, Mail, Lock, CheckCircle2, Wallet, ArrowRight } from 'lucide-react';

export default function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoggedIn(true);
    setTimeout(() => {
      onNavigate('/');
    }, 1500);
  };

  return (
    <div className="pt-28 pb-20 bg-[#05070e] min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4">
        
        <div className="rounded-3xl bg-[#090e1a] border border-white/10 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-cyan-500/20">
              <ArrowUpRight className="w-6 h-6 text-cyan-200" />
            </div>
            <h2 className="text-2xl font-extrabold text-white font-sans">
              Welcome Back to COIN<span className="text-cyan-400">LIFT</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Sign in to manage creator collaborations & active campaigns
            </p>
          </div>

          {loggedIn ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-white">Login Successful!</h3>
              <p className="text-xs text-slate-400">Redirecting to platform workspace...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="creator@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#05070e] text-xs text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#05070e] text-xs text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded bg-white/10 border-white/20 text-cyan-500" defaultChecked />
                  <span>Remember Me</span>
                </label>
                <a href="#" className="hover:text-cyan-300">Forgot Password?</a>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2"
              >
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                <span className="relative bg-[#090e1a] px-3 text-[10px] text-slate-400 uppercase font-mono">Or connect via Web3</span>
              </div>

              <button
                type="button"
                onClick={() => setLoggedIn(true)}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4 text-cyan-400" />
                <span>Connect Web3 Wallet (Metamask / Phantom)</span>
              </button>

            </form>
          )}

          <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <button onClick={() => onNavigate('/signup')} className="text-cyan-400 font-bold hover:underline">
              Get Started
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
