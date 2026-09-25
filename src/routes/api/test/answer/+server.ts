import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { execute, queryOne } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { session_id, question_id } = body;
  if (!session_id || !question_id) return json({ error: 'Invalid payload' }, { status: 400 });

  const session = await queryOne<any>(
    `SELECT ts.*, tc.code AS category_code FROM test_sessions ts
     JOIN test_categories tc ON tc.id = ts.category_id
     WHERE ts.id = ? AND ts.status = 'in_progress'`,
    [session_id]
  );
  if (!session) return json({ error: 'Session tidak valid' }, { status: 400 });

  if (session.category_code === 'INTEL') {
    const { selected, time_taken_seconds } = body;
    const q = await queryOne<any>(
      `SELECT correct_answer, score_weight FROM intelligence_questions WHERE id = ?`,
      [question_id]
    );
    if (!q) return json({ error: 'Soal tidak ditemukan' }, { status: 404 });

    const isCorrect = selected === q.correct_answer ? 1 : 0;
    const rawScore = isCorrect ? Number(q.score_weight) : 0;

    await execute(
      `INSERT INTO intelligence_answers (session_id, question_id, selected_answer, is_correct, raw_score, time_taken_seconds)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE selected_answer=VALUES(selected_answer), is_correct=VALUES(is_correct),
         raw_score=VALUES(raw_score), time_taken_seconds=VALUES(time_taken_seconds)`,
      [session_id, question_id, selected, isCorrect, rawScore, time_taken_seconds ?? 0]
    );
  } else {
    const { selected_most, selected_least } = body;
    if (selected_most === selected_least) {
      return json({ error: 'Pilihan tidak boleh sama' }, { status: 400 });
    }
    await execute(
      `INSERT INTO personality_answers (session_id, question_id, selected_most, selected_least, dimension_scores)
       VALUES (?, ?, ?, ?, JSON_OBJECT())
       ON DUPLICATE KEY UPDATE selected_most=VALUES(selected_most), selected_least=VALUES(selected_least)`,
      [session_id, question_id, selected_most, selected_least]
    );
  }

  return json({ success: true });
};