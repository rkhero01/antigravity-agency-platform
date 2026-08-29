import React, { useState, useEffect } from 'react';
import {
  Building,
  TrendingUp,
  DollarSign,
  Award,
} from 'lucide-react';
import { whatsappService } from '../../services/whatsappService.js';

export function ClientAnalytics() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClientAnalytics();
  }, []);

  const loadClientAnalytics = async () => {
    setLoading(true);
    const res = await whatsappService.getClientAnalytics();
    setClients(res);
    setLoading(false);
  };

  if (loading) return null;

  return (
    <div className="wa-client-analytics-card">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Building size={17} className="text-primary" />
            <span>Multi-Client Workspace Performance Matrix</span>
          </h3>
          <p className="text-xs text-muted">
            Cross-client operational efficiency, total leads acquired, attributed sales revenue, and ROAS
          </p>
        </div>
      </div>

      <div className="wa-followup-table-container">
        <table className="wa-followup-table">
          <thead>
            <tr>
              <th>Client Workspace</th>
              <th>Industry</th>
              <th>Conversations</th>
              <th>Total Messages</th>
              <th>New Leads</th>
              <th>Qualified</th>
              <th>Won Deals</th>
              <th>Revenue</th>
              <th>ROAS</th>
              <th>Reply Rate</th>
              <th>Avg SLA</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((cl) => (
              <tr key={cl.clientId} className="table-row-item">
                <td>
                  <strong className="text-white text-xs">{cl.clientName}</strong>
                </td>
                <td>
                  <span className="text-[11px] text-dim">{cl.industry}</span>
                </td>
                <td>
                  <span className="text-xs text-white font-semibold">{cl.conversations}</span>
                </td>
                <td>
                  <span className="text-xs text-dim">{(cl.messages || 0).toLocaleString()}</span>
                </td>
                <td>
                  <span className="text-xs text-primary font-bold">{cl.leads}</span>
                </td>
                <td>
                  <span className="text-xs text-purple font-semibold">{cl.qualified}</span>
                </td>
                <td>
                  <span className="text-xs text-white font-bold">{cl.conversions}</span>
                </td>
                <td>
                  <strong className="text-xs text-success font-bold">₹{(cl.revenue || 0).toLocaleString()}</strong>
                </td>
                <td>
                  <span className="text-xs text-cyan font-bold bg-cyan-500/10 px-2 py-0.5 rounded">
                    {cl.roas}
                  </span>
                </td>
                <td>
                  <span className="text-xs text-pink font-semibold">{cl.replyRate}</span>
                </td>
                <td>
                  <span className="text-xs text-dim">{cl.avgResponse}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClientAnalytics;
