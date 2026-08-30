import React, { useState, useEffect, useMemo } from 'react';
import {
  SocialHeader,
  SocialHealthKpiCards,
  PlatformConnectionCards,
  SocialAccountsGrid,
  SocialAccountsTable,
  ConnectAccountModal,
  AccountDetailModal,
} from '../../components/socialAccounts/index.js';
import { socialAccountsService } from '../../services/socialAccountsService.js';
import { CheckCircle2, AlertCircle, RefreshCw, Share2 } from 'lucide-react';

export function SocialAccountsPage({
  activeClient = 'all',
  onNavigate,
}) {
  const [accounts, setAccounts] = useState([]);
  const [oauthStatus, setOauthStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnectingOAuth, setIsConnectingOAuth] = useState(false);
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
  }, [selectedClientFilter]);

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
        socialAccountsService.getAccounts({
          clientId: selectedClientFilter !== 'all' ? selectedClientFilter : undefined,
        }),
        socialAccountsService.getOAuthStatus(),
      ]);
      setAccounts(data);
      setOauthStatus(oauth);
    } catch (err) {
      console.error('Failed to load social accounts from PostgreSQL:', err);
      setError(
        err.message || 'Unable to load social accounts from database. Please check connection and retry.'
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleConnectAccount = async (accountData) => {
    const created = await socialAccountsService.connectAccount(accountData);
    await loadAccounts(true);
    showToast(`✓ Channel "${created.accountName}" connected successfully!`);
  };

  const handleInitiatePlatformOAuth = async (platformName) => {
    setIsConnectingOAuth(true);
    try {
      const res = await socialAccountsService.initiateOAuthConnect(
        platformName,
        selectedClientFilter !== 'all' ? selectedClientFilter : null
      );

      if (res?.authorizationUrl) {
        window.location.href = res.authorizationUrl;
      } else if (res?.status === 'CONFIGURATION_REQUIRED') {
        showToast(`[OAuth Setup Required]: ${res.message || 'Platform credentials not set in environment.'}`);
        setIsConnectModalOpen(true);
      } else {
        showToast('OAuth connection initiated.');
      }
    } catch (err) {
      console.error('Failed to initiate OAuth connect:', err);
      showToast(`Error: ${err.message || 'Failed to initiate OAuth redirection.'}`);
      setIsConnectModalOpen(true);
    } finally {
      setIsConnectingOAuth(false);
    }
  };

  const handleSyncAccount = async (accountId) => {
    const synced = await socialAccountsService.syncAccount(accountId);
    setAccounts((prev) => prev.map((a) => (a.id === accountId ? synced : a)));
    if (inspectedAccount && inspectedAccount.id === accountId) {
      setInspectedAccount(synced);
    }
    showToast('Channel synced successfully with platform.');
  };

  const handleReconnectAccount = async (accountId) => {
    const res = await socialAccountsService.reconnectAccount(accountId);
    await loadAccounts(true);
    return res;
  };

  const handleDisconnectAccount = async (accountId) => {
    await socialAccountsService.disconnectAccount(accountId);
    setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    if (inspectedAccount && inspectedAccount.id === accountId) {
      setInspectedAccount(null);
    }
    showToast('Account disconnected and credentials safely purged.');
  };

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchesClient =
        selectedClientFilter === 'all' ? true : acc.clientId === selectedClientFilter;

      const pUpper = selectedPlatform.toUpperCase();
      const itemPlatform = (acc.platform || '').toUpperCase();
      let matchesPlatform = true;
      if (selectedPlatform !== 'all') {
        if (pUpper === 'META') {
          matchesPlatform = itemPlatform === 'META' || itemPlatform === 'FACEBOOK' || itemPlatform === 'INSTAGRAM';
        } else {
          matchesPlatform = itemPlatform === pUpper;
        }
      }

      let matchesStatus = true;
      if (selectedStatus !== 'all') {
        matchesStatus = (acc.statusRaw || acc.status || '').toUpperCase().includes(selectedStatus.toUpperCase());
      }

      const matchesSearch =
        searchQuery.trim() === ''
          ? true
          : (acc.accountName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (acc.handle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (acc.clientName || '').toLowerCase().includes(searchQuery.toLowerCase());

      return matchesClient && matchesPlatform && matchesStatus && matchesSearch;
    });
  }, [accounts, selectedClientFilter, selectedPlatform, selectedStatus, searchQuery]);

  // Compute live KPI metrics
  const healthMetrics = useMemo(() => {
    return socialAccountsService.calculateHealthMetrics(accounts);
  }, [accounts]);

  return (
    <div className="social-hub-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification" role="status">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Filter Controls */}
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

      {/* 4 Health KPI Cards */}
      <SocialHealthKpiCards metrics={healthMetrics} />

      {/* Platform Connection Center Cards */}
      <div className="social-section-block">
        <div className="section-header-row">
          <h2 className="section-title">Platform Connection Hub</h2>
          <span className="section-subtext">Direct OAuth authorization channels for client workspaces</span>
        </div>
        <PlatformConnectionCards
          accounts={accounts}
          oauthStatus={oauthStatus}
          onInitiateConnect={handleInitiatePlatformOAuth}
          isConnecting={isConnectingOAuth}
        />
      </div>

      {/* Main View Area: Loading, Error, Grid, or Table */}
      <div className="social-section-block mt-4">
        <div className="section-header-row">
          <h2 className="section-title">Connected Channel Accounts ({filteredAccounts.length})</h2>
          <span className="section-subtext">Encrypted multi-tenant channel tokens persisted to PostgreSQL</span>
        </div>

        {loading ? (
          <div className="clients-state-box loading">
            <div className="clients-loading-spinner" />
            <p className="clients-state-title">
              Loading social platform channels from PostgreSQL...
            </p>
            <span className="clients-state-sub">
              Decrypting token health, expiration dates & platform permissions
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
        ) : filteredAccounts.length === 0 ? (
          <div className="clients-empty-state-card">
            <div className="empty-state-icon">
              <Share2 size={32} />
            </div>
            <h3>No connected accounts found</h3>
            <p>
              {accounts.length === 0
                ? "No social platform channels are currently connected. Choose a platform above to connect your first channel."
                : 'No accounts match the current filter criteria.'}
            </p>
            <button
              type="button"
              className="btn-saas-primary"
              onClick={() => setIsConnectModalOpen(true)}
            >
              Connect Social Channel
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <SocialAccountsGrid
            accounts={filteredAccounts}
            onInspect={(acc) => setInspectedAccount(acc)}
            onReconnect={handleReconnectAccount}
          />
        ) : (
          <SocialAccountsTable
            accounts={filteredAccounts}
            onInspect={(acc) => setInspectedAccount(acc)}
            onReconnect={handleReconnectAccount}
          />
        )}
      </div>

      {/* Connect Account Modal */}
      <ConnectAccountModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnectAccount={handleConnectAccount}
        oauthStatus={oauthStatus}
      />

      {/* Account Detail Modal */}
      <AccountDetailModal
        account={inspectedAccount}
        isOpen={Boolean(inspectedAccount)}
        onClose={() => setInspectedAccount(null)}
        onSync={handleSyncAccount}
        onReconnect={handleReconnectAccount}
        onDisconnect={handleDisconnectAccount}
      />
    </div>
  );
}

export default SocialAccountsPage;
