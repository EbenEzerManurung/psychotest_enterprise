<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
  let loading: boolean = $state(false);
</script>

<svelte:head><title>Login - Psychotest</title></svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 p-4">
  <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
    <div class="mb-6 text-center">
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary-700 text-2xl font-bold text-white">
        P
      </div>
      <h1 class="mt-4 text-2xl font-bold text-primary-900">Psychotest Enterprise</h1>
      <p class="mt-1 text-sm text-slate-500">Silakan login untuk melanjutkan</p>
    </div>

    {#if form?.error}
      <div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {form.error}
      </div>
    {/if}

    <form method="POST"
      use:enhance={() => {
        loading = true;
        return async ({ update }) => {
          await update();
          loading = false;
        };
      }}
      class="space-y-4">
      <div>
        <label for="username" class="block text-sm font-medium text-primary-900">Username / Email</label>
        <input id="username" name="username" type="text" required
          value={form?.username ?? ''}
          class="mt-1 w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          placeholder="masukkan username atau email" />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-primary-900">Password</label>
        <input id="password" name="password" type="password" required
          class="mt-1 w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          placeholder="masukkan password" />
      </div>

      <button type="submit" disabled={loading}
        class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:opacity-60">
        {loading ? 'Memproses...' : 'Login'}
      </button>
    </form>

    <div class="mt-6 rounded-lg bg-primary-50 p-3 text-xs text-primary-800">
      <p class="font-semibold">Demo Login:</p>
      <p>superadmin / password123</p>
      <p>hr / password123</p>
      <p>candidate1 / candidate123</p>
    </div>
  </div>
</div>