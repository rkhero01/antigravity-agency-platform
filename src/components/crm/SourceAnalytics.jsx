import React from 'react';
import {
  PieChart,
  Share2,
  Search,
  Camera,
  MessageSquare,
  Globe,
  TrendingUp,
  Users,
  Award,
  DollarSign,
} from 'lucide-react';

export function SourceAnalytics({
  sources = [],
}) {
  const getSourceIcon = (name) => {
    if (name.includes('Meta')) return <Share2 size={16} />;
    if (name.includes('Google')) return <Search size={16} />;
    if (name.includes('Instagram')) return <Camera size={16} />;
    if (name.includes('WhatsApp')) return <MessageSquare size={16} />;
    if (name.includes('Website')) return <Globe size={16} />;
    if (name.includes('Organic')) return <TrendingUp size={16} />;
    if (name.includes('Facebook')) return <Users size={16} />;
    return <Award size={16} />;
  };

  return (
    <div className="crm-sources-pane">
      <div className="sources-top-banner">
        <PieChart size={20} className="text-primary flex-shrink-0" />
        <div>
          <strong className="text-white text-sm block">Omnichannel Lead Attribution & Channel ROI Intelligence</strong>
          <span className="text-xs text-muted">Measure customer acquisition cost (CPL), qualification velocity, and closed contract revenue across paid ad networks and organic touchpoints.</span>
        </div>
      </div>

      <div className="sources-cards-grid">
        {sources.map((src, idx) => (
          <div key={idx} className="source-stat-card">
            <div className="source-card-header">
              <div className="flex items-center gap-2.5">
                <div
                  className="source-icon-badge"
                  style={{ background: `${src.color}20`, color: src.color }}
                >
                  {getSourceIcon(src.source)}
                </div>
                <div>
                  <h4 className="source-title-text">{src.source}</h4>
                  <span className="text-xs text-muted">Attributed Channel</span>
                </div>
              </div>

              {src.roas !== 'N/A' && (
                <span className="roas-pill-tag">{src.roas} ROAS</span>
              )}
            </div>

            <div className="source-telemetry-grid">
              <div className="st-block">
                <span className="st-lbl">Total Leads</span>
                <strong className="st-val text-white">{src.leads}</strong>
              </div>

              <div className="st-block">
                <span className="st-lbl">Qualified Leads</span>
                <strong className="st-val text-cyan">{src.qualifiedLeads}</strong>
              </div>

              <div className="st-block">
                <span className="st-lbl">Close Rate</span>
                <strong className="st-val text-primary">{src.conversionRate}</strong>
              </div>

              <div className="st-block">
                <span className="st-lbl">Cost Per Lead</span>
                <strong className="st-val text-warning">{src.costPerLead}</strong>
              </div>
            </div>

            <div className="source-card-footer">
              <span className="text-xs text-muted">Revenue Attributed:</span>
              <strong className="text-success text-sm">{src.revenue}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SourceAnalytics;
