import React from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  MessageCircle,
  Sparkles,
  Flame,
} from 'lucide-react';

export function TemplatesMetrics({
  templates = [],
}) {
  const total = templates.length;
  const approved = templates.filter((t) => t.status === 'Approved').length;
  const pending = templates.filter((t) => t.status === 'Pending').length;
  const rejected = templates.filter((t) => t.status === 'Rejected').length;

  const totalUsage = templates.reduce((acc, t) => acc + (t.usageCount || 0), 0);

  // Compute average delivery and reply rates safely
  let deliverySum = 0;
  let replySum = 0;
  templates.forEach((t) => {
    deliverySum += parseFloat(t.deliveryRate || '0');
    replySum += parseFloat(t.replyRate || '0');
  });

  const avgDelivery = total > 0 ? (deliverySum / total).toFixed(1) + '%' : '0.0%';
  const avgReply = total > 0 ? (replySum / total).toFixed(1) + '%' : '0.0%';

  // Find most used template
  const mostUsed = templates.length > 0
    ? [...templates].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))[0]
    : null;

  return (
    <div className="wa-templates-metrics-strip">
      <div className="t-metric-item">
        <span className="t-metric-lbl">Total Templates</span>
        <div className="flex items-center gap-1.5">
          <FileText size={14} className="text-primary" />
          <strong className="t-metric-val text-white">{total}</strong>
        </div>
        <span className="t-metric-sub text-dim">Meta synced library</span>
      </div>

      <div className="t-metric-item">
        <span className="t-metric-lbl">Meta Approved</span>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-success" />
          <strong className="t-metric-val text-success">{approved}</strong>
        </div>
        <span className="t-metric-sub text-success">✓ Ready to broadcast</span>
      </div>

      <div className="t-metric-item">
        <span className="t-metric-lbl">Pending Review</span>
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-warning" />
          <strong className="t-metric-val text-warning">{pending}</strong>
        </div>
        <span className="t-metric-sub text-warning">◷ In Meta queue</span>
      </div>

      <div className="t-metric-item">
        <span className="t-metric-lbl">Rejected</span>
        <div className="flex items-center gap-1.5">
          <XCircle size={14} className="text-danger" />
          <strong className="t-metric-val text-danger">{rejected}</strong>
        </div>
        <span className="t-metric-sub text-danger">× Policy adjustment</span>
      </div>

      <div className="t-metric-item">
        <span className="t-metric-lbl">Avg Delivery</span>
        <div className="flex items-center gap-1.5">
          <Send size={14} className="text-cyan" />
          <strong className="t-metric-val text-cyan">{avgDelivery}</strong>
        </div>
        <span className="t-metric-sub text-dim">Tier 3 deliverability</span>
      </div>

      <div className="t-metric-item">
        <span className="t-metric-lbl">Avg Reply Rate</span>
        <div className="flex items-center gap-1.5">
          <MessageCircle size={14} className="text-purple" />
          <strong className="t-metric-val text-purple">{avgReply}</strong>
        </div>
        <span className="t-metric-sub text-dim">Direct user responses</span>
      </div>

      <div className="t-metric-item">
        <span className="t-metric-lbl">Total Usage</span>
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-pink" />
          <strong className="t-metric-val text-pink">{totalUsage.toLocaleString()}</strong>
        </div>
        <span className="t-metric-sub text-dim">Total sends across CRM</span>
      </div>

      {mostUsed && (
        <div className="t-metric-item highlight">
          <span className="t-metric-lbl">Most Popular</span>
          <div className="flex items-center gap-1">
            <Flame size={13} className="text-warning" />
            <strong className="t-metric-val text-warning truncate text-xs" title={mostUsed.name}>
              {mostUsed.name}
            </strong>
          </div>
          <span className="t-metric-sub text-muted">
            {mostUsed.usageCount} sends ({mostUsed.deliveryRate})
          </span>
        </div>
      )}
    </div>
  );
}

export default TemplatesMetrics;
