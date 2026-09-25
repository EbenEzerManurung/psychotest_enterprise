<script lang="ts">
  let {
    open = $bindable(false),
    title = '',
    size = 'md',
    children
  }: {
    open: boolean;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    children: any;
  } = $props();

  const sizes: Record<string, string> = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  function onKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') open = false;
  }
</script>

<svelte:window on:keydown={onKey} />

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/50" onclick={() => (open = false)} role="presentation"></div>
    <div class="relative max-h-[90vh] w-full {sizes[size]} overflow-hidden rounded-xl bg-white shadow-2xl">
      <div class="flex items-center justify-between border-b border-primary-200 px-5 py-3">
        <h2 class="text-lg font-semibold text-primary-900">{title}</h2>
        <button onclick={() => (open = false)} aria-label="Tutup modal" class="rounded-lg p-1 text-slate-400 hover:bg-primary-50">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="max-h-[70vh] overflow-y-auto p-5">
        {@render children()}
      </div>
    </div>
  </div>
{/if}