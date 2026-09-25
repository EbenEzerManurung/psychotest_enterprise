import mysql from 'mysql2/promise';
import type { Connection } from 'mysql2/promise';
import { dbConfig, DB_NAME } from './config.js';

let connection: Connection | null = null;

export async function connect(): Promise<Connection> {
  if (connection) return connection;

  const { database: _db, ...configWithoutDb } = dbConfig;

  connection = await mysql.createConnection({
    host: configWithoutDb.host,
    port: configWithoutDb.port,
    user: configWithoutDb.user,
    password: configWithoutDb.password,
    multipleStatements: true
  });

  return connection;
}

export async function connectToDb(): Promise<Connection> {
  const conn = await connect();
  await conn.query(`USE \`${DB_NAME}\``);
  return conn;
}

export async function closeConnection(): Promise<void> {
  if (connection) {
    await connection.end();
    connection = null;
  }
}
