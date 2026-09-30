import React from 'react';
import { Circle } from 'lucide-react';

export default function OnlineStatus({ isOnline }) {
  return (
    <div className="flex items-center gap-1.5">
      <Circle className={`w-2.5 h-2.5 fill-current ${isOnline ? 'text-emerald-500' : 'text-slate-400'}`} />
      <span className="text-xs font-mono font-bold text-slate-500">
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}
