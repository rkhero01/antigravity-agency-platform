import React from 'react';
import {
  X,
  Zap,
  CheckCircle2,
  Pause,
  Play,
  Copy,
  Edit,
  Trash2,
  Users,
  Award,
  DollarSign,
  TrendingUp,
  Clock,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { AutomationFlowViewer } from './AutomationFlowViewer.jsx';
import { whatsappService } from '../../services/whatsappService.js';

export function AutomationDetailModal({
  flow,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
  onToggleStatus,
  onDelete,
}) {
  if (!isOpen || !flow) return null;

  const metrics = whatsappService.calculateAutomationMetrics(flow);
  const isActive = flow.status === 'Active';

  const revPerConv =
    flow.completed > 0 && flow.revenue > 0
      ? `₹${Math.round(flow.revenue / (flow.completed * 0.28)).toLocaleString()}`
      : '₹0';

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card wa-automation-detail-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="flex items-center gap-3 min-w-0">
            <div className="modal-icon-badge">
              <Zap size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="modal-title truncate">{flow.name}</h3>
                <span className={`automation-status-badge ${flow.status.toLowerCase()}`}>
                  {isActive ? <CheckCircle2 size={11} /> : <Pause size={11} />}
                  {flow.status}
                </span>
              </div>
              <p className="modal-subtitle">
                🏢 {flow.clientName} • Trigger: {flow.trigger} • Last Run: {flow.lastRun || 'Just now'}
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="wa-automation-detail-body">
          {/* Performance Stats Strip */}
          <div className="detail-card-panel">
            <h4 className="detail-panel-title">1. Journey Performance & Telemetry</h4>
            <div className="financial-telemetry-grid">
              <div className="fin-stat-box">
                <span className="fin-lbl">Total Enrolled</span>
                <strong className="fin-val text-white">{flow.enrolled?.toLocaleString() || 0}</strong>
                <span className="fin-sub">Triggered contacts</span>
              </div>

              <div className="fin-stat-box">
                <span className="fin-lbl">Completed Funnels</span>
                <strong className="fin-val text-cyan">{flow.completed?.toLocaleString() || 0}</strong>
                <span className="fin-sub">{metrics.completionRate} completion rate</span>
              </div>

              <div className="fin-stat-box">
                <span className="fin-lbl">Attributed Revenue</span>
                <strong className="fin-val text-success">₹{(flow.revenue || 0).toLocaleString()}</strong>
                <span className="fin-sub">Direct closed sales</span>
              </div>

              <div className="fin-stat-box">
                <span className="fin-lbl">Conversion Lift</span>
                <strong className="fin-val text-purple">{flow.conversionRate || '28.4%'}</strong>
                <span className="fin-sub">{revPerConv} / conversion</span>
              </div>
            </div>
          </div>

          {/* Visual Journey Stream */}
          <div className="detail-card-panel">
            <h4 className="detail-panel-title">2. Customer Journey Stream & Action Nodes</h4>
            <AutomationFlowViewer flow={flow} />
          </div>

          {/* Trigger Configuration & Rules */}
          <div className="detail-card-panel">
            <h4 className="detail-panel-title">3. Enrollment Conditions & Execution Rules</h4>
            <div className="config-parameters-grid">
              <div className="config-item">
                <span className="cfg-lbl">Trigger Event:</span>
                <span className="cfg-val text-white">{flow.trigger}</span>
              </div>
              <div className="config-item">
                <span className="cfg-lbl">Re-entry Policy:</span>
                <span className="cfg-val text-cyan">Once every 30 days per contact</span>
              </div>
              <div className="config-item">
                <span className="cfg-lbl">Exit Condition:</span>
                <span className="cfg-val text-success">Exit when customer replies or deal Won</span>
              </div>
              <div className="config-item">
                <span className="cfg-lbl">Active Working Hours:</span>
                <span className="cfg-val text-warning">09:00 AM - 08:30 PM (IST)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-dialog-footer">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`btn-saas-secondary text-xs ${isActive ? 'text-warning' : 'text-success'}`}
              onClick={() => onToggleStatus(flow.id)}
            >
              {isActive ? <Pause size={13} /> : <Play size={13} />}
              <span>{isActive ? 'Pause Journey' : 'Activate Journey'}</span>
            </button>

            <button
              type="button"
              className="btn-saas-secondary text-xs"
              onClick={() => {
                onClose();
                onDuplicate(flow);
              }}
            >
              <Copy size={13} />
              <span>Duplicate</span>
            </button>

            <button
              type="button"
              className="btn-saas-secondary text-xs text-danger"
              onClick={() => {
                onClose();
                onDelete(flow.id);
              }}
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-saas-secondary"
              onClick={() => {
                onClose();
                onEdit(flow);
              }}
            >
              Edit Flow
            </button>
            <button type="button" className="btn-saas-primary" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AutomationDetailModal;
