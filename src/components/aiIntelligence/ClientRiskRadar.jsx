import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Building,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Zap,
} from 'lucide-react';

export function ClientRiskRadar({
  riskClients = [],
  onSelectClient,
  loading = false,
}) {
  const getRiskBadge = (level) => {
    switch (level?.toUpperCase()) {
      case 'LOW':
        return (
          <span className="risk-level-badge low">
            <ShieldCheck size={11} /> LOW RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="risk-level-badge medium">
            <AlertTriangle size={11} /> MEDIUM RISK
          </span>
        );
      case 'HIGH':
        return (
          <span className="risk-level-badge high">
            <ShieldAlert size={11} /> HIGH RISK
          </span>
        );
      default:
        return (
          <span className="risk-level-badge critical">
            <ShieldAlert size={11} /> CRITICAL
          </span>
        );
    }
  };

  return (
    <div className="client-risk-radar-card">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="risk-radar-icon-badge">
            <ShieldAlert size={17} className="text-danger" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Client Portfolio Risk Radar &amp; Retention Defense
            </h3>
            <p className="text-xs text-muted">
              Continuous monitoring of retention vulnerabilities, pipeline friction, SLA latency, and media efficiency degradation
            </p>
          </div>
        </div>

        <span className="text-xs text-slate-300 bg-slate-900/60 px-2.5 py-1 rounded border border-white/5 font-semibold">
          7 Active Client Workspaces Monitored
        </span>
      </div>

      {/* Grid of Client Risk Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {riskClients.map((client) => {
          const isMediumOrHigh = client.overallRisk === 'MEDIUM' || client.overallRisk === 'HIGH';

          return (
            <div
              key={client.clientId}
              className={`client-risk-node-card ${isMediumOrHigh ? 'has-risk' : ''}`}
              onClick={() => onSelectClient && onSelectClient(client.clientId)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="min-w-0 pr-2">
                  <h4 className="text-xs font-bold text-white truncate">{client.clientName}</h4>
                  <span className="text-[10px] text-dim block">Health: {client.healthScore}/100</span>
                </div>
                {getRiskBadge(client.overallRisk)}
              </div>

              {/* Multi-Factor Radar Metrics */}
              <div className="space-y-1.5 mt-2.5 text-[11px] bg-slate-900/40 p-2.5 rounded-lg border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-dim">Revenue Trend:</span>
                  <strong className="text-success font-semibold">{client.revenueTrend}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dim">Lead Growth:</span>
                  <strong className="text-cyan font-semibold">{client.leadTrend}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dim">Pipeline Risk:</span>
                  <span
                    className={`font-bold ${
                      client.pipelineRisk === 'Low' ? 'text-success' : 'text-warning'
                    }`}
                  >
                    {client.pipelineRisk}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dim">Campaign Health:</span>
                  <span className="text-white font-semibold">{client.campaignPerformance}</span>
                </div>
              </div>

              {/* Primary Risk Factor */}
              <div className="mt-2.5 pt-2 border-t border-white/6 text-[10px]">
                <span className="text-dim font-bold uppercase block mb-0.5">Primary Vulnerability:</span>
                <p className="text-slate-300 line-clamp-2 leading-tight">
                  {client.primaryRiskFactor || 'No critical SLA anomalies detected'}
                </p>
              </div>

              {/* Focus Button */}
              <div className="mt-2.5 flex justify-end">
                <span className="text-[10px] text-cyan hover:underline flex items-center gap-1 font-semibold">
                  <span>Open Dossier</span>
                  <ExternalLink size={9} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ClientRiskRadar;
