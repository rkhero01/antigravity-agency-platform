import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function SEOAuditTab({
  issues = [],
  onRunAudit,
  isAuditing,
  onResolveIssue,
}) {
  const [categoryFilter, setCategoryFilter] = useState('all');

  const criticalCount = issues.filter((i) => i.severity === 'Critical').length;
  const highCount = issues.filter((i) => i.severity === 'High').length;
  const mediumCount = issues.filter((i) => i.severity === 'Medium').length;
  const lowCount = issues.filter((i) => i.severity === 'Low').length;

  const categories = ['all', 'Indexation & Crawl', 'On-Page SEO', 'Core Web Vitals', 'Structured Data', 'Technical Architecture'];

  const filteredIssues = issues.filter((issue) => {
    if (categoryFilter === 'all') return true;
    return issue.category.toLowerCase().includes(categoryFilter.toLowerCase());
  });

  const getSeverityBadge = (sev) => {
    if (sev === 'Critical') return <Badge variant="danger" size="sm">🚨 Critical Error</Badge>;
    if (sev === 'High') return <Badge variant="warning" size="sm">⚠️ High Priority</Badge>;
    if (sev === 'Medium') return <Badge variant="warning" size="sm">⚡ Medium Warning</Badge>;
    return <Badge variant="primary" size="sm">ℹ️ Low Notice</Badge>;
  };

  return (
    <div className="seo-audit-pane">
      {/* Health Score & Severity Cards */}
      <div className="audit-health-overview-grid">
        {/* Overall Score Card */}
        <div className="audit-score-card">
          <div className="score-ring-circle">
            <span className="score-big-number">92</span>
            <span className="score-max-text">/ 100</span>
          </div>
          <div className="score-info-block">
            <h3 className="score-headline">Overall SEO Site Health</h3>
            <p className="score-subtext">Crawl analyzed 1,240 pages across indexed sitemaps. 148 automated technical checks passed.</p>
            <button
              type="button"
              className="btn-run-audit-big"
              disabled={isAuditing}
              onClick={onRunAudit}
            >
              <RefreshCw size={14} className={isAuditing ? 'spin' : ''} />
              <span>{isAuditing ? 'Executing Live Crawl...' : 'Re-Run Technical Audit'}</span>
            </button>
          </div>
        </div>

        {/* Severity Counts Cards */}
        <div className="audit-counts-grid">
          <div className="audit-count-box critical">
            <AlertOctagon size={18} />
            <span className="count-num">{criticalCount}</span>
            <span className="count-lbl">Critical Errors</span>
          </div>
          <div className="audit-count-box high">
            <AlertTriangle size={18} />
            <span className="count-num">{highCount}</span>
            <span className="count-lbl">High Warnings</span>
          </div>
          <div className="audit-count-box medium">
            <Zap size={18} />
            <span className="count-num">{mediumCount}</span>
            <span className="count-lbl">Medium Notices</span>
          </div>
          <div className="audit-count-box low">
            <CheckCircle2 size={18} />
            <span className="count-num">{lowCount}</span>
            <span className="count-lbl">Low Notices</span>
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="audit-categories-bar">
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`cat-pill-btn ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === 'all' ? 'All Audit Categories' : cat}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted">Showing {filteredIssues.length} issues</span>
      </div>

      {/* Issues List */}
      <div className="audit-issues-list">
        {filteredIssues.map((issue) => (
          <div key={issue.id} className="audit-issue-card">
            <div className="issue-header-row">
              <div className="flex items-center gap-2">
                {getSeverityBadge(issue.severity)}
                <span className="issue-cat-tag">{issue.category}</span>
                <span className="issue-client-tag">🏢 {issue.clientName}</span>
              </div>

              <button
                type="button"
                className="btn-resolve-issue"
                onClick={() => onResolveIssue(issue.id)}
              >
                <CheckCircle2 size={13} />
                <span>Mark Fixed & Verify</span>
              </button>
            </div>

            <h4 className="issue-title-text">{issue.title}</h4>

            <div className="issue-url-strip">
              <span className="text-xs text-muted font-semibold">Affected URL:</span>
              <a href={issue.url} target="_blank" rel="noreferrer" className="issue-url-link">
                <span>{issue.url}</span>
                <ExternalLink size={11} />
              </a>
            </div>

            <div className="issue-rec-box">
              <strong className="text-xs text-warning block mb-0.5">Recommended Technical Fix:</strong>
              <span className="text-xs text-white leading-relaxed">{issue.recommendation}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SEOAuditTab;
