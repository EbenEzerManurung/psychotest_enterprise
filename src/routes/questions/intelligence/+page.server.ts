import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { query, execute } from '$lib/server/db';
import { requirePermission } from '$lib/server/guard';
import { PERMISSIONS } from '$lib/rbac';

export const load: PageServerLoad = async ({ locals }) => {
  requirePermission(locals, PERMISSIONS.QUESTION_CRUD);
  const questions = await query<any>(
    `SELECT q.*, s.name AS subcategory_name, s.code AS subcategory_code
     FROM intelligence_questions q
     JOIN test_subcategories s ON s.id = q.subcategory_id
     ORDER BY q.order_number, q.id`
  );
  const subcategories = await query<any>(
    `SELECT s.id, s.name, s.code FROM test_subcategories s
     JOIN test_categories c ON c.id = s.category_id WHERE c.code = 'INTEL'`
  );
  return { questions, subcategories };
};

function parse(data: FormData) {
  return {
    subcategory_id: Number(data.get('subcategory_id')),
    question_text: String(data.get('question_text') || '').trim(),
    image_url: String(data.get('image_url') || '').trim() || null,
    option_a: String(data.get('option_a') || '').trim(),
    option_b: String(data.get('option_b') || '').trim(),
    option_c: String(data.get('option_c') || '').trim(),
    option_d: String(data.get('option_d') || '').trim(),
    correct_answer: String(data.get('correct_answer') || 'A'),
    difficulty: String(data.get('difficulty') || 'medium'),
    score_weight: Number(data.get('score_weight') || 1),
    time_seconds: Number(data.get('time_seconds') || 60),
    order_number: Number(data.get('order_number') || 0)
  };
}

export const actions: Actions = {
  create: async ({ request, locals }) => {
    requirePermission(locals, PERMISSIONS.QUESTION_CRUD);
    const d = parse(await request.formData());
    if (!d.subcategory_id || !d.question_text) return fail(400, { error: 'Data tidak lengkap' });
    await execute(
      `INSERT INTO intelligence_questions
       (subcategory_id, question_text, image_url, option_a, option_b, option_c, option_d, correct_answer, difficulty, score_weight, time_seconds, order_number)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [d.subcategory_id, d.question_text, d.image_url, d.option_a, d.option_b, d.option_c, d.option_d,
       d.correct_answer, d.difficulty, d.score_weight, d.time_seconds, d.order_number]
    );
    return { success: true, message: 'Soal ditambahkan' };
  },
  update: async ({ request, locals }) => {
    requirePermission(locals, PERMISSIONS.QUESTION_CRUD);
    const data = await request.formData();
    const id = Number(data.get('id'));
    const d = parse(data);
    if (!id) return fail(400, { error: 'ID tidak valid' });
    await execute(
      `UPDATE intelligence_questions SET
         subcategory_id=?, question_text=?, image_url=?, option_a=?, option_b=?, option_c=?, option_d=?,
         correct_answer=?, difficulty=?, score_weight=?, time_seconds=?, order_number=? WHERE id=?`,
      [d.subcategory_id, d.question_text, d.image_url, d.option_a, d.option_b, d.option_c, d.option_d,
       d.correct_answer, d.difficulty, d.score_weight, d.time_seconds, d.order_number, id]
    );
    return { success: true, message: 'Soal diperbarui' };
  },
  delete: async ({ request, locals }) => {
    requirePermission(locals, PERMISSIONS.QUESTION_CRUD);
    const data = await request.formData();
    const id = Number(data.get('id'));
    if (!id) return fail(400, { error: 'ID tidak valid' });
    await execute(`DELETE FROM intelligence_questions WHERE id = ?`, [id]);
    return { success: true, message: 'Soal dihapus' };
  }
};