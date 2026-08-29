import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { whatsappService } from '../../services/whatsappService.js';

export function FollowUpAnalytics({
  selectedClient = 'all',
}) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowUpMetrics();
  }, [selectedClient]);

  const loadFollowUpMetrics = async () => {
    setLoading(true);
    const res = await whatsappService.getFollowUpMetrics({ clientId: selectedClient });
    setMetrics(res);
    setLoading(false);
  };

  if (loading || !metrics) return null;

  return (
    <div className="wa-followup-analytics-card">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CalendarCheck size={17} className="text-success" />
            <span>Follow-up SLA Adherence &amp; Pipeline Recovery</span>
          </h3>
          <p className="text-xs text-muted">
            Task resolution velocity, overdue touchpoint remediation, and recovered pipeline revenue
          </p>
        </div>
      </div>

      <div className="followup-analytics-metrics-strip">
        <div className="fu-stat-box">
          <span className="fu-stat-lbl">Completion Rate</span>
          <strong className="fu-stat-val text-success">{metrics.completionRate}</strong>
          <span className="fu-stat-sub text-dim">{metrics.completedTodayCount} tasks closed</span>
        </div>

        <div className="fu-stat-box">
          <span className="fu-stat-lbl">Revenue at Risk</span>
          <strong className="fu-stat-val text-warning">₹{metrics.revenueAtRisk.toLocaleString()}</strong>
          <span className="fu-stat-sub text-dim">Overdue &amp; due today</span>
        </div>

        <div className="fu-stat-box">
          <span className="fu-stat-lbl">Active Overdue</span>
          <strong className="fu-stat-val text-danger">{metrics.overdueCount}</strong>
          <span className="fu-stat-sub text-dim">Urgent attention needed</span>
        </div>

        <div className="fu-stat-box">
          <span className="fu-stat-lbl">VIP / High Priority</span>
          <strong className="fu-stat-val text-pink">{metrics.highPriorityCount}</strong>
          <span className="fu-stat-sub text-dim">High-intent deals</span>
        </div>
      </div>
    </div>
  );
}

export default FollowUpAnalytics;
