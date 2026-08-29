import React from 'react';
import {
  Zap,
  CheckCircle2,
  Pause,
  Users,
  Award,
  DollarSign,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';

export function AutomationMetrics({
  flows = [],
}) {
  const total = flows.length;
  const active = flows.filter((f) => f.status === 'Active').length;
  const paused = flows.filter((f) => f.status === 'Paused').length;
  const totalEnrolled = flows.reduce((acc, f) => acc + (f.enrolled || 0), 0);
  const totalCompleted = flows.reduce((acc, f) => acc + (f.completed || 0), 0);
  const totalRevenue = flows.reduce((acc, f) => acc + (f.revenue || 0), 0);

  const avgCompletionRate =
    totalEnrolled > 0
      ? ((totalCompleted / totalEnrolled) * 100).toFixed(1) + '%'
      : '0.0%';

  let convSum = 0;
  flows.forEach((f) => {
    convSum += parseFloat(f.conversionRate || '0');
  });
  const avgConversionRate = total > 0 ? (convSum / total).toFixed(1) + '%' : '0.0%';

  return (
    <div className="wa-automation-metrics-strip">
      <div className="a-metric-item">
        <span className="a-metric-lbl">Total Journeys</span>
        <div className="flex items-center gap-1.5">
          <Zap size={14} className="text-primary" />
          <strong className="a-metric-val text-white">{total}</strong>
        </div>
        <span className="a-metric-sub text-dim">Automated trigger flows</span>
      </div>

      <div className="a-metric-item">
        <span className="a-metric-lbl">Active Live</span>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-success" />
          <strong className="a-metric-val text-success">{active}</strong>
        </div>
        <span className="a-metric-sub text-success">✓ Inbound listening</span>
      </div>

      <div className="a-metric-item">
        <span className="a-metric-lbl">Paused</span>
        <div className="flex items-center gap-1.5">
          <Pause size={14} className="text-warning" />
          <strong className="a-metric-val text-warning">{paused}</strong>
        </div>
        <span className="a-metric-sub text-warning">Ⅱ Temporarily halted</span>
      </div>

      <div className="a-metric-item">
        <span className="a-metric-lbl">Total Enrolled</span>
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-cyan" />
          <strong className="a-metric-val text-cyan">{totalEnrolled.toLocaleString()}</strong>
        </div>
        <span className="a-metric-sub text-dim">Contacts entered flows</span>
      </div>

      <div className="a-metric-item">
        <span className="a-metric-lbl">Completed</span>
        <div className="flex items-center gap-1.5">
          <RotateCcw size={14} className="text-purple" />
          <strong className="a-metric-val text-purple">{totalCompleted.toLocaleString()}</strong>
        </div>
        <span className="a-metric-sub text-muted">{avgCompletionRate} completion</span>
      </div>

      <div className="a-metric-item">
        <span className="a-metric-lbl">Avg Conversion</span>
        <div className="flex items-center gap-1.5">
          <Award size={14} className="text-pink" />
          <strong className="a-metric-val text-pink">{avgConversionRate}</strong>
        </div>
        <span className="a-metric-sub text-dim">Journey conversion lift</span>
      </div>

      <div className="a-metric-item highlight">
        <span className="a-metric-lbl">Attributed Revenue</span>
        <div className="flex items-center gap-1">
          <DollarSign size={14} className="text-warning" />
          <strong className="a-metric-val text-warning">₹{totalRevenue.toLocaleString()}</strong>
        </div>
        <span className="a-metric-sub text-success">Direct flow sales</span>
      </div>
    </div>
  );
}

export default AutomationMetrics;
