<script lang="ts">
  let {
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled = false,
    loading = false,
    onclick,
    children,
    class: className = ''
  }: {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
    size?: 'sm' | 'md' | 'lg';
    type?: 'button' | 'submit';
    disabled?: boolean;
    loading?: boolean;
    onclick?: (e: MouseEvent) => void;
    children: any;
    class?: string;
  } = $props();

  const variants: Record<string, string> = {
    primary: 'bg-primary-700 text-white hover:bg-primary-800 focus:ring-primary-500',
    secondary: 'bg-white text-primary-800 border border-primary-300 hover:bg-primary-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-primary-600 text-white hover:bg-primary-700',
    ghost: 'bg-transparent text-primary-700 hover:bg-primary-50'
  };
  const sizes: Record<string, string> = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };
</script>

<button
  {type}
  disabled={disabled || loading}
  onclick={onclick}
  class="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1
    {variants[variant]} {sizes[size]} {className}"
>
  {#if loading}
    <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
    </svg>
  {/if}
  {@render children()}
</button>