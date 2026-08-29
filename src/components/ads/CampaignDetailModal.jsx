import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  DollarSign,
  Target,
  MousePointerClick,
  Layers,
  Sparkles,
  Calendar,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export function CampaignDetailModal({
  campaign,
  isOpen,
  onClose,
  onUpdateBudget,
  onToggleStatus,
  onDeleteCampaign,
}) {
  const [budgetSliderVal, setBudgetSliderVal] = useState(campaign?.dailyBudget || 100);

  if (!isOpen || !campaign) return null;

  const estimatedMonthlySpend = budgetSliderVal * 30;
  const estimatedRevenue = Math.round(estimatedMonthlySpend * (campaign.roas || 4.2));
  const estimatedLeads = Math.round(
    estimatedMonthlySpend / Math.max(campaign.cpl || 15, 5)
  );

  const handleSaveBudget = () => {
    onUpdateBudget(campaign.id, budgetSliderVal);
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card campaign-detail-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <TrendingUp size={18} />
            </div>
            <div>
              <div className="detail-top-badges-row">
                <span className="platform-tag-mini">{campaign.platform}</span>
                <span className="objective-tag-mini">{campaign.objective}</span>
                <span className={`status-pill-mini ${campaign.status.toLowerCase()}`}>
                  {campaign.status}
                </span>
              </div>
              <h3 className="modal-title">{campaign.campaignName}</h3>
              <span className="modal-client-sub">🏢 {campaign.clientName}</span>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="campaign-modal-body">
          <div className="campaign-two-columns">
            {/* Left: Creative Preview */}
            <div className="creative-preview-pane">
              <h4 className="pane-section-title">Active Ad Creative & Copy</h4>
              <div className="live-ad-card">
                <div className="ad-card-brand-bar">
                  <div className="ad-avatar">🏢</div>
                  <div>
                    <span className="ad-client-title">{campaign.clientName}</span>
                    <span className="ad-sponsored-tag">Sponsored • {campaign.platform}</span>
                  </div>
                </div>

                <p className="ad-primary-copy">{campaign.adCreative?.primaryText}</p>

                <div className="ad-media-box">
                  <img
                    src={
                      campaign.adCreative?.mediaUrl ||
                      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80'
                    }
                    alt="Ad Creative"
                    className="ad-creative-img"
                  />
                  <div className="ad-headline-banner">
                    <span className="ad-dest-url">
                      {campaign.clientName.toLowerCase().replace(/\s+/g, '')}.com/special-offer
                    </span>
                    <h5 className="ad-headline-text">{campaign.adCreative?.headline}</h5>
                    <button type="button" className="btn-ad-cta-preview">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Funnel & Ad Sets */}
            <div className="analytics-details-pane">
              {/* Funnel Metrics Grid */}
              <h4 className="pane-section-title">Conversion Funnel Yield</h4>
              <div className="funnel-metrics-grid">
                <div className="funnel-kpi-box">
                  <span className="label">Impressions</span>
                  <strong>{campaign.impressions?.toLocaleString() || '124,000'}</strong>
                </div>
                <div className="funnel-kpi-box">
                  <span className="label">Clicks (CTR)</span>
                  <strong>
                    {campaign.clicks?.toLocaleString()} ({campaign.ctr})
                  </strong>
                </div>
                <div className="funnel-kpi-box">
                  <span className="label">Leads Acquired</span>
                  <strong className="text-primary">{campaign.leads}</strong>
                </div>
                <div className="funnel-kpi-box">
                  <span className="label">Total Spend</span>
                  <strong>{formatCurrency(campaign.spend)}</strong>
                </div>
                <div className="funnel-kpi-box">
                  <span className="label">Cost Per Lead</span>
                  <strong className="text-warning">${campaign.cpl?.toFixed(2)}</strong>
                </div>
                <div className="funnel-kpi-box">
                  <span className="label">Verified ROAS</span>
                  <strong className="text-success">{campaign.roas?.toFixed(2)}x</strong>
                </div>
              </div>

              {/* Ad Sets Breakdown */}
              {campaign.adSets && campaign.adSets.length > 0 && (
                <div className="ad-sets-section">
                  <h5 className="sub-section-title">Targeted Ad Sets</h5>
                  <div className="ad-sets-list">
                    {campaign.adSets.map((set, sIdx) => (
                      <div key={sIdx} className="ad-set-row">
                        <span className="ad-set-name">{set.name}</span>
                        <div className="ad-set-stats">
                          <span>Spend: {formatCurrency(set.spend)}</span>
                          <span>Leads: {set.leads}</span>
                          <span className="text-success">{set.roas}x ROAS</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Budget Optimizer & Projection */}
              <div className="budget-slider-box">
                <div className="slider-label-row">
                  <span className="slider-label">Daily Budget Scaling</span>
                  <strong className="current-slider-val">${budgetSliderVal} / day</strong>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={budgetSliderVal}
                  onChange={(e) => setBudgetSliderVal(Number(e.target.value))}
                  className="budget-slider-input"
                />

                {/* Instant Projections */}
                <div className="budget-projections-pill">
                  <div className="proj-col">
                    <span>Est. 30D Spend</span>
                    <strong>{formatCurrency(estimatedMonthlySpend)}</strong>
                  </div>
                  <div className="proj-col">
                    <span>Est. Leads</span>
                    <strong className="text-primary">{estimatedLeads}</strong>
                  </div>
                  <div className="proj-col">
                    <span>Est. Attributed Revenue</span>
                    <strong className="text-success">{formatCurrency(estimatedRevenue)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-dialog-footer campaign-modal-footer">
          <button
            type="button"
            className="btn-delete-icon-only"
            onClick={() => {
              onDeleteCampaign(campaign.id);
              onClose();
            }}
            title="Delete Campaign"
          >
            <Trash2 size={16} />
          </button>

          <div className="modal-footer-right-actions">
            <button type="button" className="btn-saas-secondary" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="btn-saas-primary"
              onClick={handleSaveBudget}
            >
              <CheckCircle2 size={15} />
              <span>Update Budget (${budgetSliderVal}/day)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampaignDetailModal;
