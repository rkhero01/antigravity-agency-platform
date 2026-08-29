import { initialMockSocialAccounts } from '../data/mockSocialAccounts.js';
import { mockClients } from '../data/mockClients.js';

let accountsState = [...initialMockSocialAccounts];

export const socialAccountsService = {
  /**
   * Fetch all social accounts with optional filters
   */
  async getAccounts(filters = {}) {
    const { clientId, platform, status, search } = filters;

    let filtered = [...accountsState];

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((a) => a.clientId === clientId);
    }

    if (platform && platform !== 'all') {
      filtered = filtered.filter(
        (a) => a.platform.toLowerCase() === platform.toLowerCase()
      );
    }

    if (status && status !== 'all') {
      if (status === 'Needs Re-auth') {
        filtered = filtered.filter((a) => a.status === 'Needs Re-auth');
      } else if (status === 'Expiring Soon') {
        filtered = filtered.filter((a) => a.tokenDaysRemaining <= 14 && a.tokenDaysRemaining > 0);
      } else {
        filtered = filtered.filter((a) => a.status.toLowerCase() === status.toLowerCase());
      }
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (a) =>
          a.handle.toLowerCase().includes(q) ||
          a.accountName.toLowerCase().includes(q) ||
          a.clientName.toLowerCase().includes(q) ||
          a.platform.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(filtered);
  },

  /**
   * Get account by ID
   */
  async getAccountById(id) {
    const account = accountsState.find((a) => a.id === id);
    return Promise.resolve(account || null);
  },

  /**
   * Connect a new account
   */
  async connectAccount(data) {
    const client = mockClients.find((c) => c.id === data.clientId) || mockClients[0];
    const newAccount = {
      id: `sa-${Date.now()}`,
      clientId: data.clientId,
      clientName: client.name,
      platform: data.platform || 'Instagram',
      handle: data.handle.startsWith('@') ? data.handle : `@${data.handle}`,
      accountName: data.accountName || `${client.name} ${data.platform}`,
      followers: data.followers || '1.2K',
      followersDelta: '+10.0%',
      status: 'Connected',
      health: 'Healthy',
      publishingStatus: 'Active',
      tokenExpires: '2026-11-30',
      tokenDaysRemaining: 90,
      lastSync: 'Just now (Synced)',
      apiQuotaUsage: '8%',
      scopes: [
        `${data.platform.toLowerCase()}_basic`,
        `${data.platform.toLowerCase()}_content_publish`,
        'pages_read_engagement',
      ],
      icon: data.platform.toLowerCase().replace(/\s+/g, '-'),
    };

    accountsState = [newAccount, ...accountsState];
    return Promise.resolve(newAccount);
  },

  /**
   * Reconnect / Refresh expired OAuth token
   */
  async reconnectAccount(id) {
    accountsState = accountsState.map((a) => {
      if (a.id === id) {
        return {
          ...a,
          status: 'Connected',
          health: 'Healthy',
          publishingStatus: 'Active',
          tokenExpires: '2026-11-28',
          tokenDaysRemaining: 90,
          statusNote: undefined,
          lastSync: 'Just now (Reconnected)',
        };
      }
      return a;
    });

    const updated = accountsState.find((a) => a.id === id);
    return Promise.resolve(updated);
  },

  /**
   * Sync single account
   */
  async syncAccount(id) {
    accountsState = accountsState.map((a) => {
      if (a.id === id) {
        return {
          ...a,
          lastSync: 'Just now (Synced)',
        };
      }
      return a;
    });
    const updated = accountsState.find((a) => a.id === id);
    return Promise.resolve(updated);
  },

  /**
   * Sync all accounts
   */
  async syncAllAccounts() {
    accountsState = accountsState.map((a) => ({
      ...a,
      lastSync: 'Just now (All Synced)',
    }));
    return Promise.resolve([...accountsState]);
  },

  /**
   * Disconnect account
   */
  async disconnectAccount(id) {
    accountsState = accountsState.filter((a) => a.id !== id);
    return Promise.resolve(true);
  },

  /**
   * Compute summary health metrics
   */
  calculateHealthMetrics(accountsList) {
    const total = accountsList.length;
    const connectedCount = accountsList.filter((a) => a.status === 'Connected').length;
    const reauthNeededCount = accountsList.filter((a) => a.status === 'Needs Re-auth').length;
    const expiringSoonCount = accountsList.filter(
      (a) => a.tokenDaysRemaining <= 14 && a.tokenDaysRemaining > 0
    ).length;
    const publishingActiveCount = accountsList.filter(
      (a) => a.publishingStatus === 'Active'
    ).length;

    return {
      total,
      connectedCount,
      reauthNeededCount,
      expiringSoonCount,
      publishingActiveCount,
    };
  },
};

export default socialAccountsService;
