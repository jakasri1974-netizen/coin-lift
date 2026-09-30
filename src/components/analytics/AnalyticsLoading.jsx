import React from 'react';
import { Loader2 } from 'lucide-react';

export default function AnalyticsLoading({ message = 'Loading campaign analytics...' }) {
  return (
    <div className="py-20 flex flex-col items-center justify-center bg-white/60 rounded-3xl border border-purple-100 backdrop-blur-sm">
      <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-3" />
      <p className="text-xs font-semibold text-slate-700 tracking-wide uppercase">{message}</p>
    </div>
  );
}
