import React from 'react';
import { WebhookMonitoringDashboard } from '../components/monitoring/WebhookMonitoringDashboard';

export const WebhookMonitoringPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <WebhookMonitoringDashboard />
    </div>
  );
};