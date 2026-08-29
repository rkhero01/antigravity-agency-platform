/**
 * Provider Factory & Dynamic Router
 * Task 27 — Step 6: Seamless Demo/Production Provider Swapping
 */

import { ENV_CONFIG } from '../../../utils/envConfig.js';
import { demoProvider } from './demoProvider.js';
import { realApiProvider } from './realApiProvider.js';

export function getProvider(overrideMode = null) {
  const mode = (overrideMode || ENV_CONFIG.EXECUTION_MODE || 'DEMO').toUpperCase();

  if (mode === 'REAL' && ENV_CONFIG.IS_PRODUCTION) {
    return realApiProvider;
  }

  // Safe fallback to DemoProvider
  return demoProvider;
}

export const providerFactory = {
  getProvider,
  demoProvider,
  realApiProvider,
};

export default providerFactory;
