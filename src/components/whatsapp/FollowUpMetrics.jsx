import React from 'react';
import {
  CalendarCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingUp,
  Flame,
  RotateCcw,
} from 'lucide-react';

export function FollowUpMetrics({
  metrics = {},
}) {
  const {
    total = 0,
    overdueCount = 0,
    dueTodayCount = 0,
    dueTomorrowCount = 0,
    upcomingCount = 0,
    completedTodayCount = 0,
    completionRate = '0.0%',
    revenueAtRisk = 0,
    highPriorityCount = 0,
  } = metrics;

  return (
    <div className="wa-followup-metrics-strip">
      <div className="fu-metric-item">
        <span className="fu-metric-lbl">Total Tasks</span>
        <div className="flex items-center gap-1.5">
          <CalendarCheck size={14} className="text-primary" />
          <strong className="fu-metric-val text-white">{total}</strong>
        </div>
        <span className="fu-metric-sub text-dim">Active pipeline follow-ups</span>
      </div>

      <div className={`fu-metric-item ${overdueCount > 0 ? 'alert-danger' : ''}`}>
        <span className="fu-metric-lbl">Overdue</span>
        <div className="flex items-center gap-1.5">
          <AlertTriangle size={14} className="text-danger" />
          <strong className="fu-metric-val text-danger">{overdueCount}</strong>
        </div>
        <span className="fu-metric-sub text-danger font-semibold">Immediate attention</span>
      </div>

      <div className="fu-metric-item highlight-today">
        <span className="fu-metric-lbl">Due Today</span>
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-warning" />
          <strong className="fu-metric-val text-warning">{dueTodayCount}</strong>
        </div>
        <span className="fu-metric-sub text-warning font-medium">Scheduled for today</span>
      </div>

      <div className="fu-metric-item">
        <span className="fu-metric-lbl">Due Tomorrow</span>
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-cyan" />
          <strong className="fu-metric-val text-cyan">{dueTomorrowCount}</strong>
        </div>
        <span className="fu-metric-sub text-dim">Next day queue</span>
      </div>

      <div className="fu-metric-item">
        <span className="fu-metric-lbl">Upcoming</span>
        <div className="flex items-center gap-1.5">
          <RotateCcw size={14} className="text-purple" />
          <strong className="fu-metric-val text-purple">{upcomingCount}</strong>
        </div>
        <span className="fu-metric-sub text-dim">Future pipeline</span>
      </div>

      <div className="fu-metric-item">
        <span className="fu-metric-lbl">Completed</span>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-success" />
          <strong className="fu-metric-val text-success">{completedTodayCount}</strong>
        </div>
        <span className="fu-metric-sub text-success">{completionRate} complete</span>
      </div>

      <div className="fu-metric-item highlight-rev">
        <span className="fu-metric-lbl">Revenue at Risk</span>
        <div className="flex items-center gap-1">
          <DollarSign size={14} className="text-warning" />
          <strong className="fu-metric-val text-warning">₹{revenueAtRisk.toLocaleString()}</strong>
        </div>
        <span className="fu-metric-sub text-muted">Overdue &amp; Today</span>
      </div>

      <div className="fu-metric-item">
        <span className="fu-metric-lbl">VIP / High Priority</span>
        <div className="flex items-center gap-1.5">
          <Flame size={14} className="text-pink" />
          <strong className="fu-metric-val text-pink">{highPriorityCount}</strong>
        </div>
        <span className="fu-metric-sub text-dim">Top tier accounts</span>
      </div>
    </div>
  );
}

export default FollowUpMetrics;
