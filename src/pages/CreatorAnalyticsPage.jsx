import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, RefreshCw, BarChart3, Users, Heart, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { analyticsService } from '../services/api';
import AnalyticsOverview from '../components/analytics/AnalyticsOverview';
import DeliverableProgress from '../components/analytics/DeliverableProgress';
import ReachChart from '../components/analytics/ReachChart';
import EngagementChart from '../components/analytics/EngagementChart';
import CollaborationPerformance from '../components/analytics/CollaborationPerformance';
import AnalyticsLoading from '../components/analytics/AnalyticsLoading';
import AnalyticsEmptyState from '../components/analytics/AnalyticsEmptyState';
import { useAuth } from '../context/AuthContext';

export default function CreatorAnalyticsPage({ onNavigate }) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchAnalytics = async () => {
    if (!user?._id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getCreatorAnalytics(user._id);
      if (res.success) {
        setData(res.data);
        if (res.data?.collaborations && res.data.collaborations.length > 0) {
          const firstCollabId = res.data.collaborations[0].collaborationId?._id || res.data.collaborations[0].collaborationId;
          if (firstCollabId) {
            const histRes = await analyticsService.getAnalyticsHistory(firstCollabId);
            if (histRes.success) {
              setHistory(histRes.data || []);
            }
          }
        }
      } else {
        setError(res.message || 'Unable to load creator performance analytics.');
      }
    } catch (err) {
      console.error('[Creator Analytics Page Error]', err);
      setError('Error connecting to CrypLift analytics service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <AnalyticsLoading message="Loading your creator performance analytics..." />;

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <AnalyticsEmptyState
          title="Creator Analytics Unavailable"
          message={error || 'No performance data exists for your profile yet.'}
          actionButton={
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors"
            >
              Return to Dashboard
            </button>
          }
        />
      </div>
    );
  }

  const { summary = {}, collaborations = [] } = data;

  return (
    <div className="min-h-screen bg-[#FAF8FF] py-10 print:bg-white print:py-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <button
            onClick={() => (onNavigate ? onNavigate('/dashboard') : window.history.back())}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAnalytics}
              className="p-2.5 rounded-xl bg-white border border-purple-100 text-slate-700 hover:text-purple-600 hover:border-purple-200 transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* Creator Banner */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl border border-purple-300/20 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={user?.name}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-purple-500/30 shadow-lg"
              />
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[11px] font-mono font-bold mb-1">
                  <Sparkles className="w-3 h-3 text-pink-300" />
                  Creator Analytics Workspace
                </div>
                <h1 className="text-3xl font-black font-sans tracking-tight">
                  {user?.name || 'Creator Analytics'}
                </h1>
                <p className="text-xs text-purple-200/80 font-medium">
                  Active Collaborations: <strong className="text-white">{collaborations.length}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
              <div>
                <div className="text-xs text-purple-200/80 font-medium">Deliverables Completion</div>
                <div className="text-2xl font-black text-emerald-300 font-sans">{summary.progressPercentage || 0}%</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <div className="text-xs text-purple-200/80 font-medium">Avg. Engagement</div>
                <div className="text-2xl font-black text-pink-300 font-sans">{summary.engagementRate || 0}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Metric Cards */}
        <AnalyticsOverview summary={summary} />

        {/* Charts & Deliverables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <DeliverableProgress
              completed={summary.deliverablesCompleted}
              total={summary.deliverablesTotal}
              percentage={summary.progressPercentage}
            />
          </div>
          <div className="lg:col-span-2">
            <ReachChart history={history} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EngagementChart history={history} />
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-sans mb-3">Deliverable Progress Summary</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Keep your deliverables updated and verified to ensure higher algorithmic compatibility and project trust scores on CrypLift.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-purple-100 flex items-center justify-between text-xs font-mono font-bold text-purple-700">
              <span>{summary.deliverablesCompleted || 0} Deliverables Completed</span>
              <span className="text-slate-400">Total: {summary.deliverablesTotal || 1}</span>
            </div>
          </div>
        </div>

        {/* Active Collaboration Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 font-sans tracking-tight">
              My Active Collaboration Performance
            </h3>
            <span className="text-xs text-slate-500 font-mono font-bold">
              {collaborations.length} Active Campaigns
            </span>
          </div>

          {collaborations.length === 0 ? (
            <AnalyticsEmptyState message="You do not have any active campaign performance records yet." />
          ) : (
            <div className="space-y-4">
              {collaborations.map((item) => (
                <CollaborationPerformance
                  key={item._id}
                  analytics={item}
                  canEdit={true}
                  onUpdated={() => fetchAnalytics()}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
