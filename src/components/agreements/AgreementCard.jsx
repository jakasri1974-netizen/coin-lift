import React from 'react';
import { Calendar, DollarSign, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import AgreementStatus from './AgreementStatus';

export default function AgreementCard({ agreement, onSelect, currentUserId }) {
  if (!agreement) return null;

  const campaignTitle = agreement.campaignId?.title || 'Web3 Campaign';
  const creatorName = agreement.creatorId?.name || 'Creator';
  const projectName = agreement.projectId?.name || 'Project';
  const formattedBudget = typeof agreement.budget === 'number'
    ? `${agreement.budget.toLocaleString()} ${agreement.currency || 'USDC'}`
    : `${agreement.budget || 0} ${agreement.currency || 'USDC'}`;

  const deliverableCount = agreement.deliverables?.length || 1;

  return (
    <div
      onClick={() => onSelect(agreement)}
      className="p-5 rounded-3xl bg-white border border-purple-100 shadow-md shadow-purple-900/5 hover:shadow-xl hover:border-purple-300 cursor-pointer transition-all duration-300 flex flex-col justify-between group"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <AgreementStatus status={agreement.status} />
          <span className="text-[10px] font-mono font-bold text-slate-400 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
            v{agreement.version || 1}
          </span>
        </div>

        {/* Title & Campaign */}
        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors font-sans line-clamp-1">
          {agreement.title}
        </h3>
        <p className="text-xs text-purple-700 font-semibold mt-0.5 mb-3 line-clamp-1">
          Campaign: {campaignTitle}
        </p>

        {/* Participants */}
        <div className="p-3 rounded-2xl bg-purple-50/40 border border-purple-100 text-xs space-y-1 mb-4">
          <div className="flex justify-between text-slate-600 font-medium">
            <span className="text-slate-400 font-mono text-[10px] uppercase">Project</span>
            <strong className="text-slate-800">{projectName}</strong>
          </div>
          <div className="flex justify-between text-slate-600 font-medium">
            <span className="text-slate-400 font-mono text-[10px] uppercase">Creator</span>
            <strong className="text-slate-800">{creatorName}</strong>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-purple-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="font-extrabold font-mono text-purple-900 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            {formattedBudget}
          </span>
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            {deliverableCount} Deliverable{deliverableCount > 1 ? 's' : ''}
          </span>
        </div>

        <span className="text-purple-600 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 text-xs">
          <span>View Terms</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}
