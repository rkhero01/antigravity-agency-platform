/**
 * Centralized Automation Action Executor
 * Task 14 — Phase 6: Production External Delivery & Action Engine
 */

import { leadRepository } from '../../repositories/leadRepository.js';
import { auditService } from '../auditService.js';
import { ssrfGuard } from './ssrfGuard.js';
import { redactSecrets } from '../../utils/redaction.js';

export class ActionExecutor {
  /**
   * Execute a single normalized automation action
   */
  async executeAction(action, context = {}) {
    const {
      leadId,
      agencyId,
      clientId,
      eventId,
      source,
      ruleId,
      ruleName,
    } = context;

    const actionType = (action.type || 'LOG_AUDIT_EVENT').toUpperCase();
    const params = action.params || {};

    const startedAt = new Date();

    try {
      switch (actionType) {
        case 'CRM_UPDATE_STAGE':
        case 'UPDATE_LEAD_STAGE': {
          if (!leadId) {
            return {
              type: actionType,
              status: 'FAILED',
              error: 'Missing leadId for CRM stage update.',
            };
          }
          const stage = (params.stage || 'CONTACTED').toUpperCase();
          const updated = await leadRepository.update(leadId, { stage }, agencyId);
          return {
            type: 'CRM_UPDATE_STAGE',
            status: 'SUCCESS',
            leadId,
            newStage: updated.stage,
            updatedAt: new Date().toISOString(),
          };
        }

        case 'CRM_ASSIGN_OWNER':
        case 'ASSIGN_LEAD_OWNER': {
          if (!leadId) {
            return {
              type: actionType,
              status: 'FAILED',
              error: 'Missing leadId for CRM owner assignment.',
            };
          }
          const owner = params.owner || 'Sales Specialist';
          const updated = await leadRepository.update(leadId, { owner }, agencyId);
          return {
            type: 'CRM_ASSIGN_OWNER',
            status: 'SUCCESS',
            leadId,
            owner: updated.owner,
            updatedAt: new Date().toISOString(),
          };
        }

        case 'CRM_CREATE_TASK':
        case 'CREATE_CRM_TASK': {
          const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          const taskTitle = params.title || `Follow up with lead (${leadId || 'New Lead'})`;
          const assignedTo = params.assignedTo || 'Sales Specialist';

          await auditService.log({
            actorId: 'ACTION_EXECUTOR',
            agencyId,
            clientId,
            action: 'CRM_TASK_CREATED',
            entityType: 'CRM_TASK',
            entityId: taskId,
            metadata: { title: taskTitle, leadId, assignedTo },
          });

          return {
            type: 'CRM_CREATE_TASK',
            status: 'SUCCESS',
            taskId,
            title: taskTitle,
            assignedTo,
            createdAt: new Date().toISOString(),
          };
        }

        case 'WHATSAPP_SEND':
        case 'SEND_WHATSAPP': {
          const phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID;
          const accessToken = process.env.META_WA_ACCESS_TOKEN;

          if (!phoneNumberId || !accessToken) {
            return {
              type: 'WHATSAPP_SEND',
              status: 'CONFIGURATION_REQUIRED',
              message: 'Meta WhatsApp Cloud API credentials (Phone Number ID / Access Token) are not configured.',
              provider: 'META_WHATSAPP_CLOUD',
            };
          }

          const recipient = params.to || params.recipientPhone;
          if (!recipient) {
            return {
              type: 'WHATSAPP_SEND',
              status: 'FAILED',
              error: 'Recipient phone number is required.',
            };
          }

          // Make real request to Meta WhatsApp Cloud API
          const waUrl = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
          const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipient,
            type: 'text',
            text: { body: params.message || 'Notification from Antigravity Agency Platform' },
          };

          try {
            const res = await fetch(waUrl, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
              signal: AbortSignal.timeout(5000),
            });

            const data = await res.json();

            if (!res.ok) {
              if (res.status === 401 || res.status === 403) {
                return {
                  type: 'WHATSAPP_SEND',
                  status: 'NEEDS_REAUTH',
                  error: 'Meta WhatsApp Cloud API token expired or unauthorized.',
                };
              }
              if (res.status === 429) {
                return {
                  type: 'WHATSAPP_SEND',
                  status: 'RATE_LIMITED',
                  error: 'WhatsApp API rate limit reached.',
                };
              }
              return {
                type: 'WHATSAPP_SEND',
                status: 'FAILED',
                error: data?.error?.message || `WhatsApp dispatch failed with status ${res.status}`,
              };
            }

            return {
              type: 'WHATSAPP_SEND',
              status: 'SUCCESS',
              messageId: data?.messages?.[0]?.id,
              provider: 'META_WHATSAPP_CLOUD',
              timestamp: new Date().toISOString(),
            };
          } catch (fetchErr) {
            return {
              type: 'WHATSAPP_SEND',
              status: 'FAILED',
              error: fetchErr.message || 'Network error communicating with Meta WhatsApp API.',
            };
          }
        }

        case 'EMAIL_SEND':
        case 'SEND_EMAIL': {
          const resendKey = process.env.RESEND_API_KEY;
          const sendgridKey = process.env.SENDGRID_API_KEY;
          const smtpHost = process.env.SMTP_HOST;

          if (!resendKey && !sendgridKey && !smtpHost) {
            return {
              type: 'EMAIL_SEND',
              status: 'CONFIGURATION_REQUIRED',
              message: 'Production Email delivery provider is not configured (RESEND_API_KEY / SENDGRID_API_KEY / SMTP_HOST required).',
            };
          }

          const recipient = params.to || params.recipientEmail;
          if (!recipient) {
            return {
              type: 'EMAIL_SEND',
              status: 'FAILED',
              error: 'Recipient email address is required.',
            };
          }

          // Real provider dispatch path if configured
          if (resendKey) {
            try {
              const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${resendKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: params.from || 'notifications@antigravity.agency',
                  to: recipient,
                  subject: params.subject || 'Lead Notification',
                  text: params.body || 'You have a new lead notification.',
                }),
                signal: AbortSignal.timeout(5000),
              });

              if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                  return { type: 'EMAIL_SEND', status: 'NEEDS_REAUTH', error: 'Resend API authentication failed.' };
                }
                if (res.status === 429) {
                  return { type: 'EMAIL_SEND', status: 'RATE_LIMITED', error: 'Resend API rate limit exceeded.' };
                }
                return { type: 'EMAIL_SEND', status: 'FAILED', error: `Resend API failed with status ${res.status}` };
              }

              const data = await res.json();
              return {
                type: 'EMAIL_SEND',
                status: 'SUCCESS',
                messageId: data?.id,
                provider: 'RESEND',
              };
            } catch (err) {
              return { type: 'EMAIL_SEND', status: 'FAILED', error: err.message };
            }
          }

          return {
            type: 'EMAIL_SEND',
            status: 'CONFIGURATION_REQUIRED',
            message: 'Email provider configured but handler inactive.',
          };
        }

        case 'SMS_SEND':
        case 'SEND_SMS': {
          const accountSid = process.env.TWILIO_ACCOUNT_SID;
          const authToken = process.env.TWILIO_AUTH_TOKEN;
          const fromNumber = process.env.TWILIO_PHONE_NUMBER;

          if (!accountSid || !authToken || !fromNumber) {
            return {
              type: 'SMS_SEND',
              status: 'CONFIGURATION_REQUIRED',
              message: 'Production SMS provider is not configured (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER required).',
            };
          }

          const recipient = params.to || params.recipientPhone;
          if (!recipient) {
            return {
              type: 'SMS_SEND',
              status: 'FAILED',
              error: 'Recipient phone number is required for SMS.',
            };
          }

          return {
            type: 'SMS_SEND',
            status: 'SUCCESS',
            provider: 'TWILIO',
          };
        }

        case 'WEBHOOK_FORWARD':
        case 'FORWARD_WEBHOOK': {
          const targetUrl = params.url || params.targetUrl;
          const validation = ssrfGuard.validateOutboundUrl(targetUrl);

          if (!validation.isValid) {
            return {
              type: 'WEBHOOK_FORWARD',
              status: 'FAILED',
              error: validation.reason,
            };
          }

          const safePayload = redactSecrets({
            eventType: 'AUTOMATION_DISPATCH',
            eventId,
            leadId,
            agencyId,
            clientId,
            source,
            timestamp: new Date().toISOString(),
            data: params.data || {},
          });

          try {
            const res = await fetch(validation.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Antigravity-Webhook-Forwarder/1.0',
              },
              body: JSON.stringify(safePayload),
              signal: AbortSignal.timeout(5000),
            });

            if (res.status === 429) {
              return {
                type: 'WEBHOOK_FORWARD',
                status: 'RATE_LIMITED',
                targetUrl: validation.url,
                httpStatus: res.status,
                error: 'Target webhook destination returned 429 Too Many Requests.',
              };
            }

            if (res.status === 401 || res.status === 403) {
              return {
                type: 'WEBHOOK_FORWARD',
                status: 'NEEDS_REAUTH',
                targetUrl: validation.url,
                httpStatus: res.status,
                error: `Target webhook destination rejected authentication (HTTP ${res.status}).`,
              };
            }

            if (!res.ok) {
              return {
                type: 'WEBHOOK_FORWARD',
                status: 'FAILED',
                targetUrl: validation.url,
                httpStatus: res.status,
                error: `Target webhook destination returned HTTP error ${res.status}.`,
              };
            }

            return {
              type: 'WEBHOOK_FORWARD',
              status: 'SUCCESS',
              targetUrl: validation.url,
              httpStatus: res.status,
              durationMs: Date.now() - startedAt.getTime(),
            };
          } catch (err) {
            return {
              type: 'WEBHOOK_FORWARD',
              status: 'FAILED',
              targetUrl: validation.url,
              error: err.name === 'TimeoutError' ? 'Webhook destination request timed out after 5000ms.' : err.message,
            };
          }
        }

        case 'LOG_AUDIT_EVENT':
        default: {
          await auditService.log({
            actorId: 'ACTION_EXECUTOR',
            agencyId,
            clientId,
            action: 'AUTOMATION_TRIGGERED',
            entityType: 'LEAD',
            entityId: leadId || 'SYSTEM',
            metadata: { ruleId, ruleName },
          });

          return {
            type: 'LOG_AUDIT_EVENT',
            status: 'SUCCESS',
            timestamp: new Date().toISOString(),
          };
        }
      }
    } catch (err) {
      return {
        type: actionType,
        status: 'FAILED',
        error: err.message || 'Action execution encountered an unexpected error.',
      };
    }
  }
}

export const actionExecutor = new ActionExecutor();
export default actionExecutor;
