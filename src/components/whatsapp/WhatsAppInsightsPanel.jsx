import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { whatsappService } from '../../services/whatsappService.js';

export function WhatsAppInsightsPanel() {
  const [insights, setInsights] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsightsAndAnomalies();
  }, []);

  const loadInsightsAndAnomalies = async () => {
    setLoading(true);
    const [ins, anom] = await Promise.all([
      whatsappService.getAIInsights(),
      whatsappService.getAnomalies(),
    ]);
    setInsights(ins);
    setAnomalies(anom);
    setLoading(false);
  };

  if (loading || !insights) return null;

  return (
    <div className="wa-insights-panel-container">
      {/* 1. Anomaly Detection Alerts Strip */}
      {anomalies.length > 0 && (
        <div className="anomaly-alerts-strip">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert size={15} className="text-warning" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Automated Anomaly Detection
            </h4>
          </div>

          <div className="anomaly-cards-row">
            {anomalies.map((anom) => (
              <div
                key={anom.id}
                className={`anomaly-alert-card ${anom.severity === 'Warning' ? 'warning' : 'success'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <strong className="text-xs text-white font-bold">{anom.metric}</strong>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${anom.severity === 'Warning' ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
                    {anom.change}
                  </span>
                </div>
                <div className="text-[11px] text-dim mb-1.5">
                  Current: <strong className="text-white">{anom.current}</strong> (Expected: {anom.expected})
                </div>
                <p className="text-xs text-muted">
                  <strong>Action:</strong> {anom.recommendedAction}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Key Observations & Action Recommendations */}
      <div className="insights-recommendations-grid">
        {/* Observations */}
        <div className="analytics-card-panel">
          <div className="flex items-center gap-2 mb-3">
            <div className="smart-ai-badge-icon">
              <Sparkles size={14} className="text-warning" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              AI Growth Observations &amp; Velocity Shifts
            </h4>
          </div>

          <ul className="insights-bullets-list">
            {insights.keyObservations.map((obs, idx) => (
              <li key={idx} className="insight-bullet-item">
                <div className="bullet-dot" />
                <span className="text-xs text-muted leading-relaxed">{obs}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Prioritized Actions */}
        <div className="analytics-card-panel">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={15} className="text-primary" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Prioritized Strategic Action Plan
            </h4>
          </div>

          <div className="actions-vertical-stack">
            {insights.recommendedActions.map((act, idx) => (
              <div key={idx} className="action-recommendation-box">
                <div className="flex justify-between items-center mb-1">
                  <span className={`priority-badge ${act.badge}`}>
                    {act.priority}
                  </span>
                </div>
                <strong className="text-xs text-white block mb-0.5">{act.title}</strong>
                <p className="text-[11px] text-muted leading-relaxed">{act.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhatsAppInsightsPanel;
