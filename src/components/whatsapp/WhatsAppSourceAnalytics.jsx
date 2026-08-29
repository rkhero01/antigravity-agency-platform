import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Target,
  DollarSign,
  TrendingUp,
  Award,
} from 'lucide-react';
import { whatsappService } from '../../services/whatsappService.js';

export function WhatsAppSourceAnalytics() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSourceAnalytics();
  }, []);

  const loadSourceAnalytics = async () => {
    setLoading(true);
    const res = await whatsappService.getSourceAnalytics();
    setSources(res);
    setLoading(false);
  };

  if (loading) return null;

  return (
    <div className="wa-source-analytics-card">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Target size={17} className="text-success" />
            <span>Multi-Channel Inbound Attribution &amp; Source ROI</span>
          </h3>
          <p className="text-xs text-muted">
            Acquisition channel breakdown, cost per lead (CPL), conversion efficiency, and ROAS
          </p>
        </div>
      </div>

      {/* Attribution Share Strip */}
      <div className="mb-4">
        <span className="text-xs text-dim block mb-1.5 font-medium">Channel Revenue Share</span>
        <div className="capacity-segments-bar h-3">
          {sources.map((src, i) => (
            <div
              key={src.source}
              className="capacity-segment-fill"
              style={{
                width: src.share,
                backgroundColor: src.color,
              }}
              title={`${src.source}: ${src.share}`}
            />
          ))}
        </div>
      </div>

      <div className="wa-followup-table-container">
        <table className="wa-followup-table">
          <thead>
            <tr>
              <th>Inbound Channel Source</th>
              <th>New Leads</th>
              <th>Qualified Leads</th>
              <th>Conversion Rate</th>
              <th>Cost Per Lead (CPL)</th>
              <th>Attributed Revenue</th>
              <th>Channel ROAS</th>
              <th>Share of Pipeline</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((src) => (
              <tr key={src.source} className="table-row-item">
                <td>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: src.color }}
                    />
                    <strong className="text-white text-xs">{src.source}</strong>
                  </div>
                </td>
                <td>
                  <span className="text-xs text-white font-semibold">{src.leads}</span>
                </td>
                <td>
                  <span className="text-xs text-purple font-semibold">{src.qualified}</span>
                </td>
                <td>
                  <span className="text-xs text-success font-semibold">{src.conversionRate}</span>
                </td>
                <td>
                  <span className="text-xs text-dim">{src.cpl}</span>
                </td>
                <td>
                  <strong className="text-xs text-success font-bold">₹{(src.revenue || 0).toLocaleString()}</strong>
                </td>
                <td>
                  <span className="text-xs text-cyan font-bold bg-cyan-500/10 px-2 py-0.5 rounded">
                    {src.roas}
                  </span>
                </td>
                <td>
                  <span className="text-xs text-dim font-medium">{src.share}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default WhatsAppSourceAnalytics;
