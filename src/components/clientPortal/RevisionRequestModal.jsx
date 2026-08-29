import React, { useState } from 'react';
import { X, MessageSquare, AlertCircle } from 'lucide-react';

export function RevisionRequestModal({
  post,
  isOpen,
  onClose,
  onSubmitRevision,
}) {
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !post) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError('Please provide feedback notes for the agency creative team.');
      return;
    }

    onSubmitRevision(post.id, feedback.trim());
    setFeedback('');
    setError('');
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card revision-request-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge warning">
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 className="modal-title">Request Content Revisions</h3>
              <p className="modal-subtitle">Send feedback directly to your assigned copywriters & designers</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="revision-request-form">
          {/* Post Summary */}
          <div className="revision-target-post-summary">
            <span className="summary-lbl">Target Post:</span>
            <strong className="summary-post-title">{post.title} ({post.platform})</strong>
          </div>

          {/* Feedback Field */}
          <div className="form-field-group">
            <label className="form-label">
              Revision Notes & Specific Changes <span className="text-danger">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Please update the promotional discount to 20% off and replace the call-to-action button with 'Book Assessment'..."
              className={`form-textarea-input ${error ? 'error' : ''}`}
            />
            {error && <span className="form-error-msg">{error}</span>}
          </div>

          {/* Footer */}
          <div className="modal-dialog-footer">
            <button type="button" className="btn-saas-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-saas-primary">
              <MessageSquare size={15} />
              <span>Submit Changes to Agency</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RevisionRequestModal;
