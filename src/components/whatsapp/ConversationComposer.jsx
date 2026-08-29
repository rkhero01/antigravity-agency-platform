import React, { useState, useEffect } from 'react';
import {
  Send,
  FileText,
  Smile,
  Paperclip,
  X,
  CheckCircle2,
  Sparkles,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { whatsappService } from '../../services/whatsappService.js';

export function ConversationComposer({
  conversation,
  onSendMessage,
  onSendTemplate,
}) {
  const [messageText, setMessageText] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateVariables, setTemplateVariables] = useState({});

  useEffect(() => {
    loadTemplates();
  }, [conversation]);

  const loadTemplates = async () => {
    const tmpls = await whatsappService.getTemplates({
      clientId: conversation?.clientId || 'all',
    });
    setTemplates(tmpls);
    if (tmpls.length > 0) {
      setSelectedTemplate(tmpls[0]);
      initTemplateVariables(tmpls[0]);
    }
  };

  const initTemplateVariables = (tmpl) => {
    if (!tmpl) return;
    const initialVars = {};
    tmpl.variables?.forEach((v, idx) => {
      initialVars[`var_${idx + 1}`] = idx === 0 ? conversation?.contactName || '' : '';
    });
    setTemplateVariables(initialVars);
  };

  const handleSelectTemplate = (tmpl) => {
    setSelectedTemplate(tmpl);
    initTemplateVariables(tmpl);
  };

  const handleVariableChange = (key, val) => {
    setTemplateVariables((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleSendText = (e) => {
    if (e) e.preventDefault();
    if (!messageText.trim()) return;
    onSendMessage(messageText.trim());
    setMessageText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const handleSendTemplateSubmit = (e) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    onSendTemplate(selectedTemplate.id, templateVariables);
    setShowTemplateModal(false);
  };

  const getPreviewText = () => {
    if (!selectedTemplate) return '';
    let text = selectedTemplate.content;
    selectedTemplate.variables?.forEach((v, idx) => {
      const val = templateVariables[`var_${idx + 1}`] || `[${v}]`;
      text = text.split(`{{${idx + 1}}}`).join(val);
    });
    return text;
  };

  const insertQuickSnippet = (snippet) => {
    setMessageText((prev) => (prev ? `${prev} ${snippet}` : snippet));
  };

  return (
    <div className="wa-composer-container">
      {/* Quick Snippets Bar */}
      <div className="wa-quick-snippets-bar">
        <button
          type="button"
          className="btn-snippet-pill"
          onClick={() => insertQuickSnippet(`Namaste ${conversation?.contactName || ''}, how can we help you today?`)}
        >
          👋 Greeting
        </button>

        <button
          type="button"
          className="btn-snippet-pill"
          onClick={() => insertQuickSnippet('Here is the secure payment link: https://pay.apexfit.com/pass')}
        >
          <DollarSign size={11} className="text-success" /> Payment Link
        </button>

        <button
          type="button"
          className="btn-snippet-pill"
          onClick={() => insertQuickSnippet('Would tomorrow at 11:00 AM work for your discovery briefing?')}
        >
          <Calendar size={11} className="text-cyan" /> Slot Invite
        </button>

        <button
          type="button"
          className="btn-snippet-pill highlight"
          onClick={() => setShowTemplateModal(true)}
        >
          <FileText size={12} /> Meta Template
        </button>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSendText} className="wa-composer-form">
        <textarea
          rows={2}
          placeholder={`Reply to ${conversation?.contactName || 'contact'} on WhatsApp (Press Enter to send)...`}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="wa-composer-textarea"
        />

        <div className="wa-composer-actions-row">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="btn-composer-icon"
              onClick={() => setShowTemplateModal(true)}
              title="Insert Approved WhatsApp Template"
            >
              <FileText size={16} />
            </button>
            <button
              type="button"
              className="btn-composer-icon"
              onClick={() => insertQuickSnippet('👍')}
              title="Add Emoji"
            >
              <Smile size={16} />
            </button>
            <button
              type="button"
              className="btn-composer-icon"
              onClick={() => insertQuickSnippet('📎 [Brochure Attached]')}
              title="Attach Media File"
            >
              <Paperclip size={16} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="wa-char-count text-xs text-dim">
              {messageText.length} chars
            </span>
            <button
              type="submit"
              disabled={!messageText.trim()}
              className="btn-wa-send-submit"
              title="Send WhatsApp Message (Enter)"
            >
              <Send size={15} />
              <span>Send</span>
            </button>
          </div>
        </div>
      </form>

      {/* Template Modal / Popover */}
      {showTemplateModal && (
        <div className="modal-backdrop-overlay" onClick={() => setShowTemplateModal(false)}>
          <div
            className="modal-dialog-card wa-template-send-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-dialog-header">
              <div className="modal-title-with-icon">
                <div className="modal-icon-badge">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="modal-title">Send Meta-Approved WhatsApp Template</h3>
                  <p className="modal-subtitle">
                    Select a verified message template and populate dynamic variable parameters
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setShowTemplateModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendTemplateSubmit} className="wa-template-modal-body">
              <div className="wa-template-grid-two">
                {/* Template Selector Left */}
                <div className="template-select-col">
                  <label className="form-label">Select Template ({templates.length} Available)</label>
                  <div className="templates-scroll-list">
                    {templates.map((tmpl) => (
                      <div
                        key={tmpl.id}
                        className={`template-pick-item ${selectedTemplate?.id === tmpl.id ? 'active' : ''}`}
                        onClick={() => handleSelectTemplate(tmpl)}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <strong className="text-white text-xs">{tmpl.name}</strong>
                          <span className="template-cat-chip">{tmpl.category}</span>
                        </div>
                        <span className="text-dim text-xs block truncate">{tmpl.content}</span>
                        <div className="flex justify-between items-center mt-1 text-[11px] text-muted">
                          <span>{tmpl.language}</span>
                          <span className="text-success">{tmpl.deliveryRate} Delivery</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Variables & Preview Right */}
                <div className="template-vars-col">
                  <label className="form-label">Populate Dynamic Variables</label>
                  <div className="vars-fields-list">
                    {selectedTemplate?.variables?.map((v, idx) => (
                      <div key={idx} className="form-field-group">
                        <label className="form-label-mini">
                          Variable {`{{${idx + 1}}}`}: <strong>{v}</strong>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={`Enter value for ${v}...`}
                          value={templateVariables[`var_${idx + 1}`] || ''}
                          onChange={(e) => handleVariableChange(`var_${idx + 1}`, e.target.value)}
                          className="form-text-input-mini"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Live Message Preview */}
                  <div className="wa-template-preview-box">
                    <span className="text-xs text-primary font-bold block mb-1">Live WhatsApp Preview:</span>
                    <div className="wa-preview-bubble">
                      <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">
                        {getPreviewText()}
                      </p>
                      <span className="preview-time-stamp">12:30 PM ✓✓</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="btn-saas-secondary"
                  onClick={() => setShowTemplateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-wa-primary"
                >
                  <Send size={14} />
                  <span>Send Template Message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConversationComposer;
