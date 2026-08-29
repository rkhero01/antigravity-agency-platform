import React from 'react';
import {
  X,
  Megaphone,
  Calendar,
  Users,
  Send,
  Eye,
  MessageCircle,
  Award,
  DollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Pause,
  Play,
  FileText,
  Building,
  ArrowRight,
} from 'lucide-react';
import { CampaignMetrics } from './CampaignMetrics.jsx';
import { whatsappService } from '../../services/whatsappService.js';

export function CampaignDetailModal({
  campaign,
  isOpen,
  onClose,
  onStatusChange,
  onEdit,
}) {
  if (!isOpen || !campaign) return null;

  const metrics = whatsappService.calculateCampaignMetrics(campaign);
  const isRunning = campaign.status === 'Running';
  const isPaused = campaign.status === 'Paused';

  const funnelSteps = [
    {
      step: '1. Targeted Audience',
      count: campaign.recipients || 0,
      pct: '100%',
      icon: Users,
      color: '#3b82f6',
    },
    {
      step: '2. Delivered Messages',
      count: campaign.delivered || 0,
      pct: metrics.deliveryRate,
      icon: Send,
      color: '#10b981',
    },
    {
      step: '3. Read & Opened',
      count: campaign.read || 0,
      pct: metrics.readRate,
      icon: Eye,
      color: '#06b6d4',
    },
    {
      step: '4. Direct Replies',
      count: campaign.replied || 0,
      pct: metrics.replyRate,
      icon: MessageCircle,
      color: '#8b5cf6',
    },
    {
      step: '5. Closed Conversions',
      count: campaign.conversions || 0,
      pct: metrics.conversionRate,
      icon: Award,
      color: '#ec4899',
    },
  ];

  const revPerConv =
    campaign.conversions > 0
      ? `₹${Math.round(campaign.revenue / campaign.conversions).toLocaleString()}`
      : '₹0';

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card wa-campaign-detail-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="flex items-center gap-3 min-w-0">
            <div className="modal-icon-badge">
              <Megaphone size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="modal-title truncate">{campaign.name}</h3>
                <span className={`campaign-status-badge ${campaign.status.toLowerCase()}`}>
                  {campaign.status}
                </span>
              </div>
              <p className="modal-subtitle">
                🏢 {campaign.clientName} • Type: {campaign.type} • Template: {campaign.templateName}
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="wa-campaign-detail-body">
          {/* Section B: Delivery & Conversion Funnel */}
          <div className="detail-card-panel">
            <h4 className="detail-panel-title">1. WhatsApp Broadcast Conversion Funnel</h4>
            <div className="funnel-steps-grid">
              {funnelSteps.map((f, idx) => {
                const Icon = f.icon;
                return (
                  <React.Fragment key={idx}>
                    <div className="funnel-step-card">
                      <div className="flex justify-between items-center mb-1">
                        <span className="step-name-lbl">{f.step}</span>
                        <div
                          className="step-icon-wrap"
                          style={{ background: `${f.color}18`, color: f.color }}
                        >
                          <Icon size={12} />
                        </div>
                      </div>
                      <strong className="step-count-val">{f.count.toLocaleString()}</strong>
                      <span className="step-rate-sub" style={{ color: f.color }}>
                        {f.pct} rate
                      </span>
                    </div>
                    {idx < funnelSteps.length - 1 && (
                      <div className="funnel-arrow-connector">
                        <ArrowRight size={14} className="text-dim" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Section C: Financial Performance */}
          <div className="detail-card-panel">
            <h4 className="detail-panel-title">2. Financial ROI & Revenue Attribution</h4>
            <div className="financial-telemetry-grid">
              <div className="fin-stat-box">
                <span className="fin-lbl">Total Campaign Spend</span>
                <strong className="fin-val text-white">₹{Number(campaign.spend || 0).toLocaleString()}</strong>
                <span className="fin-sub">Meta API conversation fees</span>
              </div>

              <div className="fin-stat-box">
                <span className="fin-lbl">Attributed Revenue</span>
                <strong className="fin-val text-success">₹{Number(campaign.revenue || 0).toLocaleString()}</strong>
                <span className="fin-sub">Direct closed sales</span>
              </div>

              <div className="fin-stat-box">
                <span className="fin-lbl">Campaign ROAS</span>
                <strong className="fin-val text-cyan">{metrics.roas}</strong>
                <span className="fin-sub">Return on ad spend</span>
              </div>

              <div className="fin-stat-box">
                <span className="fin-lbl">Revenue / Conversion</span>
                <strong className="fin-val text-purple">{revPerConv}</strong>
                <span className="fin-sub">Average ticket size</span>
              </div>
            </div>
          </div>

          {/* Section D: Engagement & Performance Metrics */}
          <div className="detail-card-panel">
            <h4 className="detail-panel-title">3. Engagement & Deliverability Metrics</h4>
            <CampaignMetrics metrics={metrics} variant="grid" />
          </div>

          {/* Section E: Campaign Configuration */}
          <div className="detail-card-panel">
            <h4 className="detail-panel-title">4. Audience & Scheduling Parameters</h4>
            <div className="config-parameters-grid">
              <div className="config-item">
                <span className="cfg-lbl">Target Audience:</span>
                <span className="cfg-val text-white">{campaign.audience}</span>
              </div>
              <div className="config-item">
                <span className="cfg-lbl">Scheduled Launch:</span>
                <span className="cfg-val text-cyan">{campaign.scheduledDate || campaign.startDate}</span>
              </div>
              <div className="config-item">
                <span className="cfg-lbl">Meta Template:</span>
                <span className="cfg-val text-warning"><code>{campaign.templateName}</code></span>
              </div>
              <div className="config-item">
                <span className="cfg-lbl">Client Workspace:</span>
                <span className="cfg-val text-primary">🏢 {campaign.clientName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-dialog-footer">
          <div className="flex items-center gap-2">
            {isRunning && (
              <button
                type="button"
                className="btn-saas-secondary text-xs"
                onClick={() => onStatusChange(campaign.id, 'Paused')}
              >
                <Pause size={13} />
                <span>Pause Campaign</span>
              </button>
            )}

            {isPaused && (
              <button
                type="button"
                className="btn-saas-secondary text-xs text-success"
                onClick={() => onStatusChange(campaign.id, 'Running')}
              >
                <Play size={13} />
                <span>Resume Campaign</span>
              </button>
            )}

            {campaign.status !== 'Completed' && (
              <button
                type="button"
                className="btn-saas-secondary text-xs"
                onClick={() => onStatusChange(campaign.id, 'Completed')}
              >
                <CheckCircle2 size={13} />
                <span>Mark Completed</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-saas-secondary"
              onClick={() => {
                onClose();
                onEdit(campaign);
              }}
            >
              Edit Campaign
            </button>
            <button type="button" className="btn-saas-primary" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampaignDetailModal;
