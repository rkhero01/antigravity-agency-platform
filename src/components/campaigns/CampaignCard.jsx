import React from 'react';
import {
  Rocket,
  Building,
  Target,
  DollarSign,
  TrendingUp,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function CampaignCard({
  campaign,
  onInspect,
  onEdit,
  onArchive,
}) {
  const getPlatformGradient = (platform) => {
    switch ((platform || '').toUpperCase()) {
      case 'META':
        return 'linear-gradient(135deg, #1877f2, #0d65d9)';
      case 'GOOGLE':
        return 'linear-gradient(135deg, #4285f4, #34a853)';
      case 'LINKEDIN':
        return 'linear-gradient(135deg, #0a66c2, #004182)';
      case 'TIKTOK':
        return 'linear-gradient(135deg, #00f2fe, #4facfe)';
      case 'TWITTER':
        return 'linear-gradient(135deg, #1da1f2, #0c85d0)';
      default:
        return 'linear-gradient(135deg, #6366f1, #3b82f6)';
    }
  };

  const isArchived = (campaign.status || '').toUpperCase() === 'ARCHIVED';

  return (
    <div className={`social-account-card ${isArchived ? 'card-expired' : ''}`}>
      {/* Platform Header Stripe */}
      <div
        className="card-platform-strip"
        style={{ background: getPlatformGradient(campaign.platform) }}
      />

      <div className="card-main-body">
        {/* Header */}
        <div className="card-header-row">
          <div className="account-handle-block">
            <span className="platform-tag-pill">{campaign.platform}</span>
            <h4 className="account-handle-text">{campaign.name || campaign.title}</h4>
            <span className="account-client-tag">
              <Building size={12} className="inline-icon" /> {campaign.clientName || 'Assigned Client'}
            </span>
          </div>

          <div className="account-status-badge-box">
            <Badge variant={campaign.statusVariant || 'primary'}>
              {campaign.status}
            </Badge>
          </div>
        </div>

        {/* Objective */}
        <div className="campaign-objective-badge-row mt-2">
          <span className="campaign-objective-pill">
            <Target size={11} className="inline-icon" /> {campaign.objective}
          </span>
          {campaign.socialAccountName && (
            <span className="social-account-link-pill">
              🔗 {campaign.socialAccountName}
            </span>
          )}
        </div>

        {/* Budget & Metrics Grid */}
        <div className="account-diagnostics-grid mt-3">
          <div className="diag-item">
            <span className="diag-label">
              <DollarSign size={11} className="inline-icon" /> Daily Budget
            </span>
            <strong className="diag-val text-emerald">
              ${(campaign.dailyBudget || 0).toLocaleString()}
            </strong>
          </div>

          <div className="diag-item">
            <span className="diag-label">
              <TrendingUp size={11} className="inline-icon" /> Total Spend
            </span>
            <strong className="diag-val">
              ${(campaign.spend || campaign.totalSpend || 0).toLocaleString()}
            </strong>
          </div>

          <div className="diag-item">
            <span className="diag-label">Conversions</span>
            <strong className="diag-val text-cyan">
              {(campaign.conversions || 0).toLocaleString()}
            </strong>
          </div>

          <div className="diag-item">
            <span className="diag-label">ROAS</span>
            <strong className="diag-val text-gold">
              {campaign.metrics?.roas || '0.00x'}
            </strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card-actions-footer">
          <button
            type="button"
            className="btn-inspect-action"
            onClick={() => onInspect(campaign)}
            title="Inspect Campaign Details"
          >
            <Eye size={13} />
            <span>Details</span>
          </button>

          <button
            type="button"
            className="btn-sync-action"
            onClick={() => onEdit(campaign)}
            title="Edit Campaign Settings"
          >
            <Edit2 size={13} />
            <span>Edit</span>
          </button>

          <button
            type="button"
            className="btn-disconnect-action"
            onClick={() => onArchive(campaign.id)}
            title="Archive Campaign"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CampaignCard;
