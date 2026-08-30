/**
 * Meta (Facebook & Instagram) OAuth Provider
 * Task 12: Real Meta Graph API Discovery for Facebook Pages & Instagram Professional
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
    const accounts = await this.discoverAccounts({ accessToken });
    if (accounts.length > 0) {
      return accounts[0];
    }
    return {
      platformAccountId: `meta_${Date.now()}`,
      accountName: 'Meta Channel',
      handle: '@metachannel',
      platform: 'FACEBOOK',
      metadata: {},
    };
  }

  async discoverAccounts({ accessToken }) {
    const meUrl = `https://graph.facebook.com/v19.0/me?fields=id,name,accounts{id,name,category,picture,access_token,instagram_business_account{id,username,profile_picture_url}}&access_token=${encodeURIComponent(accessToken)}`;
    const res = await fetch(meUrl);
    const data = await res.json();

    if (data.error) {
      throw new Error(`Meta profile discovery failed: ${data.error.message}`);
    }

    const discovered = [];
    const pages = data.accounts?.data || [];

    for (const page of pages) {
      // 1. Add Facebook Page
      discovered.push({
        platformAccountId: page.id,
        accountName: page.name,
        handle: `@${page.name?.replace(/\s+/g, '').toLowerCase()}`,
        platform: 'FACEBOOK',
        platformLabel: 'Facebook Page',
        avatarUrl: page.picture?.data?.url || null,
        metadata: {
          pageId: page.id,
          pageName: page.name,
          category: page.category || null,
          facebookUserId: data.id,
        },
      });

      // 2. Add connected Instagram Professional account if present
      if (page.instagram_business_account) {
        const ig = page.instagram_business_account;
        discovered.push({
          platformAccountId: ig.id,
          accountName: `@${ig.username || page.name}`,
          handle: `@${ig.username || page.name}`,
          platform: 'INSTAGRAM',
          platformLabel: 'Instagram Business',
          avatarUrl: ig.profile_picture_url || page.picture?.data?.url || null,
          metadata: {
            instagramId: ig.id,
            instagramUsername: ig.username,
            pageId: page.id,
            pageName: page.name,
            facebookUserId: data.id,
          },
        });
      }
    }

    // Fallback if user has no Pages created yet
    if (discovered.length === 0 && data.id) {
      discovered.push({
        platformAccountId: data.id,
        accountName: data.name || 'Meta User Account',
        handle: `@${data.name?.replace(/\s+/g, '').toLowerCase() || data.id}`,
        platform: 'FACEBOOK',
        platformLabel: 'Facebook Account',
        avatarUrl: null,
        metadata: {
          facebookUserId: data.id,
        },
      });
    }

    return discovered;
  }
}

export default MetaOAuthProvider;
