/**
 * Webhook Deduplicator
 * Task 28 — Step 1: Idempotent Webhook Event Ingestion
 */

import { webhookRepository } from '../repositories/webhookRepository.js';

export class WebhookDeduplicator {
  async processEvent(agencyId, provider, eventId, eventType, payload) {
    if (!eventId) {
      return { isDuplicate: false, reason: 'No event ID supplied' };
    }

    const res = await webhookRepository.recordEvent(agencyId, provider, eventId, eventType, payload);
    return res;
  }
}

export const webhookDeduplicator = new WebhookDeduplicator();
export default webhookDeduplicator;
