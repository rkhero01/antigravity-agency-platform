/**
 * Billing & Payment Gateway Boundary
 * Task 28 — Step 3: Billing Safety & Payment Capture Block
 */

import { ExecutionBlockedError } from '../utils/errors.js';
import { env } from '../config/env.js';

export class BillingProviderBoundary {
  async chargePayment(invoiceId, amount, mode = 'DEMO') {
    if (mode === 'REAL' || env.isProduction) {
      throw new ExecutionBlockedError(
        'Production Payment Gateway execution blocked: Live financial payment gateway (Stripe/Razorpay) is not configured. Invoices remain records only.'
      );
    }

    return {
      success: true,
      mode: 'DEMO',
      invoiceId,
      amount,
      status: 'SIMULATED_SUCCESS',
      transactionId: `tx-demo-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  }
}

export const billingProvider = new BillingProviderBoundary();
export default billingProvider;
