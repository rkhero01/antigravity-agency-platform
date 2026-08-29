import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  UserCheck,
  Building,
} from 'lucide-react';

export function AIActivityStream({
  streamEvents = [],
  onSelectEvent,
  loading = false,
}) {
  const [filterType, setFilterType] = useState('all');

  const types = [
    { id: 'all', label: 'All Signals' },
    { id: 'anomaly', label: 'Anomalies' },
    { id: 'optimization', label: 'Optimizations' },
    { id: 'velocity', label: 'Velocity' },
    { id: 'team', label: 'Team & SLA' },
  ];

  let list = [...streamEvents];
  if (filterType !== 'all') {
    list = list.filter((e) => e.type?.toLowerCase() === filterType.toLowerCase());
  }

  const getEventIcon = (type, severity) => {
    switch (type) {
      case 'anomaly':
        return <ShieldAlert size={14} className="text-danger" />;
      case 'optimization':
        return <TrendingUp size={14} className="text-success" />;
      case 'velocity':
        return <AlertTriangle size={14} className="text-warning" />;
      case 'followup':
      case 'lead':
        return <UserCheck size={14} className="text-cyan" />;
      case 'team':
        return <Zap size={14} className="text-purple" />;
      default:
        return <Activity size={14} className="text-primary" />;
    }
  };

  return (
    <div className="activity-stream-panel-card">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="stream-icon-badge">
            <Activity size={17} className="text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Live AI Activity Stream
              </h3>
              <span className="text-[10px] text-cyan font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Demo Simulation
              </span>
            </div>
            <p className="text-xs text-muted">
              Simulated real-time signal stream displaying anomaly detections, autonomous triage suggestions, and operator actions
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 flex-wrap">
          {types.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`client-filter-chip ${filterType === t.id ? 'active' : ''}`}
              onClick={() => setFilterType(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stream Timeline Items */}
      {loading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stream-item-row skeleton-card h-14" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="wa-empty-conversations-box py-8">
          <Activity size={28} className="text-dim mb-2" />
          <strong className="text-white text-xs block">No Activity Events</strong>
          <span className="text-[11px] text-muted">Real-time signals will stream here dynamically.</span>
        </div>
      ) : (
        <div className="activity-stream-feed space-y-2.5">
          {list.map((item) => (
            <div
              key={item.id}
              className={`stream-item-row severity-${item.severity || 'info'}`}
              onClick={() => onSelectEvent && onSelectEvent(item)}
            >
              <div className="stream-event-icon-box">
                {getEventIcon(item.type, item.severity)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-2 mb-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <strong className="text-xs font-bold text-white truncate">{item.title}</strong>
                    <span className="ai-client-tag">🏢 {item.clientName}</span>
                    <span className="ai-module-tag">🔗 {item.module}</span>
                  </div>
                  <span className="text-[10px] text-dim whitespace-nowrap flex items-center gap-0.5">
                    <Clock size={9} /> {item.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AIActivityStream;
