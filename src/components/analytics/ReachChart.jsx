import React from 'react';
import PerformanceChart from './PerformanceChart';

export default function ReachChart({ history = [] }) {
  return <PerformanceChart title="Reach & Impressions Over Time" data={history} metricKey="reach" color="#a855f7" />;
}
