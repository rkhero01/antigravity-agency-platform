import React from 'react';
import {
  Zap,
  CheckCircle2,
  Pause,
  Play,
  Copy,
  Edit,
  Trash2,
  Eye,
  Users,
  Award,
  DollarSign,
  TrendingUp,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { whatsappService } from '../../services/whatsappService.js';

export function AutomationCard({
  flow,
  onOpenDetails,
  onEdit,
  onDuplicate,
  onToggleStatus,
  onDelete,
}) {
  const metrics = whatsappService.calculateAutomationMetrics(flow);
  const isActive = flow.status === 'Active';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span className="automation-status-badge active">
            <span className="pulse-dot" /> Live Active
          </span>
        );
      case 'Paused':
        return (
          <span className="automation-status-badge paused">
            <Pause size={11} /> Paused
          </span>
        );
      default:
        return <span className="automation-status-badge draft">Draft</span>;
    }
  };

  const stepsCount = flow.steps?.length || 4;

  return (
    <div className="wa-automation-card" onClick={() => onOpenDetails(flow)}>
      {/* Top Bar: Title & Status */}
      <div className="automation-card-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="automation-trigger-chip">
              <Zap size={11} /> {flow.trigger}
            </span>
            <span className="automation-client-tag">🏢 {flow.clientName}</span>
          </div>
          <h4 className="automation-card-title">{flow.name}</h4>
        </div>
        {getStatusBadge(flow.status)}
      </div>

      {/* Mini Journey Steps Chain Preview */}
      <div className="automation-mini-chain-preview">
        <div className="chain-item trigger">
          <Zap size={10} />
          <span>Trigger</span>
        </div>
        <ArrowRight size={10} className="chain-arrow" />
        <div className="chain-item delay">
          <Clock size={10} />
          <span>Wait</span>
        </div>
        <ArrowRight size={10} className="chain-arrow" />
        <div className="chain-item message">
          <span>Message</span>
        </div>
        <ArrowRight size={10} className="chain-arrow" />
        <div className="chain-item crm">
          <span>CRM</span>
        </div>
        <span className="chain-steps-total ml-auto">{stepsCount} Steps</span>
      </div>

      {/* 4 Telemetry Metrics Grid */}
      <div className="automation-metrics-bar">
        <div className="a-stat">
          <span className="lbl">Enrolled</span>
          <strong className="val text-white">{flow.enrolled?.toLocaleString() || 0}</strong>
        </div>

        <div className="a-stat">
          <span className="lbl">Completion</span>
          <strong className="val text-cyan">{metrics.completionRate}</strong>
        </div>

        <div className="a-stat">
          <span className="lbl">Conversion</span>
          <strong className="val text-purple">{flow.conversionRate || '0.0%'}</strong>
        </div>

        <div className="a-stat">
          <span className="lbl">Revenue</span>
          <strong className="val text-warning">₹{(flow.revenue || 0).toLocaleString()}</strong>
        </div>
      </div>

      {/* Progress Track */}
      <div className="automation-progress-wrap">
        <div className="flex justify-between items-center text-[11px] mb-1">
          <span className="text-dim">Funnel Execution:</span>
          <span className="text-muted">
            {flow.completed || 0} / {flow.enrolled || 0} Completed ({metrics.completionRate})
          </span>
        </div>
        <div className="automation-progress-track">
          <div
            className="automation-progress-fill"
            style={{ width: metrics.completionRate }}
          />
        </div>
      </div>

      {/* Footer Controls */}
      <div className="automation-card-footer" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className={`btn-auto-toggle ${isActive ? 'pause' : 'activate'}`}
            onClick={() => onToggleStatus(flow.id)}
            title={isActive ? 'Pause Automation Journey' : 'Activate Live Journey'}
          >
            {isActive ? <Pause size={12} /> : <Play size={12} />}
            <span>{isActive ? 'Pause' : 'Activate'}</span>
          </button>

          <button
            type="button"
            className="btn-auto-icon"
            onClick={() => onDuplicate(flow)}
            title="Duplicate Journey Flow"
          >
            <Copy size={13} />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="btn-auto-icon"
            onClick={() => onEdit(flow)}
            title="Edit Journey Steps"
          >
            <Edit size={13} />
          </button>

          <button
            type="button"
            className="btn-auto-icon delete"
            onClick={() => onDelete(flow.id)}
            title="Delete Automation Flow"
          >
            <Trash2 size={13} />
          </button>

          <button
            type="button"
            className="btn-auto-view"
            onClick={() => onOpenDetails(flow)}
          >
            <Eye size={12} />
            <span>View Flow</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AutomationCard;
