import React, { useState } from 'react';
import { Eye, Heart, MousePointer, CheckCircle2, TrendingUp, Edit3 } from 'lucide-react';
import DeliverableProgress from './DeliverableProgress';
import AnalyticsUpdateForm from './AnalyticsUpdateForm';

export default function CollaborationPerformance({ analytics, onUpdated, canEdit = false }) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  if (!analytics) return null;

  const creatorName = analytics.creatorId?.name || analytics.creatorId?.displayName || 'Creator Partner';
  const creatorImage = analytics.creatorId?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

  return (
    <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-100">
        <div className="flex items-center gap-3">
          <img
            src={creatorImage}
            alt={creatorName}
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-100"
          />
          <div>
            <h4 className="text-base font-bold text-slate-900 font-sans">{creatorName}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-mono font-bold text-purple-700 px-2 py-0.5 rounded bg-purple-50">
                Engagement: {analytics.engagementRate || 0}%
              </span>
            </div>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowUpdateModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Update Metrics</span>
          </button>
        )}
      </div>

      {/* Deliverable Progress */}
      <DeliverableProgress
        completed={analytics.deliverablesCompleted}
        total={analytics.deliverablesTotal}
        percentage={analytics.progressPercentage}
      />

      {/* Metric Breakdown Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <Eye className="w-3.5 h-3.5 text-purple-600" />
            <span>Reach / Views</span>
          </div>
          <div className="text-lg font-black text-slate-900 font-sans">
            {(analytics.reach || 0).toLocaleString()} / {(analytics.views || 0).toLocaleString()}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <Heart className="w-3.5 h-3.5 text-pink-600" />
            <span>Engagement</span>
          </div>
          <div className="text-lg font-black text-slate-900 font-sans">
            {((analytics.likes || 0) + (analytics.comments || 0) + (analytics.shares || 0)).toLocaleString()}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <MousePointer className="w-3.5 h-3.5 text-emerald-600" />
            <span>Clicks / Conv.</span>
          </div>
          <div className="text-lg font-black text-slate-900 font-sans">
            {(analytics.clicks || 0).toLocaleString()} / {(analytics.conversions || 0).toLocaleString()}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            <span>Cost Efficiency</span>
          </div>
          <div className="text-xs font-bold text-slate-800 font-mono">
            {analytics.costPerClick ? `$${analytics.costPerClick} CPC` : 'CPC: N/A'} • {analytics.costPerEngagement ? `$${analytics.costPerEngagement} CPE` : 'CPE: N/A'}
          </div>
        </div>
      </div>

      {showUpdateModal && (
        <AnalyticsUpdateForm
          analytics={analytics}
          onClose={() => setShowUpdateModal(false)}
          onUpdated={(updated) => {
            if (onUpdated) onUpdated(updated);
          }}
        />
      )}
    </div>
  );
}
