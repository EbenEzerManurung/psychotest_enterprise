import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { query, execute } from '$lib/server/db';
import { requirePermission } from '$lib/server/guard';
import { PERMISSIONS } from '$lib/rbac';

export const load: PageServerLoad = async ({ locals }) => {
  requirePermission(locals, PERMISSIONS.QUESTION_CRUD);
  const questions = await query<any>(`SELECT * FROM personality_questions ORDER BY order_number, id`);
  const options = await query<any>(`SELECT * FROM personality_options ORDER BY question_id, option_label`);
  return { questions, options };
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    requirePermission(locals, PERMISSIONS.QUESTION_CRUD);
    const data = await request.formData();
    const question_text = String(data.get('question_text') || '').trim();
    const dimension = String(data.get('dimension') || '').trim();
    const order_number = Number(data.get('order_number') || 0);

    if (!question_text || !dimension) return fail(400, { error: 'Field wajib diisi' });

    const result = await execute(
      `INSERT INTO personality_questions (question_text, dimension, order_number) VALUES (?,?,?)`,
      [question_text, dimension, order_number]
    );
    const qid = result.insertId;

    for (const label of ['A', 'B', 'C', 'D']) {
      const text = String(data.get(`option_${label.toLowerCase()}_text`) || '').trim();
      const scoreJson = String(data.get(`option_${label.toLowerCase()}_score`) || '{}');
      if (!text) continue;
      try { JSON.parse(scoreJson); } catch { return fail(400, { error: `JSON skor opsi ${label} tidak valid` }); }
      await execute(
        `INSERT INTO personality_options (question_id, option_label, statement_text, dimension_score) VALUES (?,?,?,?)`,
        [qid, label, text, scoreJson]
      );
    }
    return { success: true, message: 'Soal kepribadian ditambahkan' };
  },
  update: async ({ request, locals }) => {
    requirePermission(locals, PERMISSIONS.QUESTION_CRUD);
    const data = await request.formData();
    const id = Number(data.get('id'));
    const question_text = String(data.get('question_text') || '').trim();
    const dimension = String(data.get('dimension') || '').trim();
    const order_number = Number(data.get('order_number') || 0);

    if (!id || !question_text || !dimension) return fail(400, { error: 'Data tidak lengkap' });

    await execute(`UPDATE personality_questions SET question_text=?, dimension=?, order_number=? WHERE id=?`,
      [question_text, dimension, order_number, id]);
    await execute(`DELETE FROM personality_options WHERE question_id = ?`, [id]);
    for (const label of ['A', 'B', 'C', 'D']) {
      const text = String(data.get(`option_${label.toLowerCase()}_text`) || '').trim();
      const scoreJson = String(data.get(`option_${label.toLowerCase()}_score`) || '{}');
      if (!text) continue;
      try { JSON.parse(scoreJson); } catch { return fail(400, { error: `JSON skor opsi ${label} tidak valid` }); }
      await execute(
        `INSERT INTO personality_options (question_id, option_label, statement_text, dimension_score) VALUES (?,?,?,?)`,
        [id, label, text, scoreJson]
      );
    }
    return { success: true, message: 'Soal diperbarui' };
  },
  delete: async ({ request, locals }) => {
    requirePermission(locals, PERMISSIONS.QUESTION_CRUD);
    const data = await request.formData();
    const id = Number(data.get('id'));
    if (!id) return fail(400, { error: 'ID tidak valid' });
    await execute(`DELETE FROM personality_questions WHERE id = ?`, [id]);
    return { success: true, message: 'Soal dihapus' };
  }
};