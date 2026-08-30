/**
 * Google (YouTube, Google Business, Google Ads) OAuth Provider
 * Task 11: Real Google OAuth 2.0 Flow & Channel Discovery
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
    const userinfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
    const res = await fetch(userinfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();

    if (data.error) {
      throw new Error(`Google profile discovery failed: ${data.error.message}`);
    }

    return {
      platformAccountId: data.id,
      accountName: data.name || data.email,
      handle: data.email ? `@${data.email.split('@')[0]}` : `@${data.id}`,
      platform: 'YOUTUBE',
      metadata: {
        googleEmail: data.email,
        picture: data.picture,
      },
    };
  }
}

export default GoogleOAuthProvider;
