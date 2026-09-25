<script lang="ts">
  let {
    open = $bindable(false),
    title = 'Konfirmasi',
    message = '',
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    variant = 'warning',
    onConfirm,
    onCancel
  }: {
    open: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'warning' | 'danger' | 'primary';
    onConfirm: () => void;
    onCancel?: () => void;
  } = $props();

  const variants: Record<string, string> = {
    warning: 'bg-amber-500 hover:bg-amber-600',
    danger: 'bg-red-600 hover:bg-red-700',
    primary: 'bg-primary-700 hover:bg-primary-800'
  };

  const iconBg: Record<string, string> = {
    warning: 'bg-amber-100',
    danger: 'bg-red-100',
    primary: 'bg-primary-100'
  };

  const iconChar: Record<string, string> = {
    warning: '❓',
    danger: '⚠️',
    primary: 'ℹ️'
  };

  function handleCancel(): void {
    open = false;
    onCancel?.();
  }

  function handleConfirm(): void {
    open = false;
    onConfirm();
  }
</script>

{#if open}
  <div class="fixed inset-0 z-[200] flex items-center justify-center p-4">
    <div
      class="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onclick={handleCancel}
      role="presentation"
    ></div>
    <div class="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
      <div class="text-center">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full {iconBg[variant]}">
          <span class="text-2xl">{iconChar[variant]}</span>
        </div>
        <h2 class="mt-4 text-lg font-bold text-primary-900">{title}</h2>
        <p class="mt-2 text-sm text-slate-600">{message}</p>
      </div>
      <div class="mt-5 flex gap-3">
        <button
          type="button"
          onclick={handleCancel}
          class="flex-1 rounded-lg border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onclick={handleConfirm}
          class="flex-1 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition {variants[variant]}"
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}
