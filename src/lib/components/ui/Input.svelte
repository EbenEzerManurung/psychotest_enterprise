<script lang="ts">
  let {
    label = '',
    type = 'text',
    value = $bindable(''),
    name = '',
    placeholder = '',
    required = false,
    error = '',
    disabled = false
  }: {
    label?: string;
    type?: string;
    value?: string | number;
    name?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
  } = $props();
</script>

<div class="space-y-1">
  {#if label}
    <label for={name} class="block text-sm font-medium text-primary-900">
      {label} {#if required}<span class="text-red-500">*</span>{/if}
    </label>
  {/if}
  <input
    id={name}
    {name}
    {type}
    {placeholder}
    {required}
    {disabled}
    bind:value
    class="w-full rounded-lg border border-primary-200 px-3 py-2 text-sm placeholder:text-slate-400
      focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20
      disabled:bg-primary-50 {error ? 'border-red-500' : ''}"
  />
  {#if error}<p class="text-xs text-red-500">{error}</p>{/if}
</div>