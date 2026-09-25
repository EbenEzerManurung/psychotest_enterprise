// 001_seed_roles_permissions.js
import { connectToDb } from '../db.js';

export default async function seed() {
  const conn = await connectToDb();

  // Roles
  await conn.query(`
    INSERT INTO roles (id, name, label) VALUES
      (1, 'superadmin', 'Super Administrator'),
      (2, 'hr', 'Human Resources'),
      (3, 'candidate', 'Calon Karyawan')
    ON DUPLICATE KEY UPDATE label = VALUES(label)
  `);

  // Permissions
  await conn.query(`
    INSERT INTO permissions (id, code, label) VALUES
      (1, 'dashboard:view', 'Lihat Dashboard'),
      (2, 'user:crud', 'CRUD User'),
      (3, 'candidate:crud', 'CRUD Calon Karyawan'),
      (4, 'question:crud', 'CRUD Soal Psikotes'),
      (5, 'result:view', 'Lihat Hasil Test'),
      (6, 'result:export', 'Export Hasil Test'),
      (7, 'test:assign', 'Berikan Akses Test'),
      (8, 'test:take', 'Ikuti Test Psikotes')
    ON DUPLICATE KEY UPDATE label = VALUES(label)
  `);

  // Role Permissions
  await conn.query(`DELETE FROM role_permissions`);
  await conn.query(`
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT 1, id FROM permissions
  `);
  await conn.query(`
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT 2, id FROM permissions WHERE code NOT IN ('user:crud')
  `);
  await conn.query(`
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT 3, id FROM permissions WHERE code IN ('dashboard:view','test:take')
  `);
}