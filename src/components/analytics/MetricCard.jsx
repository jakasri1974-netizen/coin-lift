import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function MetricCard({ title, value, subtext, icon: Icon, color = 'from-purple-600 to-indigo-600', badge }) {
  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'Not available';
    if (typeof num === 'string') return num;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 font-mono tracking-wider uppercase">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center text-white shadow-sm`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <h3 className="text-2xl font-black text-slate-900 font-sans">
          {formatNumber(value)}
        </h3>
        {badge && (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <TrendingUp className="w-2.5 h-2.5 text-emerald-600" />
            {badge}
          </span>
        )}
      </div>

      {subtext && <p className="text-[11px] text-slate-500 font-medium mt-1">{subtext}</p>}
    </div>
  );
}
