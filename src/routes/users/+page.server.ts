import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { query, queryOne, execute } from '$lib/server/db';
import { hashPassword } from '$lib/server/auth';
import { requirePermission } from '$lib/server/guard';
import { PERMISSIONS } from '$lib/rbac';

export const load: PageServerLoad = async ({ locals }) => {
  requirePermission(locals, PERMISSIONS.USER_CRUD);
  const users = await query<any>(
    `SELECT u.id, u.username, u.email, u.full_name, u.is_active, u.last_login,
            r.name AS role_name, r.id AS role_id
     FROM users u JOIN roles r ON r.id = u.role_id
     ORDER BY u.created_at DESC`
  );
  const roles = await query<any>(`SELECT id, name, label FROM roles ORDER BY id`);
  return { users, roles };
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    requirePermission(locals, PERMISSIONS.USER_CRUD);
    const data = await request.formData();
    const username = String(data.get('username') || '').trim();
    const email = String(data.get('email') || '').trim();
    const fullName = String(data.get('full_name') || '').trim();
    const password = String(data.get('password') || '');
    const roleId = Number(data.get('role_id'));

    if (!username || !email || !fullName || !password || !roleId) return fail(400, { error: 'Semua field wajib diisi' });
    if (password.length < 6) return fail(400, { error: 'Password minimal 6 karakter' });

    const exists = await queryOne(`SELECT id FROM users WHERE username = ? OR email = ?`, [username, email]);
    if (exists) return fail(400, { error: 'Username atau email sudah terdaftar' });

    const hash = await hashPassword(password);
    await execute(
      `INSERT INTO users (username, email, password_hash, full_name, role_id) VALUES (?, ?, ?, ?, ?)`,
      [username, email, hash, fullName, roleId]
    );
    return { success: true, message: 'User berhasil dibuat' };
  },

  update: async ({ request, locals }) => {
    requirePermission(locals, PERMISSIONS.USER_CRUD);
    const data = await request.formData();
    const id = Number(data.get('id'));
    const username = String(data.get('username') || '').trim();
    const email = String(data.get('email') || '').trim();
    const fullName = String(data.get('full_name') || '').trim();
    const roleId = Number(data.get('role_id'));
    const isActive = data.get('is_active') === 'on' ? 1 : 0;
    const password = String(data.get('password') || '');

    if (!id || !username || !email || !fullName || !roleId) return fail(400, { error: 'Semua field wajib diisi' });

    if (password) {
      const hash = await hashPassword(password);
      await execute(
        `UPDATE users SET username=?, email=?, full_name=?, role_id=?, is_active=?, password_hash=? WHERE id=?`,
        [username, email, fullName, roleId, isActive, hash, id]
      );
    } else {
      await execute(
        `UPDATE users SET username=?, email=?, full_name=?, role_id=?, is_active=? WHERE id=?`,
        [username, email, fullName, roleId, isActive, id]
      );
    }
    return { success: true, message: 'User berhasil diupdate' };
  },

  delete: async ({ request, locals }) => {
    requirePermission(locals, PERMISSIONS.USER_CRUD);
    const data = await request.formData();
    const id = Number(data.get('id'));
    const username = String(data.get('username') || '');
    if (!id) return fail(400, { error: 'ID tidak valid' });
    if (username === 'superadmin') return fail(400, { error: 'Tidak bisa menghapus superadmin' });
    await execute(`DELETE FROM users WHERE id = ?`, [id]);
    return { success: true, message: 'User berhasil dihapus' };
  }
};