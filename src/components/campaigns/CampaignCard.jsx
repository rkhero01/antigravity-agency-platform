import React from 'react';
import { Rocket, Calendar, DollarSign, TrendingUp, Eye, Trash2, CheckCircle2, Layers } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function CampaignCard({
  campaign,
  onInspect,
  onDeleteCampaign,
}) {
  const getStatusBadge = (status) => {
    if (status === 'Live Blitz') return <Badge variant="danger" size="sm">🔥 {status}</Badge>;
    if (status === 'Creative Production') return <Badge variant="primary" size="sm">🎨 {status}</Badge>;
    if (status === 'Pre-Launch Teaser') return <Badge variant="warning" size="sm">⚡ {status}</Badge>;
    return <Badge variant="neutral" size="sm">📝 {status}</Badge>;
  };

  return (
    <div className="campaign-card-item">
      {/* Header */}
      <div className="campaign-card-header">
        <span className="campaign-client-tag">🏢 {campaign.clientName}</span>
        {getStatusBadge(campaign.status)}
      </div>

      {/* Title & Dates */}
      <div className="campaign-title-block">
        <h3 className="campaign-title" title={campaign.title}>
          {campaign.title}
        </h3>
        <div className="campaign-date-pill">
          <Calendar size={12} className="inline-icon" />
          <span>{campaign.startDate} — {campaign.endDate}</span>
        </div>
      </div>

      {/* Financial Targets Grid */}
      <div className="campaign-financials-grid">
        <div className="cf-block">
          <span className="cf-lbl">Budget</span>
          <strong className="cf-val text-cyan">{campaign.budget}</strong>
        </div>
        <div className="cf-block">
          <span className="cf-lbl">Target Pipeline</span>
          <strong className="cf-val text-success">{campaign.targetRevenue}</strong>
        </div>
        <div className="cf-block">
          <span className="cf-lbl">Target ROAS</span>
          <strong className="cf-val text-primary">{campaign.projectedRoas}</strong>
        </div>
      </div>

      {/* Channel Distribution */}
      <div className="campaign-channels-box">
        <span className="channels-lbl">Omnichannel Budget Split:</span>
        <div className="channel-split-bar">
          {campaign.channelSplit.map((ch, idx) => (
            <div
              key={idx}
              className="split-segment"
              style={{ width: `${ch.percentage}%`, background: ch.color }}
              title={`${ch.channel}: ${ch.percentage}%`}
            />
          ))}
        </div>
        <div className="channel-legend-row">
          {campaign.channelSplit.map((ch, idx) => (
            <span key={idx} className="legend-item">
              <span className="legend-dot" style={{ background: ch.color }} />
              {ch.channel.split(' ')[0]} ({ch.percentage}%)
            </span>
          ))}
        </div>
      </div>

      {/* Moodboard Swatches & Deliverables */}
      <div className="campaign-moodboard-strip">
        <div className="moodboard-palette-dots">
          {campaign.moodboard.palette.map((color, idx) => (
            <span
              key={idx}
              className="palette-swatch"
              style={{ background: color }}
              title={color}
            />
          ))}
        </div>

        <div className="deliverables-progress-block">
          <div className="deliv-head">
            <span className="deliv-lbl">Deliverables</span>
            <strong className="deliv-val">{campaign.deliverables.completed}/{campaign.deliverables.total} ({campaign.deliverables.percentage}%)</strong>
          </div>
          <div className="deliv-bar">
            <div
              className="deliv-fill"
              style={{ width: `${campaign.deliverables.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="campaign-card-footer">
        <button
          type="button"
          className="btn-inspect-brief"
          onClick={() => onInspect(campaign)}
        >
          <Eye size={13} />
          <span>Inspect Full Brief</span>
        </button>

        <button
          type="button"
          className="btn-delete-campaign"
          onClick={() => onDeleteCampaign(campaign.id)}
          title="Delete campaign"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export default CampaignCard;
