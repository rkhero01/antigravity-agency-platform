import React from 'react';
import {
  Users2,
  Sparkles,
  DollarSign,
  TrendingUp,
  Tag,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function InfluencerCard({
  influencer,
  onOpenPitchModal,
  onUpdateStage,
  onDeleteInfluencer,
}) {
  const getStageVariant = (stage) => {
    switch (stage) {
      case 'Published & Paid':
        return 'success';
      case 'Content Draft Review':
        return 'warning';
      case 'Contract Signed':
        return 'info';
      case 'Outreach Sent':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <div className="influencer-card-item">
      {/* Top Header Row */}
      <div className="inf-card-header">
        <div className="inf-creator-profile">
          <img
            src={influencer.avatar}
            alt={influencer.name}
            className="inf-avatar-img"
          />
          <div>
            <div className="inf-name-row">
              <strong className="inf-creator-name">{influencer.name}</strong>
              <span className={`inf-platform-badge ${influencer.platform.toLowerCase()}`}>
                {influencer.platform}
              </span>
            </div>
            <span className="inf-handle-text">{influencer.handle}</span>
          </div>
        </div>

        <span className="inf-client-tag">🏢 {influencer.clientName}</span>
      </div>

      {/* Campaign & Niche */}
      <div className="inf-campaign-box">
        <div className="inf-campaign-title-row">
          <span className="campaign-lbl">Active Campaign:</span>
          <strong className="campaign-val">{influencer.campaign}</strong>
        </div>
        <div className="inf-tags-strip">
          <span className="inf-niche-pill">{influencer.niche}</span>
          <span className="inf-tier-pill">{influencer.tier}</span>
        </div>
      </div>

      {/* Metrics Row: Followers, Engagement, Rate */}
      <div className="inf-metrics-strip">
        <div className="inf-metric-col">
          <span className="im-lbl">Followers</span>
          <strong className="im-val">{influencer.followers}</strong>
        </div>
        <div className="inf-metric-col">
          <span className="im-lbl">Engagement</span>
          <strong className="im-val text-success">{influencer.engagementRate}</strong>
        </div>
        <div className="inf-metric-col">
          <span className="im-lbl">Rate</span>
          <strong className="im-val text-primary">{influencer.rate}</strong>
        </div>
      </div>

      {/* Deliverables & Promo Code */}
      <div className="inf-deliverables-box">
        <div className="inf-deliv-line">
          <Layers size={12} className="inline-icon text-muted" />
          <span>{influencer.deliverables}</span>
        </div>
        <div className="inf-promo-line">
          <span className="promo-lbl">
            <Tag size={11} className="inline-icon" /> Code: <strong>{influencer.promoCode}</strong>
          </span>
          <span className="sales-val text-cyan">{influencer.attributedSales}</span>
        </div>
      </div>

      {/* Stage Selector & Actions */}
      <div className="inf-card-footer">
        <div className="stage-select-wrapper">
          <span className="stage-lbl">Stage:</span>
          <select
            value={influencer.stage}
            onChange={(e) => onUpdateStage(influencer.id, e.target.value)}
            className="inf-stage-select"
          >
            <option value="Outreach Sent">Outreach Sent</option>
            <option value="Contract Signed">Contract Signed</option>
            <option value="Content Draft Review">Content Draft Review</option>
            <option value="Published & Paid">Published & Paid</option>
          </select>
        </div>

        <div className="inf-card-actions">
          <button
            type="button"
            className="btn-ai-pitch"
            onClick={() => onOpenPitchModal(influencer)}
            title="Generate AI Outreach Pitch"
          >
            <Sparkles size={13} />
            <span>AI Pitch</span>
          </button>

          <button
            type="button"
            className="btn-delete-inf"
            onClick={() => onDeleteInfluencer(influencer.id)}
            title="Remove Creator"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default InfluencerCard;
