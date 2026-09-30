import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsEmptyState({ title = 'No performance data available yet', message = 'Metrics can be updated by authorized participants once campaign deliverables begin.', actionButton }) {
  return (
    <div className="py-16 px-6 text-center bg-white rounded-3xl border border-purple-100 shadow-sm max-w-lg mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-4">
        <BarChart3 className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed mb-6 font-medium">{message}</p>
      {actionButton}
    </div>
  );
}
