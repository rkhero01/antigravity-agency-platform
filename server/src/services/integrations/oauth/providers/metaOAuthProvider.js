/**
 * Meta (Facebook & Instagram) OAuth Provider
 * Task 11: Real Meta Graph API OAuth Flow & Account Discovery
 */

import { BaseOAuthProvider } from './baseOAuthProvider.js';

export class MetaOAuthProvider extends BaseOAuthProvider {
  constructor() {
    super('META');
  }

  isConfigured() {
    return Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET);
  }

  getAuthorizationUrl({ state, redirectUri }) {
    this.ensureConfigured();
    const appId = process.env.META_APP_ID;
    const rUri = encodeURIComponent(redirectUri || process.env.META_REDIRECT_URI || 'https://antigravity-agency-platform.onrender.com/api/v1/integrations/meta/callback');
    const scopes = encodeURIComponent(
      'pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish,business_management'
    );

    return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${rUri}&state=${encodeURIComponent(state)}&scope=${scopes}&response_type=code`;
  }

  async exchangeCode({ code, redirectUri }) {
    this.ensureConfigured();
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    const rUri = redirectUri || process.env.META_REDIRECT_URI;

    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&redirect_uri=${encodeURIComponent(rUri)}&code=${encodeURIComponent(code)}`;

    const response = await fetch(tokenUrl);
    const data = await response.json();

    if (data.error) {
      throw new Error(`Meta token exchange failed: ${data.error.message || JSON.stringify(data.error)}`);
    }

    // Exchange short-lived token for 60-day long-lived token
    const longLivedUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${encodeURIComponent(data.access_token)}`;

    let accessToken = data.access_token;
    let expiresIn = data.expires_in || 5184000; // 60 days default

    try {
      const llRes = await fetch(longLivedUrl);
      const llData = await llRes.json();
      if (llData.access_token) {
        accessToken = llData.access_token;
        expiresIn = llData.expires_in || expiresIn;
      }
    } catch (e) {
      console.warn('[META_OAUTH] Failed to exchange long-lived token, using short-lived:', e.message);
    }

    return {
      accessToken,
      refreshToken: null,
      tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      scopes: 'pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish',
    };
  }

  async getAccountProfile({ accessToken }) {
    const meUrl = `https://graph.facebook.com/v19.0/me?fields=id,name,accounts{id,name,category,instagram_business_account{id,username}}&access_token=${encodeURIComponent(accessToken)}`;
    const res = await fetch(meUrl);
    const data = await res.json();

    if (data.error) {
      throw new Error(`Meta profile discovery failed: ${data.error.message}`);
    }

    // Discover first page / IG account
    const firstPage = data.accounts?.data?.[0];
    const igAccount = firstPage?.instagram_business_account;

    return {
      platformAccountId: igAccount?.id || firstPage?.id || data.id,
      accountName: igAccount?.username ? `@${igAccount.username}` : (firstPage?.name || data.name),
      handle: igAccount?.username ? `@${igAccount.username}` : `@${data.name?.replace(/\s+/g, '').toLowerCase()}`,
      platform: igAccount ? 'INSTAGRAM' : 'FACEBOOK',
      metadata: {
        facebookUserId: data.id,
        pageId: firstPage?.id || null,
        pageName: firstPage?.name || null,
        instagramId: igAccount?.id || null,
      },
    };
  }
}

export default MetaOAuthProvider;
