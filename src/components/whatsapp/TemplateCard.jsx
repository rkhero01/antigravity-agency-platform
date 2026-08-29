import React from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Edit,
  Trash2,
  Send,
  Eye,
  MessageCircle,
  Sparkles,
  Globe,
  Tag,
} from 'lucide-react';
import { whatsappService } from '../../services/whatsappService.js';

export function TemplateCard({
  template,
  onOpenDetails,
  onEdit,
  onDuplicate,
  onDelete,
  onUseTemplate,
}) {
  const metrics = whatsappService.calculateTemplateMetrics(template);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="template-status-badge approved">
            <CheckCircle2 size={11} /> Meta Approved
          </span>
        );
      case 'Pending':
        return (
          <span className="template-status-badge pending">
            <Clock size={11} /> Pending Review
          </span>
        );
      case 'Rejected':
        return (
          <span className="template-status-badge rejected">
            <XCircle size={11} /> Rejected
          </span>
        );
      default:
        return <span className="template-status-badge">{status}</span>;
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Marketing':
        return '#f59e0b';
      case 'Utility':
        return '#3b82f6';
      case 'Authentication':
        return '#8b5cf6';
      case 'Appointment':
        return '#06b6d4';
      case 'Payment':
        return '#22c55e';
      default:
        return '#ec4899';
    }
  };

  return (
    <div className="wa-template-card" onClick={() => onOpenDetails(template)}>
      {/* Top Header */}
      <div className="template-card-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="template-cat-tag"
              style={{
                background: `${getCategoryColor(template.category)}18`,
                color: getCategoryColor(template.category),
              }}
            >
              {template.category}
            </span>
            <span className="template-lang-tag">
              <Globe size={10} /> {template.language}
            </span>
          </div>
          <h4 className="template-card-title">{template.name}</h4>
          <span className="template-code-slug"><code>{template.name.toUpperCase()}</code></span>
        </div>
        {getStatusBadge(template.status)}
      </div>

      {/* Message Preview Bubble Snippet */}
      <div className="template-preview-snippet-box">
        <p className="template-snippet-text">{template.content}</p>
      </div>

      {/* Dynamic Variables Chips */}
      {template.variables && template.variables.length > 0 && (
        <div className="template-variables-row">
          <span className="text-[11px] text-dim flex-shrink-0">Vars:</span>
          <div className="flex items-center gap-1 overflow-x-auto">
            {template.variables.map((v, idx) => (
              <span key={idx} className="template-var-pill">
                {`{{${idx + 1}}}`}: {v}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Usage & Delivery Metrics Bar */}
      <div className="template-metrics-bar">
        <div className="t-stat">
          <span className="lbl">Total Usage</span>
          <strong className="val text-white">{template.usageCount || 0}</strong>
        </div>

        <div className="t-stat">
          <span className="lbl">Delivery</span>
          <strong className="val text-success">{metrics.deliveryRate}</strong>
        </div>

        <div className="t-stat">
          <span className="lbl">Reply Rate</span>
          <strong className="val text-purple">{metrics.replyRate}</strong>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="template-card-footer" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="btn-tpl-action use"
            onClick={() => onUseTemplate(template)}
            title="Use template in direct message"
          >
            <Send size={12} />
            <span>Use Template</span>
          </button>

          <button
            type="button"
            className="btn-tpl-icon"
            onClick={() => onDuplicate(template)}
            title="Duplicate Template"
          >
            <Copy size={13} />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="btn-tpl-icon"
            onClick={() => onEdit(template)}
            title="Edit Template"
          >
            <Edit size={13} />
          </button>

          <button
            type="button"
            className="btn-tpl-icon delete"
            onClick={() => onDelete(template.id)}
            title="Delete Template"
          >
            <Trash2 size={13} />
          </button>

          <button
            type="button"
            className="btn-tpl-view"
            onClick={() => onOpenDetails(template)}
          >
            <Eye size={12} />
            <span>View</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemplateCard;
