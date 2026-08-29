import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  Clock,
  CheckCircle2,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { whatsappService } from '../../services/whatsappService.js';

export function TeamAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadTeamAnalytics();
  }, []);

  const loadTeamAnalytics = async () => {
    const res = await whatsappService.getTeamAnalytics();
    setData(res);
  };

  if (!data) return null;

  return (
    <div className="wa-team-analytics-card">
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users size={17} className="text-purple" />
            <span>Operator Productivity &amp; Sales Conversion Leaderboard</span>
          </h3>
          <p className="text-xs text-muted">
            Individual staff SLA adherence, ticket resolution speeds, follow-up execution, and revenue generation
          </p>
        </div>

        {data.topPerformer && (
          <div className="flex items-center gap-2">
            <div className="accolade-chip staff">
              <Award size={11} />
              <span>Top Operator: {data.topPerformer.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* Team Leaderboard Table */}
      <div className="wa-followup-table-container">
        <table className="wa-followup-table">
          <thead>
            <tr>
              <th>Operator Staff</th>
              <th>Role</th>
              <th>Active Chats</th>
              <th>Resolved Tickets</th>
              <th>Avg Response Time</th>
              <th>Follow-ups Done</th>
              <th>Won Leads</th>
              <th>Revenue Generated</th>
              <th>Capacity Load</th>
            </tr>
          </thead>
          <tbody>
            {(data.members || []).map((m) => (
              <tr key={m.id} className="table-row-item">
                <td>
                  <div className="flex items-center gap-2">
                    <img
                      src={m.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={m.name}
                      className="w-7 h-7 rounded-full object-cover border border-white/10"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
                      }}
                    />
                    <strong className="text-white text-xs">{m.name}</strong>
                  </div>
                </td>
                <td>
                  <span className="text-xs text-dim">{m.role}</span>
                </td>
                <td>
                  <span className="text-xs text-primary font-bold">{m.activeConversations}</span>
                </td>
                <td>
                  <span className="text-xs text-success font-semibold">{m.resolvedConversations}</span>
                </td>
                <td>
                  <span className="text-xs text-cyan font-bold bg-cyan-500/10 px-2 py-0.5 rounded">
                    {m.avgResponseTime}
                  </span>
                </td>
                <td>
                  <span className="text-xs text-white font-semibold">{m.followUpsCompleted || 8}</span>
                </td>
                <td>
                  <span className="text-xs text-purple font-bold">{m.wonLeads}</span>
                </td>
                <td>
                  <strong className="text-xs text-success font-bold">
                    ₹{(m.revenueGenerated || 0).toLocaleString()}
                  </strong>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          m.workloadPct > 80 ? 'bg-danger' : m.workloadPct > 60 ? 'bg-warning' : 'bg-success'
                        }`}
                        style={{ width: `${m.workloadPct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-dim">{m.workloadPct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TeamAnalytics;
