import React from 'react';

export default function PerformanceChart({ title, data = [], metricKey = 'views', color = '#8b5cf6', labelKey = 'capturedAt' }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm text-center">
        <h4 className="text-sm font-bold text-slate-900 mb-2 font-sans">{title}</h4>
        <p className="text-xs text-slate-500 py-8 font-medium">No historical performance data yet.</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => Number(d[metricKey]) || 0), 1);
  const chartHeight = 140;

  return (
    <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-sm font-bold text-slate-900 font-sans">{title}</h4>
        <span className="text-[10px] font-mono font-bold text-purple-700 px-2 py-0.5 rounded bg-purple-50 border border-purple-100">
          {data.length} {data.length === 1 ? 'Snapshot' : 'Snapshots'}
        </span>
      </div>

      <div className="relative h-36 flex items-end justify-between gap-2 pt-4 border-b border-slate-100">
        {data.map((item, idx) => {
          const val = Number(item[metricKey]) || 0;
          const heightPct = Math.max(8, Math.round((val / maxVal) * 100));
          const dateStr = item[labelKey] ? new Date(item[labelKey]).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : `Point ${idx + 1}`;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center group relative">
              {/* Tooltip */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono py-1 px-2 rounded shadow-lg pointer-events-none z-20 whitespace-nowrap">
                {val.toLocaleString()} ({dateStr})
              </div>

              {/* Bar */}
              <div
                className="w-full max-w-[28px] rounded-t-lg transition-all duration-300 group-hover:brightness-110"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: color,
                  opacity: 0.85 + (idx / data.length) * 0.15,
                }}
              />
              <span className="text-[9px] font-mono text-slate-400 mt-2 truncate max-w-full">
                {dateStr}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
