import React, { useState, useEffect } from 'react';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Clock,
  X,
  Eye,
  ShieldAlert,
  CheckSquare,
  Square,
  Filter,
  Layers,
  RotateCcw,
  ThumbsUp,
  ShieldCheck,
  Building,
  Target,
} from 'lucide-react';
import { AIActionConfirmationModal } from './AIActionConfirmationModal.jsx';
import { aiActionOrchestrator, ACTION_STATES } from '../../services/aiActionOrchestrator.js';

export function AIActionCenter({
  insights = [],
  recommendations = [],
  anomalies = [],
  onExecuteAction,
  onReviewItem,
  onDismissItem,
  onSnoozeItem,
  loading = false,
}) {
  const [actionQueue, setActionQueue] = useState([]);
  const [executedHistory, setExecutedHistory] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState('critical'); // 'critical' | 'high' | 'opportunities' | 'executed'
  const [moduleFilter, setModuleFilter] = useState('all');

  // Preview & Confirmation Modal State
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    loadActions();
  }, [insights, recommendations, anomalies]);

  const loadActions = async () => {
    const queue = await aiActionOrchestrator.getActionQueue();
    const history = await aiActionOrchestrator.getActionHistory();
    setActionQueue(queue);
    setExecutedHistory(history);
  };

  // Section Grouping
  const criticalActions = actionQueue.filter((a) => a.priority === 'P0');
  const highPriorityActions = actionQueue.filter((a) => a.priority === 'P1');
  const opportunityActions = actionQueue.filter((a) => a.priority === 'P2' || a.priority === 'P3');
  const completedActions = executedHistory.filter((a) => a.executionState === ACTION_STATES.COMPLETED || a.status === 'Executed');

  // Get active list for selected tab
  let activeList = [];
  if (activeTab === 'critical') activeList = criticalActions;
  else if (activeTab === 'high') activeList = highPriorityActions;
  else if (activeTab === 'opportunities') activeList = opportunityActions;
  else if (activeTab === 'executed') activeList = completedActions;

  if (moduleFilter !== 'all') {
    activeList = activeList.filter((a) => a.targetModule.toLowerCase().includes(moduleFilter.toLowerCase()));
  }

  // Multi-Select Handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === activeList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(activeList.map((a) => a.actionId)));
    }
  };

  // Approve Single Action
  const handleApprove = async (actionId) => {
    await aiActionOrchestrator.approveAction(actionId);
    await loadActions();
    if (onExecuteAction) onExecuteAction({ type: 'APPROVE', actionId });
  };

  // Open Preview Modal
  const handleOpenPreview = async (act) => {
    setPendingAction(act);
    const preview = await aiActionOrchestrator.previewAction(act);
    setPreviewData(preview);
    setIsPreviewModalOpen(true);
  };

  // Bulk Preview Modal
  const handleBulkPreview = () => {
    const selectedItems = activeList.filter((a) => selectedIds.has(a.actionId));
    setPreviewData({
      items: selectedItems,
      targetModule: 'Multi-Module Batch Execution',
      clientName: 'Multiple Client Accounts',
      estimatedImpact: '+₹1,870,000 Cumulative Projected Uplift',
      confidence: '94.2% Average',
    });
    setIsPreviewModalOpen(true);
  };

  // Confirm and Execute from Modal
  const handleConfirmExecution = async () => {
    setExecuting(true);
    if (previewData.items) {
      // Bulk Execution
      await aiActionOrchestrator.bulkExecuteActions(previewData.items);
      setSelectedIds(new Set());
      if (onExecuteAction) onExecuteAction({ isBulk: true, count: previewData.items.length });
    } else if (pendingAction) {
      // Single Execution
      const res = await aiActionOrchestrator.executeAction(pendingAction.actionId, pendingAction);
      if (onExecuteAction) onExecuteAction(res.action || pendingAction);
    }
    await loadActions();
    setExecuting(false);
    setIsPreviewModalOpen(false);
    setPendingAction(null);
  };

  // Rollback Action in Sandbox
  const handleRollback = async (actionId) => {
    const res = await aiActionOrchestrator.rollbackAction(actionId);
    await loadActions();
    if (onExecuteAction) onExecuteAction({ type: 'ROLLBACK', actionId, message: res.message });
  };

  const isAllSelected = activeList.length > 0 && selectedIds.size === activeList.length;

  return (
    <div className="ai-action-center-card">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="action-center-icon-badge">
            <Zap size={17} className="text-warning" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                AI Operations &amp; Execution Command Center
              </h3>
              <span className="text-[10px] text-cyan font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Sandbox Mode
              </span>
            </div>
            <p className="text-xs text-muted">
              Production-grade execution orchestration layer with approval workflows, state transformation previews, and sandbox rollbacks
            </p>
          </div>
        </div>

        {/* Target Module Filter */}
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="filter-select-input text-xs"
        >
          <option value="all">All Modules</option>
          <option value="ads">Ads &amp; Campaigns</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="crm">CRM Pipeline</option>
          <option value="team">Team &amp; Workload</option>
        </select>
      </div>

      {/* Category Navigation Tabs */}
      <div className="flex items-center gap-1.5 mb-3.5 border-b border-white/8 pb-2 flex-wrap">
        <button
          type="button"
          className={`client-filter-chip ${activeTab === 'critical' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('critical');
            setSelectedIds(new Set());
          }}
        >
          <ShieldAlert size={12} className="text-danger" />
          <span>Critical Actions ({criticalActions.length})</span>
        </button>

        <button
          type="button"
          className={`client-filter-chip ${activeTab === 'high' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('high');
            setSelectedIds(new Set());
          }}
        >
          <AlertTriangle size={12} className="text-warning" />
          <span>High Priority ({highPriorityActions.length})</span>
        </button>

        <button
          type="button"
          className={`client-filter-chip ${activeTab === 'opportunities' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('opportunities');
            setSelectedIds(new Set());
          }}
        >
          <Sparkles size={12} className="text-cyan" />
          <span>Opportunities ({opportunityActions.length})</span>
        </button>

        <button
          type="button"
          className={`client-filter-chip ${activeTab === 'executed' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('executed');
            setSelectedIds(new Set());
          }}
        >
          <CheckCircle2 size={12} className="text-success" />
          <span>Recently Executed ({completedActions.length})</span>
        </button>
      </div>

      {/* Selection & Bulk Operations Toolbar */}
      {activeTab !== 'executed' && (
        <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-xl border border-white/5 mb-3.5 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-saas-secondary text-xs flex items-center gap-1.5 py-1 px-2.5"
              onClick={handleSelectAll}
            >
              {isAllSelected ? <CheckSquare size={13} className="text-cyan" /> : <Square size={13} />}
              <span>Select All ({activeList.length})</span>
            </button>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-cyan font-bold text-xs">
                ⚡ {selectedIds.size} Selected:
              </span>

              <button
                type="button"
                className="btn-saas-secondary text-xs py-1 px-2.5"
                onClick={handleBulkPreview}
              >
                <Eye size={11} />
                <span>Bulk Preview</span>
              </button>

              <button
                type="button"
                className="btn-ai-action text-xs py-1 px-3"
                onClick={handleBulkPreview}
              >
                <span>Bulk Execute ({selectedIds.size})</span>
                <ArrowRight size={11} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action Cards Stack */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="action-center-item-card skeleton-card h-28" />
          ))}
        </div>
      ) : activeList.length === 0 ? (
        <div className="wa-empty-conversations-box py-8">
          <CheckCircle2 size={32} className="text-success mb-2" />
          <strong className="text-white text-sm block">Queue Clear</strong>
          <p className="text-xs text-muted">No actions currently pending in this category.</p>
        </div>
      ) : (
        <div className="action-center-items-stack space-y-3">
          {activeList.map((act) => {
            const isP0 = act.priority === 'P0';
            const isSelected = selectedIds.has(act.actionId);
            const isApproved = act.executionState === ACTION_STATES.APPROVED;
            const isCompleted = act.executionState === ACTION_STATES.COMPLETED || act.status === 'Executed';

            return (
              <div
                key={act.actionId}
                className={`action-center-item-card ${isP0 ? 'p0-urgency' : ''} ${
                  isSelected ? 'is-selected' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Checkbox (only for active items) */}
                    {!isCompleted && (
                      <button
                        type="button"
                        className="text-dim hover:text-white"
                        onClick={() => handleToggleSelect(act.actionId)}
                      >
                        {isSelected ? (
                          <CheckSquare size={15} className="text-cyan" />
                        ) : (
                          <Square size={15} />
                        )}
                      </button>
                    )}

                    <span className={`ai-priority-badge ${(act.priority || 'p1').toLowerCase()}`}>
                      {act.priority || 'P1'}
                    </span>
                    <span className="ai-module-tag">🔗 {act.targetModule}</span>
                    <span className="ai-client-tag">🏢 {act.clientName}</span>

                    {/* Lifecycle State Badge */}
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isApproved
                          ? 'bg-cyan-500/10 text-cyan border border-cyan-500/20'
                          : 'bg-amber-500/10 text-warning border border-amber-500/20'
                      }`}
                    >
                      {isCompleted ? 'Completed' : isApproved ? 'Approved' : 'Review Required'}
                    </span>
                  </div>

                  <span className="text-[11px] text-cyan font-bold bg-cyan-500/10 px-2 py-0.5 rounded">
                    {act.confidence || '94.0%'} Confidence
                  </span>
                </div>

                <h4 className="action-item-title text-white">{act.title}</h4>

                {/* State Transformation Preview Chip */}
                {act.beforeState && act.proposedState && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
                    <div className="p-2 rounded bg-slate-950/50 border border-white/5">
                      <span className="text-[9px] text-dim uppercase font-bold block">Current State (Before):</span>
                      <span className="text-slate-300 font-medium">
                        {act.beforeState.metricSummary || JSON.stringify(act.beforeState)}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-cyan-950/20 border border-cyan-500/20">
                      <span className="text-[9px] text-cyan uppercase font-bold block">Simulated State (After):</span>
                      <span className="text-white font-medium">
                        {act.proposedState.metricSummary || JSON.stringify(act.proposedState)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="action-item-footer mt-3 pt-2.5 border-t border-white/6 flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-dim">Projected Gain:</span>
                    <strong className="text-success font-bold">{act.expectedImpact}</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Review / Preview */}
                    <button
                      type="button"
                      className="btn-saas-secondary text-xs"
                      onClick={() => handleOpenPreview(act)}
                      title="Preview Before -> After Transformation"
                    >
                      <Eye size={11} />
                      <span>Preview</span>
                    </button>

                    {/* If Not Approved: Approve button */}
                    {!isCompleted && !isApproved && act.requiresApproval && (
                      <button
                        type="button"
                        className="btn-saas-secondary text-xs text-cyan border-cyan-500/30"
                        onClick={() => handleApprove(act.actionId)}
                        title="Approve action for execution"
                      >
                        <ThumbsUp size={11} />
                        <span>Approve</span>
                      </button>
                    )}

                    {/* Snooze */}
                    {!isCompleted && (
                      <button
                        type="button"
                        className="btn-saas-secondary text-xs"
                        onClick={() => onSnoozeItem && onSnoozeItem(act.actionId)}
                        title="Snooze for 24h"
                      >
                        <Clock size={11} />
                        <span>Snooze</span>
                      </button>
                    )}

                    {/* Execute (Demo) */}
                    {!isCompleted && (
                      <button
                        type="button"
                        className="btn-ai-action"
                        onClick={() => handleOpenPreview(act)}
                      >
                        <span>Execute (Demo)</span>
                        <ArrowRight size={11} />
                      </button>
                    )}

                    {/* Rollback (If Completed) */}
                    {isCompleted && act.rollbackAvailable && (
                      <button
                        type="button"
                        className="btn-saas-secondary text-xs text-warning border-amber-500/30 flex items-center gap-1"
                        onClick={() => handleRollback(act.actionId)}
                        title="Rollback action in sandbox"
                      >
                        <RotateCcw size={11} />
                        <span>Rollback</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Preview & Confirmation Modal */}
      <AIActionConfirmationModal
        preview={previewData}
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPendingAction(null);
        }}
        onConfirm={handleConfirmExecution}
        loading={executing}
      />
    </div>
  );
}

export default AIActionCenter;
