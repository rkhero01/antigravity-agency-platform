/**
 * Google (YouTube, Google Business, Google Ads) OAuth Provider
 * Task 12: Real Google OAuth 2.0 Flow & Multi-Resource Channel Discovery
 */

import { BaseOAuthProvider } from './baseOAuthProvider.js';

export class GoogleOAuthProvider extends BaseOAuthProvider {
  constructor() {
    super('GOOGLE');
  }

  isConfigured() {
    return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  }

  getAuthorizationUrl({ state, redirectUri, service = 'YOUTUBE' }) {
    this.ensureConfigured();
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const rUri = encodeURIComponent(redirectUri || process.env.GOOGLE_REDIRECT_URI || 'https://antigravity-agency-platform.onrender.com/api/v1/integrations/google/callback');

    let scopes = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
    if (service === 'YOUTUBE') {
      scopes += ' https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload';
    } else if (service === 'GOOGLE_BUSINESS') {
      scopes += ' https://www.googleapis.com/auth/business.manage';
    }

    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${rUri}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(scopes)}&response_type=code&access_type=offline&prompt=consent`;
  }

  async exchangeCode({ code, redirectUri }) {
    this.ensureConfigured();
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const rUri = redirectUri || process.env.GOOGLE_REDIRECT_URI;

    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: rUri,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(`Google token exchange failed: ${data.error_description || data.error}`);
    }

    const expiresIn = data.expires_in || 3600;

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || null,
      tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      scopes: data.scope || 'youtube,google_business',
    };
  }

  async refreshToken({ refreshToken }) {
    this.ensureConfigured();
    if (!refreshToken) throw new Error('Missing refresh token for Google token renewal.');

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(`Google token refresh failed: ${data.error_description || data.error}`);
    }

    return {
      accessToken: data.access_token,
      tokenExpiresAt: new Date(Date.now() + (data.expires_in || 3600) * 1000),
    };
  }

  async getAccountProfile({ accessToken }) {
    const accounts = await this.discoverAccounts({ accessToken });
    if (accounts.length > 0) {
      return accounts[0];
    }
    return {
      platformAccountId: `google_${Date.now()}`,
      accountName: 'Google Account',
      handle: '@googleaccount',
      platform: 'YOUTUBE',
      metadata: {},
    };
  }

  async discoverAccounts({ accessToken }) {
    const discovered = [];

    // 1. Discover user profile
    const userinfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
    try {
      const uRes = await fetch(userinfoUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const uData = await uRes.json();

      if (uData.id) {
        discovered.push({
          platformAccountId: uData.id,
          accountName: uData.name || uData.email,
          handle: uData.email ? `@${uData.email.split('@')[0]}` : `@${uData.id}`,
          platform: 'GOOGLE_BUSINESS',
          platformLabel: 'Google Business Profile',
          avatarUrl: uData.picture || null,
          metadata: {
            googleEmail: uData.email,
            googleName: uData.name,
          },
        });
      }
    } catch (e) {
      // Userinfo fetch notice
    }

    // 2. Discover YouTube Channels if granted
    try {
      const ytUrl = 'https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&mine=true';
      const ytRes = await fetch(ytUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const ytData = await ytRes.json();

      const items = ytData.items || [];
      for (const channel of items) {
        const snippet = channel.snippet || {};
        discovered.push({
          platformAccountId: channel.id,
          accountName: snippet.title || 'YouTube Channel',
          handle: snippet.customUrl ? `@${snippet.customUrl.replace(/^@/, '')}` : `@${channel.id}`,
          platform: 'YOUTUBE',
          platformLabel: 'YouTube Channel',
          avatarUrl: snippet.thumbnails?.default?.url || null,
          metadata: {
            channelId: channel.id,
            channelTitle: snippet.title,
            publishedAt: snippet.publishedAt,
          },
        });
      }
    } catch (e) {
      // YouTube scope notice
    }

    return discovered;
  }
}

export default GoogleOAuthProvider;
