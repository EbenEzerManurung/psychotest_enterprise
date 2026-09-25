import mysql from 'mysql2/promise';
import { env } from '$env/dynamic/private';

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: env.DATABASE_HOST || 'localhost',
      port: Number(env.DATABASE_PORT || 3306),
      user: env.DATABASE_USER || 'root',
      password: env.DATABASE_PASSWORD || '',
      database: env.DATABASE_NAME || 'psychotest_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: true
    });
  }
  return pool;
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const [rows] = await getPool().execute(sql, params);
  return rows as T[];
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function execute(sql: string, params?: any[]) {
  const [result] = await getPool().execute(sql, params);
  return result as mysql.ResultSetHeader;
}