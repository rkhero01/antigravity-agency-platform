/**
 * AI Action Orchestrator & Execution Engine
 * Task 27 — Step 5: Action Lifecycle, Cross-Module Adapters & Real-World Action Readiness
 *
 * Engine Status: "AI Intelligence Engine — Demo / API Ready"
 */

import { initialMockAIIntelligence } from '../data/mockAIIntelligence.js';
import { validateActionPermission } from './api/actionPermissionPolicy.js';
import { providerFactory } from './api/providers/providerFactory.js';
import { telemetryService } from './api/telemetryService.js';
import { API_ERROR_CODES } from './api/apiErrors.js';
import { ENV_CONFIG } from '../utils/envConfig.js';

// Lifecycle State Enum
export const ACTION_STATES = {
  DISCOVERED: 'DISCOVERED',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  APPROVED: 'APPROVED',
  EXECUTING: 'EXECUTING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  ROLLED_BACK: 'ROLLED_BACK',
  REJECTED: 'REJECTED',
  SNOOZED: 'SNOOZED',
};

// In-Memory Idempotency & In-Flight Execution Lock Store
const executedIdempotencyKeys = new Set(['IDEM-HIST-101', 'IDEM-HIST-100', 'IDEM-HIST-099']);
const inFlightExecutionLocks = new Set();

// In-Memory Action Queue State (Initialized with comprehensive actionable items)
let actionQueueState = [
  {
    actionId: 'ACT-201',
    clientId: 'c1',
    clientName: 'Apex Fitness Club',
    sourceType: 'RECOMMENDATION',
    sourceId: 'rec-1',
    actionType: 'updateCampaignBudget',
    targetModule: 'Ads & Campaigns',
    title: 'Authorize 25% Budget Surge on Meta Lookalike Ad Sets',
    priority: 'P0',
    expectedImpact: '+₹380,000 projected monthly revenue lift',
    confidence: '96.2%',
    riskLevel: 'Low',
    requiresApproval: true,
    executionState: ACTION_STATES.REVIEW_REQUIRED,
    idempotencyKey: 'IDEM-REC-1-BUDGET-SCALE-C1',
    beforeState: {
      dailyBudget: 2000,
      monthlyBudget: 60000,
      status: 'Active',
      metricSummary: 'Current Daily Spend: ₹2,000 / day (ROAS: 12.3x)',
    },
    proposedState: {
      dailyBudget: 2500,
      monthlyBudget: 75000,
      status: 'Active (Scaled +25%)',
      metricSummary: 'New Daily Spend: ₹2,500 / day (Projected ROAS: 11.8x)',
    },
    decisionTrace: {
      signal: 'High campaign ROAS (12.3x) is capped by daily spend limits with low audience saturation (14%).',
      evidence: 'CPL is ₹150 with a 38.2% lead-to-won conversion rate.',
      patternDetected: 'Positive ROAS expansion with linear conversion scaling capacity.',
      businessRisk: '₹450,000 in unmet member trial demand lost to regional fitness competitors.',
      recommendation: 'Increase daily ad spend from ₹2,000/day to ₹2,500/day on top-performing video reels.',
      expectedImpact: '+₹380,000 projected monthly revenue lift.',
      confidence: '96.2%',
      requiredApproval: 'Yes (P0 Critical Execution)',
      executionResult: 'Pending Executive Approval',
    },
    createdAt: '2026-08-28T20:00:00.000Z',
    executedAt: null,
    completedAt: null,
    error: null,
    rollbackAvailable: true,
    demoMode: true,
  },
  {
    actionId: 'ACT-202',
    clientId: 'c2',
    clientName: 'Verde Organics',
    sourceType: 'RECOMMENDATION',
    sourceId: 'rec-2',
    actionType: 'activateAutomation',
    targetModule: 'WhatsApp Marketing',
    title: 'Deploy 2-Hour Cart Recovery WhatsApp Journey',
    priority: 'P1',
    expectedImpact: '+₹240,000 recovered pipeline',
    confidence: '92.5%',
    riskLevel: 'Low',
    requiresApproval: true,
    executionState: ACTION_STATES.REVIEW_REQUIRED,
    idempotencyKey: 'IDEM-REC-2-CART-RECOVERY-C2',
    beforeState: {
      automationActive: false,
      flowName: 'Payment Link Abandonment Nudge',
      metricSummary: 'Cart drop-off rate: 46% (No automated follow-up)',
    },
    proposedState: {
      automationActive: true,
      flowName: 'Payment Link Abandonment Nudge (2-Hour Delay + 5% Instant Token)',
      metricSummary: 'Projected cart recovery: 38% (+₹240k pipeline)',
    },
    decisionTrace: {
      signal: 'Drop-off between payment link generation and completed transaction is currently 46%.',
      evidence: '320 customers clicked payment link without completing checkout in the last 14 days.',
      patternDetected: 'Fast drop in buyer intent after 120 minutes of payment link generation.',
      businessRisk: '₹240,000 lost in recoverable high-intent transactions each month.',
      recommendation: 'Deploy 2-hour automated WhatsApp reminder with dynamic 5% coupon token.',
      expectedImpact: '+₹240,000 recovered pipeline.',
      confidence: '92.5%',
      requiredApproval: 'Yes (P1 High Priority)',
      executionResult: 'Pending Operator Approval',
    },
    createdAt: '2026-08-28T19:30:00.000Z',
    executedAt: null,
    completedAt: null,
    error: null,
    rollbackAvailable: true,
    demoMode: true,
  },
  {
    actionId: 'ACT-203',
    clientId: 'c3',
    clientName: 'NovaTech SaaS',
    sourceType: 'RECOMMENDATION',
    sourceId: 'rec-3',
    actionType: 'updateLeadStage',
    targetModule: 'CRM Pipeline',
    title: 'Attach SOC2 Compliance Dossier to Enterprise Proposals',
    priority: 'P1',
    expectedImpact: 'Accelerate ₹1.25M pipeline by 7.3 days',
    confidence: '89.0%',
    riskLevel: 'Low',
    requiresApproval: true,
    executionState: ACTION_STATES.APPROVED,
    idempotencyKey: 'IDEM-REC-3-SOC2-CRM-C3',
    beforeState: {
      complianceAttachment: false,
      avgProposalDwellTime: '12.4 days',
      metricSummary: '9 enterprise deals paused in Proposal stage',
    },
    proposedState: {
      complianceAttachment: true,
      avgProposalDwellTime: '5.1 days',
      metricSummary: 'SOC2 / ISO 27001 pack attached automatically to all >25 seat proposals',
    },
    decisionTrace: {
      signal: 'Enterprise deals pause for 12+ days during legal and technical security reviews.',
      evidence: '9 qualified leads requested compliance documentation after initial pricing.',
      patternDetected: 'CTO / SecOps review bottleneck during Proposal stage.',
      businessRisk: 'Prolonged deal stalls lead to budget cycle expiration and deal slips.',
      recommendation: 'Pre-package SOC2 Type II, ISO 27001, and GDPR documentation into proposals.',
      expectedImpact: 'Shorten sales cycle by 7.3 days (+₹1.25M pipeline velocity).',
      confidence: '89.0%',
      requiredApproval: 'Yes (Approved by Director)',
      executionResult: 'Approved — Ready for Execution',
    },
    createdAt: '2026-08-28T18:00:00.000Z',
    executedAt: null,
    completedAt: null,
    error: null,
    rollbackAvailable: true,
    demoMode: true,
  },
  {
    actionId: 'ACT-204',
    clientId: 'c5',
    clientName: 'Bharat Ayurveda Health',
    sourceType: 'RECOMMENDATION',
    sourceId: 'rec-4',
    actionType: 'sendTemplate',
    targetModule: 'WhatsApp Marketing',
    title: 'Dispatch Wholesale Inventory Replenish Broadcast',
    priority: 'P2',
    expectedImpact: '+₹320,000 recovered order volume',
    confidence: '86.0%',
    riskLevel: 'Low',
    requiresApproval: false,
    executionState: ACTION_STATES.REVIEW_REQUIRED,
    idempotencyKey: 'IDEM-REC-4-WHOLESALE-REPLENISH-C5',
    beforeState: {
      broadcastDispatched: false,
      inactiveClinics: 380,
      metricSummary: '380 clinic contacts inactive past 45 days',
    },
    proposedState: {
      broadcastDispatched: true,
      templateName: 'b2b_wholesale_inventory_replenish',
      metricSummary: 'Dispatch to 380 verified B2B clinic purchasing managers',
    },
    decisionTrace: {
      signal: '380 retail clinic contacts have not ordered in 45 days past standard replenishment cycle.',
      evidence: 'Historical re-engagement broadcasts convert at 22% when bundled with wholesale pricing.',
      patternDetected: 'Predictable 30-day recurring wholesale inventory consumption.',
      businessRisk: 'Clinics switch to competing regional botanical wholesalers.',
      recommendation: 'Dispatch WhatsApp Template: “b2b_wholesale_inventory_replenish”.',
      expectedImpact: '+₹320,000 recovered order volume.',
      confidence: '86.0%',
      requiredApproval: 'No (Routine P2 Automation)',
      executionResult: 'Pending Operator Review',
    },
    createdAt: '2026-08-28T17:00:00.000Z',
    executedAt: null,
    completedAt: null,
    error: null,
    rollbackAvailable: true,
    demoMode: true,
  },
];

// In-Memory Execution Audit History & Logs
let actionHistoryState = [
  {
    actionId: 'ACT-HIST-101',
    clientId: 'c1',
    clientName: 'Apex Fitness Club',
    sourceType: 'ANOMALY',
    sourceId: 'anom-int-1',
    actionType: 'assignOperator',
    targetModule: 'Team & Workload',
    title: 'Auto-Balance Operator Shift for Evening Peak SLA',
    priority: 'P0',
    expectedImpact: 'Restored first response SLA to 42s',
    confidence: '98.0%',
    executionState: ACTION_STATES.COMPLETED,
    idempotencyKey: 'IDEM-HIST-101',
    operator: 'Antigravity AI Co-Pilot',
    time: 'Today at 07:30 PM',
    executedAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date(Date.now() - 3590000).toISOString(),
    beforeState: {
      shiftOperators: 1,
      firstTouchLatency: '2.4 minutes',
      metricSummary: 'Evening chat queue: 48 queries / 1 operator',
    },
    proposedState: {
      shiftOperators: 3,
      firstTouchLatency: '42 seconds',
      metricSummary: 'Evening chat queue: 48 queries / 3 operators + AI co-pilot',
    },
    decisionTrace: {
      signal: 'Evening first touch latency spikes to 2.4 minutes due to operator queue saturation.',
      evidence: '48% of daily inbound queries arrive between 6 PM–9 PM.',
      patternDetected: 'Recurring post-work gym trial query rush.',
      businessRisk: 'High lead bounce rate (18%) during peak signup hours.',
      recommendation: 'Auto-reassign 2 operators and enable AI Co-Pilot instant reply.',
      expectedImpact: 'Sub-45s response SLA restored.',
      confidence: '98.0%',
      requiredApproval: 'Executed under autonomous SLA policy',
      executionResult: 'Completed successfully (Demo Sandbox)',
    },
    auditMessage: 'Demo action executed successfully. No external API action was performed.',
    rollbackAvailable: true,
    demoMode: true,
  },
  {
    actionId: 'ACT-HIST-100',
    clientId: 'c2',
    clientName: 'Verde Organics',
    sourceType: 'ANOMALY',
    sourceId: 'anom-int-3',
    actionType: 'updateCampaignBudget',
    targetModule: 'Ads & Campaigns',
    title: 'Scale Autumn Skincare UGC Reel Campaign (+25%)',
    priority: 'P1',
    expectedImpact: '+₹380,000 projected monthly revenue lift',
    confidence: '94.0%',
    executionState: ACTION_STATES.COMPLETED,
    idempotencyKey: 'IDEM-HIST-100',
    operator: 'Media Lead',
    time: 'Today at 04:15 PM',
    executedAt: new Date(Date.now() - 14400000).toISOString(),
    completedAt: new Date(Date.now() - 14390000).toISOString(),
    beforeState: {
      dailyBudget: 2000,
      monthlyBudget: 60000,
      metricSummary: 'Daily budget: ₹2,000 / day (ROAS: 12.9x)',
    },
    proposedState: {
      dailyBudget: 2500,
      monthlyBudget: 75000,
      metricSummary: 'Daily budget: ₹2,500 / day (Projected ROAS: 12.2x)',
    },
    decisionTrace: {
      signal: 'Viral organic UGC reel expanded ROAS by +98.5% with sub-₹45 CPC.',
      evidence: 'Current spend ₹48,000 generated ₹590,000 revenue.',
      patternDetected: 'Viral social proof surge with low audience fatigue.',
      businessRisk: 'Under-spending while consumer interest is peaked.',
      recommendation: 'Scale daily budget by 25% on winning ad set.',
      expectedImpact: '+₹380,000 projected monthly revenue.',
      confidence: '94.0%',
      requiredApproval: 'Approved by Media Lead',
      executionResult: 'Completed successfully (Demo Sandbox)',
    },
    auditMessage: 'Demo action executed successfully. No external API action was performed.',
    rollbackAvailable: true,
    demoMode: true,
  },
];

// Activity Events Stream
let activityEventsState = [
  {
    id: 'act-ev-1',
    timestamp: 'Just now',
    type: 'action',
    title: 'AI Action Queue Synchronized',
    description: '4 high-priority prescriptive directives analyzed and ready for review.',
    severity: 'info',
    clientName: 'Agency-Wide',
    clientId: 'all',
    module: 'Operations Command',
  },
  {
    id: 'act-ev-2',
    timestamp: '2 mins ago',
    type: 'anomaly',
    title: 'SLA Latency Spike Detected',
    description: 'First response time rose to 2.4 minutes on Apex Fitness WhatsApp inbox during 6–9 PM shift.',
    severity: 'critical',
    clientName: 'Apex Fitness Club',
    clientId: 'c1',
    module: 'Team & Workload',
  },
  {
    id: 'act-ev-3',
    timestamp: '14 mins ago',
    type: 'optimization',
    title: 'Meta Lookalike Budget Scaled (Demo)',
    description: 'Daily spend increased from ₹2,000 to ₹2,500 following 12.3x ROAS detection.',
    severity: 'positive',
    clientName: 'Apex Fitness Club',
    clientId: 'c1',
    module: 'Ads & Campaigns',
  },
  {
    id: 'act-ev-4',
    timestamp: '32 mins ago',
    type: 'velocity',
    title: '14 Enterprise Proposals Stalled',
    description: 'CTO security compliance validation bottleneck detected at NovaTech SaaS. Recommended SOC2 pack attachment.',
    severity: 'warning',
    clientName: 'NovaTech SaaS',
    clientId: 'c3',
    module: 'CRM Pipeline',
  },
  {
    id: 'act-ev-5',
    timestamp: '1 hour ago',
    type: 'followup',
    title: 'Automated 2-Hour Cart Nudge Activated',
    description: 'Journey flow triggered for 320 abandoned checkout sessions with dynamic 5% UPI token.',
    severity: 'positive',
    clientName: 'Verde Organics',
    clientId: 'c2',
    module: 'WhatsApp Marketing',
  },
];

// --------------------------------------------------------------------------
// CROSS-MODULE ACTION ADAPTERS (Safe Sandbox Execution)
// --------------------------------------------------------------------------

export const crossModuleAdapters = {
  // CRM Adapters
  async updateLeadStage(clientId, leadId, newStage) {
    return Promise.resolve({
      success: true,
      module: 'CRM Pipeline',
      entityId: leadId || 'lead-1',
      clientId,
      beforeStage: 'Proposal / Offer',
      newStage: newStage || 'Negotiation',
      auditMessage: `Lead stage safely updated to "${newStage}" in sandbox. No external CRM API was modified.`,
      demoMode: true,
    });
  },

  async assignLead(clientId, leadId, operatorId) {
    return Promise.resolve({
      success: true,
      module: 'CRM Pipeline',
      entityId: leadId || 'lead-1',
      clientId,
      assignedOperator: operatorId || 'team-1',
      auditMessage: 'Lead assigned in sandbox environment.',
      demoMode: true,
    });
  },

  async createCRMTask(clientId, taskData = {}) {
    return Promise.resolve({
      success: true,
      module: 'CRM Pipeline',
      taskId: `TASK-CRM-${Date.now()}`,
      clientId,
      taskTitle: taskData.title || 'Follow up with enterprise prospect',
      auditMessage: 'CRM task scheduled in sandbox environment.',
      demoMode: true,
    });
  },

  // WhatsApp Adapters
  async createFollowUp(clientId, followUpData = {}) {
    return Promise.resolve({
      success: true,
      module: 'WhatsApp Marketing',
      followUpId: `WA-FU-${Date.now()}`,
      clientId,
      scheduledTime: followUpData.scheduledTime || 'In 2 hours',
      auditMessage: 'WhatsApp follow-up scheduled in sandbox environment.',
      demoMode: true,
    });
  },

  async sendTemplate(clientId, templateId, contactId) {
    return Promise.resolve({
      success: true,
      module: 'WhatsApp Marketing',
      templateId: templateId || 'b2b_wholesale_inventory_replenish',
      contactId: contactId || 'contact-1',
      clientId,
      auditMessage: 'Simulated WhatsApp broadcast template dispatched in sandbox.',
      demoMode: true,
    });
  },

  async activateAutomation(clientId, flowId) {
    return Promise.resolve({
      success: true,
      module: 'WhatsApp Marketing',
      flowId: flowId || 'wa-flow-cart',
      clientId,
      status: 'Active',
      auditMessage: 'WhatsApp automation flow activated in sandbox.',
      demoMode: true,
    });
  },

  // Ads Adapters
  async updateCampaignBudget(clientId, campaignId, newDailyBudget) {
    return Promise.resolve({
      success: true,
      module: 'Ads & Campaigns',
      campaignId: campaignId || 'camp-101',
      clientId,
      newDailyBudget: newDailyBudget || 2500,
      auditMessage: `Campaign daily budget updated to ₹${newDailyBudget || 2500} in sandbox. No live Meta API call performed.`,
      demoMode: true,
    });
  },

  async pauseCampaign(clientId, campaignId) {
    return Promise.resolve({
      success: true,
      module: 'Ads & Campaigns',
      campaignId: campaignId || 'camp-101',
      clientId,
      status: 'Paused',
      auditMessage: 'Campaign safely paused in sandbox.',
      demoMode: true,
    });
  },

  // SEO Adapter
  async createSEOOpportunityTask(clientId, keyword, targetUrl) {
    return Promise.resolve({
      success: true,
      module: 'SEO Command Center',
      keyword: keyword || 'best enterprise cloud compliance tools 2026',
      targetUrl: targetUrl || '/enterprise-security',
      clientId,
      auditMessage: 'SEO optimization sprint task created in sandbox.',
      demoMode: true,
    });
  },

  // Team Adapter
  async assignOperator(clientId, operatorId, shift) {
    return Promise.resolve({
      success: true,
      module: 'Team & Workload',
      operatorId: operatorId || 'Alex Morgan',
      shift: shift || 'Evening 6 PM – 9 PM',
      clientId,
      auditMessage: 'Operator shift allocation updated in sandbox.',
      demoMode: true,
    });
  },
};

// --------------------------------------------------------------------------
// AI ACTION ORCHESTRATOR SERVICE
// --------------------------------------------------------------------------

export const aiActionOrchestrator = {
  /**
   * Get Active Action Queue filtered by client, priority, or execution state
   */
  async getActionQueue(filters = {}) {
    const { clientId = 'all', priority = 'all', executionState = 'all' } = filters;
    let list = JSON.parse(JSON.stringify(actionQueueState));

    if (clientId && clientId !== 'all') {
      list = list.filter((a) => a.clientId === clientId);
    }
    if (priority && priority !== 'all') {
      list = list.filter((a) => a.priority.toLowerCase() === priority.toLowerCase());
    }
    if (executionState && executionState !== 'all') {
      list = list.filter((a) => a.executionState.toLowerCase() === executionState.toLowerCase());
    }

    return Promise.resolve(list);
  },

  /**
   * Get Action by ID
   */
  async getActionById(actionId) {
    if (!actionId) return Promise.resolve(null);
    const item =
      actionQueueState.find((a) => a.actionId === actionId) ||
      actionHistoryState.find((a) => a.actionId === actionId);
    return Promise.resolve(item ? JSON.parse(JSON.stringify(item)) : null);
  },

  /**
   * Get Pending Approvals (P0 / P1 in REVIEW_REQUIRED state)
   */
  async getPendingApprovals(filters = {}) {
    const { clientId = 'all' } = filters;
    let list = actionQueueState.filter(
      (a) => a.executionState === ACTION_STATES.REVIEW_REQUIRED && (a.priority === 'P0' || a.priority === 'P1')
    );

    if (clientId && clientId !== 'all') {
      list = list.filter((a) => a.clientId === clientId);
    }

    return Promise.resolve(JSON.parse(JSON.stringify(list)));
  },

  /**
   * Preview Action Transformation Before Execution
   */
  async previewAction(actionIdOrItem) {
    let action = null;
    if (typeof actionIdOrItem === 'string') {
      action = await this.getActionById(actionIdOrItem);
    } else if (typeof actionIdOrItem === 'object' && actionIdOrItem !== null) {
      action = actionIdOrItem;
    }

    if (!action) {
      return Promise.resolve({
        actionId: `ACT-PREV-${Date.now()}`,
        title: 'Generic Strategic Directive',
        clientName: 'Agency-Wide',
        targetModule: 'Multi-Module',
        beforeState: { summary: 'Current baseline configuration' },
        proposedState: { summary: 'Simulated AI optimization configuration' },
        expectedImpact: '+₹150,000 estimated uplift',
        confidence: '90.0%',
        riskLevel: 'Low',
        requiresApproval: true,
        auditMessage: 'Demo Action — No external API call will be performed.',
        demoMode: true,
      });
    }

    return Promise.resolve({
      ...JSON.parse(JSON.stringify(action)),
      auditMessage: 'Demo Action — No external API call will be performed.',
      demoMode: true,
    });
  },

  /**
   * Approve Action (REVIEW_REQUIRED -> APPROVED)
   */
  async approveAction(actionId) {
    if (!actionId) return Promise.resolve({ success: false, message: 'Invalid Action ID' });

    let updatedAction = null;
    actionQueueState = actionQueueState.map((a) => {
      if (a.actionId === actionId) {
        updatedAction = {
          ...a,
          executionState: ACTION_STATES.APPROVED,
          decisionTrace: {
            ...a.decisionTrace,
            executionResult: 'Approved by Operator — Ready for Execution',
          },
        };
        return updatedAction;
      }
      return a;
    });

    if (updatedAction) {
      // Add activity event
      activityEventsState = [
        {
          id: `act-ev-${Date.now()}`,
          timestamp: 'Just now',
          type: 'action',
          title: `Action Approved: ${updatedAction.title}`,
          description: `Approved by Agency Director for ${updatedAction.clientName}. Ready for demo execution.`,
          severity: 'positive',
          clientName: updatedAction.clientName,
          clientId: updatedAction.clientId,
          module: updatedAction.targetModule,
        },
        ...activityEventsState,
      ];
    }

    return Promise.resolve({
      success: Boolean(updatedAction),
      actionId,
      action: updatedAction,
      message: updatedAction
        ? `Action approved successfully. Ready for execution in sandbox.`
        : 'Action not found in queue.',
    });
  },

  /**
   * Reject / Dismiss Action
   */
  async rejectAction(actionId, reason = 'Operator dismissed') {
    if (!actionId) return Promise.resolve({ success: false, message: 'Invalid Action ID' });

    let rejectedAction = null;
    actionQueueState = actionQueueState.map((a) => {
      if (a.actionId === actionId) {
        rejectedAction = {
          ...a,
          executionState: ACTION_STATES.REJECTED,
          error: reason,
        };
        return rejectedAction;
      }
      return a;
    });

    return Promise.resolve({
      success: Boolean(rejectedAction),
      actionId,
      message: `Action dismissed from active queue.`,
    });
  },

  /**
   * Snooze Action for 24h
   */
  async snoozeAction(actionId, duration = '24h') {
    if (!actionId) return Promise.resolve({ success: false, message: 'Invalid Action ID' });

    actionQueueState = actionQueueState.map((a) => {
      if (a.actionId === actionId) {
        return {
          ...a,
          executionState: ACTION_STATES.SNOOZED,
        };
      }
      return a;
    });

    return Promise.resolve({
      success: true,
      actionId,
      message: `Action snoozed for ${duration}.`,
    });
  },

  /**
   * Execute Action with Concurrency Lock, Idempotency Protection, Policy Governance & Telemetry
   */
  async executeAction(actionIdOrItem, payload = {}) {
    const startTime = Date.now();
    let action = null;
    if (typeof actionIdOrItem === 'string') {
      action = await this.getActionById(actionIdOrItem);
    } else if (typeof actionIdOrItem === 'object' && actionIdOrItem !== null) {
      action = actionIdOrItem;
    }

    if (!action || !action.actionId) {
      return Promise.resolve({
        success: false,
        error: 'Invalid Action ID: Action payload is missing or not found in active registry.',
        errorCode: API_ERROR_CODES.VALIDATION_ERROR,
      });
    }

    const actionId = action.actionId;
    const mode = payload.mode || ENV_CONFIG.EXECUTION_MODE || 'DEMO';

    // 1. Concurrency Lock: Prevent double-click or simultaneous in-flight execution
    if (inFlightExecutionLocks.has(actionId)) {
      return Promise.resolve({
        success: false,
        error: 'Concurrent Execution Conflict: Action is currently processing. Double submission prevented.',
        errorCode: API_ERROR_CODES.DUPLICATE_EXECUTION,
        actionId,
      });
    }

    inFlightExecutionLocks.add(actionId);

    try {
      const idempotencyKey = action.idempotencyKey || `IDEM-${actionId}`;

      // 2. Idempotency Check: Prevent duplicate completed execution
      if (executedIdempotencyKeys.has(idempotencyKey) && action.executionState === ACTION_STATES.COMPLETED) {
        return Promise.resolve({
          success: false,
          error: 'Duplicate Execution Conflict: This action has already been completed. Please roll back before re-executing.',
          errorCode: API_ERROR_CODES.DUPLICATE_EXECUTION,
          actionId,
          idempotencyKey,
        });
      }

      // 3. Permission & Approval Policy Validation
      const permissionCheck = validateActionPermission(action, mode);
      if (!permissionCheck.allowed) {
        telemetryService.logExecution({
          actionId,
          clientId: action.clientId,
          provider: mode === 'REAL' ? 'RealApiProvider' : 'DemoProvider',
          actionType: action.actionType,
          mode,
          status: 'BLOCKED',
          durationMs: Date.now() - startTime,
          errorCode: permissionCheck.errorCode,
        });

        return Promise.resolve({
          success: false,
          executionState: 'BLOCKED',
          mode,
          reason: permissionCheck.reason,
          error: permissionCheck.reason,
          errorCode: permissionCheck.errorCode,
          auditMessage: `Execution Blocked: ${permissionCheck.reason}`,
        });
      }

      // 4. Provider Execution
      const provider = providerFactory.getProvider(mode);
      const providerResult = await provider.executeAction(action, payload);

      if (!providerResult.success) {
        telemetryService.logExecution({
          actionId,
          clientId: action.clientId,
          provider: provider.name,
          actionType: action.actionType,
          mode,
          status: providerResult.executionState || 'FAILED',
          durationMs: Date.now() - startTime,
          errorCode: providerResult.errorCode || API_ERROR_CODES.PROVIDER_ERROR,
        });

        return providerResult;
      }

      // 5. Lock Idempotency Key & Transition State
      executedIdempotencyKeys.add(idempotencyKey);
      const completedTimestamp = new Date().toISOString();

      const executedRecord = {
        ...action,
        executionState: ACTION_STATES.COMPLETED,
        executedAt: completedTimestamp,
        completedAt: completedTimestamp,
        operator: payload.operator || 'Agency Director (Antigravity AI Co-Pilot)',
        time: 'Just now',
        provider: provider.name,
        mode,
        auditMessage: providerResult.auditMessage || 'Demo action executed successfully. No external API action was performed.',
        rollbackAvailable: true,
        decisionTrace: {
          ...(action.decisionTrace || {}),
          executionResult: mode === 'REAL' ? 'Completed via Live Production API' : 'Completed successfully (Sandbox Simulation)',
        },
      };

      // 6. Update In-Memory State & Audit History
      actionQueueState = actionQueueState.filter((a) => a.actionId !== actionId);
      actionHistoryState = [executedRecord, ...actionHistoryState];

      // 7. Log Execution Telemetry
      telemetryService.logExecution({
        actionId,
        clientId: action.clientId,
        provider: provider.name,
        actionType: action.actionType,
        mode,
        status: 'COMPLETED',
        durationMs: Date.now() - startTime,
        errorCode: null,
      });

      // 8. Stream Activity Event
      activityEventsState = [
        {
          id: `act-ev-${Date.now()}`,
          timestamp: 'Just now',
          type: 'action',
          title: `Action Executed (${mode}): ${executedRecord.title}`,
          description: `${executedRecord.expectedImpact}. Verified in ${mode} environment.`,
          severity: 'positive',
          clientName: executedRecord.clientName,
          clientId: executedRecord.clientId,
          module: executedRecord.targetModule,
        },
        ...activityEventsState,
      ];

      return {
        success: true,
        actionId: executedRecord.actionId,
        action: JSON.parse(JSON.stringify(executedRecord)),
        message: executedRecord.auditMessage,
        mode,
        rollbackAvailable: true,
      };
    } finally {
      // Release in-flight lock
      inFlightExecutionLocks.delete(actionId);
    }
  },

  /**
   * Sandbox Rollback System using Captured Before-State
   */
  async rollbackAction(actionId) {
    if (!actionId) {
      return Promise.resolve({ success: false, message: 'Invalid action ID' });
    }

    let rolledBackItem = null;
    actionHistoryState = actionHistoryState.map((a) => {
      if (a.actionId === actionId) {
        rolledBackItem = {
          ...a,
          executionState: ACTION_STATES.ROLLED_BACK,
          status: 'Undone',
          rollbackAvailable: false,
          auditMessage: 'Sandbox state restored successfully. Previous configuration rolled back.',
          decisionTrace: {
            ...(a.decisionTrace || {}),
            executionResult: 'Rolled back to previous baseline in sandbox.',
          },
        };
        // Release idempotency key so action can be re-run if needed
        if (a.idempotencyKey) {
          executedIdempotencyKeys.delete(a.idempotencyKey);
        }
        return rolledBackItem;
      }
      return a;
    });

    if (rolledBackItem) {
      // Re-insert into queue as REVIEW_REQUIRED so it can be re-reviewed
      actionQueueState = [
        {
          ...rolledBackItem,
          executionState: ACTION_STATES.REVIEW_REQUIRED,
        },
        ...actionQueueState,
      ];

      // Stream rollback event
      activityEventsState = [
        {
          id: `act-ev-${Date.now()}`,
          timestamp: 'Just now',
          type: 'action',
          title: `Action Rolled Back: ${rolledBackItem.title}`,
          description: `Restored before-state configuration in sandbox for ${rolledBackItem.clientName}.`,
          severity: 'warning',
          clientName: rolledBackItem.clientName,
          clientId: rolledBackItem.clientId,
          module: rolledBackItem.targetModule,
        },
        ...activityEventsState,
      ];
    }

    return Promise.resolve({
      success: Boolean(rolledBackItem),
      actionId,
      beforeState: rolledBackItem?.beforeState,
      message: rolledBackItem
        ? 'Sandbox state restored successfully. Previous parameters reinstated.'
        : 'Action record not found in audit history.',
      demoMode: true,
    });
  },

  /**
   * Get Chronological Action History & Audit Trail
   */
  async getActionHistory(filters = {}) {
    const { clientId = 'all', module = 'all', status = 'all', search = '', priority = 'all' } = filters;
    let list = JSON.parse(JSON.stringify(actionHistoryState));

    if (clientId && clientId !== 'all') {
      list = list.filter((a) => a.clientId === clientId);
    }
    if (priority && priority !== 'all') {
      list = list.filter((a) => a.priority?.toLowerCase() === priority.toLowerCase());
    }
    if (module && module !== 'all') {
      list = list.filter((a) => a.targetModule?.toLowerCase().includes(module.toLowerCase()));
    }
    if (status && status !== 'all') {
      list = list.filter((a) =>
        a.executionState?.toLowerCase() === status.toLowerCase() ||
        a.status?.toLowerCase() === status.toLowerCase()
      );
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.clientName?.toLowerCase().includes(q) ||
          a.title?.toLowerCase().includes(q) ||
          a.aiTrigger?.toLowerCase().includes(q) ||
          a.targetModule?.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(list);
  },

  /**
   * Get Real-Time Simulated Activity Stream
   */
  async getActivityStream(filters = {}) {
    const { clientId = 'all', type = 'all' } = filters;
    let list = JSON.parse(JSON.stringify(activityEventsState));

    if (clientId && clientId !== 'all') {
      list = list.filter((e) => e.clientId === clientId || e.clientId === 'all');
    }
    if (type && type !== 'all') {
      list = list.filter((e) => e.type?.toLowerCase() === type.toLowerCase());
    }

    return Promise.resolve(list);
  },

  /**
   * Create New Action in Queue
   */
  async createAction(data = {}) {
    const actionId = `ACT-${Date.now()}`;
    const newAction = {
      actionId,
      clientId: data.clientId || 'c1',
      clientName: data.clientName || 'Apex Fitness Club',
      sourceType: data.sourceType || 'CUSTOM',
      sourceId: data.sourceId || `src-${Date.now()}`,
      actionType: data.actionType || 'customDirective',
      targetModule: data.targetModule || 'General Operations',
      title: data.title || 'Custom AI Operational Directive',
      priority: data.priority || 'P1',
      expectedImpact: data.expectedImpact || '+₹100,000 projected gain',
      confidence: data.confidence || '90.0%',
      riskLevel: data.riskLevel || 'Low',
      requiresApproval: data.requiresApproval !== undefined ? data.requiresApproval : true,
      executionState: ACTION_STATES.REVIEW_REQUIRED,
      idempotencyKey: `IDEM-${actionId}`,
      beforeState: data.beforeState || { summary: 'Baseline parameter' },
      proposedState: data.proposedState || { summary: 'Updated parameter' },
      decisionTrace: data.decisionTrace || {
        signal: 'Custom operator directive initiated.',
        evidence: 'Validated through sandbox telemetry.',
        patternDetected: 'Direct operator intervention.',
        businessRisk: 'Low operational friction.',
        recommendation: data.title || 'Execute custom workflow.',
        expectedImpact: data.expectedImpact || '+₹100,000 gain.',
        confidence: data.confidence || '90.0%',
        requiredApproval: 'Required',
        executionResult: 'Pending Operator Review',
      },
      createdAt: new Date().toISOString(),
      executedAt: null,
      completedAt: null,
      error: null,
      rollbackAvailable: true,
      demoMode: true,
    };

    actionQueueState = [newAction, ...actionQueueState];
    return Promise.resolve(JSON.parse(JSON.stringify(newAction)));
  },

  /**
   * Bulk Execute Actions
   */
  async bulkExecuteActions(actions = []) {
    if (!Array.isArray(actions) || actions.length === 0) {
      return Promise.resolve({ success: true, count: 0, results: [], message: 'No actions to execute.' });
    }

    const results = [];
    for (const act of actions) {
      const res = await this.executeAction(act);
      results.push(res);
    }

    return Promise.resolve({
      success: true,
      count: results.length,
      results: JSON.parse(JSON.stringify(results)),
      message: `Batch processed ${results.length} demo actions in sandbox.`,
      demoMode: true,
    });
  },
};

export default aiActionOrchestrator;
