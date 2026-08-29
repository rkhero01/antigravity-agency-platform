import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Filter,
  DollarSign,
  ArrowDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { whatsappService } from '../../services/whatsappService.js';

export function WhatsAppConversionFunnel({
  selectedClient = 'all',
}) {
  const [funnelData, setFunnelData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFunnel();
  }, [selectedClient]);

  const loadFunnel = async () => {
    setLoading(true);
    const data = await whatsappService.getConversionFunnelAnalytics({ clientId: selectedClient });
    setFunnelData(data);
    setLoading(false);
  };

  if (loading || !funnelData) {
    return <div className="wa-loading-spinner-box">Loading conversion funnel...</div>;
  }

  const steps = funnelData.steps || [];

  return (
    <div className="wa-funnel-card">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers size={17} className="text-primary" />
            <span>WhatsApp Full-Funnel Conversion &amp; Revenue Pipeline</span>
          </h3>
          <p className="text-xs text-muted">
            End-to-end attribution from initial WhatsApp broadcast to qualified CRM deals and revenue
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-success font-bold bg-success/10 px-2.5 py-1 rounded border border-success/20">
            Overall Conversion: {funnelData.overallConversionRate}
          </span>
          <span className="text-xs text-warning font-bold bg-warning/10 px-2.5 py-1 rounded border border-warning/20">
            Revenue: {funnelData.attributedRevenue}
          </span>
        </div>
      </div>

      {/* Funnel Visual Stack */}
      <div className="funnel-steps-vertical-container">
        {steps.map((step, idx) => {
          // Dynamic width calculation for funnel taper
          const widthPct = Math.max(28, 100 - idx * 10.5);

          return (
            <div key={idx} className="funnel-step-wrapper">
              <div
                className={`funnel-step-bar ${idx === steps.length - 1 ? 'final-won-step' : ''}`}
                style={{ width: `${widthPct}%` }}
              >
                <div className="flex justify-between items-center w-full min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="funnel-step-number">{idx + 1}</span>
                    <strong className="funnel-step-title truncate">{step.step}</strong>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="funnel-count-badge">
                      {step.count.toLocaleString()}
                    </span>
                    <span className="funnel-rate-badge">
                      {step.conversionRate} conv
                    </span>
                    {idx > 0 && (
                      <span className="funnel-drop-badge text-danger">
                        -{step.dropOff} drop
                      </span>
                    )}
                    {step.revenue !== '₹0' && (
                      <strong className="text-xs text-warning font-bold">
                        {step.revenue}
                      </strong>
                    )}
                  </div>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className="funnel-connector-arrow">
                  <ArrowDown size={12} className="text-dim" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WhatsAppConversionFunnel;
