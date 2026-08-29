import React, { useState } from 'react';
import {
  History,
  Search,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  Target,
  Zap,
} from 'lucide-react';

export function AIActionHistory({
  historyItems = [],
  onUndoAction,
  loading = false,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  let list = [...historyItems];

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(
      (h) =>
        h.clientName?.toLowerCase().includes(q) ||
        h.title?.toLowerCase().includes(q) ||
        h.aiTrigger?.toLowerCase().includes(q) ||
        h.actionType?.toLowerCase().includes(q) ||
        h.targetModule?.toLowerCase().includes(q)
    );
  }

  if (statusFilter !== 'all') {
    list = list.filter((h) =>
      h.executionState?.toLowerCase() === statusFilter.toLowerCase() ||
      h.status?.toLowerCase() === statusFilter.toLowerCase()
    );
  }

  if (priorityFilter !== 'all') {
    list = list.filter((h) => h.priority?.toLowerCase() === priorityFilter.toLowerCase());
  }

  if (moduleFilter !== 'all') {
    list = list.filter((h) => h.targetModule?.toLowerCase().includes(moduleFilter.toLowerCase()));
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="action-history-panel-card">
      {/* Header & Controls */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="history-icon-badge">
            <History size={17} className="text-cyan" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              AI Action Audit Trail &amp; Execution Telemetry
            </h3>
            <p className="text-xs text-muted">
              Immutable chronological record of simulated operational directives, operator triggers, and rollback states
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="channel-search-box">
            <Search size={13} className="text-dim" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="channel-search-input"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select-input text-xs"
          >
            <option value="all">All Priorities</option>
            <option value="p0">P0 Critical</option>
            <option value="p1">P1 High</option>
            <option value="p2">P2 Medium</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select-input text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="executed">Executed</option>
            <option value="rolled_back">Rolled Back / Undone</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <div className="skeleton-card h-48" />
      ) : list.length === 0 ? (
        <div className="wa-empty-conversations-box py-8">
          <History size={28} className="text-dim mb-2" />
          <strong className="text-white text-xs block">No Action History Found</strong>
          <span className="text-[11px] text-muted">Executed operational directives will appear here.</span>
        </div>
      ) : (
        <div className="channel-matrix-table-wrap">
          <table className="channel-matrix-table">
            <thead>
              <tr>
                <th>Execution Time</th>
                <th>Client Account</th>
                <th>AI Trigger Context</th>
                <th>Executed Directive</th>
                <th>Target Module</th>
                <th>Operator</th>
                <th>Estimated Impact</th>
                <th>Lifecycle State</th>
                <th>Audit Details</th>
                <th className="text-right">Rollback</th>
              </tr>
            </thead>
            <tbody>
              {list.map((act) => {
                const isCompleted = act.executionState === 'COMPLETED' || act.status === 'Executed';
                const isExpanded = expandedId === act.actionId;
                const trace = act.decisionTrace || {};

                return (
                  <React.Fragment key={act.actionId}>
                    <tr className="channel-table-row">
                      {/* Time */}
                      <td className="text-xs text-dim whitespace-nowrap">
                        {act.time || 'Just now'}
                      </td>

                      {/* Client */}
                      <td>
                        <strong className="text-white text-xs block truncate max-w-[140px]">
                          {act.clientName}
                        </strong>
                      </td>

                      {/* AI Trigger */}
                      <td>
                        <span className="text-xs text-slate-300 line-clamp-1 max-w-[180px]">
                          {act.aiTrigger || act.title}
                        </span>
                      </td>

                      {/* Action */}
                      <td>
                        <span className="text-xs text-cyan font-semibold line-clamp-1 max-w-[200px]">
                          {act.actionType || act.title}
                        </span>
                      </td>

                      {/* Module */}
                      <td>
                        <span className="ai-module-tag">{act.targetModule}</span>
                      </td>

                      {/* Operator */}
                      <td className="text-xs text-slate-300 whitespace-nowrap">
                        {act.operator || 'Antigravity AI Co-Pilot'}
                      </td>

                      {/* Impact */}
                      <td>
                        <strong className="text-xs text-success font-bold whitespace-nowrap">
                          {act.expectedImpact || act.estimatedImpact}
                        </strong>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`status-pill-badge ${
                            isCompleted ? 'executed' : 'undone'
                          }`}
                        >
                          {act.executionState || act.status}
                        </span>
                      </td>

                      {/* Expand Audit Details */}
                      <td>
                        <button
                          type="button"
                          className="btn-saas-secondary text-[10px] py-0.5 px-2 flex items-center gap-1"
                          onClick={() => toggleExpand(act.actionId)}
                        >
                          <span>{isExpanded ? 'Hide Trace' : 'Inspect'}</span>
                          {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                        </button>
                      </td>

                      {/* Rollback Action */}
                      <td className="text-right">
                        {act.rollbackAvailable && isCompleted ? (
                          <button
                            type="button"
                            className="btn-saas-secondary text-xs py-0.5 px-2 text-warning flex items-center gap-1 ml-auto"
                            onClick={() => onUndoAction && onUndoAction(act.actionId)}
                            title="Rollback simulated action in sandbox"
                          >
                            <RotateCcw size={10} />
                            <span>Rollback</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-dim">N/A</span>
                        )}
                      </td>
                    </tr>

                    {/* Expandable Decision Trace Row */}
                    {isExpanded && (
                      <tr className="bg-slate-950/80 border-b border-white/10">
                        <td colSpan={10} className="p-4">
                          <div className="decision-trace-box p-3 rounded-xl border border-white/10 space-y-2 text-xs">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Target size={14} className="text-cyan" />
                              <strong className="text-white text-xs uppercase tracking-wider">
                                AI Decision Trace &amp; Execution Telemetry
                              </strong>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <strong className="text-dim block mb-0.5">1. Observable Signal:</strong>
                                <p className="text-slate-200 bg-slate-900/50 p-2 rounded border border-white/5">{trace.signal || 'Signal detected in media attribution layer.'}</p>

                                <strong className="text-dim block mt-2 mb-0.5">2. Quantitative Evidence:</strong>
                                <p className="text-emerald-300 bg-emerald-950/20 p-2 rounded border border-emerald-500/20">{trace.evidence || 'Conversion spread exceeded baseline.'}</p>
                              </div>

                              <div>
                                <strong className="text-dim block mb-0.5">3. State Transformation:</strong>
                                <div className="p-2 rounded bg-slate-900/50 border border-white/5 space-y-1">
                                  <div><span className="text-dim">Before: </span><span className="text-slate-300">{act.beforeState?.metricSummary || JSON.stringify(act.beforeState)}</span></div>
                                  <div><span className="text-cyan font-bold">After: </span><span className="text-white font-medium">{act.proposedState?.metricSummary || JSON.stringify(act.proposedState)}</span></div>
                                </div>

                                <strong className="text-dim block mt-2 mb-0.5">4. Execution Result:</strong>
                                <p className="text-purple bg-purple-950/20 p-2 rounded border border-purple-500/20">{trace.executionResult || act.auditMessage || 'Simulated execution completed in sandbox.'}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AIActionHistory;
