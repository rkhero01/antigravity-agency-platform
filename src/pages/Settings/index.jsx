import React, { useState, useEffect } from 'react';
import {
  SettingsHeader,
  GeneralSettingsTab,
  AIEngineSettingsTab,
  IntegrationsSettingsTab,
  BrandKitSettingsTab,
  NotificationsSettingsTab,
  BillingSettingsTab,
} from '../../components/settings/index.js';
import { settingsService } from '../../services/settingsService.js';
import { CheckCircle2 } from 'lucide-react';

export function SettingsPage({
  activeClient = 'all',
  onNavigate,
}) {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadSettings = async () => {
    setLoading(true);
    const data = await settingsService.getSettings();
    setSettings(data);
    setLoading(false);
  };

  const handleSectionChange = (sectionKey, newValues) => {
    setSettings((prev) => ({
      ...prev,
      [sectionKey]: newValues,
    }));
    setIsDirty(true);
  };

  const handleSaveAll = async () => {
    if (!settings) return;
    await settingsService.saveSettings('general', settings.general);
    await settingsService.saveSettings('aiEngine', settings.aiEngine);
    await settingsService.saveSettings('brandKitDefaults', settings.brandKitDefaults);
    await settingsService.saveSettings('notifications', settings.notifications);
    setIsDirty(false);
    showToast('✨ All agency settings and configurations saved successfully!');
  };

  const handleDiscard = async () => {
    await loadSettings();
    setIsDirty(false);
    showToast('Reverted unsaved changes to last saved state.');
  };

  const handleToggleIntegration = async (id) => {
    const updatedList = await settingsService.toggleIntegration(id);
    setSettings((prev) => ({ ...prev, integrations: updatedList }));
    showToast('OAuth Integration status updated.');
  };

  const handleTestWebhook = async (id) => {
    await settingsService.testWebhook(id);
    const refreshed = await settingsService.getSettings();
    setSettings(refreshed);
    showToast('🚀 Test ping sent: HTTP 200 OK received from endpoint!');
  };

  const handleAddWebhook = async (webhookData) => {
    await settingsService.addWebhook(webhookData);
    const refreshed = await settingsService.getSettings();
    setSettings(refreshed);
    showToast('Webhook endpoint configured and registered.');
  };

  const handleDeleteWebhook = async (id) => {
    await settingsService.deleteWebhook(id);
    const refreshed = await settingsService.getSettings();
    setSettings(refreshed);
    showToast('Webhook endpoint removed.');
  };

  const handleUpgradePlan = () => {
    showToast('Enterprise plan scaling: Contacting agency account representative...');
  };

  const handleUpdatePayment = () => {
    showToast('Stripe billing portal launched (simulated).');
  };

  const handleDownloadInvoice = (id) => {
    showToast(`Downloading invoice receipt ${id} (PDF)...`);
  };

  if (loading || !settings) return null;

  return (
    <div className="settings-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Tabs */}
      <SettingsHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSaveAll={handleSaveAll}
        onDiscard={handleDiscard}
        isDirty={isDirty}
      />

      {/* Tab Panels */}
      {activeTab === 'general' && (
        <GeneralSettingsTab
          data={settings.general}
          onChange={(newVal) => handleSectionChange('general', newVal)}
        />
      )}

      {activeTab === 'ai-engine' && (
        <AIEngineSettingsTab
          data={settings.aiEngine}
          onChange={(newVal) => handleSectionChange('aiEngine', newVal)}
        />
      )}

      {activeTab === 'integrations' && (
        <IntegrationsSettingsTab
          integrations={settings.integrations}
          webhooks={settings.webhooks}
          onToggleIntegration={handleToggleIntegration}
          onTestWebhook={handleTestWebhook}
          onAddWebhook={handleAddWebhook}
          onDeleteWebhook={handleDeleteWebhook}
        />
      )}

      {activeTab === 'brandKit' || activeTab === 'brand-kit' ? (
        <BrandKitSettingsTab
          data={settings.brandKitDefaults}
          onChange={(newVal) => handleSectionChange('brandKitDefaults', newVal)}
        />
      ) : null}

      {activeTab === 'notifications' && (
        <NotificationsSettingsTab
          data={settings.notifications}
          onChange={(newVal) => handleSectionChange('notifications', newVal)}
        />
      )}

      {activeTab === 'billing' && (
        <BillingSettingsTab
          data={settings.billing}
          onUpgradePlan={handleUpgradePlan}
          onUpdatePayment={handleUpdatePayment}
          onDownloadInvoice={handleDownloadInvoice}
        />
      )}
    </div>
  );
}

export default SettingsPage;
