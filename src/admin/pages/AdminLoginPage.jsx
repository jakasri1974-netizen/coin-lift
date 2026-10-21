import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result && result.success) {
      if (result.user?.role !== 'ADMIN') {
        setFormError('Access Denied: Account is not authorized for Admin access');
        return;
      }
      onNavigate('/admin');
    } else {
      setFormError(result?.error || 'Invalid admin credentials');
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">

        {/* Admin Card Header */}
        <div className="rounded-3xl bg-[#0b101d] border border-cyan-500/20 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">

          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 shadow-lg shadow-cyan-500/10">
              <Shield className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 mb-2">
              CoinLift Admin Portal
            </span>
            <h2 className="text-2xl font-extrabold text-white font-sans">
              Secure Administration
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Authorized platform administrators only
            </p>
          </div>

          {formError && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 font-mono">Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="admin@coinlift.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#050811] text-xs text-white pl-10 pr-4 py-3.5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 font-mono">Admin Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#050811] text-xs text-white pl-10 pr-4 py-3.5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In to Admin Portal</span>
                </>
              )}
            </button>

          </form>

          <div className="mt-8 pt-4 border-t border-white/10 text-center text-[11px] text-slate-500 font-mono">
            Protected Gateway • IP Logged for Security
          </div>

        </div>

      </div>
    </div>
  );
}
