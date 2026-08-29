import React from 'react';
import { Eye, Shield, ArrowRight, Zap, Target } from 'lucide-react';

export function CompetitorAdsSpy({ adsList = [] }) {
  if (adsList.length === 0) {
    return (
      <div className="competitors-empty-state-card">
        <Eye size={36} className="empty-icon-muted" />
        <h4 className="empty-state-title">No competitor ads detected</h4>
        <p className="empty-state-subtitle">Select a different client workspace or run an Ads Library refresh scan.</p>
      </div>
    );
  }

  return (
    <div className="competitor-ads-spy-pane">
      <div className="ads-spy-header">
        <div>
          <h3 className="section-title">Active Competitor Paid Ad Campaigns</h3>
          <p className="section-desc">Real-time surveillance of live Meta, TikTok, and Google Ads run by industry competitors</p>
        </div>
        <span className="ads-spy-badge">● Spy Feed Active</span>
      </div>

      <div className="ads-spy-cards-grid">
        {adsList.map((ad) => (
          <div key={ad.id} className="ad-spy-card">
            <div className="ad-card-top-row">
              <span className="ad-competitor-name">🏢 {ad.competitorName}</span>
              <span className="ad-platform-tag">{ad.platform}</span>
            </div>

            <div className="ad-headline-box">
              <span className="ad-headline-lbl">Ad Headline:</span>
              <h4 className="ad-headline-text">"{ad.headline}"</h4>
            </div>

            <div className="ad-meta-tags-row">
              <span className="ad-angle-pill">🎯 Angle: {ad.creativeAngle}</span>
              <span className="ad-format-pill">{ad.format}</span>
              <span className="ad-duration-pill">{ad.activeDuration}</span>
            </div>

            <div className="ad-cta-row">
              <span className="cta-lbl">Call to Action:</span>
              <strong className="cta-val">{ad.cta}</strong>
            </div>

            {/* Counter Strategy */}
            <div className="ad-counter-strategy-box">
              <div className="counter-head">
                <Zap size={13} className="text-primary" />
                <span>Recommended Counter-Ad Angle</span>
              </div>
              <p className="counter-desc">{ad.counterStrategy}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CompetitorAdsSpy;
