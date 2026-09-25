<script lang="ts">
  let {
    variant = 'default',
    children
  }: {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    children: any;
  } = $props();

  const variants: Record<string, string> = {
    default: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-primary-100 text-primary-800'
  };
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {variants[variant]}">
  {@render children()}
</span>