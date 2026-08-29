import React from 'react';
import {
  Megaphone,
  Calendar,
  Send,
  Eye,
  MessageCircle,
  Award,
  DollarSign,
  TrendingUp,
  Play,
  Pause,
  CheckCircle2,
  Trash2,
  Edit,
  ExternalLink,
  Users,
} from 'lucide-react';
import { whatsappService } from '../../services/whatsappService.js';

export function CampaignCard({
  campaign,
  onOpenDetails,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const metrics = whatsappService.calculateCampaignMetrics(campaign);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Running':
        return (
          <span className="campaign-status-badge running">
            <span className="pulse-dot" /> Running Live
          </span>
        );
      case 'Completed':
        return (
          <span className="campaign-status-badge completed">
            <CheckCircle2 size={11} /> Completed
          </span>
        );
      case 'Paused':
        return (
          <span className="campaign-status-badge paused">
            <Pause size={11} /> Paused
          </span>
        );
      case 'Scheduled':
        return (
          <span className="campaign-status-badge scheduled">
            <Calendar size={11} /> Scheduled
          </span>
        );
      default:
        return <span className="campaign-status-badge draft">Draft</span>;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Promotional':
        return '#f59e0b';
      case 'Abandoned Cart':
        return '#ec4899';
      case 'Lead Follow-up':
        return '#3b82f6';
      case 'Win-back':
        return '#8b5cf6';
      default:
        return '#22c55e';
    }
  };

  return (
    <div className="wa-campaign-card" onClick={() => onOpenDetails(campaign)}>
      {/* Top Row: Title & Status */}
      <div className="campaign-card-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="campaign-type-chip"
              style={{
                background: `${getTypeColor(campaign.type)}18`,
                color: getTypeColor(campaign.type),
              }}
            >
              {campaign.type}
            </span>
            <span className="campaign-client-tag">🏢 {campaign.clientName}</span>
          </div>
          <h4 className="campaign-card-title">{campaign.name}</h4>
        </div>
        {getStatusBadge(campaign.status)}
      </div>

      {/* Target Audience & Schedule */}
      <div className="campaign-audience-row">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Users size={12} className="text-primary" />
          <span className="truncate max-w-[220px]" title={campaign.audience}>
            {campaign.audience}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-dim">
          <Calendar size={12} />
          <span>{campaign.scheduledDate || campaign.startDate}</span>
        </div>
      </div>

      {/* 4 Key Metrics Bar */}
      <div className="campaign-mini-telemetry-grid">
        <div className="cmt-col">
          <span className="cmt-lbl">Recipients</span>
          <strong className="cmt-val text-white">{campaign.recipients?.toLocaleString()}</strong>
        </div>

        <div className="cmt-col">
          <span className="cmt-lbl">Delivery</span>
          <strong className="cmt-val text-success">{metrics.deliveryRate}</strong>
        </div>

        <div className="cmt-col">
          <span className="cmt-lbl">Reply Rate</span>
          <strong className="cmt-val text-cyan">{metrics.replyRate}</strong>
        </div>

        <div className="cmt-col">
          <span className="cmt-lbl">Conversions</span>
          <strong className="cmt-val text-purple">{campaign.conversions || 0}</strong>
        </div>
      </div>

      {/* Financials & ROAS Row */}
      <div className="campaign-financials-box">
        <div className="flex items-center gap-1">
          <DollarSign size={13} className="text-success" />
          <span className="text-xs text-dim">Revenue:</span>
          <strong className="text-sm text-success font-bold">
            ₹{(campaign.revenue || 0).toLocaleString()}
          </strong>
        </div>

        {metrics.roas !== 'N/A' && (
          <span className="campaign-roas-pill">
            <TrendingUp size={11} /> {metrics.roas} ROAS
          </span>
        )}
      </div>

      {/* Delivery Progress Bar */}
      <div className="campaign-progress-bar-wrap">
        <div className="flex justify-between items-center text-[11px] mb-1">
          <span className="text-dim">Engagement Funnel:</span>
          <span className="text-muted">
            {campaign.delivered} Deliv • {campaign.read} Read • {campaign.replied} Replied
          </span>
        </div>
        <div className="campaign-progress-track">
          <div
            className="campaign-progress-fill delivered"
            style={{ width: `${Math.min(100, (campaign.delivered / (campaign.recipients || 1)) * 100)}%` }}
            title={`Delivered: ${metrics.deliveryRate}`}
          />
          <div
            className="campaign-progress-fill read"
            style={{ width: `${Math.min(100, (campaign.read / (campaign.recipients || 1)) * 100)}%` }}
            title={`Read: ${metrics.readRate}`}
          />
          <div
            className="campaign-progress-fill replied"
            style={{ width: `${Math.min(100, (campaign.replied / (campaign.recipients || 1)) * 100)}%` }}
            title={`Replied: ${metrics.replyRate}`}
          />
        </div>
      </div>

      {/* Footer Controls */}
      <div className="campaign-card-footer" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1.5">
          {campaign.status === 'Running' && (
            <button
              type="button"
              className="btn-card-ctrl pause"
              onClick={() => onStatusChange(campaign.id, 'Paused')}
              title="Pause Live Campaign"
            >
              <Pause size={12} />
              <span>Pause</span>
            </button>
          )}

          {campaign.status === 'Paused' && (
            <button
              type="button"
              className="btn-card-ctrl resume"
              onClick={() => onStatusChange(campaign.id, 'Running')}
              title="Resume Broadcast"
            >
              <Play size={12} />
              <span>Resume</span>
            </button>
          )}

          {campaign.status === 'Scheduled' && (
            <button
              type="button"
              className="btn-card-ctrl start"
              onClick={() => onStatusChange(campaign.id, 'Running')}
              title="Start Broadcast Immediately"
            >
              <Play size={12} />
              <span>Launch Now</span>
            </button>
          )}

          {campaign.status === 'Draft' && (
            <button
              type="button"
              className="btn-card-ctrl schedule"
              onClick={() => onStatusChange(campaign.id, 'Scheduled')}
              title="Schedule Broadcast"
            >
              <Calendar size={12} />
              <span>Schedule</span>
            </button>
          )}

          {campaign.status === 'Running' && (
            <button
              type="button"
              className="btn-card-ctrl complete"
              onClick={() => onStatusChange(campaign.id, 'Completed')}
              title="Mark as Completed"
            >
              <CheckCircle2 size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-card-icon-action"
            onClick={() => onEdit(campaign)}
            title="Edit Campaign Parameters"
          >
            <Edit size={13} />
          </button>

          <button
            type="button"
            className="btn-card-icon-action delete"
            onClick={() => onDelete(campaign.id)}
            title="Delete Campaign"
          >
            <Trash2 size={13} />
          </button>

          <button
            type="button"
            className="btn-card-view-details"
            onClick={() => onOpenDetails(campaign)}
          >
            <span>View Funnel</span>
            <ExternalLink size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CampaignCard;
