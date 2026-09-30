import React from 'react';
import { Eye, Users, Heart, MousePointer, Target, CheckCircle2, DollarSign, TrendingUp } from 'lucide-react';
import MetricCard from './MetricCard';

export default function AnalyticsOverview({ summary = {} }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Impressions"
          value={summary.impressions || 0}
          icon={Eye}
          color="from-purple-600 to-indigo-600"
          subtext="Total content impressions"
        />
        <MetricCard
          title="Total Reach"
          value={summary.reach || 0}
          icon={Users}
          color="from-pink-500 to-purple-600"
          subtext="Unique audience reach"
        />
        <MetricCard
          title="Engagement Rate"
          value={summary.engagementRate !== undefined ? `${summary.engagementRate}%` : '0%'}
          icon={Heart}
          color="from-rose-500 to-pink-600"
          badge="Interactive"
          subtext={`Likes: ${summary.likes || 0} • Cmts: ${summary.comments || 0}`}
        />
        <MetricCard
          title="Clicks & Conversions"
          value={summary.clicks || 0}
          icon={MousePointer}
          color="from-emerald-500 to-teal-600"
          subtext={`Conversions: ${summary.conversions || 0}`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Cost Per Click (CPC)"
          value={summary.costPerClick !== null && summary.costPerClick !== undefined ? `$${summary.costPerClick}` : 'N/A'}
          icon={DollarSign}
          color="from-blue-600 to-indigo-600"
          subtext="Budget / Clicks"
        />
        <MetricCard
          title="Cost Per Engagement (CPE)"
          value={summary.costPerEngagement !== null && summary.costPerEngagement !== undefined ? `$${summary.costPerEngagement}` : 'N/A'}
          icon={TrendingUp}
          color="from-violet-600 to-purple-700"
          subtext="Budget / Engagements"
        />
        <MetricCard
          title="Cost Per Mille (CPM)"
          value={summary.costPerThousandImpressions !== null && summary.costPerThousandImpressions !== undefined ? `$${summary.costPerThousandImpressions}` : 'N/A'}
          icon={Target}
          color="from-emerald-600 to-teal-700"
          subtext="Budget per 1,000 impressions"
        />
      </div>
    </div>
  );
}
