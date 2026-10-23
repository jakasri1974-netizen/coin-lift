import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function AdminProtectedRoute({ children, onNavigate }) {
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      onNavigate('/login');
    }
  }, [loading, isAuthenticated, onNavigate]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 bg-[#060913] min-h-screen flex items-center justify-center text-slate-300">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          <span className="text-sm font-medium font-mono">Authenticating Admin Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="pt-32 pb-20 bg-[#060913] min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 rounded-3xl bg-[#0b101d] border border-red-500/30 text-center shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2 font-sans">Unauthorized Admin Access</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Your account role (<strong className="text-white font-mono">{user.role}</strong>) does not have authorization to enter the CrypLift Administration Portal.
          </p>
          <button
            onClick={() => onNavigate('/')}
            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
          >
            Return to Public Platform
          </button>
        </div>
      </div>
    );
  }

  return children;
}
