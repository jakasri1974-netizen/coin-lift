import React from 'react';
import PerformanceChart from './PerformanceChart';

export default function EngagementChart({ history = [] }) {
  return <PerformanceChart title="Engagement Rate Over Time (%)" data={history} metricKey="engagementRate" color="#ec4899" />;
}
