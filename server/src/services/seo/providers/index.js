/**
 * SEO Providers Registry & Factory
 * Task 17 — Provider Registration, Selection & Health Status
 */

import { GoogleSearchConsoleProvider } from './googleSearchConsoleProvider.js';
import { DataForSeoProvider } from './dataForSeoProvider.js';

export const PROVIDER_TYPES = {
  GOOGLE_SEARCH_CONSOLE: 'GOOGLE_SEARCH_CONSOLE',
  DATAFORSEO: 'DATAFORSEO',
};

const providers = {
  [PROVIDER_TYPES.GOOGLE_SEARCH_CONSOLE]: new GoogleSearchConsoleProvider(),
  [PROVIDER_TYPES.DATAFORSEO]: new DataForSeoProvider(),
};

/**
 * Get provider instance by name
 */
export function getSeoProvider(providerName) {
  const normalized = (providerName || PROVIDER_TYPES.DATAFORSEO).toUpperCase();
  const provider = providers[normalized];
  if (!provider) {
    throw new Error(`Unsupported SEO provider "${providerName}". Supported: ${Object.keys(providers).join(', ')}`);
  }
  return provider;
}

/**
 * Get health / configuration status of all SEO providers
 */
export async function getSeoProvidersStatus() {
  const statusList = [];
  for (const [key, provider] of Object.entries(providers)) {
    const health = await provider.healthCheck();
    statusList.push({
      provider: key,
      configured: health.configured,
      status: health.status,
    });
  }
  return statusList;
}

export {
  GoogleSearchConsoleProvider,
  DataForSeoProvider,
};
