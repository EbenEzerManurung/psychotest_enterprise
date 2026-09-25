import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { query, queryOne, execute } from '$lib/server/db';
import { requireAuth } from '$lib/server/guard';

export const load: PageServerLoad = async ({ url, locals }) => {
  const user = requireAuth(locals);
  const token = url.searchParams.get('token');

  if (!token) throw error(400, 'Token tidak ada');

  const assignment = await queryOne<any>(
    `SELECT ta.*, tc.code AS category_code, tc.name AS category_name,
            tc.time_per_question_seconds, tc.total_time_seconds,
            c.user_id, c.id AS candidate_id
     FROM test_assignments ta
     JOIN test_categories tc ON tc.id = ta.category_id
     JOIN candidates c ON c.id = ta.candidate_id
     WHERE ta.access_token = ?`,
    [token]
  );

  if (!assignment) throw error(404, 'Token tes tidak valid');
  if (assignment.user_id !== user.id) throw error(403, 'Token bukan milik Anda');
  if (assignment.is_used) throw error(400, 'Token sudah digunakan');
  if (new Date(assignment.expires_at) < new Date()) throw error(400, 'Token sudah kedaluwarsa');

  let session = await queryOne<any>(
    `SELECT * FROM test_sessions
     WHERE candidate_id = ? AND category_id = ? AND status = 'in_progress'
     ORDER BY id DESC LIMIT 1`,
    [assignment.candidate_id, assignment.category_id]
  );

  if (!session) {
    const result = await execute(
      `INSERT INTO test_sessions (candidate_id, category_id, status) VALUES (?, ?, 'in_progress')`,
      [assignment.candidate_id, assignment.category_id]
    );
    session = { id: result.insertId, started_at: new Date().toISOString() };
  }

  // Hitung sisa waktu
  const totalTime = Number(assignment.total_time_seconds) || 0;
  const startedAt = session.started_at ? new Date(session.started_at).getTime() : Date.now();
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  const remainingSeconds = Math.max(0, totalTime - elapsed);

  let questions: any[] = [];
  if (assignment.category_code === 'INTEL') {
    questions = await query<any>(
      `SELECT id, question_text, image_url, option_a, option_b, option_c, option_d
       FROM intelligence_questions WHERE is_active = 1 ORDER BY order_number, id`
    );
  } else {
    questions = await query<any>(
      `SELECT id, question_text FROM personality_questions WHERE is_active = 1 ORDER BY order_number, id`
    );
    for (const q of questions) {
      q.options = await query<any>(
        `SELECT option_label, statement_text FROM personality_options WHERE question_id = ? ORDER BY option_label`,
        [q.id]
      );
    }
  }

  // Load saved answers
  let savedAnswers: any[] = [];
  if (assignment.category_code === 'INTEL') {
    savedAnswers = await query<any>(
      `SELECT question_id, selected_answer FROM intelligence_answers WHERE session_id = ?`,
      [session.id]
    );
  } else {
    savedAnswers = await query<any>(
      `SELECT question_id, selected_most, selected_least FROM personality_answers WHERE session_id = ?`,
      [session.id]
    );
  }

  return {
    session,
    assignment: {
      category_code: assignment.category_code,
      category_name: assignment.category_name,
      total_time_seconds: totalTime,
      time_per_question_seconds: Number(assignment.time_per_question_seconds) || 0
    },
    questions,
    savedAnswers,
    remainingSeconds
  };
};