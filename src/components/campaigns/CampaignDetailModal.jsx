import React from 'react';
import { X, Rocket, Printer, Calendar, DollarSign, Target, CheckCircle2, Image as ImageIcon, Users } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function CampaignDetailModal({
  campaign,
  isOpen,
  onClose,
}) {
  if (!isOpen || !campaign) return null;

  const handlePrint = () => {
    window.print();
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
              <Rocket size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="modal-title">{campaign.title}</h3>
                <Badge variant="primary" size="sm">{campaign.status}</Badge>
              </div>
              <p className="modal-subtitle">🏢 {campaign.clientName} • Timeline: {campaign.startDate} — {campaign.endDate}</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="campaign-detail-body">
          {/* Top 3 Targets Row */}
          <div className="brief-kpis-three-col">
            <div className="b-kpi-card">
              <span className="bk-lbl">Allocated Budget</span>
              <strong className="bk-val text-cyan">{campaign.budget}</strong>
            </div>
            <div className="b-kpi-card">
              <span className="bk-lbl">Projected Revenue</span>
              <strong className="bk-val text-success">{campaign.targetRevenue}</strong>
            </div>
            <div className="b-kpi-card">
              <span className="bk-lbl">Target ROAS</span>
              <strong className="bk-val text-primary">{campaign.projectedRoas}</strong>
            </div>
          </div>

          {/* Strategic Narrative Block */}
          <div className="brief-section-card">
            <h4 className="b-section-title">Strategic Value Proposition & Hook</h4>
            <p className="b-narrative-text">"{campaign.valueProposition}"</p>

            <div className="b-goal-row">
              <strong className="text-white text-xs">Primary Goal:</strong>
              <span className="text-muted text-xs">{campaign.primaryGoal}</span>
            </div>
          </div>

          {/* Target Audience Persona */}
          <div className="brief-section-card">
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-primary" />
              <h4 className="b-section-title">Target Audience Persona</h4>
            </div>
            <p className="b-narrative-text">{campaign.audiencePersona}</p>
          </div>

          {/* Omnichannel Budget Split */}
          <div className="brief-section-card">
            <h4 className="b-section-title">Omnichannel Budget & Media Channel Allocation</h4>
            <div className="channel-split-bar my-2">
              {campaign.channelSplit.map((ch, i) => (
                <div
                  key={i}
                  className="split-segment"
                  style={{ width: `${ch.percentage}%`, background: ch.color }}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {campaign.channelSplit.map((ch, i) => (
                <div key={i} className="ch-alloc-item">
                  <div className="flex items-center gap-1.5">
                    <span className="legend-dot" style={{ background: ch.color }} />
                    <strong className="text-xs text-white">{ch.channel}</strong>
                  </div>
                  <span className="text-xs text-cyan">{ch.percentage}% Allocation</span>
                </div>
              ))}
            </div>
          </div>

          {/* Moodboard & Visual Direction */}
          <div className="brief-section-card">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon size={14} className="text-warning" />
              <h4 className="b-section-title">Creative Visual Moodboard & Aesthetics</h4>
            </div>
            <p className="text-xs text-muted mb-2">"{campaign.moodboard.aesthetic}"</p>

            <div className="moodboard-palette-row mb-3">
              <span className="text-xs text-dim mr-2">Color Palette:</span>
              {campaign.moodboard.palette.map((c, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="palette-swatch" style={{ background: c }} />
                  <span className="text-xs text-muted font-mono">{c}</span>
                </div>
              ))}
            </div>

            <div className="moodboard-images-grid">
              {campaign.moodboard.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Moodboard ref ${i + 1}`}
                  className="moodboard-ref-img"
                />
              ))}
            </div>
          </div>

          {/* Deliverables Checklist Progress */}
          <div className="brief-section-card">
            <div className="flex justify-between items-center mb-1.5">
              <h4 className="b-section-title">Campaign Deliverables Pacing</h4>
              <strong className="text-sm text-success">{campaign.deliverables.completed} of {campaign.deliverables.total} Approved ({campaign.deliverables.percentage}%)</strong>
            </div>
            <div className="deliv-bar">
              <div
                className="deliv-fill"
                style={{ width: `${campaign.deliverables.percentage}%`, background: '#10b981' }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-dialog-footer">
          <button type="button" className="btn-saas-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn-saas-primary" onClick={handlePrint}>
            <Printer size={15} />
            <span>Print Strategy Brief (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CampaignDetailModal;
