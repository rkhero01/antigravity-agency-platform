/**
 * WhatsApp Provider Boundary
 * Task 28 — Step 3: WhatsApp Provider Abstraction & Real Mode Safety Gate
 */

import { ExecutionBlockedError } from '../utils/errors.js';
import { env } from '../config/env.js';

export class WhatsAppProviderBoundary {
  async sendMessage(params = {}, mode = 'DEMO') {
    if (mode === 'REAL' || env.isProduction) {
      throw new ExecutionBlockedError(
        'Production WhatsApp API execution blocked: Meta WhatsApp Cloud API credentials and access tokens are not configured. Messaging allowed in DEMO mode only.'
      );
    }

    // Demo Sandbox Execution
    return {
      success: true,
      mode: 'DEMO',
      messageId: `wa-demo-msg-${Date.now()}`,
      status: 'SENT',
      timestamp: new Date().toISOString(),
      details: 'Demo WhatsApp message simulated in sandbox memory.',
    };
  }

  async sendTemplate(params = {}, mode = 'DEMO') {
    if (mode === 'REAL' || env.isProduction) {
      throw new ExecutionBlockedError(
        'Production WhatsApp Template dispatch blocked: Meta Cloud API credentials not configured.'
      );
    }

    return {
      success: true,
      mode: 'DEMO',
      templateId: params.templateId || 'tmpl-demo-01',
      status: 'DELIVERED',
      timestamp: new Date().toISOString(),
    };
  }
}

export const whatsAppProvider = new WhatsAppProviderBoundary();
export default whatsAppProvider;
