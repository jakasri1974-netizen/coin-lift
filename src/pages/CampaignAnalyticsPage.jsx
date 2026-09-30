import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, RefreshCw, BarChart3, Layers, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { analyticsService } from '../services/api';
import AnalyticsOverview from '../components/analytics/AnalyticsOverview';
import DeliverableProgress from '../components/analytics/DeliverableProgress';
import ReachChart from '../components/analytics/ReachChart';
import EngagementChart from '../components/analytics/EngagementChart';
import ConversionChart from '../components/analytics/ConversionChart';
import CollaborationPerformance from '../components/analytics/CollaborationPerformance';
import AnalyticsLoading from '../components/analytics/AnalyticsLoading';
import AnalyticsEmptyState from '../components/analytics/AnalyticsEmptyState';
import { useAuth } from '../context/AuthContext';

export default function CampaignAnalyticsPage({ onNavigate }) {
  const pathParts = window.location.pathname.split('/');
  const campaignId = pathParts[2] || '';
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getCampaignAnalytics(campaignId);
      if (res.success) {
        setData(res.data);
        if (res.data?.breakdown && res.data.breakdown.length > 0) {
          const firstCollabId = res.data.breakdown[0].collaborationId?._id || res.data.breakdown[0].collaborationId;
          if (firstCollabId) {
            const histRes = await analyticsService.getAnalyticsHistory(firstCollabId);
            if (histRes.success) {
              setHistory(histRes.data || []);
            }
          }
        }
      } else {
        setError(res.message || 'Unable to load campaign analytics.');
      }
    } catch (err) {
      console.error('[Campaign Analytics Page Error]', err);
      setError('Error connecting to CrypLift analytics service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [campaignId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <AnalyticsLoading message="Loading campaign analytics data..." />;

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <AnalyticsEmptyState
          title="Campaign Analytics Unavailable"
          message={error || 'No performance data exists for this campaign.'}
          actionButton={
            <button
              onClick={() => navigate('/campaigns')}
              className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors"
            >
              Return to Campaigns
            </button>
          }
        />
      </div>
    );
  }

  const { campaign, summary, breakdown = [] } = data;
  const isProjectOwner = user?.role === 'admin' || user?.role === 'project';

  return (
    <div className="min-h-screen bg-[#FAF8FF] py-10 print:bg-white print:py-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation & Actions Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <button
            onClick={() => (onNavigate ? onNavigate('/campaigns') : window.history.back())}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Campaigns</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAnalytics}
              className="p-2.5 rounded-xl bg-white border border-purple-100 text-slate-700 hover:text-purple-600 hover:border-purple-200 transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm"
              title="Refresh Data"
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

        {/* Campaign Banner Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl border border-purple-300/20 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-mono font-bold uppercase">
                  Campaign Analytics Report
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold capitalize">
                  {campaign.status || 'Active'}
                </span>
              </div>
              <h1 className="text-3xl font-black font-sans tracking-tight mb-2">
                {campaign.title}
              </h1>
              <p className="text-xs text-purple-200/80 font-medium">
                Budget Allocation: <strong className="text-white">{campaign.budget || 'N/A'}</strong> • Collaborations: <strong className="text-white">{breakdown.length}</strong>
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
              <div>
                <div className="text-xs text-purple-200/80 font-medium">Progress Rate</div>
                <div className="text-2xl font-black text-pink-300 font-sans">{summary.progressPercentage || 0}%</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <div className="text-xs text-purple-200/80 font-medium">Avg. Engagement</div>
                <div className="text-2xl font-black text-cyan-300 font-sans">{summary.engagementRate || 0}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Overview Metric Cards */}
        <AnalyticsOverview summary={summary} />

        {/* Section 2: Progress Bar & History Charts */}
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
          <ConversionChart history={history} />
        </div>

        {/* Section 3: Creator Collaborations Performance Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 font-sans tracking-tight">
              Creator Collaboration Performance
            </h3>
            <span className="text-xs text-slate-500 font-mono font-bold">
              {breakdown.length} Active Collaborators
            </span>
          </div>

          {breakdown.length === 0 ? (
            <AnalyticsEmptyState message="No creator collaborations active in this campaign yet." />
          ) : (
            <div className="space-y-4">
              {breakdown.map((item) => (
                <CollaborationPerformance
                  key={item._id}
                  analytics={item}
                  canEdit={isProjectOwner}
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
