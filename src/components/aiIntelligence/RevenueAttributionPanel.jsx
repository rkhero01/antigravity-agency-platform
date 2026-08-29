import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  PieChart,
  Award,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  Layers,
} from 'lucide-react';

export function RevenueAttributionPanel({
  revenueData = {},
  loading = false,
}) {
  const [activeTab, setActiveTab] = useState('channel');

  const {
    totalAttributedRevenue = 12840000,
    totalAgencyPipelineValue = 18450000,
    monthlyRecurringBillingMRR = 1450000,
    byChannel = [],
    byClient = [],
    byLeadSource = [],
    highlights = {
      highestRevenueChannel: 'Meta Click-to-WhatsApp (₹4,650,000, 36.2% share)',
      highestRoasChannel: 'WhatsApp Direct Broadcasts (21.8x ROAS)',
      highestGrowthChannel: 'Instagram Direct & Reels (+19.8% MoM)',
      weakestChannel: 'SMS Flash VIP Broadcasts (5.5x ROAS, 0.8% share)',
    },
  } = revenueData;

  return (
    <div className="revenue-attribution-panel-card">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="revenue-attr-icon-badge">
            <DollarSign size={17} className="text-warning" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Multitouch Revenue Attribution &amp; Financial Efficiency
            </h3>
            <p className="text-xs text-muted">
              Attributed gross sales, customer acquisition cost (CAC), return on ad spend (ROAS), and contribution margin
            </p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="timeframe-switch" role="group" aria-label="Attribution View">
          <button
            type="button"
            className={`timeframe-btn ${activeTab === 'channel' ? 'active' : ''}`}
            onClick={() => setActiveTab('channel')}
          >
            By Channel
          </button>
          <button
            type="button"
            className={`timeframe-btn ${activeTab === 'client' ? 'active' : ''}`}
            onClick={() => setActiveTab('client')}
          >
            By Client
          </button>
          <button
            type="button"
            className={`timeframe-btn ${activeTab === 'source' ? 'active' : ''}`}
            onClick={() => setActiveTab('source')}
          >
            By Lead Source
          </button>
        </div>
      </div>

      {/* 4 Financial Efficiency Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
        <div className="revenue-highlight-box top-rev">
          <span className="text-[10px] text-dim block uppercase font-bold">Top Revenue Driver</span>
          <strong className="text-xs text-white font-bold block mt-0.5">{highlights.highestRevenueChannel}</strong>
        </div>

        <div className="revenue-highlight-box top-roas">
          <span className="text-[10px] text-dim block uppercase font-bold">Highest Efficiency</span>
          <strong className="text-xs text-success font-bold block mt-0.5">{highlights.highestRoasChannel}</strong>
        </div>

        <div className="revenue-highlight-box top-growth">
          <span className="text-[10px] text-dim block uppercase font-bold">Fastest Growth Velocity</span>
          <strong className="text-xs text-cyan font-bold block mt-0.5">{highlights.highestGrowthChannel}</strong>
        </div>

        <div className="revenue-highlight-box weakest">
          <span className="text-[10px] text-dim block uppercase font-bold">Lowest Efficiency Target</span>
          <strong className="text-xs text-warning font-bold block mt-0.5">{highlights.weakestChannel}</strong>
        </div>
      </div>

      {/* Tab Content Display */}
      {activeTab === 'channel' && (
        <div className="attribution-breakdown-table-wrap">
          <table className="attribution-breakdown-table">
            <thead>
              <tr>
                <th>Channel Name</th>
                <th className="text-right">Attributed Revenue</th>
                <th className="text-right">Media Spend</th>
                <th className="text-right">ROAS</th>
                <th className="text-right">Blended CAC</th>
                <th className="text-right">Contribution %</th>
                <th>Revenue Share</th>
              </tr>
            </thead>
            <tbody>
              {byChannel.map((item, idx) => (
                <tr key={idx} className="attr-table-row">
                  <td>
                    <strong className="text-white text-xs">{item.channel}</strong>
                  </td>
                  <td className="text-right text-xs text-warning font-extrabold">
                    ₹{(item.revenue || 0).toLocaleString()}
                  </td>
                  <td className="text-right text-xs text-slate-300">
                    ₹{(item.spend || 0).toLocaleString()}
                  </td>
                  <td className="text-right text-xs text-success font-bold">
                    {item.roas}
                  </td>
                  <td className="text-right text-xs text-cyan font-semibold">
                    {item.cac}
                  </td>
                  <td className="text-right text-xs text-white font-bold">
                    {item.contributionPct}
                  </td>
                  <td className="w-32">
                    <div className="attribution-share-track">
                      <div
                        className="attribution-share-fill"
                        style={{ width: item.contributionPct }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'client' && (
        <div className="attribution-breakdown-table-wrap">
          <table className="attribution-breakdown-table">
            <thead>
              <tr>
                <th>Client Workspace</th>
                <th className="text-right">Attributed Revenue</th>
                <th className="text-right">Ad Spend</th>
                <th className="text-right">Blended ROAS</th>
                <th className="text-right">Revenue Share</th>
                <th>Portfolio Weight</th>
              </tr>
            </thead>
            <tbody>
              {byClient.map((item, idx) => (
                <tr key={idx} className="attr-table-row">
                  <td>
                    <strong className="text-white text-xs">{item.clientName}</strong>
                  </td>
                  <td className="text-right text-xs text-warning font-extrabold">
                    ₹{(item.revenue || 0).toLocaleString()}
                  </td>
                  <td className="text-right text-xs text-slate-300">
                    ₹{(item.spend || 0).toLocaleString()}
                  </td>
                  <td className="text-right text-xs text-success font-bold">
                    {item.roas}
                  </td>
                  <td className="text-right text-xs text-white font-bold">
                    {item.contributionPct}
                  </td>
                  <td className="w-32">
                    <div className="attribution-share-track">
                      <div
                        className="attribution-share-fill"
                        style={{ width: item.contributionPct }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'source' && (
        <div className="attribution-breakdown-table-wrap">
          <table className="attribution-breakdown-table">
            <thead>
              <tr>
                <th>Inbound Lead Source</th>
                <th className="text-right">Gross Attributed Revenue</th>
                <th className="text-right">Leads Ingested</th>
                <th className="text-right">Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {byLeadSource.map((item, idx) => (
                <tr key={idx} className="attr-table-row">
                  <td>
                    <strong className="text-white text-xs">{item.source}</strong>
                  </td>
                  <td className="text-right text-xs text-warning font-extrabold">
                    ₹{(item.revenue || 0).toLocaleString()}
                  </td>
                  <td className="text-right text-xs text-white font-bold">
                    {(item.leads || 0).toLocaleString()}
                  </td>
                  <td className="text-right text-xs text-purple font-bold">
                    {item.conversionRate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RevenueAttributionPanel;
