import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ExternalLink,
  Trash2,
  Filter,
  Plus,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function KeywordRankingsTab({
  keywords = [],
  intentFilter,
  onIntentFilterChange,
  statusFilter,
  onStatusFilterChange,
  posRangeFilter,
  onPosRangeFilterChange,
  onDeleteKeyword,
  onOpenAddKeywordModal,
}) {
  const getChangeBadge = (change, status) => {
    if (status === 'New') {
      return <span className="rank-change-chip new">✨ NEW</span>;
    }
    if (status === 'Lost') {
      return <span className="rank-change-chip lost">⚠️ LOST</span>;
    }
    if (change > 0) {
      return (
        <span className="rank-change-chip positive">
          <TrendingUp size={12} /> +{change}
        </span>
      );
    }
    if (change < 0) {
      return (
        <span className="rank-change-chip negative">
          <TrendingDown size={12} /> {change}
        </span>
      );
    }
    return (
      <span className="rank-change-chip neutral">
        <Minus size={12} /> 0
      </span>
    );
  };

  const getIntentBadge = (intent) => {
    if (intent === 'Transactional') return <Badge variant="success" size="sm">💰 {intent}</Badge>;
    if (intent === 'Commercial') return <Badge variant="primary" size="sm">🔍 {intent}</Badge>;
    return <Badge variant="neutral" size="sm">ℹ️ {intent}</Badge>;
  };

  const getKdColor = (kd) => {
    if (kd >= 60) return '#ef4444';
    if (kd >= 40) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="seo-rankings-pane">
      {/* Sub-Filters Row */}
      <div className="rankings-filter-bar">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Intent Filter */}
          <div className="seo-mini-select-wrap">
            <span className="mini-label">Intent:</span>
            <select
              value={intentFilter}
              onChange={(e) => onIntentFilterChange(e.target.value)}
              className="seo-mini-select"
            >
              <option value="all">All Intents</option>
              <option value="Commercial">Commercial</option>
              <option value="Transactional">Transactional</option>
              <option value="Informational">Informational</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="seo-mini-select-wrap">
            <span className="mini-label">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="seo-mini-select"
            >
              <option value="all">All Statuses</option>
              <option value="Rising">🟢 Rising</option>
              <option value="Stable">⚪ Stable</option>
              <option value="Falling">🔴 Falling</option>
              <option value="New">✨ New</option>
              <option value="Lost">⚠️ Lost</option>
            </select>
          </div>

          {/* Position Range Filter */}
          <div className="seo-mini-select-wrap">
            <span className="mini-label">Range:</span>
            <select
              value={posRangeFilter}
              onChange={(e) => onPosRangeFilterChange(e.target.value)}
              className="seo-mini-select"
            >
              <option value="all">All Positions</option>
              <option value="top3">🏆 Top 3 (Positions 1-3)</option>
              <option value="top10">🥇 Page 1 (Positions 1-10)</option>
              <option value="page2">🥈 Page 2 (Positions 11-20)</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-muted">
          Showing <strong>{keywords.length}</strong> tracked keywords
        </div>
      </div>

      {/* Keywords Table */}
      {keywords.length === 0 ? (
        <div className="seo-empty-state-card">
          <TrendingUp size={36} className="empty-icon-muted" />
          <h4 className="empty-state-title">No tracked keywords match filters</h4>
          <p className="empty-state-subtitle">Adjust your filter parameters or track new target search terms.</p>
          <button
            type="button"
            className="btn-seo-primary mt-2"
            onClick={onOpenAddKeywordModal}
          >
            <Plus size={15} />
            <span>Track New Keyword</span>
          </button>
        </div>
      ) : (
        <div className="seo-table-card">
          <div className="seo-table-scroll">
            <table className="seo-data-table">
              <thead>
                <tr>
                  <th>Keyword / Target</th>
                  <th>Client Workspace</th>
                  <th>Monthly Volume</th>
                  <th>Difficulty (KD)</th>
                  <th>Current SERP</th>
                  <th>Change</th>
                  <th>Search Intent</th>
                  <th>SERP Features</th>
                  <th>Ranking URL</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((kw) => (
                  <tr key={kw.id} className="seo-table-row">
                    <td>
                      <strong className="keyword-title-text">{kw.keyword}</strong>
                      <span className="keyword-check-time">Checked {kw.lastChecked}</span>
                    </td>
                    <td>
                      <span className="seo-client-badge">🏢 {kw.clientName}</span>
                    </td>
                    <td>
                      <span className="volume-number">{kw.volume.toLocaleString()} / mo</span>
                    </td>
                    <td>
                      <div className="kd-bar-wrapper">
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: getKdColor(kw.difficulty), fontWeight: 700 }}>
                            {kw.difficulty}%
                          </span>
                        </div>
                        <div className="kd-progress-bg">
                          <div
                            className="kd-progress-fill"
                            style={{
                              width: `${kw.difficulty}%`,
                              backgroundColor: getKdColor(kw.difficulty),
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="serp-position-display">
                        <span className={`position-badge ${kw.position <= 3 ? 'top3' : kw.position <= 10 ? 'top10' : ''}`}>
                          #{kw.position > 0 ? kw.position : '—'}
                        </span>
                        {kw.previousPosition > 0 && (
                          <span className="prev-pos-sub">Prev: #{kw.previousPosition}</span>
                        )}
                      </div>
                    </td>
                    <td>{getChangeBadge(kw.change, kw.status)}</td>
                    <td>{getIntentBadge(kw.intent)}</td>
                    <td>
                      <span className="serp-features-tag">{kw.serpFeature}</span>
                    </td>
                    <td>
                      <a
                        href={kw.url}
                        target="_blank"
                        rel="noreferrer"
                        className="ranking-url-link"
                        title={kw.url}
                      >
                        <span>{kw.url.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink size={11} />
                      </a>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="btn-table-delete-icon"
                        onClick={() => onDeleteKeyword(kw.id)}
                        title="Remove keyword"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default KeywordRankingsTab;
