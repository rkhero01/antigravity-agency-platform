import React from 'react';
import { GitPullRequest, Sparkles, TrendingUp, ArrowRight, Award } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function ContentGapTab({
  gaps = [],
  onOpenBriefWithKeyword,
}) {
  const getPriorityBadge = (p) => {
    if (p === 'High') return <Badge variant="danger" size="sm">🔥 High ROI</Badge>;
    if (p === 'Medium') return <Badge variant="warning" size="sm">⚡ Medium</Badge>;
    return <Badge variant="primary" size="sm">ℹ️ Low</Badge>;
  };

  return (
    <div className="seo-content-gap-pane">
      <div className="gap-top-notice">
        <GitPullRequest size={20} className="text-cyan flex-shrink-0" />
        <div>
          <strong className="text-white text-sm block">Competitor Keyword Gap & Content Opportunity Matrix</strong>
          <span className="text-xs text-muted">High-volume keywords where rival brands rank in the Top 3 while your client is absent or ranking beyond Page 2.</span>
        </div>
      </div>

      <div className="content-gaps-grid">
        {gaps.map((gap) => (
          <div key={gap.id} className="content-gap-card">
            <div className="gap-card-header">
              <div className="flex items-center gap-2">
                {getPriorityBadge(gap.priority)}
                <span className="gap-client-tag">🏢 {gap.clientName}</span>
              </div>
              <span className="gap-vol-tag">{gap.volume.toLocaleString()} searches / mo</span>
            </div>

            <h4 className="gap-keyword-title">{gap.keyword}</h4>

            <div className="gap-rankings-compare-box">
              <div className="rank-compare-col">
                <span className="rc-lbl">Client Rank:</span>
                <strong className={`rc-val ${gap.clientRanking === 'Not Ranking' ? 'text-danger' : 'text-warning'}`}>
                  {gap.clientRanking}
                </strong>
              </div>
              <ArrowRight size={14} className="text-muted" />
              <div className="rank-compare-col">
                <span className="rc-lbl">Competitor Rank:</span>
                <strong className="rc-val text-success">{gap.competitorRanking}</strong>
              </div>
            </div>

            <div className="gap-rec-box">
              <span className="text-xs text-cyan font-bold block mb-0.5">Recommended Content Strategy:</span>
              <span className="text-xs text-white leading-relaxed">{gap.recommendedType}</span>
            </div>

            <div className="gap-card-footer">
              <span className="text-xs text-muted">KD: <strong>{gap.difficulty}%</strong> • {gap.opportunity}</span>
              <button
                type="button"
                className="btn-create-gap-brief"
                onClick={() => onOpenBriefWithKeyword(gap)}
              >
                <Sparkles size={13} />
                <span>Generate AI Brief</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContentGapTab;
