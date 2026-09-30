import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, CheckCircle2, ArrowRight, Loader2, Layers, DollarSign, Clock, FileText } from 'lucide-react';
import { campaignsService } from '../../services/api';

export default function CreateCampaignModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Infrastructure');
  const [campaignType, setCampaignType] = useState('Sponsored Video & Review');
  const [budget, setBudget] = useState('5,000 USDC');
  const [duration, setDuration] = useState('14 Days');
  const [deliverables, setDeliverables] = useState('1x Detailed Video Review, 2x X Threads');
  const [status, setStatus] = useState('active');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const categories = [
    'Infrastructure',
    'DeFi',
    'Gaming',
    'NFT',
    'AI & Oracles',
    'Cross-Chain',
    'Web3',
  ];

  const campaignTypes = [
    'Sponsored Video & Review',
    'Educational X Threads',
    'Live Stream & Demo',
    'Technical Whitepaper Review',
    'Social Media Campaign',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!title.trim() || !description.trim() || !budget.trim() || !duration.trim()) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        campaignType,
        budget: budget.trim(),
        duration: duration.trim(),
        deliverables: deliverables.split(',').map((d) => d.trim()).filter(Boolean),
        status,
        tags: [category, 'Web3'],
        logoColor: 'from-[#5146E5] via-[#7C3AED] to-[#A855F7]',
      };

      const res = await campaignsService.create(payload);

      if (res.success) {
        setSuccessMessage('Campaign Brief created successfully!');
        setTimeout(() => {
          onSuccess && onSuccess(res.data);
          onClose();
        }, 1200);
      } else {
        throw new Error(res.message || 'Failed to create campaign brief.');
      }
    } catch (err) {
      console.error('[Campaign Creation Error]', err);
      setErrorMessage(err.message || 'Error creating campaign. Please verify authentication and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 rounded-3xl bg-white border border-purple-100 p-6 sm:p-8 shadow-2xl shadow-purple-900/20 overflow-hidden">
        
        {/* Background Accent Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-[11px] font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Project Campaign Studio</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-sans">
            Create Campaign Brief
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Launch a new creator campaign brief stored directly on MongoDB Atlas
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage ? (
          <div className="py-10 text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-xl font-extrabold text-slate-900">{successMessage}</h3>
            <p className="text-xs text-slate-500">Updating Project workspace and active marketplace listings...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Campaign Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ApexChain L2 Mainnet Launch Video Review"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-purple-50/50 text-xs text-slate-900 p-3 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Campaign Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe the scope, objectives, and community target for creators..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-purple-50/50 text-xs text-slate-900 p-3 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-medium leading-relaxed resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ecosystem Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-purple-50/50 text-xs text-slate-900 p-3 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-medium"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Campaign Format <span className="text-red-500">*</span>
                </label>
                <select
                  value={campaignType}
                  onChange={(e) => setCampaignType(e.target.value)}
                  className="w-full bg-purple-50/50 text-xs text-slate-900 p-3 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-medium"
                >
                  {campaignTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Budget Pool <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="5,000 USDC"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-purple-50/50 text-xs text-slate-900 p-3 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Duration <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="14 Days"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-purple-50/50 text-xs text-slate-900 p-3 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-purple-50/50 text-xs text-slate-900 p-3 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-medium"
                >
                  <option value="active">Active (Live Marketplace)</option>
                  <option value="draft">Draft (Saved Only)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Required Deliverables <span className="text-red-500">*</span> (Comma Separated)
              </label>
              <input
                type="text"
                required
                placeholder="1x YouTube Review Video, 2x Infographic X Threads, 1x Telegram Q&A"
                value={deliverables}
                onChange={(e) => setDeliverables(e.target.value)}
                className="w-full bg-purple-50/50 text-xs text-slate-900 p-3 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-100 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-purple-50 text-slate-700 text-xs font-bold hover:bg-purple-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 text-white font-extrabold text-xs shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all flex items-center gap-2 hover:-translate-y-0.5 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Publishing Brief...</span>
                  </>
                ) : (
                  <>
                    <span>Publish Campaign Brief</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
