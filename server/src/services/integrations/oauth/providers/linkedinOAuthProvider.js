/**
 * LinkedIn OAuth Provider
 * Task 12: Real LinkedIn OAuth 2.0 Flow & Multi-Target Discovery
 */

import { BaseOAuthProvider } from './baseOAuthProvider.js';

export class LinkedInOAuthProvider extends BaseOAuthProvider {
  constructor() {
    super('LINKEDIN');
  }

  isConfigured() {
    return Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
  }

  getAuthorizationUrl({ state, redirectUri }) {
    this.ensureConfigured();
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const rUri = encodeURIComponent(redirectUri || process.env.LINKEDIN_REDIRECT_URI || 'https://antigravity-agency-platform.onrender.com/api/v1/integrations/linkedin/callback');
    const scopes = encodeURIComponent('openid profile email w_member_social');

    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${rUri}&state=${encodeURIComponent(state)}&scope=${scopes}`;
  }

  async exchangeCode({ code, redirectUri }) {
    this.ensureConfigured();
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const rUri = redirectUri || process.env.LINKEDIN_REDIRECT_URI;

    const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: rUri,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(`LinkedIn token exchange failed: ${data.error_description || data.error}`);
    }

    const expiresIn = data.expires_in || 5184000; // 60 days

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || null,
      tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      scopes: 'openid,profile,email,w_member_social',
    };
  }

  async getAccountProfile({ accessToken }) {
    const accounts = await this.discoverAccounts({ accessToken });
    if (accounts.length > 0) {
      return accounts[0];
    }
    return {
      platformAccountId: `linkedin_${Date.now()}`,
      accountName: 'LinkedIn Profile',
      handle: '@linkedinprofile',
      platform: 'LINKEDIN',
      metadata: {},
    };
  }

  async discoverAccounts({ accessToken }) {
    const userinfoUrl = 'https://api.linkedin.com/v2/userinfo';
    const res = await fetch(userinfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();

    if (data.error) {
      throw new Error(`LinkedIn profile discovery failed: ${data.error.message || JSON.stringify(data)}`);
    }

    const name = data.name || `${data.given_name || ''} ${data.family_name || ''}`.trim() || 'LinkedIn Member';

    const discovered = [
      {
        platformAccountId: data.sub,
        accountName: name,
        handle: `@${name.replace(/\s+/g, '').toLowerCase()}`,
        platform: 'LINKEDIN',
        platformLabel: 'LinkedIn Member Profile',
        avatarUrl: data.picture || null,
        metadata: {
          linkedinSub: data.sub,
          email: data.email,
          targetType: 'PERSONAL',
        },
      },
    ];

    // Attempt to discover organizations if permission granted
    try {
      const orgUrl = 'https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee';
      const orgRes = await fetch(orgUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const orgData = await orgRes.json();
      const elements = orgData.elements || [];

      for (const el of elements) {
        const orgUrn = el.organizationalTarget;
        if (orgUrn) {
          const orgId = orgUrn.split(':').pop();
          discovered.push({
            platformAccountId: orgId,
            accountName: `LinkedIn Company (${orgId})`,
            handle: `@linkedin_org_${orgId}`,
            platform: 'LINKEDIN',
            platformLabel: 'LinkedIn Organization Page',
            avatarUrl: null,
            metadata: {
              organizationUrn: orgUrn,
              role: el.role,
              targetType: 'ORGANIZATION',
            },
          });
        }
      }
    } catch (e) {
      // Org discovery notice
    }

    return discovered;
  }
}

export default LinkedInOAuthProvider;
