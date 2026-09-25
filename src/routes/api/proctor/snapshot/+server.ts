import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { execute } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const { session_id, image_data, reason } = await request.json();

  if (!session_id || !image_data) {
    return json({ error: 'Invalid payload' }, { status: 400 });
  }

  await execute(
    `INSERT INTO proctoring_snapshots (session_id, image_data, reason)
     VALUES (?, ?, ?)`,
    [session_id, image_data, reason || 'periodic']
  );

  return json({ success: true });
};