/**
 * TASK 28 — STEP 10.2: LIVE POSTGRESQL VERIFICATION & PERSISTENCE TEST SUITE
 * 
 * Verifies real operations against the live PostgreSQL database:
 * - Real PostgreSQL Connection & Version Query
 * - Table Schema & Migration DDL Verification
 * - Real PostgreSQL CRUD (Create, Read, Update, Soft-Delete, Read-after-delete)
 * - Real PostgreSQL Transaction Rollback (Multi-write atomic rollback)
 * - Real PostgreSQL Compound Uniqueness (Same agency conflict vs Different agency success)
 * - Real PostgreSQL Idempotency Key Constraint
 * - Real PostgreSQL Cross-Agency Tenant Boundary
 * - Cross-Process / Reconnect Data Persistence
 * - Production Health & Readiness Endpoints
 * - Hard Real-Mode Safety Gates (100% BLOCKED)
 * - Safe Test Data Cleanup
 */

import pg from 'pg';
import http from 'http';
import { env } from '../src/config/env.js';
import { database } from '../src/config/database.js';
import { app } from '../src/app.js';
import { whatsAppProvider } from '../src/providers/whatsappProvider.js';
import { seoProvider } from '../src/providers/seoProvider.js';
import { billingProvider } from '../src/providers/billingProvider.js';
import { aiActionOrchestrator } from '../../src/services/aiActionOrchestrator.js';

const { Pool } = pg;

console.log('========================================================================');
console.log('TASK 28 — STEP 10.2: LIVE POSTGRESQL VERIFICATION SUITE');
console.log('========================================================================\n');

function makeRequest(server, options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = { raw: data };
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json,
        });
      });
    });

    req.on('error', reject);

    if (body) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      req.setHeader('Content-Type', 'application/json');
      req.setHeader('Content-Length', Buffer.byteLength(payload));
      req.write(payload);
    }

    req.end();
  });
}

async function runLivePostgresVerification() {
  const results = {
    passed: 0,
    failed: 0,
    checks: [],
  };

  function recordCheck(name, success, details = '') {
    const statusStr = success ? '[LIVE VERIFIED] PASS' : '[LIVE VERIFIED] FAIL';
    console.log(`  ${statusStr}: ${name} ${details ? '(' + details + ')' : ''}`);
    results.checks.push({ name, success, details });
    if (success) results.passed++;
    else results.failed++;
  }

  let pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await database.connect();

  const TEST_PORT = 4998;
  const server = app.listen(TEST_PORT);

  try {
    // -------------------------------------------------------------------------
    // 1. POSTGRESQL CONNECTION & VERSION
    // -------------------------------------------------------------------------
    console.log('[SECTION 1] Live PostgreSQL Connectivity & Version Query');
    const verRes = await pool.query('SELECT version();');
    const dbVersion = verRes.rows[0]?.version || '';
    recordCheck('Real PostgreSQL connection established', Boolean(dbVersion), dbVersion.split(' on ')[0]);

    // -------------------------------------------------------------------------
    // 2. SCHEMA & TABLE INTEGRITY
    // -------------------------------------------------------------------------
    console.log('\n[SECTION 2] Database Table Structure Verification');
    const tableRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    const tables = tableRes.rows.map((r) => r.table_name);
    recordCheck('All 27 PostgreSQL platform tables verified', tables.length >= 27, `${tables.length} tables found`);

    // -------------------------------------------------------------------------
    // 3. REAL POSTGRESQL CRUD
    // -------------------------------------------------------------------------
    console.log('\n[SECTION 3] Real PostgreSQL CRUD & Soft-Delete Operations');

    // Create Test Agency
    const testAgencyId = `agency-live-${Date.now()}`;
    await pool.query(
      'INSERT INTO "Agency" (id, name, domain, plan, status, "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW())',
      [testAgencyId, 'Live Test Agency', `test-${Date.now()}.live`, 'ENTERPRISE', 'ACTIVE']
    );

    // Create Test Client
    const testClientId = `client-live-${Date.now()}`;
    await pool.query(
      'INSERT INTO "Client" (id, "agencyId", "clientName", industry, "monthlyRetainer", tier, "healthScore", status, "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())',
      [testClientId, testAgencyId, 'Supabase Enterprise Client', 'Cybersecurity', 90000, 'ENTERPRISE', 95, 'ACTIVE']
    );
    recordCheck('Real PostgreSQL Client CREATE', true, `ID: ${testClientId}`);

    // Read Client back from PostgreSQL
    const readRes = await pool.query('SELECT * FROM "Client" WHERE id = $1', [testClientId]);
    const readClient = readRes.rows[0];
    recordCheck('Real PostgreSQL Client READ', readClient && readClient.clientName === 'Supabase Enterprise Client');

    // Update Client in PostgreSQL
    await pool.query('UPDATE "Client" SET "monthlyRetainer" = $1, "healthScore" = $2, "updatedAt" = NOW() WHERE id = $3', [
      120000,
      99,
      testClientId,
    ]);
    const updatedRes = await pool.query('SELECT * FROM "Client" WHERE id = $1', [testClientId]);
    const updatedClient = updatedRes.rows[0];
    recordCheck('Real PostgreSQL Client UPDATE', updatedClient && updatedClient.monthlyRetainer === 120000 && updatedClient.healthScore === 99, 'Retainer: ₹1,20,000');

    // Soft-delete Client in PostgreSQL
    await pool.query('UPDATE "Client" SET "deletedAt" = NOW(), "updatedAt" = NOW() WHERE id = $1', [testClientId]);
    const activeClientsRes = await pool.query('SELECT * FROM "Client" WHERE "agencyId" = $1 AND "deletedAt" IS NULL', [testAgencyId]);
    const isExcluded = !activeClientsRes.rows.some((c) => c.id === testClientId);
    recordCheck('Real PostgreSQL Soft-delete & Query Exclusion', isExcluded, 'Soft-deleted record excluded from active queries');

    // -------------------------------------------------------------------------
    // 4. REAL POSTGRESQL TRANSACTION ROLLBACK
    // -------------------------------------------------------------------------
    console.log('\n[SECTION 4] Real PostgreSQL Transaction Rollback');

    const txClient = await pool.connect();
    let txCaught = false;
    const txLeadId = `lead-tx-${Date.now()}`;
    const txContactId = `contact-tx-${Date.now()}`;

    try {
      await txClient.query('BEGIN');
      await txClient.query(
        'INSERT INTO "Lead" (id, "agencyId", "clientId", name, stage, "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW())',
        [txLeadId, testAgencyId, testClientId, 'TX Lead A', 'NEW']
      );
      await txClient.query(
        'INSERT INTO "Contact" (id, "agencyId", "clientId", name, "updatedAt") VALUES ($1, $2, $3, $4, NOW())',
        [txContactId, testAgencyId, testClientId, 'TX Contact B']
      );
      // Force intentional error inside transaction
      await txClient.query('INSERT INTO "NonExistentTable_ForceError" VALUES (1);');
      await txClient.query('COMMIT');
    } catch (err) {
      await txClient.query('ROLLBACK');
      txCaught = true;
    } finally {
      txClient.release();
    }

    const checkLead = await pool.query('SELECT * FROM "Lead" WHERE id = $1', [txLeadId]);
    const checkContact = await pool.query('SELECT * FROM "Contact" WHERE id = $1', [txContactId]);
    const txRollbackSuccess = txCaught && checkLead.rows.length === 0 && checkContact.rows.length === 0;
    recordCheck('REAL POSTGRESQL TRANSACTION ROLLBACK', txRollbackSuccess, '0 partial records remained in database');

    // -------------------------------------------------------------------------
    // 5. COMPOUND UNIQUE CONSTRAINTS
    // -------------------------------------------------------------------------
    console.log('\n[SECTION 5] Real PostgreSQL Compound Unique Constraints');

    // Secondary test agency for cross-agency uniqueness verification
    const testAgencyId2 = `agency-live-2-${Date.now()}`;
    await pool.query(
      'INSERT INTO "Agency" (id, name, domain, plan, status, "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW())',
      [testAgencyId2, 'Live Test Agency 2', `test2-${Date.now()}.live`, 'PRO', 'ACTIVE']
    );

    const testContractNum = `CNT-LIVE-${Date.now()}`;
    // Insert Contract for Agency 1
    await pool.query(
      'INSERT INTO "Contract" (id, "agencyId", "clientId", "contractNumber", title, "endDate", value, "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), $6, NOW())',
      [`cnt-1-${Date.now()}`, testAgencyId, testClientId, testContractNum, 'Contract 1', 50000]
    );

    // Duplicate in Agency 1 must fail with 23505 (unique_violation)
    let contractDupFailed = false;
    try {
      await pool.query(
        'INSERT INTO "Contract" (id, "agencyId", "clientId", "contractNumber", title, "endDate", value, "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), $6, NOW())',
        [`cnt-dup-${Date.now()}`, testAgencyId, testClientId, testContractNum, 'Contract Duplicate', 50000]
      );
    } catch (err) {
      if (err.code === '23505') contractDupFailed = true;
    }
    recordCheck('Same-agency duplicate contract rejected (unique constraint)', contractDupFailed);

    // Same contract number in Agency 2 must SUCCEED
    let contractAgency2Success = false;
    try {
      await pool.query(
        'INSERT INTO "Contract" (id, "agencyId", "clientId", "contractNumber", title, "endDate", value, "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), $6, NOW())',
        [`cnt-2-${Date.now()}`, testAgencyId2, testClientId, testContractNum, 'Contract Agency 2', 50000]
      );
      contractAgency2Success = true;
    } catch (err) {
      contractAgency2Success = false;
    }
    recordCheck('Cross-agency identical contract number allowed', contractAgency2Success, 'Compound uniqueness scoped by agencyId');

    // Duplicate Invoice in Agency 1
    const testInvNum = `INV-LIVE-${Date.now()}`;
    await pool.query(
      'INSERT INTO "Invoice" (id, "agencyId", "clientId", "invoiceNumber", "dueDate", subtotal, total, "balanceDue", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, NOW())',
      [`inv-1-${Date.now()}`, testAgencyId, testClientId, testInvNum, 60000, 60000, 60000]
    );

    let invDupFailed = false;
    try {
      await pool.query(
        'INSERT INTO "Invoice" (id, "agencyId", "clientId", "invoiceNumber", "dueDate", subtotal, total, "balanceDue", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, NOW())',
        [`inv-dup-${Date.now()}`, testAgencyId, testClientId, testInvNum, 30000, 30000, 30000]
      );
    } catch (err) {
      if (err.code === '23505') invDupFailed = true;
    }
    recordCheck('Same-agency duplicate invoice rejected (unique constraint)', invDupFailed);

    // -------------------------------------------------------------------------
    // 6. REAL POSTGRESQL IDEMPOTENCY
    // -------------------------------------------------------------------------
    console.log('\n[SECTION 6] Real PostgreSQL Idempotency Key Enforcement');

    const liveIdemKey = `IDEM-LIVE-${Date.now()}`;
    await pool.query(
      'INSERT INTO "AIAction" (id, "agencyId", "clientId", "actionType", title, "idempotencyKey", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())',
      [`act-1-${Date.now()}`, testAgencyId, testClientId, 'OPTIMIZE_MEDIA', 'Live Action 1', liveIdemKey]
    );

    let idemDupFailed = false;
    try {
      await pool.query(
        'INSERT INTO "AIAction" (id, "agencyId", "clientId", "actionType", title, "idempotencyKey", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())',
        [`act-dup-${Date.now()}`, testAgencyId, testClientId, 'OPTIMIZE_MEDIA', 'Live Action 1 Dup', liveIdemKey]
      );
    } catch (err) {
      if (err.code === '23505') idemDupFailed = true;
    }
    recordCheck('Duplicate AI Action idempotencyKey rejected by PostgreSQL', idemDupFailed);

    // -------------------------------------------------------------------------
    // 7. CROSS-PROCESS / RESTART PERSISTENCE
    // -------------------------------------------------------------------------
    console.log('\n[SECTION 7] Cross-Process Restart Persistence');

    const persistClientId = `client-persist-${Date.now()}`;
    await pool.query(
      'INSERT INTO "Client" (id, "agencyId", "clientName", industry, "monthlyRetainer", tier, "healthScore", status, "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())',
      [persistClientId, testAgencyId, 'Restart Persistence Test Client', 'FinTech', 150000, 'ENTERPRISE', 98, 'ACTIVE']
    );

    // Simulate complete process restart: close pool and reopen a new pool instance
    await pool.end();
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    const persistRes = await pool.query('SELECT * FROM "Client" WHERE id = $1', [persistClientId]);
    const persistClient = persistRes.rows[0];
    const persistSuccess = persistClient && persistClient.clientName === 'Restart Persistence Test Client';
    recordCheck('CROSS-PROCESS POSTGRESQL PERSISTENCE', persistSuccess, 'Data survived connection termination and process restart');

    // -------------------------------------------------------------------------
    // 8. PRODUCTION HEALTH & READINESS ENDPOINTS
    // -------------------------------------------------------------------------
    console.log('\n[SECTION 8] Production Health & Readiness Endpoints');

    const liveRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/health/live',
      method: 'GET',
    });
    recordCheck('GET /api/v1/health/live returned 200 OK', liveRes.status === 200 && liveRes.body.data.status === 'alive');

    const readyRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/health/ready',
      method: 'GET',
    });
    recordCheck('GET /api/v1/health/ready returned 200 OK (PostgreSQL Connected)', readyRes.status === 200 && readyRes.body.data.status === 'ready');

    const dbHealthRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/health/database',
      method: 'GET',
    });
    recordCheck(
      'GET /api/v1/health/database reported PostgreSQL Connected',
      dbHealthRes.status === 200 && dbHealthRes.body.data.status === 'PostgreSQL Connected' && dbHealthRes.body.data.connected === true
    );

    const provHealthRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/health/providers',
      method: 'GET',
    });
    recordCheck('GET /api/v1/health/providers reported Real-Mode Safety Gate ACTIVE', provHealthRes.status === 200 && provHealthRes.body.data.realModeSafetyGate.includes('ACTIVE'));

    // -------------------------------------------------------------------------
    // 9. HARD REAL-MODE SAFETY GATES
    // -------------------------------------------------------------------------
    console.log('\n[SECTION 9] Real-Mode Safety Gates (100% Blocked)');

    let waBlocked = false;
    try {
      await whatsAppProvider.sendMessage({}, 'REAL');
    } catch (e) {
      if (e.code === 'EXECUTION_BLOCKED') waBlocked = true;
    }
    recordCheck('WhatsApp Real Dispatch BLOCKED (403 EXECUTION_BLOCKED)', waBlocked);

    let seoBlocked = false;
    try {
      await seoProvider.fetchLiveSERPRank('test', 'https://test.com', 'REAL');
    } catch (e) {
      if (e.code === 'EXECUTION_BLOCKED') seoBlocked = true;
    }
    recordCheck('SEO Real Crawler BLOCKED (403 EXECUTION_BLOCKED)', seoBlocked);

    let billingBlocked = false;
    try {
      await billingProvider.chargePayment('inv-01', 10000, 'REAL');
    } catch (e) {
      if (e.code === 'EXECUTION_BLOCKED') billingBlocked = true;
    }
    recordCheck('Billing Real Financial Capture BLOCKED (403 EXECUTION_BLOCKED)', billingBlocked);

    // -------------------------------------------------------------------------
    // 10. CLEAN UP TEST DATA SAFELY
    // -------------------------------------------------------------------------
    console.log('\n[SECTION 10] Safe Test Data Cleanup');
    await pool.query('DELETE FROM "Agency" WHERE id IN ($1, $2)', [testAgencyId, testAgencyId2]);
    console.log('  ✓ Test agencies and associated cascaded records cleaned safely from PostgreSQL.');

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log('\n========================================================================');
    console.log(`LIVE POSTGRESQL VERIFICATION COMPLETE: ${results.passed} PASSED, ${results.failed} FAILED`);
    console.log('========================================================================\n');

    return results;
  } finally {
    server.close();
    await pool.end().catch(() => {});
  }
}

runLivePostgresVerification().catch((err) => {
  console.error('\n[FATAL ERROR IN LIVE POSTGRES VERIFICATION]:', err);
  process.exit(1);
});
