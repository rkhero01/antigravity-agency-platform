/**
 * Client Management Real API & Live PostgreSQL Test Suite
 * Task 1: Complete Verification of Real Database-Connected Clients Module
 */

import { clientsService, normalizeClient, toDbPayload } from '../../src/services/clientsService.js';
import { authSessionService } from '../../src/services/authSessionService.js';
import { apiClient } from '../../src/services/api/apiClient.js';

console.log('========================================================================');
console.log('TEST SUITE: REAL CLIENT MANAGEMENT & DATABASE CONNECTION');
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

  // Ensure authenticated session
  console.log('[SECTION 1] Authenticating Operator for Client Operations');
  const loginRes = await authSessionService.login('owner@antigravity.agency', 'AntigravityDemo2026!');
  assert('Operator authenticated with JWT', loginRes.success && Boolean(apiClient.getAuthToken()));

  // Test 2: Field Mapping Unit Tests (toDbPayload & normalizeClient)
  console.log('\n[SECTION 2] Frontend <-> Backend Field Mapping Layer');
  const uiFormInput = {
    name: '  Apex Performance Testing  ',
    industry: 'Health & Fitness',
    contactPerson: '  Marcus Vance  ',
    email: '  marcus@apextest.com  ',
    monthlyBudget: 35000,
    tier: 'GROWTH',
  };
  const dbMappedPayload = toDbPayload(uiFormInput);
  assert('toDbPayload maps name -> clientName', dbMappedPayload.clientName === 'Apex Performance Testing');
  assert('toDbPayload maps contactPerson -> primaryContact', dbMappedPayload.primaryContact === 'Marcus Vance');
  assert('toDbPayload maps email -> contactEmail', dbMappedPayload.contactEmail === 'marcus@apextest.com');
  assert('toDbPayload maps monthlyBudget -> monthlyRetainer', dbMappedPayload.monthlyRetainer === 35000);
  assert('toDbPayload preserves tier', dbMappedPayload.tier === 'GROWTH');

  const rawDbRecord = {
    id: 'client-test-999',
    agencyId: 'agency-demo-001',
    clientName: 'Apex Performance Testing',
    industry: 'Health & Fitness',
    primaryContact: 'Marcus Vance',
    contactEmail: 'marcus@apextest.com',
    monthlyRetainer: 35000,
    status: 'ACTIVE',
    healthScore: 92,
    tier: 'GROWTH',
  };
  const normalizedUiModel = normalizeClient(rawDbRecord);
  assert('normalizeClient maps clientName -> name', normalizedUiModel.name === 'Apex Performance Testing');
  assert('normalizeClient maps primaryContact -> contactPerson', normalizedUiModel.contactPerson === 'Marcus Vance');
  assert('normalizeClient maps contactEmail -> email', normalizedUiModel.email === 'marcus@apextest.com');
  assert('normalizeClient maps monthlyRetainer -> monthlyBudget', normalizedUiModel.monthlyBudget === 35000);
  assert('normalizeClient formats status properly', normalizedUiModel.status === 'Active');

  // Test 3: Live GET /api/v1/clients Query from PostgreSQL
  console.log('\n[SECTION 3] Live GET /api/v1/clients from Database');
  const initialClients = await clientsService.getClients();
  assert('getClients() returns array from PostgreSQL', Array.isArray(initialClients));
  assert('Clients contain normalized fields', initialClients.length > 0 && Boolean(initialClients[0].name));
  const initialCount = initialClients.length;

  // Test 4: Live POST /api/v1/clients Creation in PostgreSQL
  console.log('\n[SECTION 4] Live POST /api/v1/clients (Client Creation)');
  const testClientName = `Test Enterprise Client ${Date.now()}`;
  const newClientData = {
    name: testClientName,
    industry: 'B2B Software',
    contactPerson: 'Sarah Connor',
    email: `sarah-${Date.now()}@cyberdyne.io`,
    monthlyBudget: 75000,
    tier: 'ENTERPRISE',
  };

  const createdClient = await clientsService.addClient(newClientData);
  assert('addClient() returns normalized client with database ID', Boolean(createdClient && createdClient.id));
  assert('Created client has correct name', createdClient.name === testClientName);
  assert('Created client has correct monthly budget', createdClient.monthlyBudget === 75000);
  assert('Created client has active status', createdClient.status === 'Active');

  // Test 5: Re-query verification (PostgreSQL source of truth)
  console.log('\n[SECTION 5] Verification of Persistence in PostgreSQL');
  const updatedClients = await clientsService.getClients();
  assert('Client count incremented', updatedClients.length === initialCount + 1);
  const foundInList = updatedClients.find((c) => c.id === createdClient.id);
  assert('Newly created client present in database list query', Boolean(foundInList));

  // Test 6: Single Client Query by ID
  console.log('\n[SECTION 6] Live GET /api/v1/clients/:id');
  const fetchedSingle = await clientsService.getClientById(createdClient.id);
  assert('getClientById() returns correct client record', fetchedSingle?.id === createdClient.id);
  assert('Single client has full contact details', fetchedSingle?.email === newClientData.email);

  // Test 7: Live PATCH /api/v1/clients/:id
  console.log('\n[SECTION 7] Live PATCH /api/v1/clients/:id (Update)');
  const updatedRecord = await clientsService.updateClient(createdClient.id, {
    monthlyBudget: 90000,
    industry: 'FinTech Cloud',
  });
  assert('updateClient() updates monthlyRetainer/budget', updatedRecord.monthlyBudget === 90000);
  assert('updateClient() updates industry', updatedRecord.industry === 'FinTech Cloud');

  // Test 8: Live DELETE /api/v1/clients/:id (Soft-delete & cleanup)
  console.log('\n[SECTION 8] Live DELETE /api/v1/clients/:id (Archive & Cleanup)');
  const deleteResult = await clientsService.deleteClient(createdClient.id);
  assert('deleteClient() returns success response', Boolean(deleteResult?.message));

  const postDeleteClients = await clientsService.getClients();
  const deletedInList = postDeleteClients.find((c) => c.id === createdClient.id);
  assert('Deleted/archived client excluded from active clients list', !deletedInList);

  // Test 9: API Validation Error Handling
  console.log('\n[SECTION 9] Backend Validation Error Handling');
  let validationErrorCaught = false;
  try {
    // Missing required clientName/name
    await clientsService.addClient({ name: '', industry: 'Health' });
  } catch (err) {
    validationErrorCaught = true;
    assert('Invalid payload throws descriptive error from API', Boolean(err.message));
  }
  assert('Validation error strictly enforced', validationErrorCaught);

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
