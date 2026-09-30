import React from 'react';
import { CheckCircle2, Clock, Calendar, Sparkles } from 'lucide-react';

export default function AgreementTimeline({ agreement }) {
  if (!agreement) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Pending';
    return new Date(dateStr).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const steps = [
    {
      title: 'Agreement Created',
      timestamp: formatDate(agreement.createdAt),
      completed: true,
      subtext: `Version ${agreement.version || 1} initiated`,
    },
    {
      title: 'Creator Acceptance',
      timestamp: formatDate(agreement.creatorAcceptedAt),
      completed: agreement.creatorAccepted,
      subtext: agreement.creatorAccepted ? 'Signed off by Creator' : 'Awaiting Creator review & sign-off',
    },
    {
      title: 'Project Confirmation',
      timestamp: formatDate(agreement.projectAcceptedAt),
      completed: agreement.projectAccepted,
      subtext: agreement.projectAccepted ? 'Signed off by Project' : 'Awaiting Project review & sign-off',
    },
    {
      title: 'Agreement Activated',
      timestamp: agreement.status === 'active' ? formatDate(agreement.updatedAt) : 'Pending Both Signatures',
      completed: agreement.status === 'active',
      subtext: agreement.status === 'active' ? 'Commercial terms locked & active' : 'Will activate automatically upon mutual sign-off',
    },
  ];

  return (
    <div className="p-6 rounded-2xl bg-white border border-purple-100 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-purple-600" />
        <h4 className="text-xs font-mono font-extrabold text-slate-800 uppercase tracking-wider">
          Agreement Execution Timeline & Audit Log
        </h4>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-purple-100">
        {steps.map((step, idx) => (
          <div key={idx} className="relative flex items-start gap-4">
            <div
              className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-xs ${
                step.completed
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600'
                  : 'bg-slate-200 text-slate-400'
              }`}
            >
              {step.completed ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <Clock className="w-3 h-3 text-slate-500" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h5 className={`text-xs font-bold font-sans ${step.completed ? 'text-slate-900' : 'text-slate-500'}`}>
                  {step.title}
                </h5>
                <span className="text-[10px] font-mono font-semibold text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-purple-400" />
                  {step.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{step.subtext}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
