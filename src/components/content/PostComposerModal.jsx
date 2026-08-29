import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function PostComposerModal({
  isOpen,
  onClose,
  initialDate,
  initialClient,
  initialTitle,
  initialCaption,
  initialHashtags,
  onCreatePost,
}) {
  const [formData, setFormData] = useState({
    clientId: initialClient || 'c1',
    type: 'Post',
    title: initialTitle || '',
    caption: initialCaption || '',
    hashtagsInput: initialHashtags || '#Marketing #Growth #PulseAI',
    platforms: ['instagram', 'facebook'],
    scheduledDate: initialDate || '2026-08-28',
    scheduledTime: '10:00 AM',
    mediaPreview:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    status: 'Scheduled',
  });

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handlePlatformToggle = (plat) => {
    setFormData((prev) => {
      const exists = prev.platforms.includes(plat);
      return {
        ...prev,
        platforms: exists ? prev.platforms.filter((p) => p !== plat) : [...prev.platforms, plat],
      };
    });
  };

  const handleAiGenerate = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      const clientObj = mockClients.find((c) => c.id === formData.clientId);
      const brandName = clientObj ? clientObj.name : 'our brand';
      setFormData((prev) => ({
        ...prev,
        title: prev.title || `Transform Your Routine with ${brandName}`,
        caption: `✨ Consistency is the secret to high performance! Whether you are leveling up your daily workflow or scaling new heights, ${brandName} is here to guide your journey. 🚀 Tap the link in our bio to learn more and join our community today!`,
        hashtagsInput: `#${brandName.replace(/\s+/g, '')} #GrowthMindset #DailyInspiration #MarketingAgency #PerformanceGoals`,
      }));
      setIsGeneratingAi(false);
    }, 400);
  };

  const handleSubmit = (chosenStatus) => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Post title is required';
    if (!formData.caption.trim()) newErrors.caption = 'Caption text is required';
    if (formData.platforms.length === 0) newErrors.platforms = 'Select at least one platform';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedClientObj = mockClients.find((c) => c.id === formData.clientId);

    const parsedHashtags = formData.hashtagsInput
      .split(' ')
      .filter((h) => h.startsWith('#') || h.trim().length > 0)
      .map((h) => (h.startsWith('#') ? h : `#${h}`));

    onCreatePost({
      clientId: formData.clientId,
      clientName: selectedClientObj ? selectedClientObj.name : 'Agency Client',
      type: formData.type,
      title: formData.title.trim(),
      caption: formData.caption.trim(),
      hashtags: parsedHashtags,
      platforms: formData.platforms,
      scheduledDate: formData.scheduledDate,
      scheduledTime: formData.scheduledTime,
      mediaType: formData.type === 'Reel' || formData.type === 'Video' ? 'video' : 'image',
      mediaPreview: formData.mediaPreview,
      status: chosenStatus,
    });

    onClose();
  };

  const platformOptions = [
    { id: 'instagram', label: 'Instagram' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'google-business', label: 'Google Business' },
  ];

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div className="modal-dialog-card post-composer-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="modal-title">Multi-Platform Post Composer</h3>
              <p className="modal-subtitle">Craft, format, and schedule omnichannel content</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Composer Form Body */}
        <div className="composer-modal-body">
          <div className="composer-two-columns">
            {/* Left Column: Form Controls */}
            <div className="composer-form-left">
              {/* Client & Content Format */}
              <div className="form-grid-two-col">
                <div className="form-field-group">
                  <label className="form-label">Client Workspace</label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="form-select-input"
                  >
                    {mockClients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-label">Content Format</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="form-select-input"
                  >
                    <option value="Post">Standard Post</option>
                    <option value="Reel">Reel / Short Video</option>
                    <option value="Carousel">Carousel Slider</option>
                    <option value="Story">24h Story</option>
                    <option value="Video">Long-form Video</option>
                  </select>
                </div>
              </div>

              {/* Target Platforms */}
              <div className="form-field-group">
                <label className="form-label">
                  Publish to Channels <span className="text-danger">*</span>
                </label>
                <div className="platform-checkboxes-grid">
                  {platformOptions.map((opt) => {
                    const isChecked = formData.platforms.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        className={`platform-checkbox-label ${isChecked ? 'checked' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handlePlatformToggle(opt.id)}
                          className="hidden-checkbox"
                        />
                        <span className="checkbox-custom-dot" />
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.platforms && (
                  <span className="form-error-msg">{errors.platforms}</span>
                )}
              </div>

              {/* Title */}
              <div className="form-field-group">
                <label className="form-label">
                  Post Hook / Working Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5 Morning Mobility Exercises to Supercharge Your Day"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`form-text-input ${errors.title ? 'error' : ''}`}
                />
                {errors.title && <span className="form-error-msg">{errors.title}</span>}
              </div>

              {/* Caption & AI Assistant Action */}
              <div className="form-field-group">
                <div className="label-with-action-row">
                  <label className="form-label">
                    Caption Copy <span className="text-danger">*</span>
                  </label>
                  <button
                    type="button"
                    className="btn-ai-compose-shortcut"
                    onClick={handleAiGenerate}
                    disabled={isGeneratingAi}
                  >
                    <Sparkles size={13} />
                    <span>{isGeneratingAi ? 'Generating...' : 'Auto-Write with AI'}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  placeholder="Write your engaging post caption here..."
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className={`form-textarea-input ${errors.caption ? 'error' : ''}`}
                />
                {errors.caption && <span className="form-error-msg">{errors.caption}</span>}
              </div>

              {/* Hashtags */}
              <div className="form-field-group">
                <label className="form-label">Hashtag Clusters</label>
                <input
                  type="text"
                  placeholder="#Fitness #Health #GymGoals"
                  value={formData.hashtagsInput}
                  onChange={(e) => setFormData({ ...formData, hashtagsInput: e.target.value })}
                  className="form-text-input"
                />
              </div>

              {/* Schedule Date & Time */}
              <div className="form-grid-two-col">
                <div className="form-field-group">
                  <label className="form-label">Publish Date</label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="form-text-input"
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label">Publish Time</label>
                  <input
                    type="text"
                    placeholder="09:00 AM"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="form-text-input"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Live Feed Simulation Preview */}
            <div className="composer-preview-right">
              <h4 className="preview-heading">Live Channel Preview</h4>
              <div className="live-mock-social-card">
                <div className="mock-card-header">
                  <div className="mock-avatar">🏢</div>
                  <div>
                    <span className="mock-client-name">
                      {mockClients.find((c) => c.id === formData.clientId)?.name || 'Brand'}
                    </span>
                    <span className="mock-time-sub">Sponsored / Scheduled</span>
                  </div>
                </div>

                <div className="mock-image-container">
                  <img
                    src={formData.mediaPreview}
                    alt="Creative Preview"
                    className="mock-image"
                  />
                  <span className="mock-format-tag">{formData.type}</span>
                </div>

                <div className="mock-caption-box">
                  <p className="mock-caption-text">
                    {formData.caption || 'Your caption copy will appear here in real-time...'}
                  </p>
                  <p className="mock-hashtags-text">{formData.hashtagsInput}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Workflow Actions */}
        <div className="modal-dialog-footer composer-footer">
          <button type="button" className="btn-saas-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-saas-secondary"
            onClick={() => handleSubmit('Draft')}
          >
            Save as Draft
          </button>
          <button
            type="button"
            className="btn-saas-secondary"
            onClick={() => handleSubmit('In Review')}
          >
            Send for Review
          </button>
          <button
            type="button"
            className="btn-saas-primary"
            onClick={() => handleSubmit('Scheduled')}
          >
            <CheckCircle2 size={16} />
            <span>Approve & Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostComposerModal;
