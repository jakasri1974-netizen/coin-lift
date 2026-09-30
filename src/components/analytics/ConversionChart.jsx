import React from 'react';
import PerformanceChart from './PerformanceChart';

export default function ConversionChart({ history = [] }) {
  return <PerformanceChart title="Clicks & Conversions Over Time" data={history} metricKey="conversions" color="#10b981" />;
}
