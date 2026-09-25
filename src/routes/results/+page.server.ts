import type { PageServerLoad } from './$types';
import { query, queryOne } from '$lib/server/db';
import { requireAuth } from '$lib/server/guard';

export const load: PageServerLoad = async ({ locals }) => {
  const user = requireAuth(locals);

  if (user.role === 'candidate') {
    const candidate = await queryOne<any>(`SELECT id FROM candidates WHERE user_id = ?`, [user.id]);
    const cid = candidate?.id ?? 0;
    const sessions = await query<any>(
      `SELECT ts.*, u.full_name AS candidate_name, c.position_applied,
              tc.name AS category_name, tc.code AS category_code
       FROM test_sessions ts
       JOIN candidates c ON c.id = ts.candidate_id
       JOIN users u ON u.id = c.user_id
       JOIN test_categories tc ON tc.id = ts.category_id
       WHERE ts.candidate_id = ? ORDER BY ts.started_at DESC`,
      [cid]
    );
    return { sessions };
  }

  const sessions = await query<any>(
    `SELECT ts.*, u.full_name AS candidate_name, c.position_applied,
            tc.name AS category_name, tc.code AS category_code
     FROM test_sessions ts
     JOIN candidates c ON c.id = ts.candidate_id
     JOIN users u ON u.id = c.user_id
     JOIN test_categories tc ON tc.id = ts.category_id
     ORDER BY ts.started_at DESC`
  );
  return { sessions };
};