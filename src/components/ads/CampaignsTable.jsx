import React, { useState } from 'react';
import {
  TrendingUp,
  ArrowUpDown,
  ExternalLink,
  DollarSign,
  Play,
  Pause,
  Trash2,
  Edit3,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export function CampaignsTable({
  campaigns = [],
  onSelectCampaign,
  onToggleStatus,
  onDeleteCampaign,
  onQuickAdjustBudget,
}) {
  const [sortField, setSortField] = useState('spend');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedCampaigns = [...campaigns].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const getPlatformClass = (platform) => {
    const p = platform.toLowerCase();
    if (p.includes('meta')) return 'platform-meta';
    if (p.includes('google')) return 'platform-google';
    if (p.includes('linkedin')) return 'platform-linkedin';
    return 'platform-default';
  };

  const getRoasBadgeClass = (roas) => {
    if (roas >= 5.0) return 'roas-badge-high';
    if (roas >= 3.5) return 'roas-badge-good';
    return 'roas-badge-moderate';
  };

  return (
    <div className="ads-table-card">
      <div className="table-header-bar">
        <div className="table-title-group">
          <h3 className="table-main-heading">All Marketing Campaigns & Ad Sets</h3>
          <span className="table-records-count">{campaigns.length} Total Campaigns</span>
        </div>
      </div>

      <div className="ads-table-responsive">
        <table className="saas-table ads-performance-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('campaignName')} className="sortable-th">
                <div className="th-content">
                  <span>Campaign & Objective</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th>Client</th>
              <th>Network</th>
              <th>Status</th>
              <th onClick={() => handleSort('spend')} className="sortable-th">
                <div className="th-content">
                  <span>Spend</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th onClick={() => handleSort('leads')} className="sortable-th">
                <div className="th-content">
                  <span>Leads</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th onClick={() => handleSort('cpl')} className="sortable-th">
                <div className="th-content">
                  <span>CPL</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th>CTR</th>
              <th onClick={() => handleSort('revenue')} className="sortable-th">
                <div className="th-content">
                  <span>Revenue</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th onClick={() => handleSort('roas')} className="sortable-th">
                <div className="th-content">
                  <span>ROAS</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCampaigns.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-8 text-muted">
                  No ad campaigns match your current filters.
                </td>
              </tr>
            ) : (
              sortedCampaigns.map((camp) => {
                const isActive = camp.status === 'Active';
                return (
                  <tr key={camp.id} className="campaign-data-row">
                    {/* Campaign Name & Objective */}
                    <td>
                      <div className="campaign-name-cell">
                        <strong
                          className="campaign-title-link clickable"
                          onClick={() => onSelectCampaign(camp)}
                        >
                          {camp.campaignName}
                        </strong>
                        <div className="campaign-tags-row">
                          <span className="objective-pill">{camp.objective}</span>
                          <span className="budget-mini-text">
                            ${camp.dailyBudget}/day
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Client */}
                    <td>
                      <span className="campaign-client-name">🏢 {camp.clientName}</span>
                    </td>

                    {/* Platform */}
                    <td>
                      <span className={`ad-network-pill ${getPlatformClass(camp.platform)}`}>
                        {camp.platform}
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td>
                      <button
                        type="button"
                        className={`status-toggle-btn ${isActive ? 'active' : 'paused'}`}
                        onClick={() => onToggleStatus(camp.id, isActive ? 'Paused' : 'Active')}
                        title={`Click to ${isActive ? 'Pause' : 'Activate'} Campaign`}
                      >
                        {isActive ? <Play size={10} /> : <Pause size={10} />}
                        <span>{camp.status}</span>
                      </button>
                    </td>

                    {/* Spend */}
                    <td>
                      <strong className="spend-number">{formatCurrency(camp.spend)}</strong>
                    </td>

                    {/* Leads */}
                    <td>
                      <span className="leads-number">{camp.leads}</span>
                    </td>

                    {/* CPL */}
                    <td>
                      <span className="cpl-number">${camp.cpl ? camp.cpl.toFixed(2) : '0.00'}</span>
                    </td>

                    {/* CTR */}
                    <td>
                      <span className="ctr-number">{camp.ctr}</span>
                    </td>

                    {/* Revenue */}
                    <td>
                      <strong className="revenue-number text-success">
                        {formatCurrency(camp.revenue)}
                      </strong>
                    </td>

                    {/* ROAS */}
                    <td>
                      <span className={`roas-metric-pill ${getRoasBadgeClass(camp.roas)}`}>
                        <TrendingUp size={11} /> {camp.roas ? camp.roas.toFixed(2) : '0.00'}x
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="table-actions-cell">
                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() => onSelectCampaign(camp)}
                          title="Inspect Campaign Details & Funnel"
                        >
                          <ExternalLink size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() => onQuickAdjustBudget(camp)}
                          title="Adjust Daily Budget"
                        >
                          <DollarSign size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-table-action danger"
                          onClick={() => onDeleteCampaign(camp.id)}
                          title="Delete Campaign"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CampaignsTable;
