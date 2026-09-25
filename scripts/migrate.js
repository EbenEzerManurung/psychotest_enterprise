// scripts/migrate.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connect, connectToDb, closeConnection } from './db.js';
import { DB_NAME } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const SEEDERS_DIR = path.join(__dirname, 'seeders');

const args = process.argv.slice(2);
const FRESH = args.includes('--fresh');
const SEED = args.includes('--seed');
const ROLLBACK = args.includes('--rollback');

function log(msg) { console.log(`  ${msg}`); }
function logSuccess(msg) { console.log(`  ✅ ${msg}`); }
function logError(msg) { console.error(`  ❌ ${msg}`); }
function logInfo(msg) { console.log(`  ℹ️  ${msg}`); }

// ============================================
// 1. CREATE DATABASE JIKA BELUM ADA
// ============================================
async function ensureDatabase() {
  const conn = await connect();
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  logSuccess(`Database "${DB_NAME}" siap`);
}

// ============================================
// 2. BUAT TABEL TRACKING MIGRATIONS
// ============================================
async function ensureMigrationsTable() {
  const conn = await connectToDb();
  await conn.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      migration VARCHAR(255) NOT NULL UNIQUE,
      batch INT UNSIGNED NOT NULL DEFAULT 1,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);
}

// ============================================
// 3. DROP ALL TABLES (untuk --fresh)
// ============================================
async function dropAllTables() {
  const conn = await connectToDb();
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  const [tables] = await conn.query('SHOW TABLES');
  const key = `Tables_in_${DB_NAME}`;
  for (const row of tables) {
    const tableName = row[key];
    await conn.query(`DROP TABLE IF EXISTS \`${tableName}\``);
    log(`   Drop: ${tableName}`);
  }
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  logSuccess('Semua tabel dihapus');
}

// ============================================
// 4. AMBIL DAFTAR MIGRATION YANG SUDAH DIJALANKAN
// ============================================
async function getExecutedMigrations() {
  const conn = await connectToDb();
  const [rows] = await conn.query('SELECT migration FROM migrations ORDER BY id');
  return new Set(rows.map(r => r.migration));
}

// ============================================
// 5. BACA FILE MIGRATION
// ============================================
function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  return fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();
}

// ============================================
// 6. JALANKAN MIGRATION
// ============================================
async function runMigrations() {
  const conn = await connectToDb();
  const executed = await getExecutedMigrations();
  const files = getMigrationFiles();

  if (files.length === 0) {
    logInfo('Tidak ada file migration');
    return;
  }

  // Dapatkan batch berikutnya
  const [batchRow] = await conn.query('SELECT COALESCE(MAX(batch), 0) + 1 AS next_batch FROM migrations');
  const batch = batchRow[0].next_batch;

  let count = 0;
  for (const file of files) {
    if (executed.has(file)) {
      log(`   Skip (sudah dijalankan): ${file}`);
      continue;
    }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    try {
      await conn.query(sql);
      await conn.query('INSERT INTO migrations (migration, batch) VALUES (?, ?)', [file, batch]);
      logSuccess(`Migrate: ${file}`);
      count++;
    } catch (err) {
      logError(`Gagal migrate ${file}: ${err.message}`);
      throw err;
    }
  }

  if (count === 0) logInfo('Semua migration sudah up-to-date');
  else logSuccess(`${count} migration dijalankan (batch ${batch})`);
}

// ============================================
// 7. JALANKAN SEEDER
// ============================================
async function runSeeders() {
  if (!fs.existsSync(SEEDERS_DIR)) {
    logInfo('Tidak ada folder seeders');
    return;
  }
  const files = fs.readdirSync(SEEDERS_DIR)
    .filter(f => f.endsWith('.js'))
    .sort();

  if (files.length === 0) {
    logInfo('Tidak ada file seeder');
    return;
  }

  for (const file of files) {
    const seederModule = await import(`file://${path.join(SEEDERS_DIR, file)}`);
    const seederFn = seederModule.default;
    if (typeof seederFn === 'function') {
      try {
        await seederFn();
        logSuccess(`Seed: ${file}`);
      } catch (err) {
        logError(`Gagal seed ${file}: ${err.message}`);
        throw err;
      }
    }
  }
}

// ============================================
// 8. ROLLBACK
// ============================================
async function rollback() {
  const conn = await connectToDb();
  const [batchRow] = await conn.query('SELECT MAX(batch) AS last_batch FROM migrations');
  const lastBatch = batchRow[0]?.last_batch;
  if (!lastBatch) { logInfo('Tidak ada migration untuk di-rollback'); return; }

  const [rows] = await conn.query('SELECT migration FROM migrations WHERE batch = ? ORDER BY id DESC', [lastBatch]);
  for (const row of rows) {
    // Cari file rollback (opsional): .down.sql
    const downFile = row.migration.replace('.sql', '.down.sql');
    const downPath = path.join(MIGRATIONS_DIR, downFile);
    if (fs.existsSync(downPath)) {
      const sql = fs.readFileSync(downPath, 'utf8');
      await conn.query(sql);
      logSuccess(`Rollback: ${downFile}`);
    } else {
      log(`   Tidak ada file rollback untuk ${row.migration} (skip)`);
    }
  }
  await conn.query('DELETE FROM migrations WHERE batch = ?', [lastBatch]);
  logSuccess(`Rollback batch ${lastBatch} selesai`);
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║     🗄️  PSYCHOTEST MIGRATION RUNNER      ║');
  console.log('╚══════════════════════════════════════════╝\n');

  try {
    await ensureDatabase();
    await ensureMigrationsTable();

    if (ROLLBACK) {
      await rollback();
    } else {
      if (FRESH) {
        logInfo('Mode FRESH: menghapus semua tabel...');
        await dropAllTables();
        await ensureMigrationsTable();
      }
      await runMigrations();
      if (SEED) {
        logInfo('Menjalankan seeders...');
        await runSeeders();
      }
    }

    console.log('\n✨ Selesai!\n');
  } catch (err) {
    console.error('\n💥 Terjadi kesalahan:', err.message);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

main();