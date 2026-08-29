import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  TrendingUp,
  DollarSign,
  Award,
  Sparkles,
  ArrowUpDown,
  Flame,
} from 'lucide-react';
import { whatsappService } from '../../services/whatsappService.js';

export function CampaignAnalytics({
  selectedClient = 'all',
}) {
  const [data, setData] = useState(null);
  const [sortBy, setSortBy] = useState('revenue');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    loadCampaignAnalytics();
  }, [selectedClient]);

  const loadCampaignAnalytics = async () => {
    const res = await whatsappService.getCampaignAnalytics({ clientId: selectedClient });
    setData(res);
  };

  if (!data) return null;

  let sortedCampaigns = [...(data.campaigns || [])];
  sortedCampaigns.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === 'roas' || sortBy === 'replyRate' || sortBy === 'deliveryRate') {
      valA = parseFloat(valA) || 0;
      valB = parseFloat(valB) || 0;
    }

    return sortAsc ? valA - valB : valB - valA;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="wa-campaign-analytics-card">
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Megaphone size={17} className="text-pink" />
            <span>Campaign Performance &amp; Broadcast ROI</span>
          </h3>
          <p className="text-xs text-muted">
            Comparative broadcast metrics, message reads, sales conversions, and return on ad spend
          </p>
        </div>

        {/* Highlight Accolades */}
        {data.bestByRoas && (
          <div className="flex items-center gap-2">
            <div className="accolade-chip roas">
              <Sparkles size={11} />
              <span>Top ROAS: {data.bestByRoas.name} ({data.bestByRoas.roas})</span>
            </div>
          </div>
        )}
      </div>

      {/* Campaign Analytics Table */}
      <div className="wa-followup-table-container">
        <table className="wa-followup-table">
          <thead>
            <tr>
              <th>Campaign &amp; Client</th>
              <th>Audience / Sent</th>
              <th onClick={() => handleSort('deliveryRate')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  <span>Delivery %</span>
                  <ArrowUpDown size={11} />
                </div>
              </th>
              <th onClick={() => handleSort('readRate')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  <span>Read %</span>
                  <ArrowUpDown size={11} />
                </div>
              </th>
              <th onClick={() => handleSort('replyRate')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  <span>Replies %</span>
                  <ArrowUpDown size={11} />
                </div>
              </th>
              <th onClick={() => handleSort('conversions')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  <span>Conversions</span>
                  <ArrowUpDown size={11} />
                </div>
              </th>
              <th>Spend</th>
              <th onClick={() => handleSort('revenue')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  <span>Revenue</span>
                  <ArrowUpDown size={11} />
                </div>
              </th>
              <th onClick={() => handleSort('roas')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  <span>ROAS</span>
                  <ArrowUpDown size={11} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCampaigns.map((camp) => (
              <tr key={camp.id} className="table-row-item">
                <td>
                  <div>
                    <strong className="text-white text-xs block">{camp.name}</strong>
                    <span className="text-[11px] text-dim">{camp.clientName} • {camp.type}</span>
                  </div>
                </td>
                <td>
                  <span className="text-xs text-white font-semibold">{(camp.recipients || 0).toLocaleString()}</span>
                </td>
                <td>
                  <span className="text-xs text-success font-semibold">{camp.deliveryRate}</span>
                </td>
                <td>
                  <span className="text-xs text-purple font-semibold">{camp.readRate}</span>
                </td>
                <td>
                  <span className="text-xs text-pink font-semibold">{camp.replyRate}</span>
                </td>
                <td>
                  <span className="text-xs text-white font-bold">{camp.conversions || 0}</span>
                </td>
                <td>
                  <span className="text-xs text-dim">₹{(camp.spend || 0).toLocaleString()}</span>
                </td>
                <td>
                  <strong className="text-xs text-success font-bold">₹{(camp.revenue || 0).toLocaleString()}</strong>
                </td>
                <td>
                  <span className="text-xs text-cyan font-bold bg-cyan-500/10 px-2 py-0.5 rounded">
                    {camp.roas}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CampaignAnalytics;
