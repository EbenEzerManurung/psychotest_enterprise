import type { PageServerLoad } from './$types';
import { query } from '$lib/server/db';
import { requirePermission } from '$lib/server/guard';
import { PERMISSIONS } from '$lib/rbac';

export const load: PageServerLoad = async ({ locals }) => {
  requirePermission(locals, PERMISSIONS.RESULT_EXPORT);

  const summary = await query<any>(
    `SELECT u.full_name, c.position_applied, c.status,
       (SELECT percentage FROM test_sessions ts
         JOIN test_categories tc ON tc.id = ts.category_id
         WHERE ts.candidate_id = c.id AND tc.code = 'INTEL' AND ts.status = 'completed'
         ORDER BY ts.finished_at DESC LIMIT 1) AS intel_pct,
       (SELECT percentage FROM test_sessions ts
         JOIN test_categories tc ON tc.id = ts.category_id
         WHERE ts.candidate_id = c.id AND tc.code = 'PERSONALITY' AND ts.status = 'completed'
         ORDER BY ts.finished_at DESC LIMIT 1) AS personality_pct,
       pr.integrity_score, pr.conflict_mgmt_score, pr.conviction_score,
       pr.creativity_score, pr.teamwork_score, pr.interpersonal_score
     FROM candidates c
     JOIN users u ON u.id = c.user_id
     LEFT JOIN personality_results pr ON pr.candidate_id = c.id
     ORDER BY u.full_name`
  );

  const avgScores = await query<any>(
    `SELECT AVG(percentage) AS avg_intel FROM test_sessions ts
     JOIN test_categories tc ON tc.id = ts.category_id
     WHERE tc.code = 'INTEL' AND ts.status = 'completed'`
  );

  return { summary, avgScores: avgScores[0] ?? { avg_intel: 0 } };
};