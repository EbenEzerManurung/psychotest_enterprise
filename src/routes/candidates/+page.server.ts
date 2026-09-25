import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { query, queryOne, execute } from '$lib/server/db';
import { hashPassword } from '$lib/server/auth';
import { requirePermission } from '$lib/server/guard';
import { PERMISSIONS } from '$lib/rbac';
import crypto from 'node:crypto';

export const load: PageServerLoad = async ({ locals }) => {
  requirePermission(locals, PERMISSIONS.CANDIDATE_CRUD);

  const candidates = await query<any>(
    `SELECT c.*, u.username, u.email, u.full_name, u.is_active
     FROM candidates c JOIN users u ON u.id = c.user_id
     ORDER BY c.created_at DESC`
  );

  const categories = await query<any>(
    `SELECT id, name, code FROM test_categories WHERE is_active = 1`
  );

  const assignments = await query<any>(
    `SELECT ta.id, ta.candidate_id, ta.access_token,
            ta.starts_at, ta.expires_at, ta.is_used,
            tc.name AS category_name, tc.code AS category_code
     FROM test_assignments ta
     JOIN test_categories tc ON tc.id = ta.category_id
     WHERE ta.is_used = 0 AND ta.expires_at > NOW()
     ORDER BY ta.starts_at DESC`
  );

  return { candidates, categories, assignments };
};

export const actions: Actions = {
  // ============================================
  // CREATE KANDIDAT BARU
  // ============================================
  create: async ({ request, locals }) => {
    requirePermission(locals, PERMISSIONS.CANDIDATE_CRUD);
    const data = await request.formData();

    const username = String(data.get('username') || '').trim();
    const email = String(data.get('email') || '').trim();
    const fullName = String(data.get('full_name') || '').trim();
    const password = String(data.get('password') || 'candidate123');
    const nik = String(data.get('nik') || '').trim() || null;
    const phone = String(data.get('phone') || '').trim() || null;
    const birthDate = String(data.get('birth_date') || '') || null;
    const gender = String(data.get('gender') || 'L');
    const address = String(data.get('address') || '').trim() || null;
    const education = String(data.get('education') || '').trim() || null;
    const position = String(data.get('position_applied') || '').trim() || null;

    if (!username || !email || !fullName) {
      return fail(400, { error: 'Username, email, dan nama wajib diisi' });
    }

    const exists = await queryOne(
      `SELECT id FROM users WHERE username = ? OR email = ?`,
      [username, email]
    );
    if (exists) return fail(400, { error: 'Username atau email sudah terdaftar' });

    const role = await queryOne<any>(
      `SELECT id FROM roles WHERE name = 'candidate' LIMIT 1`
    );
    if (!role) return fail(500, { error: 'Role candidate tidak ditemukan' });

    const hash = await hashPassword(password);
    const userId = (
      await execute(
        `INSERT INTO users (username, email, password_hash, full_name, role_id) VALUES (?, ?, ?, ?, ?)`,
        [username, email, hash, fullName, role.id]
      )
    ).insertId;

    await execute(
      `INSERT INTO candidates (user_id, nik, phone, birth_date, gender, address, education, position_applied)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, nik, phone, birthDate, gender, address, education, position]
    );

    return { success: true, message: 'Kandidat berhasil ditambahkan' };
  },

  // ============================================
  // UPDATE KANDIDAT
  // ============================================
  update: async ({ request, locals }) => {
    requirePermission(locals, PERMISSIONS.CANDIDATE_CRUD);
    const data = await request.formData();

    const id = Number(data.get('id'));
    const fullName = String(data.get('full_name') || '').trim();
    const nik = String(data.get('nik') || '').trim() || null;
    const phone = String(data.get('phone') || '').trim() || null;
    const birthDate = String(data.get('birth_date') || '') || null;
    const gender = String(data.get('gender') || 'L');
    const address = String(data.get('address') || '').trim() || null;
    const education = String(data.get('education') || '').trim() || null;
    const position = String(data.get('position_applied') || '').trim() || null;
    const status = String(data.get('status') || 'registered');

    const cand = await queryOne<any>(
      `SELECT user_id FROM candidates WHERE id = ?`,
      [id]
    );
    if (!cand) return fail(404, { error: 'Kandidat tidak ditemukan' });

    await execute(
      `UPDATE users SET full_name = ? WHERE id = ?`,
      [fullName, cand.user_id]
    );

    await execute(
      `UPDATE candidates
       SET nik=?, phone=?, birth_date=?, gender=?, address=?, education=?, position_applied=?, status=?
       WHERE id=?`,
      [nik, phone, birthDate, gender, address, education, position, status, id]
    );

    return { success: true, message: 'Data kandidat diperbarui' };
  },

  // ============================================
  // DELETE KANDIDAT
  // ============================================
  delete: async ({ request, locals }) => {
    requirePermission(locals, PERMISSIONS.CANDIDATE_CRUD);
    const data = await request.formData();
    const id = Number(data.get('id'));

    const cand = await queryOne<any>(
      `SELECT user_id FROM candidates WHERE id = ?`,
      [id]
    );
    if (cand) {
      await execute(`DELETE FROM users WHERE id = ?`, [cand.user_id]);
    }

    return { success: true, message: 'Kandidat dihapus' };
  },

  // ============================================
  // ASSIGN MULTIPLE TES SEKALIGUS
  // ============================================
  assign: async ({ request, locals }) => {
    const user = requirePermission(locals, PERMISSIONS.TEST_ASSIGN);
    const data = await request.formData();

    const candidateId = Number(data.get('candidate_id'));
    const startDate = String(data.get('start_date') || '');
    const endDate = String(data.get('end_date') || '');

    // Ambil semua category_ids (multiple checkbox values)
    const categoryIds = data
      .getAll('category_ids')
      .map((v) => Number(v))
      .filter((v) => !isNaN(v) && v > 0);

    // ============ VALIDASI ============
    if (!candidateId) {
      return fail(400, { error: 'Kandidat tidak valid' });
    }
    if (categoryIds.length === 0) {
      return fail(400, { error: 'Pilih minimal satu kategori tes' });
    }
    if (!startDate || !endDate) {
      return fail(400, { error: 'Tanggal mulai dan berakhir wajib diisi' });
    }

    const startAt = new Date(startDate);
    const endAt = new Date(endDate);

    if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
      return fail(400, { error: 'Format tanggal tidak valid' });
    }
    if (endAt <= startAt) {
      return fail(400, { error: 'Tanggal berakhir harus setelah tanggal mulai' });
    }

    const totalDays = Math.ceil((endAt.getTime() - startAt.getTime()) / 86400000);
    if (totalDays > 90) {
      return fail(400, { error: 'Durasi maksimal 90 hari' });
    }

    // ✅ FIX: JOIN ke tabel users untuk mendapatkan full_name
    const candidate = await queryOne<any>(
      `SELECT c.id, u.full_name
       FROM candidates c
       JOIN users u ON u.id = c.user_id
       WHERE c.id = ?`,
      [candidateId]
    );
    if (!candidate) return fail(404, { error: 'Kandidat tidak ditemukan' });

    // Format tanggal untuk MySQL DATETIME
    const startStr = startAt.toISOString().slice(0, 19).replace('T', ' ');
    const endStr = endAt.toISOString().slice(0, 19).replace('T', ' ');

    // ============ LOOP SETIAP KATEGORI ============
    const success: string[] = [];
    const skipped: string[] = [];

    for (const categoryId of categoryIds) {
      // Cek kategori ada
      const category = await queryOne<any>(
        `SELECT id, name FROM test_categories WHERE id = ? AND is_active = 1`,
        [categoryId]
      );
      if (!category) continue;

      // Cek duplikat: kandidat sudah punya akses aktif untuk kategori ini?
      const existing = await queryOne<any>(
        `SELECT id, expires_at FROM test_assignments
         WHERE candidate_id = ? AND category_id = ?
           AND is_used = 0 AND expires_at > NOW()`,
        [candidateId, categoryId]
      );

      if (existing) {
        skipped.push(category.name);
        continue;
      }

      // Generate token unik per kategori
      const token = crypto.randomBytes(24).toString('hex');

      await execute(
        `INSERT INTO test_assignments
          (candidate_id, category_id, starts_at, assigned_by, access_token, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [candidateId, categoryId, startStr, user.id, token, endStr]
      );

      success.push(category.name);
    }

    // ============ RESPONSE ============
    if (success.length === 0 && skipped.length > 0) {
      return fail(400, {
        error: `Semua kategori yang dipilih sudah punya akses aktif: ${skipped.join(', ')}. Tunggu kedaluwarsa dulu atau selesaikan tes yang ada.`
      });
    }

    if (success.length === 0) {
      return fail(400, { error: 'Gagal memberikan akses tes. Coba lagi.' });
    }

    const fmt = (d: Date) => d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    let message = `✅ Akses diberikan ke ${candidate.full_name}: ${success.join(' + ')}.`;
    message += ` Berlaku ${fmt(startAt)} s/d ${fmt(endAt)} (${totalDays} hari).`;

    if (skipped.length > 0) {
      message += ` ⚠️ Di-skip (sudah ada akses): ${skipped.join(', ')}.`;
    }

    return { success: true, message };
  }
};