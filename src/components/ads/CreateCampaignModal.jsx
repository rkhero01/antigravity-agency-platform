import React, { useState } from 'react';
import { X, Sparkles, PlusCircle, CheckCircle2 } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function CreateCampaignModal({ isOpen, onClose, onCreateCampaign }) {
  const [formData, setFormData] = useState({
    campaignName: '',
    clientId: 'c1',
    platform: 'Meta Ads',
    network: 'meta',
    objective: 'Lead Generation',
    dailyBudget: 100,
    headline: '',
    primaryText: '',
    mediaUrl:
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80',
  });

  const [errors, setErrors] = useState({});
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  if (!isOpen) return null;

  const handleAiAutoFill = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      const selectedClient = mockClients.find((c) => c.id === formData.clientId);
      const brandName = selectedClient ? selectedClient.name : 'Apex Fitness';

      setFormData((prev) => ({
        ...prev,
        campaignName: prev.campaignName || `${brandName} High-Intent Q3 Lead Funnel`,
        headline: `Exclusive Introductory Offer from ${brandName}`,
        primaryText: `🚀 Stop waiting and start achieving measurable results! Connect with ${brandName} today and unlock our proven framework. Limited spots available this quarter.`,
      }));
      setIsAiGenerating(false);
    }, 450);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.campaignName.trim()) newErrors.campaignName = 'Campaign name is required';
    if (!formData.headline.trim()) newErrors.headline = 'Headline is required';
    if (!formData.primaryText.trim()) newErrors.primaryText = 'Primary copy is required';
    if (formData.dailyBudget <= 0) newErrors.dailyBudget = 'Budget must be greater than $0';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedClient = mockClients.find((c) => c.id === formData.clientId);

    onCreateCampaign({
      campaignName: formData.campaignName.trim(),
      clientId: formData.clientId,
      clientName: selectedClient ? selectedClient.name : 'Agency Client',
      platform: formData.platform,
      network:
        formData.platform === 'Meta Ads'
          ? 'meta'
          : formData.platform === 'Google Ads'
          ? 'google-ads'
          : 'linkedin',
      objective: formData.objective,
      dailyBudget: Number(formData.dailyBudget),
      totalBudget: Number(formData.dailyBudget) * 30,
      adCreative: {
        headline: formData.headline.trim(),
        primaryText: formData.primaryText.trim(),
        mediaUrl: formData.mediaUrl,
      },
    });

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
              <PlusCircle size={18} />
            </div>
            <div>
              <h3 className="modal-title">Launch New Paid Campaign</h3>
              <p className="modal-subtitle">Configure ad network parameters, budget, and creative assets</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="create-campaign-form">
          <div className="form-grid-two-col">
            {/* Client Brand */}
            <div className="form-field-group">
              <label className="form-label">Client Workspace <span className="text-danger">*</span></label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="form-select-input"
              >
                {mockClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.industry})
                  </option>
                ))}
              </select>
            </div>

            {/* Platform Network */}
            <div className="form-field-group">
              <label className="form-label">Ad Network <span className="text-danger">*</span></label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="form-select-input"
              >
                <option value="Meta Ads">Meta Ads (Facebook & Instagram)</option>
                <option value="Google Ads">Google Ads (Search & Performance Max)</option>
                <option value="LinkedIn Ads">LinkedIn Sponsored Content</option>
                <option value="TikTok Ads">TikTok For Business</option>
              </select>
            </div>
          </div>

          <div className="form-grid-two-col">
            {/* Campaign Name */}
            <div className="form-field-group">
              <label className="form-label">Campaign Name <span className="text-danger">*</span></label>
              <input
                type="text"
                placeholder="e.g. Apex Fall Gym Membership Funnel"
                value={formData.campaignName}
                onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                className={`form-text-input ${errors.campaignName ? 'error' : ''}`}
              />
              {errors.campaignName && <span className="form-error-msg">{errors.campaignName}</span>}
            </div>

            {/* Objective */}
            <div className="form-field-group">
              <label className="form-label">Campaign Objective</label>
              <select
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                className="form-select-input"
              >
                <option value="Lead Generation">Lead Generation (Instant Forms & DMs)</option>
                <option value="E-commerce Sales">E-commerce Sales (Catalog & Pixel)</option>
                <option value="Trial Signups">SaaS Trial Signups</option>
                <option value="Website Traffic">High-Intent Traffic</option>
                <option value="Brand Awareness">Brand Reach & Video Views</option>
              </select>
            </div>
          </div>

          {/* Daily Budget */}
          <div className="form-field-group">
            <label className="form-label">Daily Budget (USD) <span className="text-danger">*</span></label>
            <input
              type="number"
              min="10"
              max="5000"
              value={formData.dailyBudget}
              onChange={(e) => setFormData({ ...formData, dailyBudget: e.target.value })}
              className="form-text-input"
            />
          </div>

          {/* AI Auto-Fill Helper */}
          <div className="creative-ai-helper-banner">
            <div className="helper-text">
              <Sparkles size={14} className="text-primary" />
              <span>Need high-converting copy? Use AI Copilot to draft headlines and body text.</span>
            </div>
            <button
              type="button"
              className="btn-ai-auto-draft"
              onClick={handleAiAutoFill}
              disabled={isAiGenerating}
            >
              <Sparkles size={13} />
              <span>{isAiGenerating ? 'Drafting Copy...' : 'AI Auto-Draft Copy'}</span>
            </button>
          </div>

          {/* Ad Headline */}
          <div className="form-field-group">
            <label className="form-label">Ad Creative Headline <span className="text-danger">*</span></label>
            <input
              type="text"
              placeholder="e.g. Claim Your 7-Day VIP Fitness Pass in Austin"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              className={`form-text-input ${errors.headline ? 'error' : ''}`}
            />
            {errors.headline && <span className="form-error-msg">{errors.headline}</span>}
          </div>

          {/* Primary Text */}
          <div className="form-field-group">
            <label className="form-label">Primary Ad Copy <span className="text-danger">*</span></label>
            <textarea
              rows={3}
              placeholder="Write the high-converting ad text..."
              value={formData.primaryText}
              onChange={(e) => setFormData({ ...formData, primaryText: e.target.value })}
              className={`form-textarea-input ${errors.primaryText ? 'error' : ''}`}
            />
            {errors.primaryText && <span className="form-error-msg">{errors.primaryText}</span>}
          </div>

          {/* Modal Footer */}
          <div className="modal-dialog-footer">
            <button type="button" className="btn-saas-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-saas-primary">
              <CheckCircle2 size={16} />
              <span>Launch Campaign</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCampaignModal;
