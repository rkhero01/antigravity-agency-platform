import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Clock,
  MessageSquare,
  GitBranch,
  UserCheck,
  Tag,
  Bell,
  Plus,
  CheckCircle2,
  Trash2,
  Sparkles,
  ArrowDown,
} from 'lucide-react';
import { AutomationFlowViewer } from './AutomationFlowViewer.jsx';
import { whatsappClients } from '../../data/mockWhatsApp.js';
import { whatsappService } from '../../services/whatsappService.js';

export function CreateAutomationModal({
  isOpen,
  onClose,
  onSubmitFlow,
  editingFlow = null,
  clients = whatsappClients,
}) {
  const [currentStep, setCurrentStep] = useState(1); // 1: Info, 2: Trigger, 3: Steps, 4: Preview & Settings
  const [templates, setTemplates] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: 'c1',
    trigger: 'New Meta / Google Ad Inbound Form Submission',
    triggerSource: 'Meta Ads',
    status: 'Active',
    steps: [
      'Trigger: Ad Lead Received via Webhook',
      'Action: Send Instant Welcome WhatsApp with personalized name',
      'Action: Wait 15 Minutes',
      'Condition: Check if user replies within 15 minutes',
      'Action: Assign lead to sales executive (Rajesh Sharma) & advance CRM stage to Contacted',
    ],
    maxEnrollments: 5000,
    allowReentry: false,
    stopOnReply: true,
    stopOnWon: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadTemplates();
  }, [formData.clientId]);

  useEffect(() => {
    if (editingFlow) {
      setFormData({
        name: editingFlow.name || '',
        description: editingFlow.description || '',
        clientId: editingFlow.clientId || 'c1',
        trigger: editingFlow.trigger || 'New Meta / Google Ad Inbound Form Submission',
        triggerSource: 'Meta Ads',
        status: editingFlow.status || 'Active',
        steps: editingFlow.steps || [
          'Trigger: Event Received',
          'Action: Send WhatsApp response',
        ],
        maxEnrollments: 5000,
        allowReentry: false,
        stopOnReply: true,
        stopOnWon: true,
      });
      setCurrentStep(1);
    } else {
      setFormData({
        name: '',
        description: '',
        clientId: 'c1',
        trigger: 'New Meta / Google Ad Inbound Form Submission',
        triggerSource: 'Meta Ads',
        status: 'Active',
        steps: [
          'Trigger: Ad Lead Received via Webhook',
          'Action: Send Instant Welcome WhatsApp with personalized name',
          'Action: Wait 15 Minutes',
          'Condition: Check if user replies within 15 minutes',
          'Action: Assign lead to sales executive (Rajesh Sharma) & advance CRM stage to Contacted',
        ],
        maxEnrollments: 5000,
        allowReentry: false,
        stopOnReply: true,
        stopOnWon: true,
      });
      setCurrentStep(1);
    }
  }, [editingFlow, isOpen]);

  const loadTemplates = async () => {
    const tmpls = await whatsappService.getTemplates({ clientId: formData.clientId });
    setTemplates(tmpls);
  };

  if (!isOpen) return null;

  const handleAddStep = (stepType) => {
    let newStepText = '';
    if (stepType === 'message') {
      const tmpl = templates[0]?.name || 'diwali_vip_membership_offer';
      newStepText = `Action: Send Meta template message [${tmpl}]`;
    } else if (stepType === 'delay') {
      newStepText = 'Action: Wait 2 Hours';
    } else if (stepType === 'condition') {
      newStepText = 'Condition: If customer replies within 2 hours';
    } else if (stepType === 'crm') {
      newStepText = 'Action: Move CRM Deal Stage to Qualified & Assign Dedicated Account Manager';
    } else if (stepType === 'tag') {
      newStepText = 'Action: Tag contact with [Hot Lead] & [High Intent]';
    }

    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, newStepText],
    }));
  };

  const handleRemoveStep = (index) => {
    if (formData.steps.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, idx) => idx !== index),
    }));
  };

  const handleStepTextChange = (index, text) => {
    const updated = [...formData.steps];
    updated[index] = text;
    setFormData((prev) => ({
      ...prev,
      steps: updated,
    }));
  };

  const handleSubmit = (statusToSubmit = 'Active') => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Journey name is required';
    if (!formData.steps || formData.steps.length === 0) {
      newErrors.steps = 'At least 1 journey step is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setCurrentStep(1);
      return;
    }

    const client = clients.find((c) => c.id === formData.clientId) || clients[0];
    const payload = {
      ...formData,
      clientName: client.name,
      status: statusToSubmit,
      id: editingFlow ? editingFlow.id : undefined,
    };

    onSubmitFlow(payload);
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card create-automation-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Zap size={18} />
            </div>
            <div>
              <h3 className="modal-title">
                {editingFlow ? 'Edit WhatsApp Journey Flow' : 'Create Visual Automation Journey'}
              </h3>
              <p className="modal-subtitle">
                Configure event triggers, time delays, Meta templates, and CRM pipeline actions
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Multi-Step Wizard Navigation */}
        <div className="wizard-step-tabs-bar">
          <button
            type="button"
            className={`wizard-step-tab ${currentStep === 1 ? 'active' : ''}`}
            onClick={() => setCurrentStep(1)}
          >
            1. Basic Info
          </button>
          <button
            type="button"
            className={`wizard-step-tab ${currentStep === 2 ? 'active' : ''}`}
            onClick={() => setCurrentStep(2)}
          >
            2. Trigger Event
          </button>
          <button
            type="button"
            className={`wizard-step-tab ${currentStep === 3 ? 'active' : ''}`}
            onClick={() => setCurrentStep(3)}
          >
            3. Journey Steps ({formData.steps.length})
          </button>
          <button
            type="button"
            className={`wizard-step-tab ${currentStep === 4 ? 'active' : ''}`}
            onClick={() => setCurrentStep(4)}
          >
            4. Preview & Settings
          </button>
        </div>

        {/* Wizard Step Bodies */}
        <div className="create-automation-body">
          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="wizard-step-pane">
              <div className="form-grid-two-col">
                <div className="form-field-group">
                  <label className="form-label">
                    Automation Journey Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Instant Lead Qualification & Meeting Scheduler"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`form-text-input ${errors.name ? 'error' : ''}`}
                  />
                  {errors.name && <span className="form-error-msg">{errors.name}</span>}
                </div>

                <div className="form-field-group">
                  <label className="form-label">Client Workspace</label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="form-select-input"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-field-group mt-2">
                <label className="form-label">Journey Goal / Strategic Objective</label>
                <textarea
                  rows={3}
                  placeholder="Describe what this customer journey accomplishes (e.g. Automatically engage inbound ad leads within 30s to secure high-ticket consultative appointments)..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Trigger Selection */}
          {currentStep === 2 && (
            <div className="wizard-step-pane">
              <div className="form-field-group">
                <label className="form-label">Select Inbound Event Trigger</label>
                <select
                  value={formData.trigger}
                  onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                  className="form-select-input text-sm font-semibold"
                >
                  <option value="New Meta / Google Ad Inbound Form Submission">
                    ⚡ New Meta / Google Ad Inbound Form Submission
                  </option>
                  <option value="Inbound WhatsApp Inquiry unreplied for > 15 Mins">
                    ⏰ Inbound WhatsApp Inquiry Unreplied for &gt; 15 Mins
                  </option>
                  <option value="Shopify / WooCommerce Cart Abandonment Event">
                    🛒 Shopify / WooCommerce Cart Abandonment Event
                  </option>
                  <option value="Appointment Confirmed via Website Booking Engine">
                    📅 Appointment Confirmed via Website Booking Engine
                  </option>
                  <option value="E-commerce Purchase Completed (Post-Purchase)">
                    🛍️ E-commerce Purchase Completed (Post-Purchase Nudge)
                  </option>
                  <option value="Inactive Customer (> 45 Days No Order)">
                    🔄 Inactive Customer (&gt; 45 Days No Order)
                  </option>
                  <option value="High-Intent Lead Score Milestone (Score > 85)">
                    🔥 High-Intent Lead Score Milestone (Score &gt; 85)
                  </option>
                </select>
              </div>

              <div className="detail-card-panel mt-3">
                <span className="text-xs text-primary font-bold block mb-1">
                  Trigger Parameters & Source Routing:
                </span>
                <p className="text-xs text-muted leading-relaxed">
                  When this trigger fires via webhook or API event, the contact will be automatically enrolled into this WhatsApp journey and receive sequential automated touchpoints according to configured delay intervals.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Journey Steps Editor */}
          {currentStep === 3 && (
            <div className="wizard-step-pane">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-dim font-bold uppercase">
                  Journey Sequence Steps ({formData.steps.length})
                </span>

                {/* Add Step Buttons Bar */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    className="btn-add-step-type msg"
                    onClick={() => handleAddStep('message')}
                  >
                    <MessageSquare size={11} />
                    <span>+ Message</span>
                  </button>
                  <button
                    type="button"
                    className="btn-add-step-type delay"
                    onClick={() => handleAddStep('delay')}
                  >
                    <Clock size={11} />
                    <span>+ Delay</span>
                  </button>
                  <button
                    type="button"
                    className="btn-add-step-type cond"
                    onClick={() => handleAddStep('condition')}
                  >
                    <GitBranch size={11} />
                    <span>+ Condition</span>
                  </button>
                  <button
                    type="button"
                    className="btn-add-step-type crm"
                    onClick={() => handleAddStep('crm')}
                  >
                    <UserCheck size={11} />
                    <span>+ CRM Action</span>
                  </button>
                  <button
                    type="button"
                    className="btn-add-step-type tag"
                    onClick={() => handleAddStep('tag')}
                  >
                    <Tag size={11} />
                    <span>+ Tag</span>
                  </button>
                </div>
              </div>

              {/* Steps Scroll List */}
              <div className="wizard-steps-editor-list">
                {formData.steps.map((step, idx) => (
                  <div key={idx} className="step-edit-item-row">
                    <span className="step-num-circle">{idx + 1}</span>
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => handleStepTextChange(idx, e.target.value)}
                      className="step-text-input"
                    />
                    <button
                      type="button"
                      className="btn-remove-step"
                      onClick={() => handleRemoveStep(idx)}
                      title="Remove step"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Preview & Settings */}
          {currentStep === 4 && (
            <div className="wizard-step-pane">
              <div className="create-automation-preview-split">
                {/* Visual Flow Stream Left */}
                <div className="preview-stream-col">
                  <span className="text-xs text-primary font-bold block mb-2">
                    Visual Customer Journey Stream:
                  </span>
                  <AutomationFlowViewer flow={formData} />
                </div>

                {/* Execution Settings Right */}
                <div className="preview-settings-col">
                  <span className="text-xs text-white font-bold block mb-2 uppercase">
                    Execution Rules & Policy
                  </span>

                  <div className="flex flex-col gap-2.5">
                    <label className="checkbox-setting-row">
                      <input
                        type="checkbox"
                        checked={formData.stopOnReply}
                        onChange={(e) =>
                          setFormData({ ...formData, stopOnReply: e.target.checked })
                        }
                      />
                      <span className="text-xs text-white">Stop journey when customer replies</span>
                    </label>

                    <label className="checkbox-setting-row">
                      <input
                        type="checkbox"
                        checked={formData.stopOnWon}
                        onChange={(e) =>
                          setFormData({ ...formData, stopOnWon: e.target.checked })
                        }
                      />
                      <span className="text-xs text-white">Stop journey when CRM Deal is Won</span>
                    </label>

                    <label className="checkbox-setting-row">
                      <input
                        type="checkbox"
                        checked={formData.allowReentry}
                        onChange={(e) =>
                          setFormData({ ...formData, allowReentry: e.target.checked })
                        }
                      />
                      <span className="text-xs text-white">Allow contact re-entry after 30 days</span>
                    </label>
                  </div>

                  <div className="meta-policy-notice-box mt-4">
                    <strong className="text-xs text-success block mb-1">
                      ✓ Meta Cloud API Safe Dispatch:
                    </strong>
                    <p className="text-[11px] text-muted leading-relaxed">
                      All message steps will automatically dispatch approved 24-hour window customer replies or Meta-verified utility/marketing templates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="modal-dialog-footer">
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn-saas-secondary"
                onClick={() => setCurrentStep((prev) => prev - 1)}
              >
                Back
              </button>
            )}
            <button type="button" className="btn-saas-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentStep < 4 ? (
              <button
                type="button"
                className="btn-wa-primary"
                onClick={() => setCurrentStep((prev) => prev + 1)}
              >
                <span>Next Step</span>
                <ArrowDown size={14} className="-rotate-90" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-saas-secondary"
                  onClick={() => handleSubmit('Paused')}
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  className="btn-wa-primary"
                  onClick={() => handleSubmit('Active')}
                >
                  <CheckCircle2 size={16} />
                  <span>{editingFlow ? 'Save Changes' : 'Activate Live Journey'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateAutomationModal;
