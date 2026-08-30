/**
 * OAuth Providers Registry
 * Task 11: Unified Platform Adapter Factory
 */

import { MetaOAuthProvider } from './metaOAuthProvider.js';
import { GoogleOAuthProvider } from './googleOAuthProvider.js';
import { LinkedInOAuthProvider } from './linkedinOAuthProvider.js';
import { TwitterOAuthProvider } from './twitterOAuthProvider.js';
import { ValidationError } from '../../../../utils/errors.js';

const providers = {
  META: new MetaOAuthProvider(),
  FACEBOOK: new MetaOAuthProvider(),
  INSTAGRAM: new MetaOAuthProvider(),
  GOOGLE: new GoogleOAuthProvider(),
  GOOGLE_BUSINESS: new GoogleOAuthProvider(),
  YOUTUBE: new GoogleOAuthProvider(),
  LINKEDIN: new LinkedInOAuthProvider(),
  TWITTER: new TwitterOAuthProvider(),
};

export function getOAuthProvider(providerName) {
  if (!providerName) {
    throw new ValidationError('Provider name is required.');
  }
  const key = String(providerName).toUpperCase();
  const provider = providers[key];
  if (!provider) {
    throw new ValidationError(`Unsupported OAuth integration provider: "${providerName}". Supported: META, GOOGLE, LINKEDIN, TWITTER, YOUTUBE, GOOGLE_BUSINESS`);
  }
  return provider;
}

export function getAllOAuthStatus() {
  return {
    META: providers.META.isConfigured(),
    FACEBOOK: providers.FACEBOOK.isConfigured(),
    INSTAGRAM: providers.INSTAGRAM.isConfigured(),
    GOOGLE: providers.GOOGLE.isConfigured(),
    GOOGLE_BUSINESS: providers.GOOGLE_BUSINESS.isConfigured(),
    YOUTUBE: providers.YOUTUBE.isConfigured(),
    LINKEDIN: providers.LINKEDIN.isConfigured(),
    TWITTER: providers.TWITTER.isConfigured(),
  };
}

export default {
  getOAuthProvider,
  getAllOAuthStatus,
};
