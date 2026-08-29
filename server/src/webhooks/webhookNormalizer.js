/**
 * Webhook Event Normalizer
 * Task 28 — Step 1: Standardized Webhook Event Pipeline
 */

export function normalizeWhatsAppWebhook(rawPayload) {
  const entry = rawPayload?.entry?.[0];
  const changes = entry?.changes?.[0]?.value;
  const message = changes?.messages?.[0];
  const contact = changes?.contacts?.[0];

  return {
    provider: 'META_WHATSAPP',
    eventId: message?.id || `WA-EVT-${Date.now()}`,
    eventType: message?.type || 'message',
    sender: contact?.wa_id || message?.from || 'unknown',
    senderName: contact?.profile?.name || 'Customer',
    timestamp: message?.timestamp ? new Date(Number(message.timestamp) * 1000).toISOString() : new Date().toISOString(),
    payload: {
      text: message?.text?.body || '',
      type: message?.type || 'text',
      raw: rawPayload,
    },
  };
}

export function normalizeCRMWebhook(rawPayload) {
  return {
    provider: 'CRM_GATEWAY',
    eventId: rawPayload?.eventId || `CRM-EVT-${Date.now()}`,
    eventType: rawPayload?.eventType || 'lead_updated',
    clientId: rawPayload?.clientId || 'c1',
    timestamp: rawPayload?.timestamp || new Date().toISOString(),
    payload: rawPayload?.data || rawPayload,
  };
}

export const webhookNormalizer = {
  normalizeWhatsAppWebhook,
  normalizeCRMWebhook,
};

export default webhookNormalizer;
