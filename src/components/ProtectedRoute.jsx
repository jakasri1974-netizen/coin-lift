import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [], onNavigate }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="pt-32 pb-20 bg-[#05070e] min-h-screen flex items-center justify-center text-slate-300">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          <span className="text-sm font-medium">Verifying authentication session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-20 bg-[#05070e] min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 rounded-3xl bg-[#090e1a] border border-white/10 text-center shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2 font-sans">Authentication Required</h3>
          <p className="text-xs text-slate-400 mb-6">
            You must be signed in to access this page.
          </p>
          <button
            onClick={() => onNavigate('/login')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="pt-32 pb-20 bg-[#05070e] min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 rounded-3xl bg-[#090e1a] border border-red-500/30 text-center shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2 font-sans">Access Unauthorized</h3>
          <p className="text-xs text-slate-400 mb-6">
            Your current role (<strong className="text-white">{user.role}</strong>) does not have access permission for this area.
          </p>
          <button
            onClick={() => onNavigate('/')}
            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return children;
}
