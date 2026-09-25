import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { query, queryOne } from '$lib/server/db';
import { requireAuth } from '$lib/server/guard';

export const load: PageServerLoad = async ({ locals }) => {
  const user = requireAuth(locals);

  const candidate = await queryOne<any>(
    `SELECT c.*, u.full_name FROM candidates c
     JOIN users u ON u.id = c.user_id WHERE c.user_id = ?`,
    [user.id]
  );
  if (!candidate) throw redirect(303, '/dashboard');

  const assignments = await query<any>(
    `SELECT ta.id, ta.access_token, ta.expires_at, tc.name AS category_name, tc.code AS category_code
     FROM test_assignments ta
     JOIN test_categories tc ON tc.id = ta.category_id
     WHERE ta.candidate_id = ? AND ta.is_used = 0 AND ta.expires_at > NOW()
     ORDER BY ta.created_at DESC`,
    [candidate.id]
  );

  return { candidate, assignments };
};