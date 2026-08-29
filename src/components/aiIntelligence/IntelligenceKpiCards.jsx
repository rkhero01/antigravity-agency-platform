import React from 'react';
import {
  Users,
  Megaphone,
  UserCheck,
  TrendingUp,
  Award,
  DollarSign,
  Receipt,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
} from 'lucide-react';

export function IntelligenceKpiCards({
  agencyOverview = {},
  selectedClientData = null,
  loading = false,
}) {
  const isIndividual = Boolean(selectedClientData);

  const cards = [
    {
      id: 'clients',
      label: isIndividual ? 'Client Account' : 'Total Client Accounts',
      value: isIndividual ? selectedClientData.clientName : `${agencyOverview.totalClients || 7} Clients`,
      change: isIndividual ? selectedClientData.growthTrend : '+18.4% MoM',
      isPositive: true,
      context: isIndividual ? selectedClientData.industry : 'Active portfolio workspaces',
      icon: Users,
      colorClass: 'text-primary',
    },
    {
      id: 'campaigns',
      label: isIndividual ? 'Top Channel' : 'Active Cross-Channel Campaigns',
      value: isIndividual ? selectedClientData.topChannel : `${agencyOverview.activeCampaigns || 24} Campaigns`,
      change: '100% On-Target',
      isPositive: true,
      context: isIndividual ? 'Primary acquisition driver' : 'Meta, Google, WhatsApp, SEO',
      icon: Megaphone,
      colorClass: 'text-pink',
    },
    {
      id: 'leads',
      label: 'Pipeline Leads Captured',
      value: isIndividual ? (selectedClientData.leadVelocity || '18.5 leads/day') : (agencyOverview.totalLeadsThisMonth || 4820).toLocaleString(),
      change: '+33.3% MoM',
      isPositive: true,
      context: isIndividual ? 'Daily acquisition velocity' : 'Multi-channel qualified leads',
      icon: UserCheck,
      colorClass: 'text-cyan',
    },
    {
      id: 'roas',
      label: 'Blended Performance ROAS',
      value: isIndividual ? selectedClientData.blendedROAS : (agencyOverview.blendedROAS || '4.85x'),
      change: '+0.85x vs Q2',
      isPositive: true,
      context: 'Calculated return on ad spend',
      icon: TrendingUp,
      colorClass: 'text-success',
    },
    {
      id: 'conversion',
      label: 'Lead-to-Won Conversion',
      value: agencyOverview.avgConversionRate || '28.4%',
      change: '+5.2% Lift',
      isPositive: true,
      context: 'Sales close win rate',
      icon: Award,
      colorClass: 'text-purple',
    },
    {
      id: 'revenue',
      label: 'Attributed Sales Revenue',
      value: isIndividual ? `₹${(selectedClientData.revenue || 0).toLocaleString()}` : `₹${(agencyOverview.totalRevenueAttributed || 12840000).toLocaleString()}`,
      change: '+29.5% Growth',
      isPositive: true,
      context: 'Direct multi-channel sales',
      icon: DollarSign,
      colorClass: 'text-warning',
      isHighlight: true,
    },
    {
      id: 'mrr',
      label: 'Monthly Retainer MRR',
      value: isIndividual ? `Spend: ₹${(selectedClientData.spend || 0).toLocaleString()}` : `₹${(agencyOverview.totalMRR || 184500).toLocaleString()} MRR`,
      change: '+14.0% Retainer',
      isPositive: true,
      context: isIndividual ? 'Monthly ad spend' : 'Agency contracted billing',
      icon: Receipt,
      colorClass: 'text-cyan',
    },
    {
      id: 'health',
      label: 'Business Health Index',
      value: isIndividual ? `${selectedClientData.healthScore || 92} / 100` : `${agencyOverview.overallHealthScore || 92} / 100`,
      change: '+4 pts',
      isPositive: true,
      context: 'AI multidimensional diagnostic',
      icon: Activity,
      colorClass: 'text-success',
      isHighlightScore: true,
    },
  ];

  if (loading) {
    return (
      <div className="intelligence-kpi-grid">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="intelligence-kpi-card skeleton-card">
            <div className="skeleton-line w-24 h-3 mb-2" />
            <div className="skeleton-line w-32 h-6 mb-2" />
            <div className="skeleton-line w-20 h-3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="intelligence-kpi-grid">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            className={`intelligence-kpi-card ${card.isHighlight ? 'highlight-revenue' : ''} ${card.isHighlightScore ? 'highlight-score' : ''}`}
          >
            <div className="flex justify-between items-start mb-1.5">
              <span className="intelligence-kpi-lbl">{card.label}</span>
              <div className="intelligence-kpi-icon-pill">
                <Icon size={13} className={card.colorClass} />
              </div>
            </div>

            <div className="intelligence-kpi-val-row">
              <strong className="intelligence-kpi-val truncate" title={card.value}>
                {card.value}
              </strong>
            </div>

            <div className="intelligence-kpi-sub-row">
              <span className={`intelligence-change-pill ${card.isPositive ? 'positive' : 'negative'}`}>
                {card.isPositive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                <span>{card.change}</span>
              </span>
              <span className="intelligence-context-text truncate">{card.context}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default IntelligenceKpiCards;
