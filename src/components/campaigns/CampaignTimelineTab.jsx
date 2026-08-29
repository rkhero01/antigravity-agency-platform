import React from 'react';
import { Layers, Calendar, DollarSign, Eye, ArrowRight } from 'lucide-react';

export function CampaignTimelineTab({
  campaigns = [],
  onInspect,
}) {
  const stages = [
    { id: 'Strategy & Concept', title: '1. Strategy & Concept', color: '#f59e0b' },
    { id: 'Creative Production', title: '2. Creative Production', color: '#06b6d4' },
    { id: 'Pre-Launch Teaser', title: '3. Pre-Launch Teaser', color: '#a855f7' },
    { id: 'Live Blitz', title: '4. Live Omnichannel Blitz', color: '#ec4899' },
  ];

  return (
    <div className="campaign-timeline-pane">
      <div className="timeline-stages-grid">
        {stages.map((stage) => {
          const stageCampaigns = campaigns.filter(
            (c) => c.status.toLowerCase() === stage.id.toLowerCase()
          );

          return (
            <div key={stage.id} className="timeline-stage-column">
              <div className="stage-column-header">
                <div className="flex items-center gap-2">
                  <span className="stage-indicator-dot" style={{ background: stage.color }} />
                  <h4 className="stage-column-title">{stage.title}</h4>
                </div>
                <span className="stage-count-badge">{stageCampaigns.length}</span>
              </div>

              <div className="stage-campaigns-list">
                {stageCampaigns.length === 0 ? (
                  <div className="stage-empty-placeholder">
                    <span>No campaigns in this stage</span>
                  </div>
                ) : (
                  stageCampaigns.map((camp) => (
                    <div
                      key={camp.id}
                      className="timeline-campaign-card"
                      onClick={() => onInspect(camp)}
                    >
                      <div className="t-card-top">
                        <span className="t-client-tag">🏢 {camp.clientName}</span>
                        <span className="t-budget-tag">{camp.budget}</span>
                      </div>

                      <h5 className="t-camp-title">{camp.title}</h5>

                      <div className="t-dates-row">
                        <Calendar size={11} className="inline-icon" />
                        <span>{camp.startDate} — {camp.endDate}</span>
                      </div>

                      <div className="t-deliv-bar-box">
                        <div className="t-deliv-lbl-row">
                          <span>Deliverables</span>
                          <strong>{camp.deliverables.completed}/{camp.deliverables.total}</strong>
                        </div>
                        <div className="deliv-bar">
                          <div
                            className="deliv-fill"
                            style={{ width: `${camp.deliverables.percentage}%`, background: stage.color }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CampaignTimelineTab;
