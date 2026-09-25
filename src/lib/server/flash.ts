import type { Cookies } from '@sveltejs/kit';

export type FlashType = 'success' | 'error' | 'info' | 'warning';

export interface FlashMessage {
  type: FlashType;
  message: string;
}

/**
 * Set flash message ke cookie.
 * Cookie akan auto-hilang setelah dibaca (di hooks.server.ts).
 */
export function setFlash(
  cookies: Cookies,
  type: FlashType,
  message: string
): void {
  cookies.set('flash', JSON.stringify({ type, message }), {
    path: '/',
    httpOnly: false, // biar bisa dibaca client-side juga
    sameSite: 'lax',
    maxAge: 10 // 10 detik — cukup untuk 1 redirect
  });
}

/**
 * Read & clear flash message dari cookie.
 */
export function readFlash(cookies: Cookies): FlashMessage | null {
  const raw = cookies.get('flash');
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as FlashMessage;
    // Auto-delete setelah dibaca
    cookies.delete('flash', { path: '/' });
    return parsed;
  } catch {
    cookies.delete('flash', { path: '/' });
    return null;
  }
}