// scripts/db.js
import mysql from 'mysql2/promise';
import { dbConfig, DB_NAME } from './config.js';

let connection = null;

export async function connect() {
  if (connection) return connection;
  // Connect tanpa database dulu (untuk create database jika belum ada)
  const { database, ...configWithoutDb } = dbConfig;
  connection = await mysql.createConnection({
    ...configWithoutDb,
    multipleStatements: true
  });
  return connection;
}

export async function connectToDb() {
  const conn = await connect();
  await conn.query(`USE \`${DB_NAME}\``);
  return conn;
}

export async function closeConnection() {
  if (connection) {
    await connection.end();
    connection = null;
  }
}