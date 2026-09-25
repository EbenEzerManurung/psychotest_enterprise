// scripts/config.js
import 'dotenv/config';

export const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT || 3306),
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'psychotest_db',
  multipleStatements: true,
  dateStrings: true
};

export const DB_NAME = dbConfig.database;