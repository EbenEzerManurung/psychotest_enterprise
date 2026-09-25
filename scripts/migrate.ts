import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RowDataPacket } from 'mysql2/promise';
import { connect, connectToDb, closeConnection } from './db.js';
import { DB_NAME } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const SEEDERS_DIR = path.join(__dirname, 'seeders');

const args: string[] = process.argv.slice(2);
const FRESH: boolean = args.includes('--fresh');
const SEED: boolean = args.includes('--seed');
const ROLLBACK: boolean = args.includes('--rollback');

function log(msg: string): void { console.log(`  ${msg}`); }
function logSuccess(msg: string): void { console.log(`  OK ${msg}`); }
function logError(msg: string): void { console.error(`  ERR ${msg}`); }
function logInfo(msg: string): void { console.log(`  INFO ${msg}`); }

async function ensureDatabase(): Promise<void> {
  const conn = await connect();
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  logSuccess(`Database "${DB_NAME}" siap`);
}

async function ensureMigrationsTable(): Promise<void> {
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

async function dropAllTables(): Promise<void> {
  const conn = await connectToDb();
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');

  // ✅ FIX: gunakan `any` karena RowDataPacket sudah punya `constructor`
  //    yang bukan string. Index signature `any` lebih aman dan fleksibel.
  interface TableRow extends RowDataPacket {
    [key: string]: any;
  }

  const [tables] = await conn.query<TableRow[]>('SHOW TABLES');
  const key = `Tables_in_${DB_NAME}`;

  for (const row of tables) {
    const tableName = row[key];
    if (tableName) {
      await conn.query(`DROP TABLE IF EXISTS \`${tableName}\``);
      log(`   Drop: ${tableName}`);
    }
  }

  await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  logSuccess('Semua tabel dihapus');
}

async function getExecutedMigrations(): Promise<Set<string>> {
  const conn = await connectToDb();

  interface MigrationRow extends RowDataPacket {
    migration: string;
  }

  const [rows] = await conn.query<MigrationRow[]>(
    'SELECT migration FROM migrations ORDER BY id'
  );
  return new Set(rows.map((r) => r.migration));
}

function getMigrationFiles(): string[] {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();
}

async function runMigrations(): Promise<void> {
  const conn = await connectToDb();
  const executed = await getExecutedMigrations();
  const files = getMigrationFiles();

  if (files.length === 0) {
    logInfo('Tidak ada file migration');
    return;
  }

  interface BatchRow extends RowDataPacket {
    next_batch: number;
  }

  const [batchRows] = await conn.query<BatchRow[]>(
    'SELECT COALESCE(MAX(batch), 0) + 1 AS next_batch FROM migrations'
  );
  const batch = batchRows[0]?.next_batch ?? 1;

  let count = 0;
  for (const file of files) {
    if (executed.has(file)) {
      log(`   Skip (sudah dijalankan): ${file}`);
      continue;
    }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    try {
      await conn.query(sql);
      await conn.query(
        'INSERT INTO migrations (migration, batch) VALUES (?, ?)',
        [file, batch]
      );
      logSuccess(`Migrate: ${file}`);
      count++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logError(`Gagal migrate ${file}: ${message}`);
      throw err;
    }
  }

  if (count === 0) logInfo('Semua migration sudah up-to-date');
  else logSuccess(`${count} migration dijalankan (batch ${batch})`);
}

type SeederFn = () => Promise<void>;

interface SeederModule {
  default: SeederFn;
}

async function runSeeders(): Promise<void> {
  if (!fs.existsSync(SEEDERS_DIR)) {
    logInfo('Tidak ada folder seeders');
    return;
  }

  const files = fs
    .readdirSync(SEEDERS_DIR)
    .filter((f) => f.endsWith('.ts'))
    .sort();

  if (files.length === 0) {
    logInfo('Tidak ada file seeder');
    return;
  }

  for (const file of files) {
    const fullPath = path.join(SEEDERS_DIR, file);
    const seederModule = (await import(`file://${fullPath}`)) as SeederModule;
    const seederFn = seederModule.default;

    if (typeof seederFn === 'function') {
      try {
        await seederFn();
        logSuccess(`Seed: ${file}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logError(`Gagal seed ${file}: ${message}`);
        throw err;
      }
    }
  }
}

async function rollback(): Promise<void> {
  const conn = await connectToDb();

  interface LastBatchRow extends RowDataPacket {
    last_batch: number | null;
  }

  const [batchRows] = await conn.query<LastBatchRow[]>(
    'SELECT MAX(batch) AS last_batch FROM migrations'
  );
  const lastBatch = batchRows[0]?.last_batch;

  if (!lastBatch) {
    logInfo('Tidak ada migration untuk di-rollback');
    return;
  }

  interface MigrationRow extends RowDataPacket {
    migration: string;
  }

  const [rows] = await conn.query<MigrationRow[]>(
    'SELECT migration FROM migrations WHERE batch = ? ORDER BY id DESC',
    [lastBatch]
  );

  for (const row of rows) {
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

async function main(): Promise<void> {
  console.log('\n========================================');
  console.log('   PSYCHOTEST MIGRATION RUNNER');
  console.log('========================================\n');

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

    console.log('\nSelesai!\n');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('\nTerjadi kesalahan:', message);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

main();