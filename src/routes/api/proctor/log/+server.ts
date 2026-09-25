import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { execute } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { session_id, event_type, severity, score_delta, detail } = body;

  if (!session_id || !event_type) {
    return json({ error: 'Invalid payload' }, { status: 400 });
  }

  // Insert log
  await execute(
    `INSERT INTO proctoring_logs (session_id, event_type, severity, score_delta, detail)
     VALUES (?, ?, ?, ?, ?)`,
    [session_id, event_type, severity || 'warning', score_delta || 0, detail || null]
  );

  // Update skor integritas di test_sessions
  await execute(
    `UPDATE test_sessions
     SET integrity_score = GREATEST(0, integrity_score + ?),
         violation_count = violation_count + 1
     WHERE id = ?`,
    [score_delta || 0, session_id]
  );

  // Ambil skor terbaru
  const result = await execute(`SELECT integrity_score FROM test_sessions WHERE id = ?`, [session_id]);

  return json({ success: true });
};