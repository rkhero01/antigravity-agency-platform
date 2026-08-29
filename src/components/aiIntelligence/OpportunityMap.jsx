import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  TrendingUp,
  Filter,
  Layers,
  Sparkles,
  Zap,
  Clock,
  ArrowUpDown,
  Building,
} from 'lucide-react';

export function OpportunityMap({
  opportunities = [],
  onExecuteOpportunity,
  loading = false,
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [sortBy, setSortBy] = useState('impact');

  const categories = [
    'all',
    'Revenue Growth',
    'Lead Conversion',
    'Sales Pipeline',
    'Retention',
    'Campaign Optimization',
  ];

  let list = [...opportunities];

  if (selectedCategory !== 'all') {
    list = list.filter((opp) => opp.category.toLowerCase() === selectedCategory.toLowerCase());
  }

  if (selectedUrgency !== 'all') {
    list = list.filter((opp) => opp.urgency.toLowerCase() === selectedUrgency.toLowerCase());
  }

  list.sort((a, b) => {
    if (sortBy === 'impact') return (b.impactValue || 0) - (a.impactValue || 0);
    if (sortBy === 'confidence') return parseFloat(b.confidence) - parseFloat(a.confidence);
    return 0;
  });

  const getUrgencyBadge = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
        return <span className="opportunity-badge high">⚡ High Urgency</span>;
      case 'medium':
        return <span className="opportunity-badge medium">⏳ Medium</span>;
      default:
        return <span className="opportunity-badge low">🟢 Low</span>;
    }
  };

  const getEffortBadge = (effort) => {
    switch (effort?.toLowerCase()) {
      case 'low':
        return <span className="effort-badge low">⚡ Low Effort (Quick Win)</span>;
      case 'medium':
        return <span className="effort-badge medium">🛠️ Medium Effort</span>;
      default:
        return <span className="effort-badge high">🏗️ High Effort</span>;
    }
  };

  return (
    <div className="opportunity-map-card">
      {/* Header & Filters */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="opportunity-icon-badge">
            <Compass size={17} className="text-cyan" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Cross-Module Growth Opportunity Matrix
            </h3>
            <p className="text-xs text-muted">
              High-ROI strategic initiatives categorized by revenue impact, confidence score, urgency, and implementation effort
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Chips */}
          <div className="flex items-center gap-1 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`client-filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                <span>{cat === 'all' ? 'All Initiatives' : cat}</span>
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select-input text-xs"
          >
            <option value="impact">Sort by Revenue Impact</option>
            <option value="confidence">Sort by Confidence</option>
          </select>
        </div>
      </div>

      {/* Grid of Opportunities */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="opportunity-item-card skeleton-card h-28" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="wa-empty-conversations-box py-8">
          <Sparkles size={28} className="text-dim mb-2" />
          <strong className="text-white text-xs block">No Opportunities Matching Filters</strong>
          <span className="text-[11px] text-muted">Try selecting "All Initiatives" to view all strategic items.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {list.map((opp) => (
            <div key={opp.id} className="opportunity-item-card">
              <div className="flex justify-between items-start mb-2 gap-2">
                <span className="opportunity-category-tag">{opp.category}</span>
                {getUrgencyBadge(opp.urgency)}
              </div>

              <h4 className="opportunity-title text-white">{opp.title}</h4>
              <span className="opportunity-client-tag">🏢 {opp.clientName}</span>

              {/* Directive */}
              <div className="opportunity-directive-box mt-2">
                <span className="text-[11px] text-cyan-200 block leading-tight">
                  👉 {opp.recommendedAction}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-white/6 text-xs">
                <div>
                  <span className="text-[10px] text-dim block uppercase font-bold">Projected Lift</span>
                  <strong className="text-success font-bold text-xs">{opp.impact}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-dim block uppercase font-bold">Confidence</span>
                  <strong className="text-cyan font-bold text-xs">{opp.confidence}</strong>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-3 flex justify-between items-center pt-2 border-t border-white/6">
                {getEffortBadge(opp.effort)}

                <button
                  type="button"
                  className="btn-ai-action text-xs py-1 px-2.5"
                  onClick={() => onExecuteOpportunity && onExecuteOpportunity(opp)}
                >
                  <span>Execute (Demo)</span>
                  <ArrowRight size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OpportunityMap;
