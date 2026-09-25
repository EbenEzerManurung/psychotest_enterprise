import type { PageServerLoad } from './$types';
import { query, queryOne } from '$lib/server/db';
import { requireAuth } from '$lib/server/guard';

export const load: PageServerLoad = async ({ locals }) => {
  const user = requireAuth(locals);

  // ============================================
  // DASHBOARD KANDIDAT
  // ============================================
  if (user.role === 'candidate') {
    const candidate = await queryOne<any>(
      `SELECT c.*, u.full_name, u.email
       FROM candidates c
       JOIN users u ON u.id = c.user_id
       WHERE c.user_id = ?`,
      [user.id]
    );

    // Tes yang tersedia — dengan info countdown & durasi
    const assignments = candidate
      ? await query<any>(
          `SELECT
             ta.id,
             ta.access_token,
             ta.expires_at,
             ta.created_at,
             tc.name AS category_name,
             tc.code AS category_code,
             tc.time_per_question_seconds,
             tc.total_time_seconds,
             TIMESTAMPDIFF(SECOND, NOW(), ta.expires_at) AS seconds_left
           FROM test_assignments ta
           JOIN test_categories tc ON tc.id = ta.category_id
           WHERE ta.candidate_id = ?
             AND ta.is_used = 0
             AND ta.expires_at > NOW()
           ORDER BY ta.expires_at ASC`,
          [candidate.id]
        )
      : [];

    // Hasil tes kandidat — dengan category_code untuk emoji
    const myResults = candidate
      ? await query<any>(
          `SELECT
             ts.id,
             ts.percentage,
             ts.status,
             ts.started_at,
             ts.finished_at,
             ts.total_score,
             ts.max_score,
             ts.time_spent_seconds,
             tc.name AS category_name,
             tc.code AS category_code
           FROM test_sessions ts
           JOIN test_categories tc ON tc.id = ts.category_id
           WHERE ts.candidate_id = ?
           ORDER BY ts.finished_at DESC, ts.started_at DESC
           LIMIT 10`,
          [candidate.id]
        )
      : [];

    return {
      role: user.role,
      candidate,
      assignments,
      myResults
    };
  }

  // ============================================
  // DASHBOARD HR / SUPERADMIN
  // ============================================
  const [totalUsers, totalCandidates, totalQuestions, completedTests] = await Promise.all([
    queryOne<any>(`SELECT COUNT(*) AS c FROM users`),
    queryOne<any>(`SELECT COUNT(*) AS c FROM candidates`),
    queryOne<any>(
      `SELECT (SELECT COUNT(*) FROM intelligence_questions)
            + (SELECT COUNT(*) FROM personality_questions) AS c`
    ),
    queryOne<any>(`SELECT COUNT(*) AS c FROM test_sessions WHERE status = 'completed'`)
  ]);

  const recentSessions = await query<any>(
    `SELECT ts.id, ts.percentage, ts.status, ts.started_at,
            u.full_name AS candidate_name, tc.name AS category_name
     FROM test_sessions ts
     JOIN candidates c ON c.id = ts.candidate_id
     JOIN users u ON u.id = c.user_id
     JOIN test_categories tc ON tc.id = ts.category_id
     ORDER BY ts.started_at DESC LIMIT 8`
  );

  const intelAvg = await queryOne<any>(
    `SELECT AVG(percentage) AS avg FROM test_sessions ts
     JOIN test_categories tc ON tc.id = ts.category_id
     WHERE tc.code = 'INTEL' AND ts.status = 'completed'`
  );

  const personalityAvg = await query<any>(
    `SELECT
       AVG(integrity_score) AS integritas,
       AVG(teamwork_score) AS teamwork,
       AVG(creativity_score) AS kreativitas,
       AVG(conflict_mgmt_score) AS konflik,
       AVG(conviction_score) AS pendirian,
       AVG(interpersonal_score) AS interpersonal
     FROM personality_results`
  );

  return {
    role: user.role,
    stats: {
      totalUsers: totalUsers?.c ?? 0,
      totalCandidates: totalCandidates?.c ?? 0,
      totalQuestions: totalQuestions?.c ?? 0,
      completedTests: completedTests?.c ?? 0
    },
    recentSessions,
    intelAvg: Number(intelAvg?.avg ?? 0).toFixed(1),
    personalityAvg: personalityAvg[0] ?? {}
  };
};