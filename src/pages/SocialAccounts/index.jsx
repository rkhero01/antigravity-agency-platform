import React, { useState, useEffect, useMemo } from 'react';
import {
  SocialHeader,
  SocialHealthKpiCards,
  SocialAccountsGrid,
  SocialAccountsTable,
  ConnectAccountModal,
  AccountDetailModal,
} from '../../components/socialAccounts/index.js';
import { socialAccountsService } from '../../services/socialAccountsService.js';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export function SocialAccountsPage({
  activeClient = 'all',
  onNavigate,
}) {
  const [accounts, setAccounts] = useState([]);
  const [oauthStatus, setOauthStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // View Mode & Filters
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [selectedClientFilter, setSelectedClientFilter] = useState(activeClient);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Feedback
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [inspectedAccount, setInspectedAccount] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (activeClient && activeClient !== 'all') {
      setSelectedClientFilter(activeClient);
    }
  }, [activeClient]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadAccounts = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const [data, oauth] = await Promise.all([
        socialAccountsService.getAccounts(),
        socialAccountsService.getOAuthStatus(),
      ]);
      setAccounts(data);
      setOauthStatus(oauth);
    } catch (err) {
      console.error('Failed to load social accounts from database:', err);
      setError(
        err.message ||
          'Unable to connect to database or retrieve social accounts. Please check connection and retry.'
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((a) => {
      const matchesClient =
        selectedClientFilter === 'all' ? true : a.clientId === selectedClientFilter;
      const matchesPlatform =
        selectedPlatform === 'all'
          ? true
          : selectedPlatform === 'META'
          ? a.platform === 'META' || a.platform === 'FACEBOOK' || a.platform === 'INSTAGRAM'
          : a.platform.toLowerCase() === selectedPlatform.toLowerCase();
      const matchesStatus =
        selectedStatus === 'all'
          ? true
          : a.status.toLowerCase() === selectedStatus.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (a.handle || '').toLowerCase().includes(q) ||
        (a.accountName || '').toLowerCase().includes(q) ||
        (a.clientName || '').toLowerCase().includes(q) ||
        (a.platform || '').toLowerCase().includes(q);

      return matchesClient && matchesPlatform && matchesStatus && matchesSearch;
    });
  }, [accounts, selectedClientFilter, selectedPlatform, selectedStatus, searchQuery]);

  // Health Summary Metrics
  const healthMetrics = useMemo(() => {
    return socialAccountsService.calculateHealthMetrics(accounts);
  }, [accounts]);

  // Handlers
  const handleConnectAccount = async (accountData) => {
    const created = await socialAccountsService.connectAccount(accountData);
    await loadAccounts(true);
    showToast(`🎉 Successfully connected ${created.accountName} (${created.platform})!`);
  };

  const handleReconnectAccount = async (id) => {
    const result = await socialAccountsService.reconnectAccount(id);
    setAccounts((prev) => prev.map((a) => (a.id === id ? result.account : a)));
    if (inspectedAccount && inspectedAccount.id === id) {
      setInspectedAccount(result.account);
    }
    showToast(`🔄 ${result.message}`);
    return result;
  };

  const handleDisconnectAccount = async (id) => {
    const target = accounts.find((a) => a.id === id);
    const confirm = window.confirm(
      `Are you sure you want to disconnect "${target?.accountName || 'this channel'}"? The record will be archived in PostgreSQL.`
    );
    if (!confirm) return;

    try {
      await socialAccountsService.disconnectAccount(id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      showToast('Social channel asset disconnected');
    } catch (err) {
      console.error('Failed to disconnect account:', err);
      alert(err.message || 'Failed to disconnect account.');
    }
  };

  return (
    <div className="social-accounts-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification" role="status">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <SocialHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedClient={selectedClientFilter}
        onClientChange={setSelectedClientFilter}
        selectedPlatform={selectedPlatform}
        onPlatformChange={setSelectedPlatform}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onRefresh={() => loadAccounts(true)}
        isRefreshing={isRefreshing}
      />

      {/* 5 Top KPI Health Metrics */}
      <SocialHealthKpiCards metrics={healthMetrics} />

      {/* Main Content Area: Loading, Error, or Grid/Table */}
      {loading ? (
        <div className="clients-state-box loading">
          <div className="clients-loading-spinner" />
          <p className="clients-state-title">
            Loading social channel connections from PostgreSQL database...
          </p>
          <span className="clients-state-sub">
            Verifying token scopes & client tenant binding
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
            onClick={() => loadAccounts(false)}
          >
            <RefreshCw size={14} />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <SocialAccountsGrid
          accounts={filteredAccounts}
          onSyncAccount={handleReconnectAccount}
          onReconnectAccount={handleReconnectAccount}
          onInspectAccount={(acc) => setInspectedAccount(acc)}
          onDisconnectAccount={handleDisconnectAccount}
          onOpenConnectModal={() => setIsConnectModalOpen(true)}
        />
      ) : (
        <SocialAccountsTable
          accounts={filteredAccounts}
          onSyncAccount={handleReconnectAccount}
          onReconnectAccount={handleReconnectAccount}
          onInspectAccount={(acc) => setInspectedAccount(acc)}
          onDisconnectAccount={handleDisconnectAccount}
        />
      )}

      {/* Connect Account Modal */}
      <ConnectAccountModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnectAccount={handleConnectAccount}
        oauthStatus={oauthStatus}
      />

      {/* Account Detail & Scopes Inspection Modal */}
      <AccountDetailModal
        account={inspectedAccount}
        isOpen={Boolean(inspectedAccount)}
        onClose={() => setInspectedAccount(null)}
        onReconnect={handleReconnectAccount}
        onDisconnect={handleDisconnectAccount}
      />
    </div>
  );
}

export default SocialAccountsPage;
