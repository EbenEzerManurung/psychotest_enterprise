import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { query, queryOne } from '$lib/server/db';
import { requireAuth } from '$lib/server/guard';
import { DIMENSION_LABELS } from '$lib/server/scoring';

export const load: PageServerLoad = async ({ url, locals }) => {
  const user = requireAuth(locals);

  // 🚫 Blokir kandidat akses halaman ini
  if (user.role === 'candidate') {
    throw error(403, 'Kandidat tidak diizinkan melihat detail hasil');
  }

  const id = Number(url.searchParams.get('id'));
  if (!id) throw error(400, 'ID tidak valid');

  const session = await queryOne<any>(
    `SELECT ts.*, u.full_name AS candidate_name, c.position_applied, c.nik, c.education,
            tc.name AS category_name, tc.code AS category_code
     FROM test_sessions ts
     JOIN candidates c ON c.id = ts.candidate_id
     JOIN users u ON u.id = c.user_id
     JOIN test_categories tc ON tc.id = ts.category_id
     WHERE ts.id = ?`,
    [id]
  );
  if (!session) throw error(404, 'Hasil tidak ditemukan');

  const isIntel = session.category_code === 'INTEL';
  let answers: any[] = [];
  let personalityResult: any = null;

  if (isIntel) {
    answers = await query<any>(
      `SELECT ia.*, iq.question_text, iq.correct_answer
       FROM intelligence_answers ia
       JOIN intelligence_questions iq ON iq.id = ia.question_id
       WHERE ia.session_id = ? ORDER BY ia.id`,
      [id]
    );
  } else {
    answers = await query<any>(
      `SELECT pa.*, pq.question_text
       FROM personality_answers pa
       JOIN personality_questions pq ON pq.id = pa.question_id
       WHERE pa.session_id = ? ORDER BY pa.id`,
      [id]
    );
    personalityResult = await queryOne<any>(
      `SELECT * FROM personality_results WHERE session_id = ?`,
      [id]
    );
  }

  // ============================================
  // ✅ PROCTORING DATA (INTEGRITY)
  // ============================================
  let proctorLogs: any[] = [];
  let snapshotCount = 0;

  try {
    proctorLogs = await query<any>(
      `SELECT id, event_type, severity, score_delta, detail, occurred_at
       FROM proctoring_logs
       WHERE session_id = ?
       ORDER BY occurred_at ASC`,
      [id]
    );

    const snapshotRow = await queryOne<any>(
      `SELECT COUNT(*) AS c FROM proctoring_snapshots WHERE session_id = ?`,
      [id]
    );
    snapshotCount = snapshotRow?.c ?? 0;
  } catch (e) {
    console.warn('Proctoring data tidak tersedia:', e);
  }

  return {
    session,
    answers,
    personalityResult,
    isIntel,
    dimensionLabels: DIMENSION_LABELS,
    proctorLogs,
    snapshotCount
  };
};