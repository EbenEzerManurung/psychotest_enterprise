<script lang="ts">
  let {
    type = 'info',
    message = '',
    dismissible = true,
    onDismiss
  }: {
    type?: 'success' | 'error' | 'info' | 'warning';
    message: string;
    dismissible?: boolean;
    onDismiss?: () => void;
  } = $props();

  const styles: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-300',
      text: 'text-green-800',
      icon: '✅'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      text: 'text-red-800',
      icon: '❌'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      text: 'text-amber-800',
      icon: '⚠️'
    },
    info: {
      bg: 'bg-primary-50',
      border: 'border-primary-300',
      text: 'text-primary-800',
      icon: 'ℹ️'
    }
  };

  const s = $derived(styles[type] ?? styles.info);
</script>

<div
  class="flex items-start gap-3 rounded-xl border-2 px-4 py-3 shadow-sm {s.bg} {s.border}"
  role="alert"
>
  <span class="shrink-0 text-lg">{s.icon}</span>
  <p class="flex-1 text-sm font-medium {s.text}">{message}</p>
  {#if dismissible}
    <button
      type="button"
      onclick={() => onDismiss?.()}
      class="shrink-0 rounded-md p-1 {s.text} opacity-60 transition hover:opacity-100"
      aria-label="Tutup"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  {/if}
</div>