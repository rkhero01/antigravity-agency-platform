import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Clock,
  Smile,
  Meh,
  Frown,
  CheckCircle2,
  Users,
  Award,
} from 'lucide-react';
import { whatsappService } from '../../services/whatsappService.js';

export function ConversationAnalytics({
  selectedClient = 'all',
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversationAnalytics();
  }, [selectedClient]);

  const loadConversationAnalytics = async () => {
    setLoading(true);
    const res = await whatsappService.getConversationAnalytics({ clientId: selectedClient });
    setData(res);
    setLoading(false);
  };

  if (loading || !data) {
    return <div className="wa-loading-spinner-box">Loading conversation analytics...</div>;
  }

  const stageEntries = Object.entries(data.stages || {});
  const totalStages = stageEntries.reduce((acc, [, val]) => acc + val, 0) || 1;

  return (
    <div className="wa-conversation-analytics-grid">
      {/* 1. Volume & Resolution SLAs */}
      <div className="analytics-card-panel">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={14} className="text-cyan" />
            <span>Response Velocity &amp; SLAs</span>
          </h4>
          <span className="text-[11px] text-success font-bold bg-success/10 px-2 py-0.5 rounded">
            99.2% In-SLA
          </span>
        </div>

        <div className="sla-metrics-grid">
          <div className="sla-stat-item">
            <span className="sla-stat-lbl">First Response Time</span>
            <strong className="sla-stat-val text-primary">{data.avgFirstResponseTime}</strong>
            <span className="sla-stat-sub text-dim">Median reply velocity</span>
          </div>

          <div className="sla-stat-item">
            <span className="sla-stat-lbl">Average Resolution Time</span>
            <strong className="sla-stat-val text-purple">{data.avgResolutionTime}</strong>
            <span className="sla-stat-sub text-dim">Ticket closure duration</span>
          </div>

          <div className="sla-stat-item">
            <span className="sla-stat-lbl">Resolution Rate</span>
            <strong className="sla-stat-val text-success">{data.resolutionRate}</strong>
            <span className="sla-stat-sub text-dim">Resolved without escalation</span>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <span className="text-xs text-dim block mb-2 font-medium">Conversation Pipeline Status</span>
          <div className="capacity-segments-bar">
            <div
              className="capacity-segment-fill seg-0"
              style={{ width: `${(data.open / data.totalConversations) * 100}%` }}
              title={`Open: ${data.open}`}
            />
            <div
              className="capacity-segment-fill seg-3"
              style={{ width: `${(data.pending / data.totalConversations) * 100}%` }}
              title={`Pending: ${data.pending}`}
            />
            <div
              className="capacity-segment-fill seg-1"
              style={{ width: `${(data.resolved / data.totalConversations) * 100}%` }}
              title={`Resolved: ${data.resolved}`}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-dim mt-2">
            <span>🔵 Open: {data.open}</span>
            <span>🟡 Pending: {data.pending}</span>
            <span>🟢 Resolved: {data.resolved}</span>
          </div>
        </div>
      </div>

      {/* 2. Sentiment Breakdown */}
      <div className="analytics-card-panel">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Smile size={14} className="text-success" />
            <span>Customer Sentiment Radar</span>
          </h4>
          <span className="text-[11px] text-primary font-bold">
            {data.sentiment.positivePct} Positive
          </span>
        </div>

        <div className="sentiment-meter-row">
          <div className="sentiment-box positive">
            <div className="flex items-center gap-1.5 mb-1">
              <Smile size={15} className="text-success" />
              <span className="text-xs text-white font-bold">Positive</span>
            </div>
            <strong className="text-base text-success font-bold">{data.sentiment.positive}</strong>
            <span className="text-[10px] text-dim block">High intent &amp; praise</span>
          </div>

          <div className="sentiment-box neutral">
            <div className="flex items-center gap-1.5 mb-1">
              <Meh size={15} className="text-warning" />
              <span className="text-xs text-white font-bold">Neutral</span>
            </div>
            <strong className="text-base text-warning font-bold">{data.sentiment.neutral}</strong>
            <span className="text-[10px] text-dim block">Inquiry &amp; pricing queries</span>
          </div>

          <div className="sentiment-box negative">
            <div className="flex items-center gap-1.5 mb-1">
              <Frown size={15} className="text-danger" />
              <span className="text-xs text-white font-bold">Negative</span>
            </div>
            <strong className="text-base text-danger font-bold">{data.sentiment.negative}</strong>
            <span className="text-[10px] text-dim block">Delivery / support queries</span>
          </div>
        </div>
      </div>

      {/* 3. CRM Lead Stage Funnel */}
      <div className="analytics-card-panel">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Award size={14} className="text-warning" />
            <span>CRM Stage Distribution</span>
          </h4>
          <span className="text-[11px] text-muted">WhatsApp to Sales Sync</span>
        </div>

        <div className="lead-stages-vertical-bars">
          {stageEntries.map(([stage, count]) => {
            const pct = Math.round((count / totalStages) * 100);
            return (
              <div key={stage} className="stage-bar-item">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white font-medium">{stage}</span>
                  <span className="text-dim">{count} leads ({pct}%)</span>
                </div>
                <div className="progress-track-bar">
                  <div
                    className={`progress-fill-bar ${
                      stage === 'Won' ? 'bg-success' : stage === 'Qualified' ? 'bg-primary' : 'bg-cyan'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ConversationAnalytics;
