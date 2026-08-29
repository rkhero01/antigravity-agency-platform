import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  FileText,
  UserCheck,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { whatsappService } from '../../services/whatsappService.js';

export function UseTemplateModal({
  template,
  isOpen,
  onClose,
  onTemplateSent,
}) {
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState('');
  const [variables, setVariables] = useState({});

  useEffect(() => {
    if (isOpen && template) {
      loadConversations();
      initVariables();
    }
  }, [isOpen, template]);

  const loadConversations = async () => {
    const convs = await whatsappService.getConversations({
      clientId: template?.clientId || 'all',
    });
    setConversations(convs);
    if (convs.length > 0) {
      setSelectedConvId(convs[0].id);
    }
  };

  const initVariables = () => {
    if (!template) return;
    const initialVars = {};
    template.variables?.forEach((v, idx) => {
      initialVars[`var_${idx + 1}`] = '';
    });
    setVariables(initialVars);
  };

  if (!isOpen || !template) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedConvId) return;

    await whatsappService.sendTemplateMessage(selectedConvId, template.id, variables);
    if (onTemplateSent) onTemplateSent(template.name, selectedConvId);
    onClose();
  };

  const getPreviewText = () => {
    let text = template.content;
    template.variables?.forEach((v, idx) => {
      const val = variables[`var_${idx + 1}`] || `[${v}]`;
      text = text.split(`{{${idx + 1}}}`).join(val);
    });
    return text;
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card use-template-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Send size={18} />
            </div>
            <div>
              <h3 className="modal-title">Use Template: {template.name}</h3>
              <p className="modal-subtitle">
                Dispatch this Meta-approved template directly to a client conversation
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSend} className="use-template-body">
          {/* Target Conversation */}
          <div className="form-field-group">
            <label className="form-label">Select Target Contact</label>
            <select
              value={selectedConvId}
              onChange={(e) => setSelectedConvId(e.target.value)}
              className="form-select-input"
              required
            >
              {conversations.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.contactName} ({c.phone}) — {c.clientName} [{c.leadStage}]
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Variables Inputs */}
          {template.variables && template.variables.length > 0 && (
            <div className="form-field-group">
              <label className="form-label">Fill Template Variables</label>
              <div className="flex flex-col gap-2">
                {template.variables.map((v, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-dim w-24 flex-shrink-0">
                      {`{{${idx + 1}}}`} ({v}):
                    </span>
                    <input
                      type="text"
                      required
                      placeholder={`Enter ${v}...`}
                      value={variables[`var_${idx + 1}`] || ''}
                      onChange={(e) =>
                        setVariables({ ...variables, [`var_${idx + 1}`]: e.target.value })
                      }
                      className="form-text-input-mini"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Preview */}
          <div className="wa-template-preview-box">
            <span className="text-xs text-primary font-bold block mb-1">Live Output Preview:</span>
            <div className="wa-preview-bubble">
              <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">
                {getPreviewText()}
              </p>
              <span className="preview-time-stamp">Just now ✓✓</span>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-dialog-footer">
            <button type="button" className="btn-saas-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-wa-primary">
              <Send size={14} />
              <span>Send Message</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UseTemplateModal;
