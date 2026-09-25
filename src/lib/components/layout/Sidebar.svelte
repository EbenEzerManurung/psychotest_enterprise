<script lang="ts">
  import { page } from '$app/stores';
  import { MENU_ITEMS, hasPermission } from '$lib/rbac';

  let {
    user,
    open = $bindable(false)
  }: { user: any; open: boolean } = $props();

  // ✅ FILTER MENU:
  // 1. Menu "Ikuti Tes" (/test) HANYA untuk kandidat
  // 2. Menu lain dicek lewat hasPermission sesuai role
  const allowedMenus = $derived(
    MENU_ITEMS.filter((m) => {
      // Menu "Ikuti Tes" hanya untuk kandidat
      if (m.href === '/test' && user.role !== 'candidate') {
        return false;
      }
      // Cek permission biasa
      return hasPermission(user.role, m.permission);
    })
  );

  const iconMap: Record<string, string> = {
    home: 'M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10',
    users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    briefcase: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    brain: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    heart: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    report: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
  };
</script>

{#if open}
  <div class="fixed inset-0 z-30 bg-black/40 md:hidden" onclick={() => (open = false)} role="presentation"></div>
{/if}

<aside class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-primary-800 text-primary-50 transition-transform
  {open ? 'translate-x-0' : '-translate-x-full'} md:static md:translate-x-0">
  <div class="flex h-16 items-center border-b border-primary-700 px-6">
    <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 font-bold text-white">P</div>
    <span class="ml-3 text-lg font-semibold">Psychotest</span>
  </div>

  <nav class="flex-1 space-y-1 overflow-y-auto p-4">
    {#each allowedMenus as item (item.href)}
      {@const isActive =
        $page.url.pathname === item.href ||
        ($page.url.pathname.startsWith(item.href) && item.href !== '/dashboard')}
      <a href={item.href} onclick={() => (open = false)}
        class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
          {isActive ? 'bg-primary-600 text-white' : 'text-primary-100 hover:bg-primary-700 hover:text-white'}">
        <svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={iconMap[item.icon]} />
        </svg>
        <span>{item.label}</span>
      </a>
    {/each}
  </nav>

  <div class="border-t border-primary-700 p-4">
    <div class="flex items-center gap-3">
      <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold">
        {user?.fullName?.charAt(0) ?? 'U'}
      </div>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium">{user?.fullName}</p>
        <p class="truncate text-xs capitalize text-primary-200">{user?.role}</p>
      </div>
    </div>
  </div>
</aside>