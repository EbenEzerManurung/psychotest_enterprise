// 002_seed_users.js
import bcrypt from 'bcryptjs';
import { connectToDb } from '../db.js';

export default async function seed() {
  const conn = await connectToDb();
  const hash = await bcrypt.hash('password123', 12);
  const candidateHash = await bcrypt.hash('candidate123', 12);

  await conn.query(`
    INSERT INTO users (id, username, email, password_hash, full_name, role_id) VALUES
      (1, 'superadmin', 'superadmin@psychotest.local', ?, 'Super Admin', 1),
      (2, 'hr', 'hr@psychotest.local', ?, 'HR Manager', 2),
      (3, 'candidate1', 'candidate1@example.com', ?, 'Budi Santoso', 3)
    ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)
  `, [hash, hash, candidateHash]);

  await conn.query(`
    INSERT INTO candidates (id, user_id, nik, phone, birth_date, gender, address, education, position_applied, status) VALUES
      (1, 3, '3273010101010001', '081234567890', '1995-01-15', 'L',
       'Jl. Merdeka No. 1, Bandung', 'S1 Teknik Informatika', 'Software Engineer', 'registered')
    ON DUPLICATE KEY UPDATE position_applied = VALUES(position_applied)
  `);
}