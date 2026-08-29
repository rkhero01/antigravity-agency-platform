/**
 * Production Database Migration Runner & Validator
 * Task 28 — Step 10.2: Real PostgreSQL Migration Deployment
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

export async function deployMigrations() {
  if (!env.isDatabaseConfigured) {
    console.log('[MIGRATION] DATABASE_URL is not configured. Skipping live migration.');
    return { success: false, reason: 'NO_DATABASE_URL' };
  }

  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();

  try {
    console.log('[MIGRATION] Connected to PostgreSQL. Applying migration DDL...');
    const migrationFilePath = path.resolve('server/prisma/migrations/0_init/migration.sql');
    const sql = fs.readFileSync(migrationFilePath, 'utf8');

    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('[MIGRATION] Migration DDL applied successfully.');

    // Query table list
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    const res = await client.query(tablesQuery);
    const tables = res.rows.map((r) => r.table_name);

    console.log(`[MIGRATION] Verified ${tables.length} tables in PostgreSQL:`, tables.join(', '));
    return { success: true, tables };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[MIGRATION ERROR] Failed to deploy migrations:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

if (process.argv[1] && process.argv[1].endsWith('migrate.js')) {
  deployMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default deployMigrations;
