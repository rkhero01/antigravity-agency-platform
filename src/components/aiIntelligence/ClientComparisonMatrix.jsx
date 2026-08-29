import React, { useState } from 'react';
import {
  Users,
  Search,
  ArrowUpDown,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';

export function ClientComparisonMatrix({
  clients = [],
  onSelectClient,
  loading = false,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortField, setSortField] = useState('revenue');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  let list = [...clients];

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(
      (c) =>
        c.clientName.toLowerCase().includes(q) ||
        (c.industry && c.industry.toLowerCase().includes(q))
    );
  }

  if (riskFilter !== 'all') {
    list = list.filter(
      (c) => (c.overallRisk || 'LOW').toLowerCase() === riskFilter.toLowerCase()
    );
  }

  list.sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === 'string' && valA.includes('x')) {
      valA = parseFloat(valA);
      valB = parseFloat(valB);
    } else if (typeof valA === 'string' && valA.includes('%')) {
      valA = parseFloat(valA);
      valB = parseFloat(valB);
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const getRiskBadge = (risk) => {
    switch (risk?.toUpperCase()) {
      case 'LOW':
        return <span className="risk-level-badge low">LOW</span>;
      case 'MEDIUM':
        return <span className="risk-level-badge medium">MEDIUM</span>;
      case 'HIGH':
        return <span className="risk-level-badge high">HIGH</span>;
      default:
        return <span className="risk-level-badge low">LOW</span>;
    }
  };

  return (
    <div className="client-comparison-matrix-card">
      {/* Header & Filter Controls */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="client-comp-icon-badge">
            <Users size={17} className="text-cyan" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Comprehensive Client Portfolio Comparison
            </h3>
            <p className="text-xs text-muted">
              Side-by-side benchmark of account health, MRR, attributed sales volume, conversion efficiency, and pipeline weights
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="channel-search-box">
            <Search size={13} className="text-dim" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="channel-search-input"
            />
          </div>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="filter-select-input text-xs"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk Only</option>
            <option value="medium">Medium Risk Only</option>
            <option value="high">High Risk Only</option>
          </select>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="channel-matrix-table-wrap">
        <table className="channel-matrix-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('clientName')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  <span>Client Account</span>
                  <ArrowUpDown size={11} className="text-dim" />
                </div>
              </th>
              <th onClick={() => handleSort('healthScore')} className="cursor-pointer text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>Health</span>
                  <ArrowUpDown size={11} className="text-dim" />
                </div>
              </th>
              <th onClick={() => handleSort('mrr')} className="cursor-pointer text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>MRR</span>
                  <ArrowUpDown size={11} className="text-dim" />
                </div>
              </th>
              <th onClick={() => handleSort('revenue')} className="cursor-pointer text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>Attributed Sales</span>
                  <ArrowUpDown size={11} className="text-dim" />
                </div>
              </th>
              <th onClick={() => handleSort('leadVolume')} className="cursor-pointer text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>Leads</span>
                  <ArrowUpDown size={11} className="text-dim" />
                </div>
              </th>
              <th onClick={() => handleSort('conversionRate')} className="cursor-pointer text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>Conv %</span>
                  <ArrowUpDown size={11} className="text-dim" />
                </div>
              </th>
              <th onClick={() => handleSort('blendedROAS')} className="cursor-pointer text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>ROAS</span>
                  <ArrowUpDown size={11} className="text-dim" />
                </div>
              </th>
              <th onClick={() => handleSort('growthTrend')} className="cursor-pointer text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>Growth</span>
                  <ArrowUpDown size={11} className="text-dim" />
                </div>
              </th>
              <th>Risk Level</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.clientId} className="channel-table-row">
                {/* Client Name & Industry */}
                <td>
                  <div>
                    <strong className="text-white text-xs block">{c.clientName}</strong>
                    <span className="text-[10px] text-dim">{c.industry}</span>
                  </div>
                </td>

                {/* Health Score */}
                <td className="text-right text-xs font-bold text-success">
                  {c.healthScore}/100
                </td>

                {/* MRR */}
                <td className="text-right text-xs text-slate-300 font-semibold">
                  ₹{(c.mrr || 25000).toLocaleString()}
                </td>

                {/* Attributed Revenue */}
                <td className="text-right text-xs text-warning font-extrabold">
                  ₹{(c.revenue || 0).toLocaleString()}
                </td>

                {/* Leads */}
                <td className="text-right text-xs text-white font-bold">
                  {(c.leadVolume || 0).toLocaleString()}
                </td>

                {/* Conversion Rate */}
                <td className="text-right text-xs text-purple font-bold">
                  {c.conversionRate}
                </td>

                {/* ROAS */}
                <td className="text-right text-xs text-emerald-400 font-bold">
                  {c.blendedROAS}
                </td>

                {/* Growth */}
                <td className="text-right text-xs text-success font-bold">
                  {c.growthTrend}
                </td>

                {/* Risk */}
                <td>{getRiskBadge(c.overallRisk)}</td>

                {/* Action */}
                <td className="text-right">
                  <button
                    type="button"
                    className="btn-saas-secondary text-xs py-1 px-2"
                    onClick={() => onSelectClient && onSelectClient(c.clientId)}
                    title="Focus Client in Intelligence Center"
                  >
                    <span>View</span>
                    <ExternalLink size={10} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClientComparisonMatrix;
