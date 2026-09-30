import React, { useState } from 'react';
import { ArrowLeft, Printer, Shield, DollarSign, Calendar, FileText, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import AgreementStatus from './AgreementStatus';
import AgreementTimeline from './AgreementTimeline';
import AgreementActions from './AgreementActions';
import AgreementForm from './AgreementForm';

export default function AgreementDetails({
  agreement,
  onBack,
  onRefresh,
  currentUserId,
  currentUserRole,
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (!agreement) return null;

  const campaignTitle = agreement.campaignId?.title || 'Web3 Campaign';
  const projectName = agreement.projectId?.name || 'Project Sponsor';
  const projectEmail = agreement.projectId?.email || '';
  const creatorName = agreement.creatorId?.name || 'Creator Partner';
  const creatorEmail = agreement.creatorId?.email || '';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Screen Only - Hidden on Print) */}
      <div className="print:hidden flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="px-3.5 py-2 rounded-xl bg-white border border-purple-100 text-slate-700 hover:bg-purple-50 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Agreements</span>
        </button>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Download PDF</span>
        </button>
      </div>

      {/* Main Document Body */}
      <div className="bg-white rounded-3xl border border-purple-100 p-8 shadow-xl shadow-purple-900/5 print:shadow-none print:border-none print:p-0 print:rounded-none space-y-8">
        
        {/* Document Header */}
        <div className="pb-6 border-b border-purple-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono font-bold text-[10px] uppercase">
                CRYPLIFT DIGITAL CONTRACT • Version {agreement.version || 1}
              </span>
              <AgreementStatus status={agreement.status} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-sans tracking-tight">
              {agreement.title}
            </h1>
            <p className="text-xs text-purple-700 font-semibold mt-1">
              Campaign: <strong className="text-slate-800">{campaignTitle}</strong>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 text-right font-mono shrink-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Agreement ID</span>
            <span className="text-xs font-bold text-slate-800">{agreement._id}</span>
          </div>
        </div>

        {/* Parties Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-100">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Party A — Project Sponsor
            </span>
            <h3 className="text-base font-extrabold text-slate-900 font-sans">{projectName}</h3>
            <p className="text-xs text-slate-500 font-medium">{projectEmail}</p>
          </div>

          <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-100">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Party B — Creator Partner
            </span>
            <h3 className="text-base font-extrabold text-slate-900 font-sans">{creatorName}</h3>
            <p className="text-xs text-slate-500 font-medium">{creatorEmail}</p>
          </div>
        </div>

        {/* Deliverables Section */}
        <div>
          <h3 className="text-xs font-mono font-extrabold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-600" />
            1. Structured Deliverables & Content Commitments
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-purple-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9FF] text-slate-600 font-mono font-extrabold border-b border-purple-100">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Deliverable Type</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Platform</th>
                  <th className="p-3 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 font-medium text-slate-800">
                {agreement.deliverables && agreement.deliverables.length > 0 ? (
                  agreement.deliverables.map((del, idx) => (
                    <tr key={idx} className="hover:bg-purple-50/20">
                      <td className="p-3 font-mono font-bold text-purple-700">{idx + 1}</td>
                      <td className="p-3 font-mono font-bold uppercase text-[11px] text-indigo-700">
                        {(del.type || 'custom').replace('_', ' ')}
                      </td>
                      <td className="p-3">{del.description}</td>
                      <td className="p-3 font-mono text-[11px] text-slate-500">{del.platform || 'General'}</td>
                      <td className="p-3 text-right font-mono font-bold">{del.quantity || 1}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-slate-400 italic">
                      No specific deliverables listed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Commercial Budget & Payment Terms */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-sans shadow-md">
            <span className="text-[10px] font-mono uppercase font-bold text-purple-200 block mb-1">
              Agreed Budget & Value
            </span>
            <div className="text-2xl font-black font-mono tracking-tight">
              {agreement.budget?.toLocaleString()} {agreement.currency || 'USDC'}
            </div>
            <p className="text-[11px] text-purple-200 mt-2 font-medium">
              Target Deadline: {agreement.deadline ? new Date(agreement.deadline).toLocaleDateString() : 'Flexible'}
            </p>
          </div>

          <div className="md:col-span-2 p-5 rounded-2xl bg-purple-50/40 border border-purple-100">
            <h4 className="text-xs font-mono font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              2. Payment Terms & Schedule
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {agreement.paymentTerms || 'Payment released upon deliverable completion and approval.'}
            </p>
          </div>
        </div>

        {/* Content Rights & Revisions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-100">
            <h4 className="text-xs font-mono font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              3. Content & Usage Rights
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {agreement.contentRights || 'Project is granted non-exclusive promotional distribution rights across official channels for 90 days.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-100">
            <h4 className="text-xs font-mono font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              4. Revision Policy
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {agreement.revisionTerms || 'Up to 2 revision rounds included for compliance and brand accuracy.'}
            </p>
          </div>
        </div>

        {/* Cancellation & Additional Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-100">
            <h4 className="text-xs font-mono font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              5. Cancellation Conditions
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {agreement.cancellationTerms || 'Either party may request cancellation before content submission with written notice.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-100">
            <h4 className="text-xs font-mono font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              6. Additional Terms
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {agreement.additionalTerms || 'This agreement records the terms accepted by both parties.'}
            </p>
          </div>
        </div>

        {/* Signatures & Acceptance Section */}
        <div>
          <h3 className="text-xs font-mono font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            7. Digital Signatures & Sign-Off Status
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Signature */}
            <div className={`p-5 rounded-2xl border ${agreement.projectAccepted ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50/50 border-amber-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 font-sans">Project Representative</span>
                <span className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded ${agreement.projectAccepted ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'}`}>
                  {agreement.projectAccepted ? 'ACCEPTED' : 'PENDING'}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">Name: <strong>{projectName}</strong></p>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                Timestamp: {agreement.projectAcceptedAt ? new Date(agreement.projectAcceptedAt).toLocaleString() : 'Not yet signed'}
              </p>
            </div>

            {/* Creator Signature */}
            <div className={`p-5 rounded-2xl border ${agreement.creatorAccepted ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50/50 border-amber-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 font-sans">Creator Representative</span>
                <span className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded ${agreement.creatorAccepted ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'}`}>
                  {agreement.creatorAccepted ? 'ACCEPTED' : 'PENDING'}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">Name: <strong>{creatorName}</strong></p>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                Timestamp: {agreement.creatorAcceptedAt ? new Date(agreement.creatorAcceptedAt).toLocaleString() : 'Not yet signed'}
              </p>
            </div>
          </div>
        </div>

        {/* Platform Legal Notice Disclaimer */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 font-medium leading-relaxed">
          <strong className="text-slate-800">Platform Notice:</strong> This agreement records the terms accepted by both parties. Users are responsible for ensuring the terms are appropriate for their jurisdiction and situation. CrypLift is a collaboration management platform and does not act as a financial escrow or legal guarantor.
        </div>

        {/* Audit Timeline */}
        <div className="print:hidden">
          <AgreementTimeline agreement={agreement} />
        </div>

        {/* Actions Bar (Screen Only) */}
        <div className="print:hidden pt-4 border-t border-purple-100">
          <AgreementActions
            agreement={agreement}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            onRefresh={onRefresh}
            onEdit={() => setIsEditing(true)}
          />
        </div>

      </div>

      {/* Edit Form Modal */}
      {isEditing && (
        <AgreementForm
          agreement={agreement}
          onClose={() => setIsEditing(false)}
          onSuccess={() => {
            setIsEditing(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
