import React, { useState } from 'react';
import { X, Save, FileText, DollarSign, Calendar, Shield, Loader2, AlertCircle } from 'lucide-react';
import DeliverableEditor from './DeliverableEditor';
import { agreementsService } from '../../services/api';

export default function AgreementForm({ agreement, collaboration, onClose, onSuccess }) {
  const isEditing = !!agreement;

  const [title, setTitle] = useState(
    agreement?.title || (collaboration?.campaignId?.title ? `${collaboration.campaignId.title} Agreement` : 'Collaboration Agreement')
  );
  const [description, setDescription] = useState(agreement?.description || '');
  const [budget, setBudget] = useState(agreement?.budget ?? 1000);
  const [currency, setCurrency] = useState(agreement?.currency || 'USDC');
  const [deadline, setDeadline] = useState(
    agreement?.deadline
      ? new Date(agreement.deadline).toISOString().split('T')[0]
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const [deliverables, setDeliverables] = useState(
    agreement?.deliverables && agreement.deliverables.length > 0
      ? agreement.deliverables
      : [
          { type: 'youtube_video', description: 'Dedicated YouTube Review Video', quantity: 1, platform: 'YouTube' },
          { type: 'x_post', description: 'Promotional X Thread', quantity: 2, platform: 'X' },
        ]
  );

  const [paymentTerms, setPaymentTerms] = useState(
    agreement?.paymentTerms || 'Payment released upon deliverable completion and approval.'
  );
  const [contentRights, setContentRights] = useState(
    agreement?.contentRights || 'Project is granted non-exclusive promotional distribution rights across official channels for 90 days.'
  );
  const [revisionTerms, setRevisionTerms] = useState(
    agreement?.revisionTerms || 'Up to 2 revision rounds included for compliance and brand accuracy.'
  );
  const [cancellationTerms, setCancellationTerms] = useState(
    agreement?.cancellationTerms || 'Either party may request cancellation before content submission with written notice.'
  );
  const [additionalTerms, setAdditionalTerms] = useState(
    agreement?.additionalTerms || 'This agreement records the terms accepted by both parties. Users are responsible for ensuring terms suit their jurisdiction.'
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Agreement title is required.');
      return;
    }

    const numBudget = Number(budget);
    if (isNaN(numBudget) || numBudget < 0) {
      setError('Budget must be a valid number >= 0.');
      return;
    }

    if (deliverables.some(d => !d.description || !d.description.trim())) {
      setError('All deliverables must have a valid description.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        collaborationId: agreement?.collaborationId?._id || agreement?.collaborationId || collaboration?._id,
        title: title.trim(),
        description: description.trim(),
        deliverables,
        quantity: deliverables.reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0),
        deadline: deadline ? new Date(deadline).toISOString() : null,
        budget: numBudget,
        currency,
        paymentTerms,
        contentRights,
        revisionTerms,
        cancellationTerms,
        additionalTerms,
      };

      let res;
      if (isEditing) {
        res = await agreementsService.updateAgreement(agreement._id, payload);
      } else {
        res = await agreementsService.createAgreement(payload);
      }

      if (res.success) {
        onSuccess(res.data);
      } else {
        throw new Error(res.message || 'Failed to save agreement terms.');
      }
    } catch (err) {
      console.error('Save agreement error:', err);
      setError(err.message || 'Failed to save agreement terms.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-purple-100 shadow-2xl max-w-3xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-100">
          <div>
            <span className="text-[10px] font-mono font-bold text-purple-700 uppercase tracking-widest block mb-1">
              Digital Contract Editor
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 font-sans">
              {isEditing ? `Edit Terms (${agreement.title})` : 'Create Digital Collaboration Agreement'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-purple-50 text-slate-500 hover:bg-purple-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title & Budget Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Agreement Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. NovaX Campaign Sponsorship Terms"
                className="w-full bg-purple-50/50 text-xs text-slate-900 px-3.5 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Budget Amount *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-purple-50/50 text-xs text-slate-900 px-3.5 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-bold font-mono"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-purple-50/50 text-xs text-slate-900 px-2.5 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-bold font-mono shrink-0"
                >
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                  <option value="USD">USD</option>
                  <option value="ETH">ETH</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Overview & Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief commercial description of the collaboration"
                className="w-full bg-purple-50/50 text-xs text-slate-900 px-3.5 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Target Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-purple-50/50 text-xs text-slate-900 px-3.5 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-bold font-mono"
              />
            </div>
          </div>

          {/* Deliverable Editor Component */}
          <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-xs">
            <DeliverableEditor deliverables={deliverables} onChange={setDeliverables} />
          </div>

          {/* Terms Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Payment Terms
              </label>
              <textarea
                rows={2}
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full bg-purple-50/50 text-xs text-slate-900 p-3 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Content & Usage Rights
              </label>
              <textarea
                rows={2}
                value={contentRights}
                onChange={(e) => setContentRights(e.target.value)}
                className="w-full bg-purple-50/50 text-xs text-slate-900 p-3 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Revision Policy
              </label>
              <textarea
                rows={2}
                value={revisionTerms}
                onChange={(e) => setRevisionTerms(e.target.value)}
                className="w-full bg-purple-50/50 text-xs text-slate-900 p-3 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Cancellation Policy
              </label>
              <textarea
                rows={2}
                value={cancellationTerms}
                onChange={(e) => setCancellationTerms(e.target.value)}
                className="w-full bg-purple-50/50 text-xs text-slate-900 p-3 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Additional Terms & Disclaimers
            </label>
            <textarea
              rows={2}
              value={additionalTerms}
              onChange={(e) => setAdditionalTerms(e.target.value)}
              className="w-full bg-purple-50/50 text-xs text-slate-900 p-3 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-medium"
            />
          </div>

          {/* Legal Notice Disclaimer */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-medium">
            <strong>Platform Disclaimer:</strong> This agreement records the commercial terms accepted by both parties. Users are responsible for ensuring terms are appropriate for their jurisdiction. CrypLift does not process direct payments or offer legal guarantees.
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-slate-700 font-extrabold text-xs transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isEditing ? 'Save & Reset Acceptances' : 'Create & Send Agreement'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
