/**
 * X / Twitter OAuth 2.0 Provider (PKCE)
 * Task 11: Real X / Twitter OAuth 2.0 Flow & Identity Verification
 */

import { BaseOAuthProvider } from './baseOAuthProvider.js';

export class TwitterOAuthProvider extends BaseOAuthProvider {
  constructor() {
    super('TWITTER');
  }

  isConfigured() {
    return Boolean(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET);
  }

  getAuthorizationUrl({ state, redirectUri }) {
    this.ensureConfigured();
    const clientId = process.env.TWITTER_CLIENT_ID;
    const rUri = encodeURIComponent(redirectUri || process.env.TWITTER_REDIRECT_URI || 'https://antigravity-agency-platform.onrender.com/api/v1/integrations/twitter/callback');
    const scopes = encodeURIComponent('tweet.read tweet.write users.read offline.access');

    return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${rUri}&scope=${scopes}&state=${encodeURIComponent(state)}&code_challenge=challenge&code_challenge_method=plain`;
  }

  async exchangeCode({ code, redirectUri }) {
    this.ensureConfigured();
    const clientId = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET;
    const rUri = redirectUri || process.env.TWITTER_REDIRECT_URI;

    const tokenUrl = 'https://api.twitter.com/2/oauth2/token';
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const params = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: rUri,
      code_verifier: 'challenge',
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: params.toString(),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(`Twitter token exchange failed: ${data.error_description || data.error}`);
    }

    const expiresIn = data.expires_in || 7200;

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || null,
      tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      scopes: data.scope || 'tweet.read,tweet.write,users.read',
    };
  }

  async refreshToken({ refreshToken }) {
    this.ensureConfigured();
    if (!refreshToken) throw new Error('Missing refresh token for Twitter token renewal.');

    const clientId = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET;
    const tokenUrl = 'https://api.twitter.com/2/oauth2/token';
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const params = new URLSearchParams({
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      client_id: clientId,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: params.toString(),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(`Twitter token refresh failed: ${data.error_description || data.error}`);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      tokenExpiresAt: new Date(Date.now() + (data.expires_in || 7200) * 1000),
    };
  }

  async getAccountProfile({ accessToken }) {
    const meUrl = 'https://api.twitter.com/2/users/me?user.fields=profile_image_url,verified';
    const res = await fetch(meUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();

    if (data.errors) {
      throw new Error(`Twitter profile discovery failed: ${data.errors[0]?.message || JSON.stringify(data.errors)}`);
    }

    const user = data.data;

    return {
      platformAccountId: user.id,
      accountName: user.name || user.username,
      handle: `@${user.username}`,
      platform: 'TWITTER',
      metadata: {
        username: user.username,
        profileImageUrl: user.profile_image_url,
      },
    };
  }
}

export default TwitterOAuthProvider;
