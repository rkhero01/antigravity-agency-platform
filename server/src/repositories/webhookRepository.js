/**
 * Webhook Event Repository with Deduplication Index
 * Task 28 — Step 1: Webhook Event Deduplication Store
 */

import { BaseRepository } from './baseRepository.js';

export class WebhookRepository extends BaseRepository {
  constructor() {
    super('WebhookEvent');
    this.processedEventIds = new Set();
  }

  hasEventId(eventId) {
    return this.processedEventIds.has(eventId);
  }

  async recordEvent(agencyId, provider, eventId, eventType, payload) {
    if (this.hasEventId(eventId)) {
      return { isDuplicate: true };
    }

    this.processedEventIds.add(eventId);
    const event = await this.create({
      agencyId,
      provider,
      eventId,
      eventType,
      payloadJson: typeof payload === 'string' ? payload : JSON.stringify(payload),
      status: 'PROCESSED',
    });

    return { isDuplicate: false, event };
  }
}

export const webhookRepository = new WebhookRepository();
export default webhookRepository;
