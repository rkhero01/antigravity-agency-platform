/**
 * Production Social Accounts Service Layer
 * Task 5: Database-Connected Multi-Tenant Social Platform Management
 */

import { apiClient } from './api/apiClient.js';

export const PLATFORM_INFO = {
  META: { name: 'Meta Business Suite', label: 'Meta (Facebook & Instagram)', color: '#1877f2', icon: 'meta' },
  FACEBOOK: { name: 'Facebook Page', label: 'Facebook Page', color: '#1877f2', icon: 'facebook' },
  INSTAGRAM: { name: 'Instagram Professional', label: 'Instagram Business', color: '#e1306c', icon: 'instagram' },
  GOOGLE_BUSINESS: { name: 'Google Business Profile', label: 'Google Business Profile', color: '#4285f4', icon: 'google' },
  YOUTUBE: { name: 'YouTube Channel', label: 'YouTube Channel', color: '#ff0000', icon: 'youtube' },
  LINKEDIN: { name: 'LinkedIn Company Page', label: 'LinkedIn Company Page', color: '#0a66c2', icon: 'linkedin' },
};

/**
 * Normalizes PostgreSQL social account record into rich UI model
 */
export function normalizeSocialAccount(dbRecord) {
  if (!dbRecord) return null;

  const platformKey = (dbRecord.platform || 'META').toUpperCase();
  const info = PLATFORM_INFO[platformKey] || PLATFORM_INFO.META;

  // Calculate actual token days remaining
  let tokenDaysRemaining = 60;
  if (dbRecord.tokenExpiresAt) {
    const diffMs = new Date(dbRecord.tokenExpiresAt) - new Date();
    tokenDaysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  // Derive human status
  const rawStatus = (dbRecord.status || 'ACTIVE').toUpperCase();
  let status = 'Active';
  let statusVariant = 'success';

  if (rawStatus === 'DISCONNECTED' || dbRecord.deletedAt) {
    status = 'Disconnected';
    statusVariant = 'danger';
  } else if (rawStatus === 'NEEDS_REAUTH' || tokenDaysRemaining <= 0) {
    status = 'Needs Re-auth';
    statusVariant = 'danger';
  } else if (tokenDaysRemaining <= 14) {
    status = 'Expiring Soon';
    statusVariant = 'warning';
  } else if (rawStatus === 'ERROR') {
    status = 'Error';
    statusVariant = 'danger';
  }

  return {
    id: dbRecord.id,
    agencyId: dbRecord.agencyId,
    clientId: dbRecord.clientId || null,
    clientName: dbRecord.clientName || 'Agency Workspace',
    platform: platformKey,
    platformLabel: info.label,
    accountName: dbRecord.accountName || 'Unnamed Asset',
    handle: dbRecord.handle || `@${dbRecord.platformAccountId || 'account'}`,
    platformAccountId: dbRecord.platformAccountId || 'ext-unknown',
    status,
    statusRaw: rawStatus,
    statusVariant,
    tokenExpiresAt: dbRecord.tokenExpiresAt,
    tokenDaysRemaining,
    scopes: dbRecord.scopes ? dbRecord.scopes.split(',') : ['read_insights', 'manage_pages'],
    createdAt: dbRecord.createdAt,
    updatedAt: dbRecord.updatedAt,
  };
}

/**
 * Maps form input to backend payload
 */
export function toDbPayload(formData = {}) {
  return {
    clientId: formData.clientId && formData.clientId !== 'all' ? formData.clientId : null,
    platform: (formData.platform || 'META').toUpperCase(),
    accountName: String(formData.accountName || '').trim(),
    handle: formData.handle ? String(formData.handle).trim() : null,
    platformAccountId: formData.platformAccountId ? String(formData.platformAccountId).trim() : null,
    status: formData.status ? String(formData.status).toUpperCase() : 'ACTIVE',
    scopes: Array.isArray(formData.scopes) ? formData.scopes.join(',') : formData.scopes,
  };
}

export const socialAccountsService = {
  /**
   * Fetch all social accounts from live API
   */
  async getAccounts(filters = {}) {
    const params = {};
    if (filters.clientId && filters.clientId !== 'all') params.clientId = filters.clientId;
    if (filters.platform && filters.platform !== 'all') params.platform = filters.platform;
    if (filters.status && filters.status !== 'all') params.status = filters.status;
    if (filters.search && filters.search.trim()) params.search = filters.search.trim();

    const response = await apiClient.socialAccounts.list(params);
    const rawList = Array.isArray(response.data?.accounts)
      ? response.data.accounts
      : Array.isArray(response.data)
      ? response.data
      : [];

    return rawList.map(normalizeSocialAccount);
  },

  /**
   * Get single account by ID
   */
  async getAccountById(id) {
    if (!id) return null;
    const response = await apiClient.socialAccounts.getById(id);
    const raw = response.data?.account || response.data;
    return normalizeSocialAccount(raw);
  },

  /**
   * Connect a new social account
   */
  async connectAccount(data) {
    const payload = toDbPayload(data);
    const response = await apiClient.socialAccounts.connect(payload);
    const raw = response.data?.account || response.data;
    return normalizeSocialAccount(raw);
  },

  /**
   * Update existing social account
   */
  async updateAccount(id, updates) {
    if (!id) throw new Error('Account ID is required');
    const payload = toDbPayload(updates);
    const response = await apiClient.socialAccounts.update(id, payload);
    const raw = response.data?.account || response.data;
    return normalizeSocialAccount(raw);
  },

  /**
   * Reconnect / refresh social account credentials
   */
  async reconnectAccount(id) {
    if (!id) throw new Error('Account ID is required');
    const response = await apiClient.socialAccounts.reconnect(id);
    const raw = response.data?.account || response.data;
    return {
      account: normalizeSocialAccount(raw),
      oauthConfigured: Boolean(response.data?.oauthConfigured),
      message: response.data?.message || 'Connection refreshed in database.',
    };
  },

  /**
   * Alias for reconnectAccount
   */
  async syncAccount(id) {
    return (await this.reconnectAccount(id)).account;
  },

  /**
   * Disconnect social account
   */
  async disconnectAccount(id) {
    if (!id) throw new Error('Account ID is required');
    const response = await apiClient.socialAccounts.disconnect(id);
    return response.data;
  },

  /**
   * Fetch OAuth configuration status
   */
  async getOAuthStatus() {
    try {
      const response = await apiClient.integrations.status();
      return response.data?.providers || {
        META: false,
        FACEBOOK: false,
        INSTAGRAM: false,
        GOOGLE: false,
        GOOGLE_BUSINESS: false,
        YOUTUBE: false,
        LINKEDIN: false,
        TWITTER: false,
      };
    } catch (e) {
      try {
        const fallback = await apiClient.socialAccounts.getOAuthStatus();
        return fallback.data?.oauthStatus || {};
      } catch (err) {
        return {
          META: false,
          GOOGLE_BUSINESS: false,
          YOUTUBE: false,
          LINKEDIN: false,
        };
      }
    }
  },

  /**
   * Initiate real OAuth redirection flow for external platform
   */
  async initiateOAuthConnect(platform, clientId = null) {
    const response = await apiClient.integrations.connect(platform.toLowerCase(), {
      clientId: clientId && clientId !== 'all' ? clientId : undefined,
    });
    return response.data;
  },

  /**
   * Calculate live KPI metrics from database records
   */
  calculateHealthMetrics(accountsList = []) {
    const total = accountsList.length;
    const active = accountsList.filter((a) => a.status === 'Active').length;
    const needsReauth = accountsList.filter((a) => a.status === 'Needs Re-auth').length;
    const expiringSoon = accountsList.filter((a) => a.status === 'Expiring Soon').length;
    const clientIds = new Set(accountsList.map((a) => a.clientId).filter(Boolean));

    return {
      total,
      active,
      needsReauth,
      expiringSoon,
      clientCount: clientIds.size,
    };
  },
};

export default socialAccountsService;
