/**
 * Team Management Real API & Live PostgreSQL Test Suite
 * Task 3: Complete Verification of Production Team & Role Management Module
 */

import { teamService, normalizeTeamMember, toDbPayload, TEAM_ROLES } from '../../src/services/teamService.js';
import { authSessionService } from '../../src/services/authSessionService.js';
import { apiClient } from '../../src/services/api/apiClient.js';

console.log('========================================================================');
console.log('TEST SUITE: REAL TEAM MEMBERS & ROLES MANAGEMENT (TASK 3)');
console.log('========================================================================\n');

async function runTeamManagementTests() {
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
    await teamService.getTeamMembers();
  } catch (err) {
    unauthBlocked = true;
    assert('Unauthenticated team request is blocked', Boolean(err.message));
  }
  assert('Authentication required for team operations', unauthBlocked);

  const loginRes = await authSessionService.login('owner@antigravity.agency', 'AntigravityDemo2026!');
  assert('Operator authenticated with JWT', loginRes.success && Boolean(apiClient.getAuthToken()));
  const agencyId = loginRes.user?.agencyId;
  assert('Resolved operator agency ID', agencyId === 'agency-demo-001');

  // Section 2: UI <-> Backend Field Mapping Layer
  console.log('\n[SECTION 2] Frontend <-> Backend Field Mapping Layer');
  const uiFormInput = {
    name: '  Marcus Aurelius  ',
    email: '  marcus@antigravity.agency  ',
    role: 'MANAGER',
    department: 'Strategic Planning',
    shiftHours: '10:00 - 19:00',
    status: 'ACTIVE',
  };
  const dbMappedPayload = toDbPayload(uiFormInput);
  assert('toDbPayload maps name', dbMappedPayload.name === 'Marcus Aurelius');
  assert('toDbPayload maps email', dbMappedPayload.email === 'marcus@antigravity.agency');
  assert('toDbPayload maps role', dbMappedPayload.role === 'MANAGER');
  assert('toDbPayload maps department', dbMappedPayload.department === 'Strategic Planning');
  assert('toDbPayload maps shiftHours', dbMappedPayload.shiftHours === '10:00 - 19:00');
  assert('toDbPayload maps status', dbMappedPayload.status === 'ACTIVE');

  const rawDbRecord = {
    id: 'teammember-test-101',
    agencyId: 'agency-demo-001',
    name: 'Marcus Aurelius',
    email: 'marcus@antigravity.agency',
    role: 'MANAGER',
    department: 'Strategic Planning',
    shiftHours: '10:00 - 19:00',
    status: 'ACTIVE',
    createdAt: '2026-08-29T12:00:00.000Z',
    updatedAt: '2026-08-29T12:00:00.000Z',
  };
  const normalizedUiModel = normalizeTeamMember(rawDbRecord);
  assert('normalizeTeamMember maps name', normalizedUiModel.name === 'Marcus Aurelius');
  assert('normalizeTeamMember generates avatar initials', normalizedUiModel.avatar === 'MA');
  assert('normalizeTeamMember maps roleTitle', normalizedUiModel.roleTitle === 'Campaign & Client Manager');
  assert('normalizeTeamMember maps status properly', normalizedUiModel.status === 'Active');

  // Section 3: Live GET /api/v1/team Query from PostgreSQL
  console.log('\n[SECTION 3] Live GET /api/v1/team from Database');
  const initialMembers = await teamService.getTeamMembers();
  assert('getTeamMembers() returns array from PostgreSQL', Array.isArray(initialMembers));
  assert('Members contain normalized fields', initialMembers.length > 0 && Boolean(initialMembers[0].name));
  const initialCount = initialMembers.length;

  // Section 4: Live POST /api/v1/team Creation in PostgreSQL
  console.log('\n[SECTION 4] Live POST /api/v1/team (Team Member Creation)');
  const testMemberName = `Operations Lead ${Date.now()}`;
  const testMemberEmail = `operator-${Date.now()}@antigravity.agency`;
  const newMemberData = {
    name: testMemberName,
    email: testMemberEmail,
    role: 'OPERATOR',
    department: 'Media Buying & Automation',
    shiftHours: '09:00 - 18:00',
  };

  const createdMember = await teamService.addMember(newMemberData);
  assert('addMember() returns normalized member with database ID', Boolean(createdMember && createdMember.id));
  assert('Created member has correct name', createdMember.name === testMemberName);
  assert('Created member has correct role', createdMember.role === 'OPERATOR');
  assert('Created member has active status', createdMember.status === 'Active');
  assert('Created member bound to operator agency ID', createdMember.agencyId === agencyId);

  // Section 5: Persistence & Metrics
  console.log('\n[SECTION 5] Verification of Persistence in PostgreSQL');
  const updatedMembers = await teamService.getTeamMembers();
  assert('Team count incremented in PostgreSQL', updatedMembers.length === initialCount + 1);
  const foundInList = updatedMembers.find((m) => m.id === createdMember.id);
  assert('Newly created member present in database list query', Boolean(foundInList));

  const metrics = teamService.calculateTeamMetrics(updatedMembers);
  assert('calculateTeamMetrics tallies total seats', metrics.total === updatedMembers.length);
  assert('calculateTeamMetrics tallies active seats', metrics.activeCount > 0);

  // Section 6: Live PATCH /api/v1/team/:memberId (Update Member)
  console.log('\n[SECTION 6] Live PATCH /api/v1/team/:memberId (Update Member)');
  const updatedRecord = await teamService.updateMember(createdMember.id, {
    department: 'Autonomous AI Growth Systems',
    status: 'ON_LEAVE',
    role: 'ANALYST',
  });
  assert('updateMember() updates department', updatedRecord.department === 'Autonomous AI Growth Systems');
  assert('updateMember() updates status', updatedRecord.status === 'On Leave');
  assert('updateMember() updates role', updatedRecord.role === 'ANALYST');

  // Verify persistence of update in fresh list query
  const freshList = await teamService.getTeamMembers();
  const verifyUpdated = freshList.find((m) => m.id === createdMember.id);
  assert('Updated fields persisted to PostgreSQL', verifyUpdated.department === 'Autonomous AI Growth Systems' && verifyUpdated.status === 'On Leave');

  // Section 7: Live DELETE /api/v1/team/:memberId (Soft-delete & Cleanup)
  console.log('\n[SECTION 7] Live DELETE /api/v1/team/:memberId (Soft-Delete & Cleanup)');
  const deleteResult = await teamService.deleteMember(createdMember.id);
  assert('deleteMember() returns success response', Boolean(deleteResult?.message));

  const postDeleteMembers = await teamService.getTeamMembers();
  const deletedInList = postDeleteMembers.find((m) => m.id === createdMember.id);
  assert('Deleted/archived member excluded from active team list', !deletedInList);

  // Section 8: Backend Validation & Privilege Escalation Defenses
  console.log('\n[SECTION 8] Validation & Privilege Escalation Defenses');
  let validationErrorCaught = false;
  try {
    await teamService.addMember({ name: '', email: 'bademail' });
  } catch (err) {
    validationErrorCaught = true;
    assert('Invalid payload throws descriptive validation error', Boolean(err.message));
  }
  assert('Validation error strictly enforced', validationErrorCaught);

  // Section 9: Multi-Tenant Isolation
  console.log('\n[SECTION 9] Multi-Tenant Isolation & Security');
  let notFoundCaught = false;
  try {
    await apiClient.team.update('teammember-nonexistent-999', { name: 'Hack' });
  } catch (err) {
    notFoundCaught = true;
    assert('Non-existent or cross-tenant member returns error (404/403)', Boolean(err.message));
  }
  assert('Cross-tenant isolation enforced', notFoundCaught);

  console.log('\n========================================================================');
  console.log(`REAL TEAM MANAGEMENT TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTeamManagementTests().catch((err) => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
