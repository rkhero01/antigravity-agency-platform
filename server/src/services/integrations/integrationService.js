/**
 * Production Integration & OAuth Lifecycle Service
 * Task 11: Real Multi-Tenant Platform Connection, Token Lifecycle & Sync Engine
 */

import { getOAuthProvider, getAllOAuthStatus } from './oauth/providers/index.js';
import { oauthStateStore } from './oauth/oauthStateStore.js';
import { encryptToken, decryptToken, sanitizeAccountCredentials } from '../../utils/tokenEncryption.js';
import { socialAccountRepository } from '../../repositories/socialAccountRepository.js';
import { clientRepository } from '../../repositories/clientRepository.js';
import { auditService, AUDIT_ACTIONS } from '../auditService.js';
import { ValidationError, NotFoundError, AuthorizationError } from '../../utils/errors.js';

export class IntegrationService {
  /**
   * Get configuration status for all external providers
   */
  getProviderStatus() {
    return getAllOAuthStatus();
  }

  /**
   * Step 1: Initiate OAuth connection flow and return external authorization URL
   */
  async initiateConnect({ providerName, clientId = null, agencyId, user, redirectUri = null }) {
    if (!agencyId) throw new AuthorizationError('Tenant agency ID is required.');
    if (!user) throw new AuthorizationError('Authenticated user is required.');

    const provider = getOAuthProvider(providerName);
    if (!provider.isConfigured()) {
      return {
        success: false,
        status: 'CONFIGURATION_REQUIRED',
        provider: provider.name,
        message: `OAuth credentials for "${provider.name}" are not configured in environment variables.`,
        requiresSetup: true,
      };
    }

    if (clientId && clientId !== 'all') {
      const client = await clientRepository.findById(clientId, agencyId);
      if (!client) {
        throw new NotFoundError(`Client workspace "${clientId}" not found in this agency.`);
      }
    }

    // Generate single-use CSRF-safe state token
    const state = oauthStateStore.createState({
      agencyId,
      clientId: clientId && clientId !== 'all' ? clientId : null,
      userId: user.userId,
      provider: provider.name,
      redirectUri,
    });

    const authorizationUrl = provider.getAuthorizationUrl({ state, redirectUri });

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: clientId && clientId !== 'all' ? clientId : null,
      action: 'OAUTH_STARTED',
      entityType: 'INTEGRATION',
      entityId: provider.name,
      metadata: { provider: provider.name },
    });

    return {
      success: true,
      status: 'CONNECTABLE',
      provider: provider.name,
      authorizationUrl,
      state,
    };
  }

  /**
   * Step 2: Handle incoming OAuth callback from external platform
   */
  async handleCallback({ providerName, code, state, redirectUri = null }) {
    if (!code) throw new ValidationError('Missing authorization code from OAuth provider.');

    // 1. Consume and validate state token
    const stateRecord = oauthStateStore.validateAndConsumeState(state, providerName);
    const { agencyId, clientId, userId } = stateRecord;

    const provider = getOAuthProvider(providerName);

    // 2. Exchange code for tokens
    const tokenResult = await provider.exchangeCode({
      code,
      redirectUri: redirectUri || stateRecord.redirectUri,
    });

    // 3. Discover profile & identity
    const profile = await provider.getAccountProfile({
      accessToken: tokenResult.accessToken,
    });

    // 4. Encrypt sensitive tokens server-side (AES-256-GCM)
    const encryptedAccessToken = encryptToken(tokenResult.accessToken);
    const encryptedRefreshToken = tokenResult.refreshToken ? encryptToken(tokenResult.refreshToken) : null;

    // 5. Look for existing SocialAccount record by platformAccountId in this agency
    const existingAccounts = await socialAccountRepository.findMany({ agencyId });
    const existing = existingAccounts.find(
      (a) => !a.deletedAt && a.platformAccountId === profile.platformAccountId && a.platform === profile.platform
    );

    let savedAccount;
    const accountPayload = {
      agencyId,
      clientId: clientId || null,
      platform: profile.platform,
      accountName: profile.accountName,
      handle: profile.handle,
      platformAccountId: profile.platformAccountId,
      status: 'ACTIVE',
      tokenExpiresAt: tokenResult.tokenExpiresAt,
      scopes: tokenResult.scopes,
      metadataJson: JSON.stringify({
        ...profile.metadata,
        encryptedAccessToken,
        encryptedRefreshToken,
        lastConnectedAt: new Date().toISOString(),
      }),
    };

    if (existing) {
      savedAccount = await socialAccountRepository.update(existing.id, accountPayload, agencyId);
      await auditService.log({
        actorId: userId,
        agencyId,
        clientId,
        action: 'OAUTH_CONNECTED',
        entityType: 'SOCIAL_ACCOUNT',
        entityId: existing.id,
        metadata: { platform: profile.platform, platformAccountId: profile.platformAccountId, mode: 'RECONNECT' },
      });
    } else {
      savedAccount = await socialAccountRepository.create(accountPayload, agencyId);
      await auditService.log({
        actorId: userId,
        agencyId,
        clientId,
        action: 'OAUTH_CONNECTED',
        entityType: 'SOCIAL_ACCOUNT',
        entityId: savedAccount.id,
        metadata: { platform: profile.platform, platformAccountId: profile.platformAccountId, mode: 'NEW_CONNECTION' },
      });
    }

    return {
      success: true,
      status: 'CONNECTED',
      account: sanitizeAccountCredentials(savedAccount),
    };
  }

  /**
   * Refresh and obtain a valid plaintext token for internal service/publishing use
   */
  async getValidAccessToken(accountId, agencyId) {
    const account = await socialAccountRepository.findById(accountId, agencyId);
    if (!account) {
      throw new NotFoundError(`Social account "${accountId}" not found.`);
    }

    let meta = {};
    try {
      meta = account.metadataJson ? JSON.parse(account.metadataJson) : {};
    } catch (e) {
      meta = {};
    }

    const encryptedToken = meta.encryptedAccessToken;
    if (!encryptedToken) {
      return null;
    }

    const accessToken = decryptToken(encryptedToken);

    // Check expiry (if expiring in less than 5 minutes)
    const isExpiringSoon = account.tokenExpiresAt && new Date(account.tokenExpiresAt).getTime() - Date.now() < 300000;

    if (isExpiringSoon && meta.encryptedRefreshToken) {
      try {
        const refreshToken = decryptToken(meta.encryptedRefreshToken);
        const provider = getOAuthProvider(account.platform);
        const refreshed = await provider.refreshToken({ refreshToken });

        if (refreshed.accessToken) {
          const newEncryptedAccess = encryptToken(refreshed.accessToken);
          meta.encryptedAccessToken = newEncryptedAccess;
          if (refreshed.refreshToken) {
            meta.encryptedRefreshToken = encryptToken(refreshed.refreshToken);
          }

          await socialAccountRepository.update(
            accountId,
            {
              tokenExpiresAt: refreshed.tokenExpiresAt,
              metadataJson: JSON.stringify(meta),
              status: 'ACTIVE',
            },
            agencyId
          );

          return refreshed.accessToken;
        }
      } catch (err) {
        console.error(`[TOKEN_REFRESH_FAILED] for account ${accountId}:`, err.message);
        await socialAccountRepository.update(accountId, { status: 'NEEDS_REAUTH' }, agencyId);
        return null;
      }
    }

    return accessToken;
  }

  /**
   * Disconnect an account and securely revoke/purge encrypted credentials
   */
  async disconnectAccount(accountId, agencyId, user) {
    const account = await socialAccountRepository.findById(accountId, agencyId);
    if (!account) {
      throw new NotFoundError(`Social account "${accountId}" not found.`);
    }

    let meta = {};
    try {
      meta = account.metadataJson ? JSON.parse(account.metadataJson) : {};
    } catch (e) {
      meta = {};
    }

    // Attempt provider token revocation if token is decryptable
    if (meta.encryptedAccessToken) {
      try {
        const token = decryptToken(meta.encryptedAccessToken);
        const provider = getOAuthProvider(account.platform);
        await provider.revoke({ accessToken: token });
      } catch (e) {
        console.warn(`[TOKEN_REVOKE_NOTICE] Revocation failed for ${account.platform}:`, e.message);
      }
    }

    // Clear encrypted tokens from metadata
    delete meta.encryptedAccessToken;
    delete meta.encryptedRefreshToken;

    const disconnected = await socialAccountRepository.update(
      accountId,
      {
        status: 'DISCONNECTED',
        metadataJson: JSON.stringify(meta),
      },
      agencyId
    );

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: account.clientId,
      action: 'ACCOUNT_DISCONNECTED',
      entityType: 'SOCIAL_ACCOUNT',
      entityId: accountId,
      before: account,
      after: disconnected,
    });

    return {
      message: `Account "${account.accountName}" disconnected successfully. Credentials purged.`,
      account: sanitizeAccountCredentials(disconnected),
    };
  }

  /**
   * Sync profile, status, and health metrics from platform
   */
  async syncAccount(accountId, agencyId, user) {
    const account = await socialAccountRepository.findById(accountId, agencyId);
    if (!account) {
      throw new NotFoundError(`Social account "${accountId}" not found.`);
    }

    if (account.status === 'DISCONNECTED') {
      throw new ValidationError('Cannot sync a disconnected account. Please reconnect first.');
    }

    const token = await this.getValidAccessToken(accountId, agencyId);
    if (!token) {
      await socialAccountRepository.update(accountId, { status: 'NEEDS_REAUTH' }, agencyId);
      return {
        success: false,
        status: 'REAUTH_REQUIRED',
        message: 'Access token expired or missing. Please re-authenticate account.',
      };
    }

    try {
      const provider = getOAuthProvider(account.platform);
      const profile = await provider.getAccountProfile({ accessToken: token });

      const updated = await socialAccountRepository.update(
        accountId,
        {
          accountName: profile.accountName || account.accountName,
          handle: profile.handle || account.handle,
          status: 'ACTIVE',
        },
        agencyId
      );

      await auditService.log({
        actorId: user.userId,
        agencyId,
        clientId: account.clientId,
        action: 'ACCOUNT_SYNCED',
        entityType: 'SOCIAL_ACCOUNT',
        entityId: accountId,
      });

      return {
        success: true,
        status: 'SYNCED',
        account: sanitizeAccountCredentials(updated),
      };
    } catch (err) {
      await socialAccountRepository.update(accountId, { status: 'NEEDS_REAUTH' }, agencyId);
      return {
        success: false,
        status: 'REAUTH_REQUIRED',
        message: err.message || 'Platform sync failed.',
      };
    }
  }
}

export const integrationService = new IntegrationService();
export default integrationService;
