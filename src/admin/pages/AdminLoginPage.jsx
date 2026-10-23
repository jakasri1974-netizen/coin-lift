import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Compatibility redirect: The separate Admin Login Portal has been unified
 * into the common platform login page (/login).
 */
export default function AdminLoginPage({ onNavigate }) {
  useEffect(() => {
    if (typeof onNavigate === 'function') {
      onNavigate('/login');
    }
  }, [onNavigate]);

  return (
    <div className="min-h-screen bg-[#060913] flex items-center justify-center p-4">
      <div className="flex items-center gap-3 text-cyan-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium text-slate-300 font-mono">
          Redirecting to unified platform login...
        </span>
      </div>
    </div>
  );
}
