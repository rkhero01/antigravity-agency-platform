/**
 * Action Permission Matrix & Policy Governance
 * Task 27 — Step 6: Hardened Permission & Approval Rules
 *
 * Engine Status: "AI Intelligence Engine — Demo / API Ready"
 */

import { API_ERROR_CODES } from './apiErrors.js';

export const ACTION_TYPES = {
  SCALE_CAMPAIGN_BUDGET: 'SCALE_CAMPAIGN_BUDGET',
  PAUSE_CAMPAIGN: 'PAUSE_CAMPAIGN',
  UPDATE_LEAD_STAGE: 'UPDATE_LEAD_STAGE',
  ASSIGN_LEAD: 'ASSIGN_LEAD',
  CREATE_CRM_TASK: 'CREATE_CRM_TASK',
  CREATE_WHATSAPP_FOLLOWUP: 'CREATE_WHATSAPP_FOLLOWUP',
  SEND_WHATSAPP_TEMPLATE: 'SEND_WHATSAPP_TEMPLATE',
  ACTIVATE_AUTOMATION: 'ACTIVATE_AUTOMATION',
  CREATE_SEO_TASK: 'CREATE_SEO_TASK',
  ASSIGN_OPERATOR: 'ASSIGN_OPERATOR',
};

export const ACTION_PERMISSION_POLICIES = {
  [ACTION_TYPES.SCALE_CAMPAIGN_BUDGET]: {
    defaultPriority: 'P0',
    requiresApproval: true,
    allowedInDemo: true,
    allowedInProduction: false, // Requires live Meta/Google Ads API provider + OAuth
    riskLevel: 'HIGH',
    description: 'Increases or decreases daily media spend on ad platforms',
  },
  [ACTION_TYPES.PAUSE_CAMPAIGN]: {
    defaultPriority: 'P0',
    requiresApproval: true,
    allowedInDemo: true,
    allowedInProduction: false,
    riskLevel: 'HIGH',
    description: 'Pauses active ad campaign delivery',
  },
  [ACTION_TYPES.UPDATE_LEAD_STAGE]: {
    defaultPriority: 'P1',
    requiresApproval: true,
    allowedInDemo: true,
    allowedInProduction: false, // Requires CRM REST endpoint
    riskLevel: 'MEDIUM',
    description: 'Transitions CRM lead stage in pipeline',
  },
  [ACTION_TYPES.ASSIGN_LEAD]: {
    defaultPriority: 'P1',
    requiresApproval: true,
    allowedInDemo: true,
    allowedInProduction: false,
    riskLevel: 'LOW',
    description: 'Assigns inbound lead to a specific team operator',
  },
  [ACTION_TYPES.CREATE_CRM_TASK]: {
    defaultPriority: 'P2',
    requiresApproval: false,
    allowedInDemo: true,
    allowedInProduction: false,
    riskLevel: 'LOW',
    description: 'Schedules a CRM follow-up task or reminder',
  },
  [ACTION_TYPES.CREATE_WHATSAPP_FOLLOWUP]: {
    defaultPriority: 'P1',
    requiresApproval: true,
    allowedInDemo: true,
    allowedInProduction: false,
    riskLevel: 'MEDIUM',
    description: 'Schedules an automated WhatsApp customer follow-up message',
  },
  [ACTION_TYPES.SEND_WHATSAPP_TEMPLATE]: {
    defaultPriority: 'P2',
    requiresApproval: false,
    allowedInDemo: true,
    allowedInProduction: false, // Requires Meta WhatsApp Cloud API credentials
    riskLevel: 'MEDIUM',
    description: 'Dispatches pre-approved Meta WhatsApp utility/marketing template',
  },
  [ACTION_TYPES.ACTIVATE_AUTOMATION]: {
    defaultPriority: 'P1',
    requiresApproval: true,
    allowedInDemo: true,
    allowedInProduction: false,
    riskLevel: 'MEDIUM',
    description: 'Activates an automated trigger/action workflow sequence',
  },
  [ACTION_TYPES.CREATE_SEO_TASK]: {
    defaultPriority: 'P2',
    requiresApproval: false,
    allowedInDemo: true,
    allowedInProduction: false,
    riskLevel: 'LOW',
    description: 'Creates SEO keyword content optimization sprint task',
  },
  [ACTION_TYPES.ASSIGN_OPERATOR]: {
    defaultPriority: 'P0',
    requiresApproval: true,
    allowedInDemo: true,
    allowedInProduction: false,
    riskLevel: 'MEDIUM',
    description: 'Reallocates operator shift schedules for peak chat SLA handling',
  },
};

/**
 * Validates action execution against permissions, approval rules, and execution mode
 */
export function validateActionPermission(action, executionMode = 'DEMO') {
  if (!action || !action.actionId) {
    return {
      allowed: false,
      errorCode: API_ERROR_CODES.VALIDATION_ERROR,
      reason: 'Invalid action payload: missing actionId.',
    };
  }

  // Normalize action type key
  let actionTypeKey = String(action.actionType || '').toUpperCase().replace(/[^A-Z_]/g, '_');
  if (action.actionType === 'updateCampaignBudget') actionTypeKey = ACTION_TYPES.SCALE_CAMPAIGN_BUDGET;
  else if (action.actionType === 'activateAutomation') actionTypeKey = ACTION_TYPES.ACTIVATE_AUTOMATION;
  else if (action.actionType === 'updateLeadStage') actionTypeKey = ACTION_TYPES.UPDATE_LEAD_STAGE;
  else if (action.actionType === 'sendTemplate') actionTypeKey = ACTION_TYPES.SEND_WHATSAPP_TEMPLATE;
  else if (action.actionType === 'assignOperator') actionTypeKey = ACTION_TYPES.ASSIGN_OPERATOR;

  const policy = ACTION_PERMISSION_POLICIES[actionTypeKey] || {
    requiresApproval: action.priority === 'P0' || action.priority === 'P1',
    allowedInDemo: true,
    allowedInProduction: false,
    riskLevel: 'MEDIUM',
  };

  // 1. Approval Check for P0/P1
  if (policy.requiresApproval && action.executionState !== 'APPROVED' && action.executionState !== 'COMPLETED') {
    return {
      allowed: false,
      errorCode: API_ERROR_CODES.AUTHORIZATION_ERROR,
      reason: `Action "${action.title || action.actionId}" is ${action.priority || 'P0'} and requires explicit operator approval before execution.`,
    };
  }

  // 2. Real Production Safety Gate Check
  if (executionMode === 'REAL') {
    if (!policy.allowedInProduction) {
      return {
        allowed: false,
        errorCode: API_ERROR_CODES.EXECUTION_BLOCKED,
        reason: `Production API execution blocked: Real API credentials for ${action.targetModule || 'module'} are not configured. Action permitted in DEMO mode only.`,
      };
    }
  }

  return {
    allowed: true,
    policy,
    actionTypeKey,
  };
}

export const actionPermissionPolicy = {
  ACTION_TYPES,
  ACTION_PERMISSION_POLICIES,
  validateActionPermission,
};

export default actionPermissionPolicy;
