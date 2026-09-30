import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

export default function DeliverableProgress({ completed = 0, total = 1, percentage = 0 }) {
  const comp = Math.max(0, Number(completed) || 0);
  const tot = Math.max(1, Number(total) || 1);
  const pct = Math.min(100, Math.max(0, Number(percentage) || Math.round((comp / tot) * 100)));

  return (
    <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-purple-600" />
          <h4 className="text-sm font-bold text-slate-900 font-sans">Deliverables Progress</h4>
        </div>
        <span className="text-xs font-mono font-extrabold text-purple-700 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200">
          {pct}% Completed
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-3 p-0.5">
        <div
          className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 rounded-full transition-all duration-500 shadow-sm"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <strong>{comp}</strong> of <strong>{tot}</strong> deliverables completed
        </span>
        <span className="flex items-center gap-1 text-slate-400 font-mono">
          <Clock className="w-3.5 h-3.5" />
          {tot - comp} remaining
        </span>
      </div>
    </div>
  );
}
