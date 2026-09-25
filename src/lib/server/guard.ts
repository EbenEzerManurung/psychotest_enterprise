import { redirect } from '@sveltejs/kit';
import { hasPermission } from '$lib/rbac';

export function requireAuth(locals: App.Locals): NonNullable<App.Locals['user']> {
  if (!locals.user) {
    throw redirect(303, '/login');
  }
  return locals.user;
}

export function requirePermission(
  locals: App.Locals,
  permission: string
): NonNullable<App.Locals['user']> {
  const user = requireAuth(locals);
  if (!hasPermission(user.role, permission)) {
    throw redirect(303, '/dashboard?error=forbidden');
  }
  return user;
}
