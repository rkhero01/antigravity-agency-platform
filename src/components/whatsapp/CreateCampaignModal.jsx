import React, { useState, useEffect } from 'react';
import {
  X,
  Megaphone,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Users,
  Send,
  Eye,
  MessageCircle,
  Award,
  DollarSign,
} from 'lucide-react';
import { whatsappClients } from '../../data/mockWhatsApp.js';
import { whatsappService } from '../../services/whatsappService.js';

export function CreateCampaignModal({
  isOpen,
  onClose,
  onSubmitCampaign,
  editingCampaign = null,
  clients = whatsappClients,
}) {
  const [formData, setFormData] = useState({
    name: '',
    clientId: 'c1',
    type: 'Promotional',
    audience: 'VIP Repeat Customers & High-Intent Inactive Leads',
    recipients: '2500',
    templateName: 'diwali_vip_membership_offer',
    scheduledDate: 'Tomorrow at 10:00 AM',
    spend: '3500',
    status: 'Draft',
  });

  const [templates, setTemplates] = useState([]);
  const [estimate, setEstimate] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadTemplates();
  }, [formData.clientId]);

  useEffect(() => {
    if (editingCampaign) {
      setFormData({
        name: editingCampaign.name || '',
        clientId: editingCampaign.clientId || 'c1',
        type: editingCampaign.type || 'Promotional',
        audience: editingCampaign.audience || '',
        recipients: String(editingCampaign.recipients || '2500'),
        templateName: editingCampaign.templateName || 'diwali_vip_membership_offer',
        scheduledDate: editingCampaign.scheduledDate || 'Tomorrow at 10:00 AM',
        spend: String(editingCampaign.spend || '3500'),
        status: editingCampaign.status || 'Draft',
      });
    } else {
      setFormData({
        name: '',
        clientId: 'c1',
        type: 'Promotional',
        audience: 'VIP Repeat Customers & High-Intent Inactive Leads',
        recipients: '2500',
        templateName: 'diwali_vip_membership_offer',
        scheduledDate: 'Tomorrow at 10:00 AM',
        spend: '3500',
        status: 'Draft',
      });
    }
  }, [editingCampaign, isOpen]);

  useEffect(() => {
    calculateEstimates();
  }, [formData.recipients, formData.spend]);

  const loadTemplates = async () => {
    const tmpls = await whatsappService.getTemplates({ clientId: formData.clientId });
    setTemplates(tmpls);
  };

  const calculateEstimates = async () => {
    const est = await whatsappService.estimateBroadcast({
      recipients: formData.recipients,
      spend: formData.spend,
    });
    setEstimate(est);
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Campaign title is required';
    if (!formData.recipients || parseInt(formData.recipients, 10) <= 0) {
      newErrors.recipients = 'Please specify valid audience recipient count';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const client = clients.find((c) => c.id === formData.clientId) || clients[0];
    const payload = {
      ...formData,
      clientName: client.name,
      recipients: parseInt(formData.recipients, 10),
      spend: parseInt(formData.spend, 10),
      id: editingCampaign ? editingCampaign.id : undefined,
    };

    onSubmitCampaign(payload);
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card create-campaign-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Megaphone size={18} />
            </div>
            <div>
              <h3 className="modal-title">
                {editingCampaign ? 'Edit WhatsApp Campaign' : 'Create WhatsApp Broadcast Campaign'}
              </h3>
              <p className="modal-subtitle">
                Configure Meta-approved template broadcasts, target audience segments, and automated scheduling
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="create-campaign-form">
          <div className="form-grid-two-col">
            <div className="form-field-group">
              <label className="form-label">
                Campaign Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Festive Diwali Flash Glow Drop"
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

          <div className="form-grid-three-col">
            <div className="form-field-group">
              <label className="form-label">Campaign Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="form-select-input"
              >
                <option value="Promotional">Promotional</option>
                <option value="Lead Follow-up">Lead Follow-up</option>
                <option value="Abandoned Cart">Abandoned Cart</option>
                <option value="Win-back">Win-back</option>
                <option value="Broadcast">Broadcast</option>
              </select>
            </div>

            <div className="form-field-group">
              <label className="form-label">Meta Message Template</label>
              <select
                value={formData.templateName}
                onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                className="form-select-input"
              >
                {templates.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.name}>
                    {tmpl.name} ({tmpl.language})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field-group">
              <label className="form-label">Audience Size (Recipients)</label>
              <input
                type="number"
                min="10"
                value={formData.recipients}
                onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                className="form-text-input"
              />
            </div>
          </div>

          <div className="form-grid-two-col">
            <div className="form-field-group">
              <label className="form-label">Target Audience Segment</label>
              <input
                type="text"
                placeholder="e.g. Repeat Purchasers & Past 30D Cart Abandoners"
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                className="form-text-input"
              />
            </div>

            <div className="form-field-group">
              <label className="form-label">Scheduled Date / Timing</label>
              <input
                type="text"
                placeholder="e.g. Sep 02, 2026 at 10:00 AM"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="form-text-input"
              />
            </div>
          </div>

          {/* Pre-Broadcast Estimated Performance Box */}
          {estimate && (
            <div className="campaign-estimator-box">
              <div className="flex items-center gap-1.5 mb-2 text-xs text-primary font-bold">
                <Sparkles size={14} />
                <span>Projected Pre-Broadcast Telemetry Estimates</span>
                <span className="text-dim font-normal">(Based on historical Meta API response curves)</span>
              </div>

              <div className="estimator-metrics-grid">
                <div className="est-col">
                  <span className="est-lbl">Projected Delivery</span>
                  <strong className="est-val text-success">{estimate.estimatedDelivery.toLocaleString()}</strong>
                  <span className="est-sub">~99.2% rate</span>
                </div>

                <div className="est-col">
                  <span className="est-lbl">Projected Reads</span>
                  <strong className="est-val text-cyan">{estimate.estimatedReads.toLocaleString()}</strong>
                  <span className="est-sub">~88.5% opens</span>
                </div>

                <div className="est-col">
                  <span className="est-lbl">Projected Replies</span>
                  <strong className="est-val text-purple">{estimate.estimatedReplies.toLocaleString()}</strong>
                  <span className="est-sub">~28.4% reply</span>
                </div>

                <div className="est-col">
                  <span className="est-lbl">Est. Conversions</span>
                  <strong className="est-val text-pink">{estimate.estimatedConversions.toLocaleString()}</strong>
                  <span className="est-sub">~24.5% close</span>
                </div>

                <div className="est-col">
                  <span className="est-lbl">Est. Revenue</span>
                  <strong className="est-val text-warning">₹{estimate.estimatedRevenue.toLocaleString()}</strong>
                  <span className="est-sub">Projected gross</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="modal-dialog-footer">
            <button type="button" className="btn-saas-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-wa-primary">
              <CheckCircle2 size={16} />
              <span>{editingCampaign ? 'Save Changes' : 'Schedule Broadcast Campaign'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCampaignModal;
