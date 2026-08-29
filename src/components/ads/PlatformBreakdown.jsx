import React from 'react';
import { Layers, TrendingUp, Target, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export function PlatformBreakdown({ campaigns = [] }) {
  const networks = [
    { id: 'meta', name: 'Meta Ads (FB & IG)', color: '#0668E1' },
    { id: 'google-ads', name: 'Google Search & PMax', color: '#4285F4' },
    { id: 'linkedin', name: 'LinkedIn Sponsored Content', color: '#0A66C2' },
  ];

  const totalPortfolioSpend = campaigns.reduce((acc, c) => acc + (c.spend || 0), 0) || 1;

  const networkStats = networks.map((net) => {
    const netCampaigns = campaigns.filter(
      (c) => c.network === net.id || c.platform.toLowerCase().includes(net.id)
    );

    const spend = netCampaigns.reduce((acc, c) => acc + (c.spend || 0), 0);
    const revenue = netCampaigns.reduce((acc, c) => acc + (c.revenue || 0), 0);
    const leads = netCampaigns.reduce((acc, c) => acc + (c.leads || 0), 0);
    const roas = spend > 0 ? (revenue / spend).toFixed(2) : '0.00';
    const cpl = leads > 0 ? (spend / leads).toFixed(2) : '0.00';
    const sharePercent = Math.round((spend / totalPortfolioSpend) * 100);

    return {
      ...net,
      campaignsCount: netCampaigns.length,
      spend,
      revenue,
      leads,
      roas,
      cpl,
      sharePercent,
    };
  });

  return (
    <div className="ads-platforms-breakdown-card">
      <div className="breakdown-header">
        <div className="breakdown-title-box">
          <Layers size={16} className="text-primary" />
          <h3 className="breakdown-title">Network Allocation & ROAS Share</h3>
        </div>
        <span className="breakdown-subtext">3 Ad Networks Connected</span>
      </div>

      <div className="networks-list-container">
        {networkStats.map((item) => (
          <div key={item.id} className="network-item-card">
            <div className="network-item-top">
              <div className="network-brand-info">
                <span className="network-dot" style={{ background: item.color }} />
                <strong className="network-name">{item.name}</strong>
                <span className="campaign-count-pill">{item.campaignsCount} Campaigns</span>
              </div>
              <div className="network-roas-badge">
                <TrendingUp size={12} />
                <span>{item.roas}x ROAS</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="network-budget-track">
              <div
                className="network-budget-fill"
                style={{ width: `${item.sharePercent}%`, background: item.color }}
              />
            </div>

            <div className="network-metrics-row">
              <div className="net-metric">
                <span className="label">Spend:</span>
                <strong>{formatCurrency(item.spend)} ({item.sharePercent}%)</strong>
              </div>
              <div className="net-metric">
                <span className="label">Leads:</span>
                <strong>{item.leads}</strong>
              </div>
              <div className="net-metric">
                <span className="label">Avg CPL:</span>
                <strong>${item.cpl}</strong>
              </div>
              <div className="net-metric">
                <span className="label">Revenue:</span>
                <strong className="text-success">{formatCurrency(item.revenue)}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlatformBreakdown;
