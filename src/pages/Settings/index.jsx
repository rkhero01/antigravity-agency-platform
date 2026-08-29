import React, { useState, useEffect } from 'react';
import {
  SettingsHeader,
  AgencyProfileTab,
  UserProfileTab,
  SecuritySettingsTab,
  WorkspacePreferencesTab,
} from '../../components/settings/index.js';
import { settingsService } from '../../services/settingsService.js';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export function SettingsPage({ activeClient = 'all', onNavigate }) {
  const [activeTab, setActiveTab] = useState('agency'); // 'agency' | 'user' | 'security' | 'preferences'
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
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

  const loadSettings = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings from database:', err);
      setError(
        err.message ||
          'Unable to connect to database or retrieve agency profile. Please check connection and retry.'
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSaveAgency = async (agencyUpdates) => {
    const updated = await settingsService.updateAgencyProfile(agencyUpdates);
    setSettings((prev) => ({
      ...prev,
      agency: {
        ...prev.agency,
        ...updated,
      },
    }));
    showToast('✨ Agency workspace profile updated in PostgreSQL!');
  };

  const handleSaveUser = async (userUpdates) => {
    const updated = await settingsService.updateUserProfile(userUpdates);
    setSettings((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        ...updated,
      },
    }));
    showToast('✨ Operator profile updated successfully!');
  };

  const handleChangePassword = async (currentPassword, newPassword) => {
    const result = await settingsService.changePassword(
      currentPassword,
      newPassword
    );
    showToast('🔒 Account password changed successfully!');
    return result;
  };

  return (
    <div className="settings-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification" role="status">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Tabs */}
      <SettingsHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={() => loadSettings(true)}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area */}
      {loading ? (
        <div className="clients-state-box loading">
          <div className="clients-loading-spinner" />
          <p className="clients-state-title">
            Loading agency workspace and credentials from PostgreSQL...
          </p>
          <span className="clients-state-sub">
            Verifying JWT token & tenant configuration
          </span>
        </div>
      ) : error ? (
        <div className="clients-state-box error" role="alert">
          <div className="state-icon-badge error">
            <AlertCircle size={28} />
          </div>
          <h3 className="clients-state-title">Database Connection Error</h3>
          <p className="clients-state-desc">{error}</p>
          <button
            type="button"
            className="btn-saas-primary"
            onClick={() => loadSettings(false)}
          >
            <RefreshCw size={14} />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : (
        <>
          {activeTab === 'agency' && (
            <AgencyProfileTab
              agency={settings.agency}
              currentUser={settings.user}
              onSaveAgency={handleSaveAgency}
            />
          )}

          {activeTab === 'user' && (
            <UserProfileTab
              user={settings.user}
              onSaveUser={handleSaveUser}
            />
          )}

          {activeTab === 'security' && (
            <SecuritySettingsTab onChangePassword={handleChangePassword} />
          )}

          {activeTab === 'preferences' && (
            <WorkspacePreferencesTab preferences={settings.preferences} />
          )}
        </>
      )}
    </div>
  );
}

export default SettingsPage;
