<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import Sidebar from '$components/layout/Sidebar.svelte';
  import Header from '$components/layout/Header.svelte';
  import Alert from '$components/ui/Alert.svelte';

  let { data, children } = $props();

  let sidebarOpen: boolean = $state(false);
  let flash = $state<{ type: string; message: string } | null>(null);

  const isPublicPage: boolean = $derived(
    $page.url.pathname === '/login' || $page.url.pathname === '/'
  );
  const showSidebar: boolean = $derived(!isPublicPage && !!data.user);

  // Set flash dari server data
  $effect(() => {
    if (data.flash) {
      flash = data.flash;
      const timer = setTimeout(() => {
        flash = null;
      }, 5000);
      return () => clearTimeout(timer);
    }
  });
</script>

<!-- FLASH ALERT — overlay di atas semua -->
{#if flash}
  <div class="fixed left-1/2 top-4 z-[100] w-full max-w-md -translate-x-1/2 px-4">
    <Alert
      type={flash.type as any}
      message={flash.message}
      onDismiss={() => (flash = null)}
    />
  </div>
{/if}

<!-- LAYOUT UTAMA -->
{#if showSidebar}
  <div class="flex h-screen overflow-hidden bg-primary-50">
    <Sidebar user={data.user} bind:open={sidebarOpen} />
    <div class="flex flex-1 flex-col overflow-hidden">
      <Header user={data.user} onToggleSidebar={() => (sidebarOpen = !sidebarOpen)} />
      <main class="flex-1 overflow-y-auto p-4 md:p-6">
        {@render children()}
      </main>
    </div>
  </div>
{:else}
  {@render children()}
{/if}