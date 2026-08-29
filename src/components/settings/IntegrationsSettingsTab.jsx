import React, { useState } from 'react';
import {
  Plug,
  Webhook,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';

export function IntegrationsSettingsTab({
  integrations = [],
  webhooks = [],
  onToggleIntegration,
  onTestWebhook,
  onAddWebhook,
  onDeleteWebhook,
}) {
  const [isAddingWebhook, setIsAddingWebhook] = useState(false);
  const [newWebhookData, setNewWebhookData] = useState({
    name: '',
    url: '',
    events: 'post.published, approval.approved',
  });

  const handleAddWebhookSubmit = (e) => {
    e.preventDefault();
    if (!newWebhookData.url.trim()) return;

    onAddWebhook({
      name: newWebhookData.name.trim() || 'New Webhook',
      url: newWebhookData.url.trim(),
      events: newWebhookData.events.split(',').map((s) => s.trim()),
    });

    setIsAddingWebhook(false);
    setNewWebhookData({ name: '', url: '', events: 'post.published, approval.approved' });
  };

  return (
    <div className="settings-tab-content-pane">
      {/* Section 1: Connected Platform APIs */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <div className="section-header-icon-box">
            <Plug size={18} />
          </div>
          <div>
            <h3 className="section-title">Platform API & Social OAuth Integrations</h3>
            <p className="section-desc">Manage direct OAuth credentials for multi-channel publishing and ad accounts</p>
          </div>
        </div>

        <div className="integrations-cards-stack">
          {integrations.map((intg) => {
            const isConnected = intg.status === 'Connected';
            return (
              <div key={intg.id} className="integration-item-row">
                <div className="integration-left">
                  <div className={`integration-icon-badge ${intg.icon}`}>
                    <Plug size={16} />
                  </div>
                  <div>
                    <strong className="integration-name">{intg.name}</strong>
                    <div className="integration-subline">
                      <span>{intg.provider}</span>
                      <span>•</span>
                      <span>{intg.appId}</span>
                      <span>•</span>
                      <span className="sync-text">{intg.lastSync}</span>
                    </div>
                  </div>
                </div>

                <div className="integration-right">
                  <span className={`conn-status-tag ${isConnected ? 'connected' : 'disconnected'}`}>
                    {isConnected ? (
                      <>
                        <CheckCircle2 size={12} /> Connected
                      </>
                    ) : (
                      <>
                        <XCircle size={12} /> Disconnected
                      </>
                    )}
                  </span>

                  <button
                    type="button"
                    className={`btn-toggle-intg ${isConnected ? 'danger' : 'primary'}`}
                    onClick={() => onToggleIntegration(intg.id)}
                  >
                    {isConnected ? 'Disconnect' : 'Connect Account'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Webhooks Manager */}
      <div className="settings-section-card">
        <div className="settings-section-header between">
          <div className="header-left-group">
            <div className="section-header-icon-box">
              <Webhook size={18} />
            </div>
            <div>
              <h3 className="section-title">Outbound Event Webhooks</h3>
              <p className="section-desc">Real-time HTTP POST payload dispatchers for external CRMs, Slack bots, and Zapier</p>
            </div>
          </div>

          {!isAddingWebhook && (
            <button
              type="button"
              className="btn-add-webhook-action"
              onClick={() => setIsAddingWebhook(true)}
            >
              <Plus size={14} />
              <span>Add Webhook Endpoint</span>
            </button>
          )}
        </div>

        {/* Add Webhook Form */}
        {isAddingWebhook && (
          <form onSubmit={handleAddWebhookSubmit} className="add-webhook-box">
            <h4 className="add-webhook-title">Configure New Webhook Target</h4>
            <div className="form-grid-two-col">
              <div className="form-field-group">
                <label className="form-label">Endpoint Name</label>
                <input
                  type="text"
                  placeholder="e.g. Zapier Lead Router"
                  value={newWebhookData.name}
                  onChange={(e) => setNewWebhookData({ ...newWebhookData, name: e.target.value })}
                  className="form-text-input"
                />
              </div>

              <div className="form-field-group">
                <label className="form-label">Payload URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://api.yourdomain.com/webhooks"
                  value={newWebhookData.url}
                  onChange={(e) => setNewWebhookData({ ...newWebhookData, url: e.target.value })}
                  className="form-text-input"
                />
              </div>
            </div>

            <div className="form-field-group">
              <label className="form-label">Subscribed Events (Comma-separated)</label>
              <input
                type="text"
                value={newWebhookData.events}
                onChange={(e) => setNewWebhookData({ ...newWebhookData, events: e.target.value })}
                className="form-text-input"
              />
            </div>

            <div className="form-actions-inline">
              <button
                type="button"
                className="btn-saas-secondary btn-sm"
                onClick={() => setIsAddingWebhook(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-saas-primary btn-sm">
                <CheckCircle2 size={14} />
                <span>Save Webhook</span>
              </button>
            </div>
          </form>
        )}

        {/* Webhooks Stack */}
        <div className="webhooks-list-stack">
          {webhooks.map((wh) => (
            <div key={wh.id} className="webhook-item-card">
              <div className="wh-left">
                <strong className="wh-name">{wh.name}</strong>
                <code className="wh-url-code">{wh.url}</code>
                <div className="wh-events-row">
                  {wh.events.map((ev) => (
                    <span key={ev} className="wh-event-pill">
                      {ev}
                    </span>
                  ))}
                </div>
                <span className="wh-last-status">{wh.lastTriggered}</span>
              </div>

              <div className="wh-actions">
                <button
                  type="button"
                  className="btn-test-wh"
                  onClick={() => onTestWebhook(wh.id)}
                  title="Send Test Ping"
                >
                  <Send size={13} />
                  <span>Test Ping</span>
                </button>
                <button
                  type="button"
                  className="btn-delete-wh"
                  onClick={() => onDeleteWebhook(wh.id)}
                  title="Delete Webhook"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default IntegrationsSettingsTab;
