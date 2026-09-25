import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { setFlash } from '$lib/server/flash';

export const POST: RequestHandler = async ({ cookies }) => {
  // Set flash sebelum hapus cookie
  setFlash(cookies, 'success', 'Anda berhasil logout. Sampai jumpa!');

  // Hapus session token
  cookies.delete('session_token', { path: '/' });

  return json({ success: true });
};