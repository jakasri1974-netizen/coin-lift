import React, { useState } from 'react';
import { X, Save, AlertCircle, Sparkles, Camera } from 'lucide-react';
import { analyticsService } from '../../services/api';

export default function AnalyticsUpdateForm({ analytics, onClose, onUpdated }) {
  const [impressions, setImpressions] = useState(analytics?.impressions || 0);
  const [reach, setReach] = useState(analytics?.reach || 0);
  const [views, setViews] = useState(analytics?.views || 0);
  const [likes, setLikes] = useState(analytics?.likes || 0);
  const [comments, setComments] = useState(analytics?.comments || 0);
  const [shares, setShares] = useState(analytics?.shares || 0);
  const [clicks, setClicks] = useState(analytics?.clicks || 0);
  const [conversions, setConversions] = useState(analytics?.conversions || 0);
  const [deliverablesCompleted, setDeliverablesCompleted] = useState(analytics?.deliverablesCompleted || 0);
  const [deliverablesTotal, setDeliverablesTotal] = useState(analytics?.deliverablesTotal || 1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [captureSnapshot, setCaptureSnapshot] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData = {
        impressions: Number(impressions),
        reach: Number(reach),
        views: Number(views),
        likes: Number(likes),
        comments: Number(comments),
        shares: Number(shares),
        clicks: Number(clicks),
        conversions: Number(conversions),
        deliverablesCompleted: Number(deliverablesCompleted),
        deliverablesTotal: Number(deliverablesTotal),
      };

      const res = await analyticsService.updateCollaborationAnalytics(analytics.collaborationId, updateData);

      if (res.success) {
        if (captureSnapshot) {
          await analyticsService.createAnalyticsSnapshot(analytics.collaborationId);
        }
        setSuccess('Performance metrics saved successfully!');
        if (onUpdated) onUpdated(res.data);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(res.message || 'Failed to update analytics metrics');
      }
    } catch (err) {
      console.error('[Update Analytics Form Error]', err);
      setError('An error occurred while saving performance metrics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-purple-100 shadow-2xl w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-sans">Update Campaign Performance</h3>
              <p className="text-[11px] text-purple-200/80">Enter measurable metrics for this collaboration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-purple-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Section: Reach & Views */}
          <div>
            <h4 className="text-xs font-mono font-bold text-purple-700 uppercase tracking-wider mb-3">
              Reach & Visibility
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Impressions</label>
                <input
                  type="number"
                  min="0"
                  value={impressions}
                  onChange={(e) => setImpressions(e.target.value)}
                  className="w-full bg-slate-50 border border-purple-100 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Reach</label>
                <input
                  type="number"
                  min="0"
                  value={reach}
                  onChange={(e) => setReach(e.target.value)}
                  className="w-full bg-slate-50 border border-purple-100 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Views</label>
                <input
                  type="number"
                  min="0"
                  value={views}
                  onChange={(e) => setViews(e.target.value)}
                  className="w-full bg-slate-50 border border-purple-100 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section: Engagement */}
          <div>
            <h4 className="text-xs font-mono font-bold text-pink-700 uppercase tracking-wider mb-3">
              Engagement Metrics
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Likes</label>
                <input
                  type="number"
                  min="0"
                  value={likes}
                  onChange={(e) => setLikes(e.target.value)}
                  className="w-full bg-slate-50 border border-purple-100 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Comments</label>
                <input
                  type="number"
                  min="0"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full bg-slate-50 border border-purple-100 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Shares</label>
                <input
                  type="number"
                  min="0"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  className="w-full bg-slate-50 border border-purple-100 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section: Conversions & Progress */}
          <div>
            <h4 className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider mb-3">
              Conversions & Deliverables
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Clicks</label>
                <input
                  type="number"
                  min="0"
                  value={clicks}
                  onChange={(e) => setClicks(e.target.value)}
                  className="w-full bg-slate-50 border border-purple-100 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Conversions</label>
                <input
                  type="number"
                  min="0"
                  value={conversions}
                  onChange={(e) => setConversions(e.target.value)}
                  className="w-full bg-slate-50 border border-purple-100 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Completed Deliv.</label>
                <input
                  type="number"
                  min="0"
                  value={deliverablesCompleted}
                  onChange={(e) => setDeliverablesCompleted(e.target.value)}
                  className="w-full bg-slate-50 border border-purple-100 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Total Deliv.</label>
                <input
                  type="number"
                  min="1"
                  value={deliverablesTotal}
                  onChange={(e) => setDeliverablesTotal(e.target.value)}
                  className="w-full bg-slate-50 border border-purple-100 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Snapshot Checkbox */}
          <div className="pt-2 border-t border-purple-100 flex items-center gap-2">
            <input
              type="checkbox"
              id="snapCheck"
              checked={captureSnapshot}
              onChange={(e) => setCaptureSnapshot(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
            />
            <label htmlFor="snapCheck" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer">
              <Camera className="w-3.5 h-3.5 text-purple-600" />
              Capture historical snapshot for timeline charts
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Metrics'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
