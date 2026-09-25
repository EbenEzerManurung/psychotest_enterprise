<script lang="ts">
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Ikuti Tes</title></svelte:head>

<div class="mx-auto max-w-3xl space-y-5">
  <div class="rounded-2xl bg-gradient-to-br from-primary-700 to-primary-800 p-6 text-white shadow-lg">
    <h2 class="text-2xl font-bold">Daftar Tes Tersedia</h2>
    <p class="mt-1 text-sm text-primary-100">Kandidat: {data.candidate.full_name}</p>
    <p class="text-sm text-primary-100">Posisi: {data.candidate.position_applied ?? '-'}</p>
  </div>

  {#if data.assignments.length > 0}
    {#each data.assignments as a}
      <div class="rounded-xl border-2 border-primary-200 bg-white p-6 transition hover:border-primary-500 hover:shadow-md">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-2xl">
              {a.category_code === 'INTEL' ? '🧠' : '💚'}
            </div>
            <div>
              <h3 class="font-semibold text-primary-900">{a.category_name}</h3>
              <p class="text-xs text-slate-500">
                ⏰ Berlaku hingga {new Date(a.expires_at).toLocaleString('id-ID')}
              </p>
            </div>
          </div>
          <a href={`/test/take?token=${a.access_token}`}
            class="rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-800">
            Mulai Tes →
          </a>
        </div>
      </div>
    {/each}
  {:else}
    <div class="rounded-xl border border-dashed border-primary-300 bg-white p-12 text-center">
      <p class="text-sm text-slate-500">Belum ada tes yang tersedia untuk Anda</p>
    </div>
  {/if}
</div>