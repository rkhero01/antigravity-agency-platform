import React from 'react';
import { Mail, MessageSquare, Calendar, Users, Eye, Trash2, TrendingUp, DollarSign } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function EmailCampaignCard({
  campaign,
  onInspect,
  onDeleteCampaign,
}) {
  const isEmail = campaign.type.includes('Email');

  const getStatusBadge = (status) => {
    if (status === 'Sent') return <Badge variant="success" size="sm">✓ {status}</Badge>;
    if (status === 'Scheduled') return <Badge variant="primary" size="sm">📅 {status}</Badge>;
    return <Badge variant="neutral" size="sm">📝 {status}</Badge>;
  };

  return (
    <div className="email-card-item">
      {/* Header */}
      <div className="email-card-header">
        <div className="flex items-center gap-2">
          <span className={`channel-type-badge ${isEmail ? 'email' : 'sms'}`}>
            {isEmail ? <Mail size={12} /> : <MessageSquare size={12} />}
            <span>{campaign.type}</span>
          </span>
          <span className="email-client-tag">🏢 {campaign.clientName}</span>
        </div>

        {getStatusBadge(campaign.status)}
      </div>

      {/* Title & Subject */}
      <div className="email-title-block">
        <h3 className="email-campaign-title" title={campaign.title}>
          {campaign.title}
        </h3>
        <p className="email-subject-line">
          <strong>Subject:</strong> {campaign.subject}
        </p>
      </div>

      {/* Meta & Segment */}
      <div className="email-meta-block">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Calendar size={12} className="inline-icon" />
          <span>{campaign.sendDate}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Users size={12} className="inline-icon" />
          <span>Segment: <strong>{campaign.segment}</strong></span>
        </div>
      </div>

      {/* Financials & Telemetry Grid */}
      <div className="email-telemetry-grid">
        <div className="et-block">
          <span className="et-lbl">Recipients</span>
          <strong className="et-val text-white">{campaign.recipients.toLocaleString()}</strong>
        </div>
        <div className="et-block">
          <span className="et-lbl">Open Rate</span>
          <strong className="et-val text-cyan">{campaign.openRate > 0 ? `${campaign.openRate}%` : '—'}</strong>
        </div>
        <div className="et-block">
          <span className="et-lbl">Click Rate</span>
          <strong className="et-val text-primary">{campaign.clickRate > 0 ? `${campaign.clickRate}%` : '—'}</strong>
        </div>
        <div className="et-block">
          <span className="et-lbl">Revenue</span>
          <strong className="et-val text-success">{campaign.revenue}</strong>
        </div>
      </div>

      {/* Footer */}
      <div className="email-card-footer">
        <button
          type="button"
          className="btn-inspect-email"
          onClick={() => onInspect(campaign)}
        >
          <Eye size={13} />
          <span>Inspect & Preview</span>
        </button>

        <button
          type="button"
          className="btn-delete-email"
          onClick={() => onDeleteCampaign(campaign.id)}
          title="Delete campaign"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export default EmailCampaignCard;
