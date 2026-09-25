<script lang="ts">
  let {
    label = '',
    value = $bindable(''),
    options = [],
    name = '',
    required = false,
    placeholder = '-- Pilih --',
    error = ''
  }: {
    label?: string;
    value?: string | number;
    options: { value: string | number; label: string }[];
    name?: string;
    required?: boolean;
    placeholder?: string;
    error?: string;
  } = $props();
</script>

<div class="space-y-1">
  {#if label}
    <label for={name} class="block text-sm font-medium text-primary-900">
      {label} {#if required}<span class="text-red-500">*</span>{/if}
    </label>
  {/if}
  <select
    id={name}
    {name}
    bind:value
    {required}
    class="w-full rounded-lg border border-primary-200 bg-white px-3 py-2 text-sm
      focus:border-primary-500 focus:outline-none {error ? 'border-red-500' : ''}"
  >
    <option value="">{placeholder}</option>
    {#each options as opt}
      <option value={opt.value}>{opt.label}</option>
    {/each}
  </select>
  {#if error}<p class="text-xs text-red-500">{error}</p>{/if}
</div>