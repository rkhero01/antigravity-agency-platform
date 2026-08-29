/**
 * Client Management Real API & Live PostgreSQL Test Suite
 * Task 2: Complete Verification of Production Client Management Module
 */

import { clientsService, normalizeClient, toDbPayload } from '../../src/services/clientsService.js';
import { authSessionService } from '../../src/services/authSessionService.js';
import { apiClient } from '../../src/services/api/apiClient.js';

console.log('========================================================================');
console.log('TEST SUITE: REAL CLIENT MANAGEMENT & DATABASE CONNECTION (TASK 2)');
console.log('========================================================================\n');

async function runClientManagementTests() {
  let passed = 0;
  let failed = 0;

  function assert(name, condition, extra = '') {
    if (condition) {
      console.log(`  [PASS] ${name} ${extra ? '(' + extra + ')' : ''}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name} ${extra ? '(' + extra + ')' : ''}`);
      failed++;
    }
  }

  // Section 1: Authentication Required
  console.log('[SECTION 1] Authentication Required & Operator Login');
  apiClient.clearAuthToken();
  let unauthBlocked = false;
  try {
    await clientsService.getClients();
  } catch (err) {
    unauthBlocked = true;
    assert('Unauthenticated client request is blocked', Boolean(err.message));
  }
  assert('Authentication required for client operations', unauthBlocked);

  const loginRes = await authSessionService.login('owner@antigravity.agency', 'AntigravityDemo2026!');
  assert('Operator authenticated with JWT', loginRes.success && Boolean(apiClient.getAuthToken()));
  const agencyId = loginRes.user?.agencyId;
  assert('Resolved operator agency ID', agencyId === 'agency-demo-001');

  // Section 2: UI <-> Backend Field Mapping Layer
  console.log('\n[SECTION 2] Frontend <-> Backend Field Mapping Layer');
  const uiFormInput = {
    name: '  Apex Performance Healthcare  ',
    industry: 'Health & Fitness',
    contactPerson: '  Marcus Vance  ',
    email: '  marcus@apexperformance.com  ',
    monthlyBudget: 35000,
    tier: 'GROWTH',
  };
  const dbMappedPayload = toDbPayload(uiFormInput);
  assert('toDbPayload maps name -> clientName', dbMappedPayload.clientName === 'Apex Performance Healthcare');
  assert('toDbPayload maps contactPerson -> primaryContact', dbMappedPayload.primaryContact === 'Marcus Vance');
  assert('toDbPayload maps email -> contactEmail', dbMappedPayload.contactEmail === 'marcus@apexperformance.com');
  assert('toDbPayload maps monthlyBudget -> monthlyRetainer', dbMappedPayload.monthlyRetainer === 35000);
  assert('toDbPayload preserves tier', dbMappedPayload.tier === 'GROWTH');

  const rawDbRecord = {
    id: 'client-test-999',
    agencyId: 'agency-demo-001',
    clientName: 'Apex Performance Healthcare',
    industry: 'Health & Fitness',
    primaryContact: 'Marcus Vance',
    contactEmail: 'marcus@apexperformance.com',
    monthlyRetainer: 35000,
    status: 'ACTIVE',
    healthScore: 92,
    tier: 'GROWTH',
    createdAt: '2026-08-29T12:00:00.000Z',
    updatedAt: '2026-08-29T12:00:00.000Z',
  };
  const normalizedUiModel = normalizeClient(rawDbRecord);
  assert('normalizeClient maps clientName -> name', normalizedUiModel.name === 'Apex Performance Healthcare');
  assert('normalizeClient maps primaryContact -> contactPerson', normalizedUiModel.contactPerson === 'Marcus Vance');
  assert('normalizeClient maps contactEmail -> email', normalizedUiModel.email === 'marcus@apexperformance.com');
  assert('normalizeClient maps monthlyRetainer -> monthlyBudget', normalizedUiModel.monthlyBudget === 35000);
  assert('normalizeClient formats status properly', normalizedUiModel.status === 'Active');

  // Section 3: Live GET /api/v1/clients Query from PostgreSQL
  console.log('\n[SECTION 3] Live GET /api/v1/clients from Database');
  const initialClients = await clientsService.getClients();
  assert('getClients() returns array from PostgreSQL', Array.isArray(initialClients));
  assert('Clients contain normalized fields', initialClients.length > 0 && Boolean(initialClients[0].name));
  const initialCount = initialClients.length;

  // Section 4: Live POST /api/v1/clients Creation in PostgreSQL
  console.log('\n[SECTION 4] Live POST /api/v1/clients (Client Creation)');
  const testClientName = `Production Enterprise Client ${Date.now()}`;
  const newClientData = {
    name: testClientName,
    industry: 'B2B Software',
    contactPerson: 'Sarah Connor',
    email: `sarah-${Date.now()}@cyberdyne.io`,
    monthlyBudget: 85000,
    tier: 'ENTERPRISE',
  };

  const createdClient = await clientsService.addClient(newClientData);
  assert('addClient() returns normalized client with database ID', Boolean(createdClient && createdClient.id));
  assert('Created client has correct name', createdClient.name === testClientName);
  assert('Created client has correct monthly budget', createdClient.monthlyBudget === 85000);
  assert('Created client has active status', createdClient.status === 'Active');
  assert('Created client bound to operator agency ID', createdClient.agencyId === agencyId);

  // Section 5: Re-query verification (PostgreSQL source of truth)
  console.log('\n[SECTION 5] Verification of Persistence in PostgreSQL');
  const updatedClients = await clientsService.getClients();
  assert('Client count incremented', updatedClients.length === initialCount + 1);
  const foundInList = updatedClients.find((c) => c.id === createdClient.id);
  assert('Newly created client present in database list query', Boolean(foundInList));

  // Section 6: Single Client Query by ID
  console.log('\n[SECTION 6] Live GET /api/v1/clients/:id');
  const fetchedSingle = await clientsService.getClientById(createdClient.id);
  assert('getClientById() returns correct client record', fetchedSingle?.id === createdClient.id);
  assert('Single client has full contact details', fetchedSingle?.email === newClientData.email);

  // Section 7: Live PATCH /api/v1/clients/:id (Update)
  console.log('\n[SECTION 7] Live PATCH /api/v1/clients/:id (Update Client)');
  const updatedRecord = await clientsService.updateClient(createdClient.id, {
    monthlyBudget: 110000,
    industry: 'FinTech Cloud Infrastructure',
    primaryContact: 'Sarah Connor-Reese',
    status: 'PAUSED',
  });
  assert('updateClient() updates monthlyRetainer/budget', updatedRecord.monthlyBudget === 110000);
  assert('updateClient() updates industry', updatedRecord.industry === 'FinTech Cloud Infrastructure');
  assert('updateClient() updates primaryContact', updatedRecord.contactPerson === 'Sarah Connor-Reese');
  assert('updateClient() updates status', updatedRecord.status === 'Paused');

  // Verify persistence of update in fresh query
  const verifyUpdated = await clientsService.getClientById(createdClient.id);
  assert('Updated fields persisted to PostgreSQL', verifyUpdated.monthlyBudget === 110000 && verifyUpdated.status === 'Paused');

  // Section 8: Live DELETE /api/v1/clients/:id (Soft-delete & cleanup)
  console.log('\n[SECTION 8] Live DELETE /api/v1/clients/:id (Archive Client & Soft-Delete)');
  const deleteResult = await clientsService.deleteClient(createdClient.id);
  assert('deleteClient() returns success response', Boolean(deleteResult?.message));

  const postDeleteClients = await clientsService.getClients();
  const deletedInList = postDeleteClients.find((c) => c.id === createdClient.id);
  assert('Deleted/archived client excluded from active clients list', !deletedInList);

  // Section 9: API Validation Error Handling
  console.log('\n[SECTION 9] Backend Validation Error Handling');
  let validationErrorCaught = false;
  try {
    await clientsService.addClient({ name: '', industry: 'Health' });
  } catch (err) {
    validationErrorCaught = true;
    assert('Invalid payload throws descriptive error from API', Boolean(err.message));
  }
  assert('Validation error strictly enforced', validationErrorCaught);

  // Section 10: Multi-Tenant Isolation
  console.log('\n[SECTION 10] Multi-Tenant Isolation & Security');
  // Attempt to access non-existent or cross-tenant client ID
  let notFoundCaught = false;
  try {
    await clientsService.getClientById('client-nonexistent-tenant-999');
  } catch (err) {
    notFoundCaught = true;
    assert('Non-existent or cross-tenant client returns error (404/403)', Boolean(err.message));
  }
  assert('Cross-tenant isolation enforced', notFoundCaught);

  console.log('\n========================================================================');
  console.log(`REAL CLIENT MANAGEMENT TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runClientManagementTests().catch((err) => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
