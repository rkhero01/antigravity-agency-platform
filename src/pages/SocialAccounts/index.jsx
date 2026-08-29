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
import { CheckCircle2 } from 'lucide-react';

export function SocialAccountsPage({
  activeClient = 'all',
  onNavigate,
}) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

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

  const loadAccounts = async () => {
    setLoading(true);
    const data = await socialAccountsService.getAccounts();
    setAccounts(data);
    setLoading(false);
  };

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((a) => {
      const matchesClient =
        selectedClientFilter === 'all' ? true : a.clientId === selectedClientFilter;
      const matchesPlatform =
        selectedPlatform === 'all'
          ? true
          : a.platform.toLowerCase() === selectedPlatform.toLowerCase();
      const matchesStatus =
        selectedStatus === 'all'
          ? true
          : selectedStatus === 'Needs Re-auth'
          ? a.status === 'Needs Re-auth'
          : selectedStatus === 'Expiring Soon'
          ? a.tokenDaysRemaining <= 14 && a.tokenDaysRemaining > 0
          : a.status.toLowerCase() === selectedStatus.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        a.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.platform.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesClient && matchesPlatform && matchesStatus && matchesSearch;
    });
  }, [accounts, selectedClientFilter, selectedPlatform, selectedStatus, searchQuery]);

  // Health Summary Metrics
  const healthMetrics = useMemo(() => {
    return socialAccountsService.calculateHealthMetrics(filteredAccounts);
  }, [filteredAccounts]);

  // Handlers
  const handleSyncAccount = async (id) => {
    const updated = await socialAccountsService.syncAccount(id);
    setAccounts((prev) => prev.map((a) => (a.id === id ? updated : a)));
    if (inspectedAccount && inspectedAccount.id === id) {
      setInspectedAccount(updated);
    }
    showToast(`🔄 Synced latest insights & token health for ${updated.handle}`);
  };

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    const refreshed = await socialAccountsService.syncAllAccounts();
    setAccounts(refreshed);
    setTimeout(() => {
      setIsSyncingAll(false);
      showToast('✨ All connected social channels synced successfully!');
    }, 600);
  };

  const handleReconnectAccount = async (id) => {
    const reconnected = await socialAccountsService.reconnectAccount(id);
    setAccounts((prev) => prev.map((a) => (a.id === id ? reconnected : a)));
    if (inspectedAccount && inspectedAccount.id === id) {
      setInspectedAccount(reconnected);
    }
    showToast(`🎉 Successfully refreshed OAuth credentials for ${reconnected.handle}!`);
  };

  const handleConnectAccount = async (accountData) => {
    const created = await socialAccountsService.connectAccount(accountData);
    setAccounts((prev) => [created, ...prev]);
    showToast(`🚀 Connected ${created.platform} account: ${created.handle}!`);
  };

  const handleDisconnectAccount = async (id) => {
    await socialAccountsService.disconnectAccount(id);
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    showToast('Channel disconnected from agency workspace');
  };

  return (
    <div className="social-accounts-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
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
        onSyncAll={handleSyncAll}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        isSyncingAll={isSyncingAll}
      />

      {/* 5 Top Health KPI Stat Cards */}
      <SocialHealthKpiCards metrics={healthMetrics} />

      {/* Main View Area: Grid Cards or Audit Table */}
      {viewMode === 'grid' ? (
        <SocialAccountsGrid
          accounts={filteredAccounts}
          onSyncAccount={handleSyncAccount}
          onReconnectAccount={handleReconnectAccount}
          onInspectAccount={(acc) => setInspectedAccount(acc)}
          onDisconnectAccount={handleDisconnectAccount}
          onOpenConnectModal={() => setIsConnectModalOpen(true)}
        />
      ) : (
        <SocialAccountsTable
          accounts={filteredAccounts}
          onSyncAccount={handleSyncAccount}
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
      />

      {/* Account Detail & Diagnostics Modal */}
      <AccountDetailModal
        account={inspectedAccount}
        isOpen={Boolean(inspectedAccount)}
        onClose={() => setInspectedAccount(null)}
        onSyncAccount={handleSyncAccount}
        onReconnectAccount={handleReconnectAccount}
      />
    </div>
  );
}

export default SocialAccountsPage;
