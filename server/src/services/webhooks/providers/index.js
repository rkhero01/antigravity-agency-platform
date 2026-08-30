/**
 * Webhook Provider Registry
 * Task 13 — Phase 1: Webhook Architecture & Provider Adapters
 */

import { metaWebhookProvider } from './metaWebhookProvider.js';
import { googleWebhookProvider } from './googleWebhookProvider.js';
import { linkedinWebhookProvider } from './linkedinWebhookProvider.js';
import { twitterWebhookProvider } from './twitterWebhookProvider.js';
import { ValidationError } from '../../../utils/errors.js';

const webhookProviders = {
  META: metaWebhookProvider,
  FACEBOOK: metaWebhookProvider,
  INSTAGRAM: metaWebhookProvider,
  GOOGLE: googleWebhookProvider,
  GOOGLE_BUSINESS: googleWebhookProvider,
  YOUTUBE: googleWebhookProvider,
  LINKEDIN: linkedinWebhookProvider,
  TWITTER: twitterWebhookProvider,
  X: twitterWebhookProvider,
};

export function getWebhookProvider(providerName) {
  if (!providerName || typeof providerName !== 'string') {
    throw new ValidationError('Provider name is required.');
  }

  const key = providerName.trim().toUpperCase();
  const provider = webhookProviders[key];

  if (!provider) {
    throw new ValidationError(
      `Unsupported webhook provider: "${providerName}". Supported: META, GOOGLE, LINKEDIN, TWITTER`
    );
  }

  return provider;
}

export function getAllWebhookStatus() {
  return {
    META: metaWebhookProvider.isConfigured(),
    GOOGLE: googleWebhookProvider.isConfigured(),
    LINKEDIN: linkedinWebhookProvider.isConfigured(),
    TWITTER: twitterWebhookProvider.isConfigured(),
  };
}

export {
  metaWebhookProvider,
  googleWebhookProvider,
  linkedinWebhookProvider,
  twitterWebhookProvider,
};
