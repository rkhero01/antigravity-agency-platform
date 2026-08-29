import React, { useState } from 'react';
import {
  X,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Edit,
  Trash2,
  Send,
  Globe,
  Tag,
  Sparkles,
  Calendar,
  Layers,
  Building,
  Check,
} from 'lucide-react';
import { whatsappService } from '../../services/whatsappService.js';

export function TemplateDetailModal({
  template,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onUseTemplate,
}) {
  const [testVars, setTestVars] = useState({});
  const [copied, setCopied] = useState(false);

  if (!isOpen || !template) return null;

  const metrics = whatsappService.calculateTemplateMetrics(template);

  const getInterpolatedText = () => {
    let text = template.content;
    template.variables?.forEach((v, idx) => {
      const val = testVars[`var_${idx + 1}`] || `{{${idx + 1}}}`;
      text = text.split(`{{${idx + 1}}}`).join(val);
    });
    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(template.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card wa-template-detail-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="flex items-center gap-3 min-w-0">
            <div className="modal-icon-badge">
              <FileText size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="modal-title truncate">{template.name}</h3>
                <span className={`template-status-badge ${template.status.toLowerCase()}`}>
                  {template.status === 'Approved' && <CheckCircle2 size={11} />}
                  {template.status === 'Pending' && <Clock size={11} />}
                  {template.status === 'Rejected' && <XCircle size={11} />}
                  {template.status}
                </span>
              </div>
              <p className="modal-subtitle">
                Category: {template.category} • Language: {template.language} • Code: <code>{template.name.toUpperCase()}</code>
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="wa-template-detail-body">
          <div className="wa-template-detail-grid">
            {/* Left Column: Live WhatsApp Sandbox & Variables */}
            <div className="template-sandbox-col">
              <h4 className="detail-panel-title">1. WhatsApp Message Simulation</h4>

              {/* Realistic WhatsApp Chat Bubble */}
              <div className="template-chat-sandbox-box">
                <div className="sandbox-incoming-context">
                  <span className="text-[11px] text-dim">User Inbound Trigger:</span>
                  <div className="sandbox-incoming-bubble">
                    <span>Hi, I would like to know more about this offer.</span>
                  </div>
                </div>

                <div className="sandbox-outgoing-bubble">
                  <div className="template-verified-meta-tag">
                    <Sparkles size={11} /> Meta Verified Business Template
                  </div>
                  <p className="sandbox-bubble-text">{getInterpolatedText()}</p>
                  <span className="sandbox-time-stamp">12:30 PM ✓✓</span>
                </div>
              </div>

              {/* Dynamic Variable Sandbox Inputs */}
              {template.variables && template.variables.length > 0 && (
                <div className="variable-sandbox-fields-card">
                  <span className="text-xs text-primary font-bold block mb-2">
                    Simulate Dynamic Variable Parameters:
                  </span>
                  <div className="flex flex-col gap-2">
                    {template.variables.map((v, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs text-dim w-24 flex-shrink-0">
                          {`{{${idx + 1}}}`} ({v}):
                        </span>
                        <input
                          type="text"
                          placeholder={`Enter test value for ${v}...`}
                          value={testVars[`var_${idx + 1}`] || ''}
                          onChange={(e) =>
                            setTestVars({ ...testVars, [`var_${idx + 1}`]: e.target.value })
                          }
                          className="form-text-input-mini"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Telemetry & Meta Information */}
            <div className="template-telemetry-col">
              <h4 className="detail-panel-title">2. Deliverability & Performance</h4>

              {/* 3 Metric Cards */}
              <div className="template-stat-cards-stack">
                <div className="tpl-stat-box">
                  <span className="lbl">Total Message Sends</span>
                  <strong className="val text-white">{template.usageCount || 0}</strong>
                  <span className="sub text-dim">CRM broadcasts & replies</span>
                </div>

                <div className="tpl-stat-box">
                  <span className="lbl">Delivery Reliability</span>
                  <strong className="val text-success">{metrics.deliveryRate}</strong>
                  <span className="sub text-success">Meta Cloud Tier 3</span>
                </div>

                <div className="tpl-stat-box">
                  <span className="lbl">Customer Reply Rate</span>
                  <strong className="val text-purple">{metrics.replyRate}</strong>
                  <span className="sub text-dim">Conversational feedback</span>
                </div>
              </div>

              {/* Meta Sync Info */}
              <div className="detail-card-panel mt-3">
                <h4 className="detail-panel-title">3. Meta API Specifications</h4>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-dim">Template ID:</span>
                    <span className="text-white font-mono">{template.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dim">Category:</span>
                    <span className="text-cyan">{template.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dim">Language:</span>
                    <span className="text-white">{template.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dim">Status:</span>
                    <span className="text-success font-semibold">{template.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dim">Created:</span>
                    <span className="text-muted">{template.createdAt || 'Recent'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-dialog-footer">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-saas-secondary text-xs"
              onClick={handleCopy}
            >
              {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Template'}</span>
            </button>

            <button
              type="button"
              className="btn-saas-secondary text-xs"
              onClick={() => {
                onClose();
                onDuplicate(template);
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
                onDelete(template.id);
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
                onEdit(template);
              }}
            >
              Edit
            </button>

            <button
              type="button"
              className="btn-wa-primary"
              onClick={() => {
                onClose();
                onUseTemplate(template);
              }}
            >
              <Send size={14} />
              <span>Use in Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateDetailModal;
