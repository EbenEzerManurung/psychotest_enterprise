<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  let { user, onToggleSidebar }: { user: any; onToggleSidebar: () => void } = $props();

  const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/users': 'Manage User',
    '/candidates': 'Data Calon Karyawan',
    '/questions/intelligence': 'Soal Tes Intellegensi',
    '/questions/personality': 'Soal Tes Kepribadian',
    '/results': 'Hasil Test Psikotes',
    '/results/detail': 'Detail Hasil Test',
    '/reports': 'Laporan & Export',
    '/test': 'Ikuti Tes Psikotes',
    '/test/take': 'Mengerjakan Tes'
  };

  const title = $derived(pageTitles[$page.url.pathname] ?? 'Psychotest Enterprise');

  let dropdownOpen: boolean = $state(false);


  async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
  // Force reload agar flash dibaca dari cookie
  window.location.href = '/login';
}

</script>

<header class="flex h-16 items-center justify-between border-b border-primary-200 bg-white px-4 md:px-6">
  <div class="flex items-center gap-3">
    <button onclick={onToggleSidebar} aria-label="Toggle sidebar" class="rounded-lg p-2 text-primary-700 hover:bg-primary-50 md:hidden">
      <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
    <h1 class="text-lg font-semibold text-primary-900">{title}</h1>
  </div>

  <div class="relative">
    <button onclick={() => (dropdownOpen = !dropdownOpen)} class="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-primary-50">
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
        {user?.fullName?.charAt(0) ?? 'U'}
      </div>
      <span class="hidden text-sm font-medium text-primary-900 md:block">{user?.fullName}</span>
    </button>

    {#if dropdownOpen}
      <div class="fixed inset-0 z-10" onclick={() => (dropdownOpen = false)} role="presentation"></div>
      <div class="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-primary-200 bg-white py-1 shadow-lg">
        <div class="border-b border-primary-100 px-4 py-2">
          <p class="text-xs text-slate-500">Masuk sebagai</p>
          <p class="truncate text-sm font-medium text-primary-900">{user?.username}</p>
        </div>
        <button onclick={logout} class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
          Logout
        </button>
      </div>
    {/if}
  </div>
</header>