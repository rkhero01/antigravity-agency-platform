import React, { useState } from 'react';
import {
  Building,
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  UserCheck,
  Award,
  Globe,
  MessageSquare,
  Mail,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from 'lucide-react';

export function ClientIntelligencePanel({
  clients = [],
  selectedClientId = 'all',
  onSelectClient,
  loading = false,
}) {
  const [activeClientTab, setActiveClientTab] = useState(
    selectedClientId === 'all' && clients.length > 0 ? clients[0]?.clientId : selectedClientId
  );

  const currentClient =
    clients.find((c) => (c.clientId || c.id) === (selectedClientId !== 'all' ? selectedClientId : activeClientTab)) ||
    clients[0];

  if (loading || !currentClient) {
    return (
      <div className="client-intelligence-panel-card skeleton-card h-80" />
    );
  }

  return (
    <div className="client-intelligence-panel-card">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="client-intel-icon-badge">
            <Building size={17} className="text-cyan" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Client Workspace Intelligence Dossier
            </h3>
            <p className="text-xs text-muted">
              Deep operational performance diagnostics, channel affinity, retention health, and revenue velocity per client account
            </p>
          </div>
        </div>

        {/* Client Workspace Pills */}
        <div className="client-pills-row flex items-center gap-1.5 flex-wrap">
          {clients.map((c) => {
            const cid = c.clientId || c.id;
            const isActive = cid === currentClient.clientId;
            return (
              <button
                key={cid}
                type="button"
                className={`client-filter-chip ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveClientTab(cid);
                  if (onSelectClient) onSelectClient(cid);
                }}
              >
                <span>{c.clientName}</span>
                <span className="chip-score-badge">{c.healthScore}%</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dossier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Client Summary & Health Overview (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="client-hero-box">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] text-dim uppercase font-bold tracking-wider">
                  {currentClient.industry}
                </span>
                <h4 className="text-base font-extrabold text-white">{currentClient.clientName}</h4>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-success/10 border border-success/20 text-success text-xs font-bold">
                <ShieldCheck size={12} />
                <span>Health: {currentClient.healthScore}/100</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/6 flex justify-between items-center text-xs">
              <span className="text-dim">Monthly Retainer MRR:</span>
              <strong className="text-white font-bold">
                ₹{(currentClient.mrr || 28000).toLocaleString()}
              </strong>
            </div>

            <div className="mt-2 flex justify-between items-center text-xs">
              <span className="text-dim">Primary Acquisition Channel:</span>
              <span className="text-cyan font-semibold truncate max-w-[180px]">
                {currentClient.topChannel}
              </span>
            </div>

            <div className="mt-2 flex justify-between items-center text-xs">
              <span className="text-dim">Audience Growth Pacing:</span>
              <span className="text-success font-bold flex items-center gap-0.5">
                <ArrowUpRight size={12} />
                {currentClient.growthTrend}
              </span>
            </div>
          </div>

          {/* Strengths & Risk Factors */}
          <div className="strengths-risks-box">
            <div className="mb-2.5">
              <span className="text-[11px] font-bold text-success flex items-center gap-1 mb-1">
                <ShieldCheck size={12} /> Core Account Strengths:
              </span>
              <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                {(currentClient.strengths || []).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-white/6">
              <span className="text-[11px] font-bold text-warning flex items-center gap-1 mb-1">
                <AlertTriangle size={12} /> Friction &amp; Risk Factors:
              </span>
              <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                {(currentClient.riskFactors || []).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: 8 Operational Deep-Dive Metric Cards (8 cols) */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. Attributed Revenue */}
            <div className="client-metric-stat-card">
              <div className="flex justify-between items-center mb-1">
                <span className="stat-lbl">Attributed Sales</span>
                <DollarSign size={13} className="text-warning" />
              </div>
              <strong className="stat-val">₹{(currentClient.revenue || 0).toLocaleString()}</strong>
              <div className="stat-delta positive">
                <ArrowUpRight size={10} />
                <span>+24.8% vs prev</span>
              </div>
            </div>

            {/* 2. Ad Spend & ROAS */}
            <div className="client-metric-stat-card">
              <div className="flex justify-between items-center mb-1">
                <span className="stat-lbl">Ad Spend &amp; ROAS</span>
                <TrendingUp size={13} className="text-success" />
              </div>
              <strong className="stat-val">{currentClient.blendedROAS}</strong>
              <span className="stat-sub">Spend: ₹{(currentClient.spend || 0).toLocaleString()}</span>
            </div>

            {/* 3. Lead Volume */}
            <div className="client-metric-stat-card">
              <div className="flex justify-between items-center mb-1">
                <span className="stat-lbl">Lead Volume</span>
                <UserCheck size={13} className="text-cyan" />
              </div>
              <strong className="stat-val">{(currentClient.leadVolume || 0).toLocaleString()}</strong>
              <div className="stat-delta positive">
                <ArrowUpRight size={10} />
                <span>{currentClient.leadVelocity}</span>
              </div>
            </div>

            {/* 4. Qualification Rate */}
            <div className="client-metric-stat-card">
              <div className="flex justify-between items-center mb-1">
                <span className="stat-lbl">Conversion Rate</span>
                <Award size={13} className="text-purple" />
              </div>
              <strong className="stat-val">{currentClient.conversionRate}</strong>
              <span className="stat-sub">{currentClient.qualifiedLeads} Qualified</span>
            </div>

            {/* 5. Organic Traffic */}
            <div className="client-metric-stat-card">
              <div className="flex justify-between items-center mb-1">
                <span className="stat-lbl">SEO Visibility</span>
                <Globe size={13} className="text-primary" />
              </div>
              <strong className="stat-val">{currentClient.organicTraffic}</strong>
              <span className="stat-sub">Domain Score: {currentClient.seoVisibility}/100</span>
            </div>

            {/* 6. WhatsApp Engagement */}
            <div className="client-metric-stat-card">
              <div className="flex justify-between items-center mb-1">
                <span className="stat-lbl">WhatsApp Reply %</span>
                <MessageSquare size={13} className="text-success" />
              </div>
              <strong className="stat-val">{currentClient.whatsappEngagement}</strong>
              <span className="stat-sub">High audience intent</span>
            </div>

            {/* 7. Email & SMS Nurture */}
            <div className="client-metric-stat-card">
              <div className="flex justify-between items-center mb-1">
                <span className="stat-lbl">Email Open Rate</span>
                <Mail size={13} className="text-pink" />
              </div>
              <strong className="stat-val">{currentClient.emailEngagement}</strong>
              <span className="stat-sub">Nurture sequence active</span>
            </div>

            {/* 8. Sentiment & Ops */}
            <div className="client-metric-stat-card">
              <div className="flex justify-between items-center mb-1">
                <span className="stat-lbl">Client Sentiment</span>
                <Activity size={13} className="text-success" />
              </div>
              <strong className="stat-val">{currentClient.customerSentiment}</strong>
              <span className="stat-sub">
                {currentClient.activeCampaigns} Campaigns • {currentClient.activeAutomations} Flows
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientIntelligencePanel;
