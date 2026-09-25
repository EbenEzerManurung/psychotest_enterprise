import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { execute } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
  const { session_id } = await request.json();
  if (!session_id) return json({ error: 'Invalid payload' }, { status: 400 });

  await execute(
    `UPDATE test_sessions SET camera_enabled = 1 WHERE id = ?`,
    [session_id]
  );
  return json({ success: true });
};