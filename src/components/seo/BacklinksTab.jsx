import React, { useState } from 'react';
import { Link2, ShieldAlert, CheckCircle2, ExternalLink, Globe, ArrowUpRight } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function BacklinksTab({
  backlinks = [],
}) {
  const [statusFilter, setStatusFilter] = useState('all');

  const total = backlinks.length;
  const activeCount = backlinks.filter((b) => b.status === 'Active').length;
  const newCount = backlinks.filter((b) => b.status === 'New').length;
  const lostCount = backlinks.filter((b) => b.status === 'Lost').length;
  const toxicCount = backlinks.filter((b) => b.status === 'Toxic').length;

  const filteredBacklinks = backlinks.filter((b) => {
    if (statusFilter === 'all') return true;
    return b.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const getStatusBadge = (status) => {
    if (status === 'Active') return <Badge variant="success" size="sm">✓ Active</Badge>;
    if (status === 'New') return <Badge variant="primary" size="sm">✨ New</Badge>;
    if (status === 'Toxic') return <Badge variant="danger" size="sm">🚨 Toxic</Badge>;
    return <Badge variant="neutral" size="sm">⚠️ Lost</Badge>;
  };

  return (
    <div className="seo-backlinks-pane">
      {/* Summary KPI Cards */}
      <div className="backlinks-kpi-grid">
        <div className="bl-kpi-card">
          <div className="flex justify-between items-center text-xs text-muted">
            <span>Total Backlinks</span>
            <Link2 size={15} className="text-primary" />
          </div>
          <strong className="bl-kpi-num">12,480 Links</strong>
          <span className="text-xs text-success">+18.4% Velocity</span>
        </div>

        <div className="bl-kpi-card">
          <div className="flex justify-between items-center text-xs text-muted">
            <span>Referring Domains</span>
            <Globe size={15} className="text-cyan" />
          </div>
          <strong className="bl-kpi-num">1,420 Domains</strong>
          <span className="text-xs text-success">Avg DA 68</span>
        </div>

        <div className="bl-kpi-card">
          <div className="flex justify-between items-center text-xs text-muted">
            <span>New Links (30d)</span>
            <ArrowUpRight size={15} className="text-success" />
          </div>
          <strong className="bl-kpi-num">+{newCount || 148} Links</strong>
          <span className="text-xs text-success">High Editorial Quality</span>
        </div>

        <div className="bl-kpi-card">
          <div className="flex justify-between items-center text-xs text-muted">
            <span>Lost Backlinks</span>
            <Link2 size={15} className="text-muted" />
          </div>
          <strong className="bl-kpi-num">-{lostCount || 12} Links</strong>
          <span className="text-xs text-muted">Low Impact</span>
        </div>

        <div className="bl-kpi-card">
          <div className="flex justify-between items-center text-xs text-muted">
            <span>Toxic Spam Links</span>
            <ShieldAlert size={15} className="text-danger" />
          </div>
          <strong className="bl-kpi-num text-danger">{toxicCount || 1} Flagged</strong>
          <span className="text-xs text-danger">Disavow Recommended</span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="backlinks-filter-row">
        <div className="flex items-center gap-2">
          {['all', 'Active', 'New', 'Lost', 'Toxic'].map((st) => (
            <button
              key={st}
              type="button"
              className={`cat-pill-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st === 'all' ? 'All Backlinks' : st}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted">Showing {filteredBacklinks.length} backlink records</span>
      </div>

      {/* Backlinks Table */}
      <div className="seo-table-card">
        <div className="seo-table-scroll">
          <table className="seo-data-table">
            <thead>
              <tr>
                <th>Referring Domain</th>
                <th>Domain Authority</th>
                <th>Target URL</th>
                <th>Anchor Text</th>
                <th>Link Type</th>
                <th>First Seen</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBacklinks.map((bl) => (
                <tr key={bl.id} className="seo-table-row">
                  <td>
                    <strong className="text-white block text-sm">{bl.referringDomain}</strong>
                    <span className="text-xs text-muted">🏢 {bl.clientName}</span>
                  </td>
                  <td>
                    <span className="da-score-pill">DA {bl.domainAuthority}</span>
                  </td>
                  <td>
                    <a
                      href={bl.targetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ranking-url-link"
                    >
                      <span>{bl.targetUrl.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink size={11} />
                    </a>
                  </td>
                  <td>
                    <span className="anchor-text-box">"{bl.anchorText}"</span>
                  </td>
                  <td>
                    <span className={`link-type-chip ${bl.linkType.toLowerCase()}`}>
                      {bl.linkType}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-muted">{bl.firstSeen}</span>
                  </td>
                  <td>{getStatusBadge(bl.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BacklinksTab;
