import React from 'react';
import { Compass, Sparkles, TrendingUp, Lightbulb, Calendar, Flame } from 'lucide-react';

export function TopicForecastsTab({ forecasts = [] }) {
  if (forecasts.length === 0) {
    return (
      <div className="trends-empty-state-card">
        <Compass size={36} className="empty-icon-muted" />
        <h4 className="empty-state-title">No topic forecasts available</h4>
        <p className="empty-state-subtitle">Select a different client workspace or run an AI trend forecast scan.</p>
      </div>
    );
  }

  return (
    <div className="topic-forecasts-pane">
      <div className="forecasts-pane-header">
        <div>
          <h3 className="section-title">Emerging Cultural & Industry Topic Forecasts</h3>
          <p className="section-desc">Predictive AI analysis of breakout discussions before they hit peak mainstream saturation</p>
        </div>
        <span className="forecast-live-chip">● Predictive AI Engine Active</span>
      </div>

      <div className="forecast-cards-grid">
        {forecasts.map((item) => (
          <div key={item.id} className="forecast-card-item">
            <div className="forecast-top-row">
              <div className="forecast-niche-badges">
                <span className="fc-cat-pill">{item.category}</span>
                <span className="fc-niche-tag">🏢 {item.niche}</span>
              </div>
              <span className="fc-velocity-badge">
                <Flame size={12} className="text-warning" />
                {item.velocity}
              </span>
            </div>

            <h4 className="forecast-topic-title">{item.topic}</h4>

            <div className="forecast-peak-row">
              <Calendar size={13} className="inline-icon text-cyan" />
              <span>Forecasted Saturation Peak: <strong>{item.peakDate}</strong></span>
            </div>

            {/* Hook Concept */}
            <div className="forecast-hook-box">
              <span className="fh-lbl">Viral Hook Script Idea:</span>
              <p className="fh-text">{item.hookConcept}</p>
            </div>

            {/* Content Brief */}
            <div className="forecast-brief-box">
              <div className="fb-head">
                <Lightbulb size={13} className="text-warning" />
                <span>Recommended Agency Content Brief</span>
              </div>
              <p className="fb-text">{item.contentBrief}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopicForecastsTab;
