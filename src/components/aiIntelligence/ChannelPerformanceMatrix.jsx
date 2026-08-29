import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  ArrowUpDown,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Zap,
} from 'lucide-react';

export function ChannelPerformanceMatrix({
  channels = [],
  onInvestigateChannel,
  loading = false,
}) {
  const [sortField, setSortField] = useState('revenue');
  const [sortAsc, setSortAsc] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  let list = [...channels];

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter((c) => c.channel.toLowerCase().includes(q));
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

  const getHealthBadge = (health) => {
    switch (health) {
      case 'Excellent':
        return (
          <span className="channel-health-badge excellent">
            <ShieldCheck size={11} /> Excellent
          </span>
        );
      case 'Healthy':
        return (
          <span className="channel-health-badge healthy">
            <Zap size={11} /> Healthy
          </span>
        );
      case 'Watch':
        return (
          <span className="channel-health-badge watch">
            <AlertTriangle size={11} /> Watch
          </span>
        );
      default:
        return (
          <span className="channel-health-badge critical">
            <AlertTriangle size={11} /> Critical
          </span>
        );
    }
  };

  return (
    <div className="channel-performance-matrix-card">
      {/* Header & Controls */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="channel-matrix-icon-badge">
            <BarChart3 size={17} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Omnichannel Acquisition &amp; Attribution Matrix
            </h3>
            <p className="text-xs text-muted">
              Cross-channel comparison of media spend efficiency, customer acquisition costs, conversion velocity, and ROAS
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="channel-search-box">
          <Search size={13} className="text-dim" />
          <input
            type="text"
            placeholder="Filter channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="channel-search-input"
          />
        </div>
      </div>

      {/* Table */}
      <div className="channel-matrix-table-wrap">
        <table className="channel-matrix-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('channel')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  <span>Marketing Channel</span>
                  <ArrowUpDown size={11} className="text-dim" />
                </div>
              </th>
              <th onClick={() => handleSort('spend')} className="cursor-pointer text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>Spend</span>
                  <ArrowUpDown size={11} className="text-dim" />
                </div>
              </th>
              <th onClick={() => handleSort('leads')} className="cursor-pointer text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>Leads</span>
                  <ArrowUpDown size={11} className="text-dim" />
                </div>
              </th>
              <th onClick={() => handleSort('qualifiedLeads')} className="cursor-pointer text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>Qualified</span>
                  <ArrowUpDown size={11} className="text-dim" />
                </div>
              </th>
              <th onClick={() => handleSort('customers')} className="cursor-pointer text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>Closed Wins</span>
                  <ArrowUpDown size={11} className="text-dim" />
                </div>
              </th>
              <th onClick={() => handleSort('revenue')} className="cursor-pointer text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>Attributed Revenue</span>
                  <ArrowUpDown size={11} className="text-dim" />
                </div>
              </th>
              <th onClick={() => handleSort('roas')} className="cursor-pointer text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>ROAS</span>
                  <ArrowUpDown size={11} className="text-dim" />
                </div>
              </th>
              <th onClick={() => handleSort('cpl')} className="cursor-pointer text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>CPL</span>
                  <ArrowUpDown size={11} className="text-dim" />
                </div>
              </th>
              <th onClick={() => handleSort('conversionRate')} className="cursor-pointer text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>Conv %</span>
                  <ArrowUpDown size={11} className="text-dim" />
                </div>
              </th>
              <th>Health</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id || c.channel} className="channel-table-row">
                {/* Channel Name with color dot */}
                <td>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color || '#3b82f6' }} />
                    <strong className="text-white text-xs">{c.channel}</strong>
                  </div>
                </td>

                {/* Spend */}
                <td className="text-right text-xs text-slate-300 font-semibold">
                  {c.spend === 0 ? '₹0 (Free)' : `₹${(c.spend || 0).toLocaleString()}`}
                </td>

                {/* Leads */}
                <td className="text-right text-xs text-white font-bold">
                  {(c.leads || 0).toLocaleString()}
                </td>

                {/* Qualified */}
                <td className="text-right text-xs text-cyan font-semibold">
                  {(c.qualifiedLeads || 0).toLocaleString()}
                </td>

                {/* Closed Deals */}
                <td className="text-right text-xs text-emerald-400 font-bold">
                  {(c.customers || 0).toLocaleString()}
                </td>

                {/* Attributed Revenue */}
                <td className="text-right text-xs text-warning font-extrabold">
                  ₹{(c.revenue || 0).toLocaleString()}
                </td>

                {/* ROAS */}
                <td className="text-right text-xs text-success font-extrabold">
                  {c.roas}
                </td>

                {/* CPL */}
                <td className="text-right text-xs text-slate-300">
                  {c.cpl}
                </td>

                {/* Conversion Rate */}
                <td className="text-right text-xs text-purple font-semibold">
                  {c.conversionRate}
                </td>

                {/* Health Badge */}
                <td>{getHealthBadge(c.health)}</td>

                {/* Action */}
                <td className="text-right">
                  <button
                    type="button"
                    className="btn-saas-secondary text-xs py-1 px-2"
                    onClick={() => onInvestigateChannel && onInvestigateChannel(c)}
                  >
                    <span>Investigate</span>
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

export default ChannelPerformanceMatrix;
