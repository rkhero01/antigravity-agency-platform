-- ==============================================================================
-- INITIAL MIGRATION DDL — ANTIGRAVITY AGENCY INTELLIGENCE PLATFORM
-- Migration: 0_init
-- Database: PostgreSQL
-- Task 28 — Step 5: Complete Production DDL Foundation
-- ==============================================================================

-- 1. Agency Tenant Table
CREATE TABLE IF NOT EXISTS "Agency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "domain" TEXT UNIQUE,
    "plan" TEXT NOT NULL DEFAULT 'ENTERPRISE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "Agency_status_idx" ON "Agency"("status");
CREATE INDEX IF NOT EXISTS "Agency_createdAt_idx" ON "Agency"("createdAt");

-- 2. User & Identity Table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL REFERENCES "Agency"("id") ON DELETE CASCADE,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OPERATOR',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "User_agencyId_idx" ON "User"("agencyId");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- 3. Team Member Table
CREATE TABLE IF NOT EXISTS "TeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL REFERENCES "Agency"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "shiftHours" TEXT NOT NULL DEFAULT '09:00 - 18:00',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "TeamMember_agencyId_idx" ON "TeamMember"("agencyId");
CREATE INDEX IF NOT EXISTS "TeamMember_email_idx" ON "TeamMember"("email");

-- 4. Client Management Table
CREATE TABLE IF NOT EXISTS "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL REFERENCES "Agency"("id") ON DELETE CASCADE,
    "externalId" TEXT,
    "clientName" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "monthlyRetainer" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tier" TEXT NOT NULL DEFAULT 'STANDARD',
    "healthScore" INTEGER NOT NULL DEFAULT 90,
    "primaryContact" TEXT,
    "contactEmail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "Client_agencyId_idx" ON "Client"("agencyId");
CREATE INDEX IF NOT EXISTS "Client_status_idx" ON "Client"("status");
CREATE INDEX IF NOT EXISTS "Client_clientName_idx" ON "Client"("clientName");

-- 5. Contact Table
CREATE TABLE IF NOT EXISTS "Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL REFERENCES "Agency"("id") ON DELETE CASCADE,
    "clientId" TEXT NOT NULL REFERENCES "Client"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "Contact_agencyId_idx" ON "Contact"("agencyId");
CREATE INDEX IF NOT EXISTS "Contact_clientId_idx" ON "Contact"("clientId");

-- 6. CRM Lead Table
CREATE TABLE IF NOT EXISTS "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL REFERENCES "Agency"("id") ON DELETE CASCADE,
    "clientId" TEXT NOT NULL REFERENCES "Client"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "source" TEXT DEFAULT 'DIRECT',
    "stage" TEXT NOT NULL DEFAULT 'NEW',
    "score" INTEGER NOT NULL DEFAULT 50,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "owner" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "Lead_agencyId_idx" ON "Lead"("agencyId");
CREATE INDEX IF NOT EXISTS "Lead_clientId_idx" ON "Lead"("clientId");
CREATE INDEX IF NOT EXISTS "Lead_stage_idx" ON "Lead"("stage");

-- 7. Campaign & Performance Metrics
CREATE TABLE IF NOT EXISTS "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL REFERENCES "Agency"("id") ON DELETE CASCADE,
    "clientId" TEXT NOT NULL REFERENCES "Client"("id") ON DELETE CASCADE,
    "platform" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "objective" TEXT NOT NULL DEFAULT 'LEAD_GENERATION',
    "dailyBudget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalSpend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "Campaign_agencyId_idx" ON "Campaign"("agencyId");
CREATE INDEX IF NOT EXISTS "Campaign_clientId_idx" ON "Campaign"("clientId");
CREATE INDEX IF NOT EXISTS "Campaign_platform_idx" ON "Campaign"("platform");

CREATE TABLE IF NOT EXISTS "CampaignMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL REFERENCES "Campaign"("id") ON DELETE CASCADE,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "spend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "recordedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "CampaignMetric_campaignId_idx" ON "CampaignMetric"("campaignId");
CREATE INDEX IF NOT EXISTS "CampaignMetric_recordedDate_idx" ON "CampaignMetric"("recordedDate");

-- 8. WhatsApp & Conversations
CREATE TABLE IF NOT EXISTS "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL REFERENCES "Agency"("id") ON DELETE CASCADE,
    "clientId" TEXT NOT NULL REFERENCES "Client"("id") ON DELETE CASCADE,
    "contactId" TEXT,
    "contactPhone" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "channel" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "assignedTo" TEXT,
    "tags" TEXT,
    "lastMessage" TEXT,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "Conversation_agencyId_idx" ON "Conversation"("agencyId");
CREATE INDEX IF NOT EXISTS "Conversation_clientId_idx" ON "Conversation"("clientId");
CREATE INDEX IF NOT EXISTS "Conversation_status_idx" ON "Conversation"("status");

CREATE TABLE IF NOT EXISTS "ConversationMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL REFERENCES "Agency"("id") ON DELETE CASCADE,
    "conversationId" TEXT NOT NULL REFERENCES "Conversation"("id") ON DELETE CASCADE,
    "direction" TEXT NOT NULL DEFAULT 'INBOUND',
    "messageType" TEXT NOT NULL DEFAULT 'text',
    "body" TEXT NOT NULL,
    "externalId" TEXT UNIQUE,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "ConversationMessage_agencyId_idx" ON "ConversationMessage"("agencyId");
CREATE INDEX IF NOT EXISTS "ConversationMessage_conversationId_idx" ON "ConversationMessage"("conversationId");

CREATE TABLE IF NOT EXISTS "WhatsAppTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL REFERENCES "Agency"("id") ON DELETE CASCADE,
    "clientId" TEXT REFERENCES "Client"("id") ON DELETE SET NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'MARKETING',
    "language" TEXT NOT NULL DEFAULT 'en',
    "body" TEXT NOT NULL,
    "variables" TEXT,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "WhatsAppTemplate_agencyId_idx" ON "WhatsAppTemplate"("agencyId");
CREATE INDEX IF NOT EXISTS "WhatsAppTemplate_category_idx" ON "WhatsAppTemplate"("category");

CREATE TABLE IF NOT EXISTS "WhatsAppAutomation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL REFERENCES "Agency"("id") ON DELETE CASCADE,
    "clientId" TEXT REFERENCES "Client"("id") ON DELETE SET NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "triggerType" TEXT NOT NULL DEFAULT 'KEYWORD_MATCH',
    "actionType" TEXT NOT NULL DEFAULT 'SEND_TEMPLATE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "steps" TEXT,
    "delayMinutes" INTEGER NOT NULL DEFAULT 0,
    "conditions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "WhatsAppAutomation_agencyId_idx" ON "WhatsAppAutomation"("agencyId");

CREATE TABLE IF NOT EXISTS "FollowUp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL REFERENCES "Agency"("id") ON DELETE CASCADE,
    "clientId" TEXT NOT NULL REFERENCES "Client"("id") ON DELETE CASCADE,
    "leadId" TEXT,
    "contactId" TEXT,
    "conversationId" TEXT,
    "assignedTo" TEXT,
    "contactPhone" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "FollowUp_agencyId_idx" ON "FollowUp"("agencyId");
CREATE INDEX IF NOT EXISTS "FollowUp_clientId_idx" ON "FollowUp"("clientId");
CREATE INDEX IF NOT EXISTS "FollowUp_status_idx" ON "FollowUp"("status");

-- 9. SEO & Organic Growth
CREATE TABLE IF NOT EXISTS "SEOKeyword" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL REFERENCES "Agency"("id") ON DELETE CASCADE,
    "clientId" TEXT NOT NULL REFERENCES "Client"("id") ON DELETE CASCADE,
    "keyword" TEXT NOT NULL,
    "searchVolume" INTEGER NOT NULL DEFAULT 0,
    "difficulty" INTEGER NOT NULL DEFAULT 0,
    "currentRank" INTEGER NOT NULL DEFAULT 100,
    "previousRank" INTEGER NOT NULL DEFAULT 100,
    "targetRank" INTEGER NOT NULL DEFAULT 10,
    "url" TEXT,
    "searchIntent" TEXT NOT NULL DEFAULT 'INFORMATIONAL',
    "status" TEXT NOT NULL DEFAULT 'TRACKING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "SEOKeyword_agencyId_idx" ON "SEOKeyword"("agencyId");
CREATE INDEX IF NOT EXISTS "SEOKeyword_clientId_idx" ON "SEOKeyword"("clientId");

CREATE TABLE IF NOT EXISTS "SEOTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL REFERENCES "Agency"("id") ON DELETE CASCADE,
    "clientId" TEXT NOT NULL REFERENCES "Client"("id") ON DELETE CASCADE,
    "keywordId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignedTo" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "completion" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "SEOTask_agencyId_idx" ON "SEOTask"("agencyId");
CREATE INDEX IF NOT EXISTS "SEOTask_clientId_idx" ON "SEOTask"("clientId");

-- 10. Contracts & Billing
CREATE TABLE IF NOT EXISTS "Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL REFERENCES "Agency"("id") ON DELETE CASCADE,
    "clientId" TEXT NOT NULL REFERENCES "Client"("id") ON DELETE CASCADE,
    "contractNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Retainer Agreement',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "billingCycle" TEXT NOT NULL DEFAULT 'MONTHLY',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "renewalDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "Contract_agencyId_contractNumber_key" UNIQUE ("agencyId", "contractNumber")
);

CREATE INDEX IF NOT EXISTS "Contract_agencyId_idx" ON "Contract"("agencyId");
CREATE INDEX IF NOT EXISTS "Contract_clientId_idx" ON "Contract"("clientId");

CREATE TABLE IF NOT EXISTS "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL REFERENCES "Agency"("id") ON DELETE CASCADE,
    "clientId" TEXT NOT NULL REFERENCES "Client"("id") ON DELETE CASCADE,
    "contractId" TEXT REFERENCES "Contract"("id") ON DELETE SET NULL,
    "invoiceNumber" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balanceDue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'ISSUED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "Invoice_agencyId_invoiceNumber_key" UNIQUE ("agencyId", "invoiceNumber")
);

CREATE INDEX IF NOT EXISTS "Invoice_agencyId_idx" ON "Invoice"("agencyId");
CREATE INDEX IF NOT EXISTS "Invoice_clientId_idx" ON "Invoice"("clientId");

-- 11. AI Intelligence & Action Orchestration
CREATE TABLE IF NOT EXISTS "AIInsight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL REFERENCES "Agency"("id") ON DELETE CASCADE,
    "clientId" TEXT NOT NULL REFERENCES "Client"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.95,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "AIInsight_agencyId_idx" ON "AIInsight"("agencyId");
CREATE INDEX IF NOT EXISTS "AIInsight_clientId_idx" ON "AIInsight"("clientId");

CREATE TABLE IF NOT EXISTS "AIRecommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL REFERENCES "Agency"("id") ON DELETE CASCADE,
    "clientId" TEXT NOT NULL REFERENCES "Client"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'P1',
    "actionType" TEXT NOT NULL,
    "expectedGain" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "AIRecommendation_agencyId_idx" ON "AIRecommendation"("agencyId");
CREATE INDEX IF NOT EXISTS "AIRecommendation_clientId_idx" ON "AIRecommendation"("clientId");

CREATE TABLE IF NOT EXISTS "AIAnomaly" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL REFERENCES "Agency"("id") ON DELETE CASCADE,
    "clientId" TEXT NOT NULL REFERENCES "Client"("id") ON DELETE CASCADE,
    "metric" TEXT NOT NULL,
    "variance" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'HIGH',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "AIAnomaly_agencyId_idx" ON "AIAnomaly"("agencyId");
CREATE INDEX IF NOT EXISTS "AIAnomaly_clientId_idx" ON "AIAnomaly"("clientId");

CREATE TABLE IF NOT EXISTS "AIAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL REFERENCES "Agency"("id") ON DELETE CASCADE,
    "clientId" TEXT NOT NULL REFERENCES "Client"("id") ON DELETE CASCADE,
    "actionType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'P1',
    "lifecycleState" TEXT NOT NULL DEFAULT 'REVIEW_REQUIRED',
    "requiresApproval" BOOLEAN NOT NULL DEFAULT TRUE,
    "approvedById" TEXT REFERENCES "User"("id"),
    "approvedAt" TIMESTAMP(3),
    "idempotencyKey" TEXT NOT NULL,
    "beforeStateJson" TEXT,
    "proposedStateJson" TEXT,
    "rollbackStateJson" TEXT,
    "expectedImpact" TEXT,
    "executionMode" TEXT NOT NULL DEFAULT 'DEMO',
    "executionResult" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AIAction_agencyId_idempotencyKey_key" UNIQUE ("agencyId", "idempotencyKey")
);

CREATE INDEX IF NOT EXISTS "AIAction_agencyId_idx" ON "AIAction"("agencyId");
CREATE INDEX IF NOT EXISTS "AIAction_clientId_idx" ON "AIAction"("clientId");

CREATE TABLE IF NOT EXISTS "AIActionExecution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actionId" TEXT NOT NULL REFERENCES "AIAction"("id") ON DELETE CASCADE,
    "provider" TEXT NOT NULL DEFAULT 'DemoProvider',
    "mode" TEXT NOT NULL DEFAULT 'DEMO',
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "requestId" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "errorCode" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "AIActionExecution_actionId_idx" ON "AIActionExecution"("actionId");

CREATE TABLE IF NOT EXISTS "AIActionAuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actionId" TEXT NOT NULL REFERENCES "AIAction"("id") ON DELETE CASCADE,
    "actorId" TEXT,
    "event" TEXT NOT NULL,
    "oldState" TEXT,
    "newState" TEXT,
    "metadataJson" TEXT,
    "requestId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "AIActionAuditLog_actionId_idx" ON "AIActionAuditLog"("actionId");

-- 12. Mutation Audit Logging
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL REFERENCES "Agency"("id") ON DELETE CASCADE,
    "actorId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "clientId" TEXT REFERENCES "Client"("id") ON DELETE SET NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "beforeJson" TEXT,
    "afterJson" TEXT,
    "requestId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "AuditLog_agencyId_idx" ON "AuditLog"("agencyId");
CREATE INDEX IF NOT EXISTS "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- 13. API Providers, Webhooks & Telemetry
CREATE TABLE IF NOT EXISTS "APIProvider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL REFERENCES "Agency"("id") ON DELETE CASCADE,
    "providerType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SANDBOX_ACTIVE',
    "mode" TEXT NOT NULL DEFAULT 'DEMO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "APIProvider_agencyId_providerType_key" UNIQUE ("agencyId", "providerType")
);

CREATE INDEX IF NOT EXISTS "APIProvider_agencyId_idx" ON "APIProvider"("agencyId");

CREATE TABLE IF NOT EXISTS "WebhookEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL REFERENCES "Agency"("id") ON DELETE CASCADE,
    "provider" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSED',
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WebhookEvent_agencyId_eventId_key" UNIQUE ("agencyId", "eventId")
);

CREATE INDEX IF NOT EXISTS "WebhookEvent_agencyId_idx" ON "WebhookEvent"("agencyId");

CREATE TABLE IF NOT EXISTS "TelemetryEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL REFERENCES "Agency"("id") ON DELETE CASCADE,
    "userId" TEXT,
    "actionId" TEXT,
    "requestId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "metadataJson" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "TelemetryEvent_agencyId_idx" ON "TelemetryEvent"("agencyId");
