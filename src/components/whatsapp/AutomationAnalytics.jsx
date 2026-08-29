import React, { useState, useEffect } from 'react';
import {
  Zap,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Award,
} from 'lucide-react';
import { whatsappService } from '../../services/whatsappService.js';

export function AutomationAnalytics({
  selectedClient = 'all',
}) {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadAutomationAnalytics();
  }, [selectedClient]);

  const loadAutomationAnalytics = async () => {
    const res = await whatsappService.getAutomationAnalytics({ clientId: selectedClient });
    setData(res);
  };

  if (!data) return null;

  return (
    <div className="wa-automation-analytics-card">
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Zap size={17} className="text-warning" />
            <span>Customer Journey &amp; Automation ROI</span>
          </h3>
          <p className="text-xs text-muted">
            Lifecycle trigger completion percentages, multi-step message reply velocity, and attributed revenue
          </p>
        </div>

        {data.highestRevenue && (
          <div className="accolade-chip revenue">
            <Sparkles size={11} />
            <span>Top Earner: {data.highestRevenue.name} (₹{(data.highestRevenue.revenue || 0).toLocaleString()})</span>
          </div>
        )}
      </div>

      {/* Automation Flows Table */}
      <div className="wa-followup-table-container">
        <table className="wa-followup-table">
          <thead>
            <tr>
              <th>Automation Flow &amp; Client</th>
              <th>Trigger Type</th>
              <th>Enrolled</th>
              <th>Completed %</th>
              <th>Replies %</th>
              <th>Conversions</th>
              <th>Attributed Revenue</th>
              <th>Rev / Enrolled Contact</th>
            </tr>
          </thead>
          <tbody>
            {(data.flows || []).map((flow) => (
              <tr key={flow.id} className="table-row-item">
                <td>
                  <div>
                    <strong className="text-white text-xs block">{flow.name}</strong>
                    <span className="text-[11px] text-dim">{flow.clientName}</span>
                  </div>
                </td>
                <td>
                  <span className="text-[10px] text-warning font-bold bg-warning/10 px-2 py-0.5 rounded">
                    {flow.trigger}
                  </span>
                </td>
                <td>
                  <span className="text-xs text-white font-semibold">{(flow.enrolled || 0).toLocaleString()}</span>
                </td>
                <td>
                  <span className="text-xs text-success font-semibold">{flow.completionRate}</span>
                </td>
                <td>
                  <span className="text-xs text-pink font-semibold">{flow.replyRate}</span>
                </td>
                <td>
                  <span className="text-xs text-white font-bold">{flow.conversions || 0}</span>
                </td>
                <td>
                  <strong className="text-xs text-success font-bold">₹{(flow.revenue || 0).toLocaleString()}</strong>
                </td>
                <td>
                  <span className="text-xs text-cyan font-semibold">{flow.revenuePerContact}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AutomationAnalytics;
