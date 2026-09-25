import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queryOne, execute } from '$lib/server/db';
import { verifyPassword, signToken } from '$lib/server/auth';
import { setFlash } from '$lib/server/flash';

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) throw redirect(303, '/dashboard');
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const username = String(data.get('username') || '').trim();
    const password = String(data.get('password') || '');

    if (!username || !password) {
      setFlash(cookies, 'error', 'Username dan password wajib diisi');
      return fail(400, { error: 'Username dan password wajib diisi', username });
    }

    const user = await queryOne<any>(
      `SELECT u.id, u.username, u.email, u.password_hash, u.full_name, u.is_active, r.name AS role
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.username = ? OR u.email = ? LIMIT 1`,
      [username, username]
    );

    if (!user) {
      setFlash(cookies, 'error', 'Username atau password salah');
      return fail(401, { error: 'Username atau password salah', username });
    }

    if (!user.is_active) {
      setFlash(cookies, 'error', 'Akun Anda tidak aktif. Hubungi administrator.');
      return fail(403, { error: 'Akun tidak aktif', username });
    }

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      setFlash(cookies, 'error', 'Username atau password salah');
      return fail(401, { error: 'Username atau password salah', username });
    }

    await execute(`UPDATE users SET last_login = NOW() WHERE id = ?`, [user.id]);

    const token = signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      fullName: user.full_name
    });

    cookies.set('session_token', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8
    });

    // ✅ FLASH: Login sukses
    setFlash(cookies, 'success', `Selamat datang, ${user.full_name}!`);

    throw redirect(303, '/dashboard');
  }
};