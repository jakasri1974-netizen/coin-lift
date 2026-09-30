import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, FileText } from 'lucide-react';

export default function AgreementStatus({ status }) {
  switch (status) {
    case 'active':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1.5 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active & Agreed</span>
        </span>
      );
    case 'pending_creator':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1.5 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Pending Creator Sign-Off</span>
        </span>
      );
    case 'pending_project':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200 inline-flex items-center gap-1.5 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>Pending Project Sign-Off</span>
        </span>
      );
    case 'rejected':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-200 inline-flex items-center gap-1.5 shadow-2xs">
          <XCircle className="w-3.5 h-3.5 text-red-600" />
          <span>Rejected</span>
        </span>
      );
    case 'cancelled':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-200 text-slate-700 border border-slate-300 inline-flex items-center gap-1.5 shadow-2xs">
          <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>Cancelled</span>
        </span>
      );
    case 'completed':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200 inline-flex items-center gap-1.5 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
          <span>Completed</span>
        </span>
      );
    case 'draft':
    default:
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 inline-flex items-center gap-1.5 shadow-2xs">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>Draft</span>
        </span>
      );
  }
}
