import type { Handle } from '@sveltejs/kit';
import { verifyToken } from '$lib/server/auth';
import { readFlash } from '$lib/server/flash';

export const handle: Handle = async ({ event, resolve }) => {
  // ============================================
  // 1. CEK AUTH TOKEN
  // ============================================
  const token = event.cookies.get('session_token');

  if (token) {
    try {
      const payload = verifyToken(token);
      event.locals.user = {
        id: payload.userId,
        username: payload.username,
        role: payload.role,
        fullName: payload.fullName
      };
    } catch {
      event.cookies.delete('session_token', { path: '/' });
      event.locals.user = null;
    }
  } else {
    event.locals.user = null;
  }

  // ============================================
  // 2. BACA FLASH MESSAGE
  // ============================================
  event.locals.flash = readFlash(event.cookies);

  return resolve(event);
};