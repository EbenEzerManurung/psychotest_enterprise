<script lang="ts">
  import type { PageData } from './$types';
  import Badge from '$components/ui/Badge.svelte';
  import { personalityLevel, intelligenceLevel, integrityLevel } from '$lib/scoring-labels';

  let { data }: { data: PageData } = $props();

  let filterStatus = $state('');
  let search = $state('');

  const filtered = $derived(
    data.sessions.filter((s: any) => {
      const okStatus = !filterStatus || s.status === filterStatus;
      const okSearch = !search || s.candidate_name.toLowerCase().includes(search.toLowerCase());
      return okStatus && okSearch;
    })
  );

  function variant(st: string): any {
    return ({ completed: 'success', in_progress: 'info', timeout: 'warning', abandoned: 'danger' } as any)[st] ?? 'default';
  }

  function statusLabel(s: string): string {
    return ({
      completed: 'Selesai',
      in_progress: 'Berlangsung',
      timeout: 'Timeout',
      abandoned: 'Dibatalkan'
    } as any)[s] ?? s;
  }

  // Warna teks berdasarkan skor
  function scoreColor(p: number): string {
    if (p >= 75) return 'text-green-700';
    if (p >= 50) return 'text-amber-700';
    return 'text-red-700';
  }

  // Warna badge background untuk status
  function levelColor(color: string): string {
    const map: Record<string, string> = {
      green: 'bg-green-100 text-green-700 border-green-200',
      primary: 'bg-primary-100 text-primary-800 border-primary-200',
      amber: 'bg-amber-100 text-amber-700 border-amber-200',
      red: 'bg-red-100 text-red-700 border-red-200'
    };
    return map[color] ?? 'bg-slate-100 text-slate-700';
  }
</script>

<svelte:head><title>Hasil Test</title></svelte:head>

<div class="space-y-5">
  <div class="flex flex-col justify-between gap-3 md:flex-row md:items-center">
    <div>
      <h2 class="text-xl font-bold text-primary-900">Hasil Test Psikotes</h2>
      <p class="text-sm text-slate-500">Semua riwayat hasil test calon karyawan</p>
    </div>
    <div class="flex flex-wrap gap-2">
      <input
        type="search"
        bind:value={search}
        placeholder="🔍 Cari nama..."
        class="rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
      />
      <select
        bind:value={filterStatus}
        class="rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
      >
        <option value="">Semua Status</option>
        <option value="completed">Selesai</option>
        <option value="in_progress">Berlangsung</option>
        <option value="timeout">Timeout</option>
        <option value="abandoned">Dibatalkan</option>
      </select>
    </div>
  </div>

  <div class="overflow-hidden rounded-xl border border-primary-200 bg-white shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-primary-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Kandidat</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Kategori</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Status</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Skor</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Penilaian</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Integritas</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Tanggal</th>
            <th class="px-4 py-3 text-right text-xs font-semibold uppercase text-primary-700">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-primary-100">
          {#each filtered as s}
            {@const score = Number(s.percentage)}
            {@const level = s.category_code === 'INTEL'
              ? intelligenceLevel(score)
              : personalityLevel(score)}

            <tr class="hover:bg-primary-50/50">
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-primary-900">{s.candidate_name}</div>
                <div class="text-xs text-slate-500">{s.position_applied ?? '-'}</div>
              </td>

              <td class="px-4 py-3 text-sm text-slate-600">
                <div class="flex items-center gap-2">
                  <span class="text-base">
                    {s.category_code === 'INTEL' ? '🧠' : '💚'}
                  </span>
                  <span>{s.category_name}</span>
                </div>
              </td>

              <td class="px-4 py-3">
                <Badge variant={variant(s.status)}>{statusLabel(s.status)}</Badge>
              </td>

              <td class="px-4 py-3">
                <div class="flex items-baseline gap-2">
                  <span class="text-sm font-bold {scoreColor(score)}">
                    {score.toFixed(2)}%
                  </span>
                  <span class="text-xs text-slate-500">
                    ({s.total_score}/{s.max_score})
                  </span>
                </div>
                <div class="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-primary-100">
                  <div
                    class="h-full rounded-full {score >= 75
                      ? 'bg-green-600'
                      : score >= 50
                      ? 'bg-amber-500'
                      : 'bg-red-500'}"
                    style="width: {Math.min(score, 100)}%"
                  ></div>
                </div>
              </td>

              <!-- ✅ KOLOM BARU: PENILAIAN -->
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold
                    {levelColor(level.color)}"
                >
                  <span>{level.icon}</span>
                  <span>{level.label}</span>
                </span>
              </td>

              <!-- ✅ KOLOM BARU: INTEGRITAS -->
              <td class="px-4 py-3">
                {#if s.integrity_score !== null && s.integrity_score !== undefined}
                  {@const integ = Number(s.integrity_score)}
                  {@const integLevel = integrityLevel(integ)}
                  <div class="flex flex-col gap-1">
                    <span class="text-sm font-bold
                      {integ >= 75 ? 'text-green-700' : integ >= 60 ? 'text-amber-700' : 'text-red-700'}">
                      {integ}
                    </span>
                    <span
                      class="inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium
                        {levelColor(integLevel.color)}"
                    >
                      {integLevel.icon} {integLevel.label}
                    </span>
                  </div>
                {:else}
                  <span class="text-xs text-slate-400">-</span>
                {/if}
              </td>

              <td class="px-4 py-3 text-sm text-slate-500">
                {new Date(s.started_at).toLocaleString('id-ID', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </td>

              <td class="px-4 py-3 text-right">
                <a
                  href={`/results/detail?id=${s.id}`}
                  class="rounded-md px-2 py-1 text-xs font-medium text-primary-700 hover:bg-primary-50"
                >
                  Detail →
                </a>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="8" class="px-4 py-10 text-center text-sm text-slate-500">
                Belum ada hasil test
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <!-- LEGENDA -->
  <div class="rounded-xl border border-primary-200 bg-primary-50/50 p-4">
    <p class="mb-3 text-xs font-semibold text-primary-900">📖 Panduan Penilaian</p>
    <div class="grid gap-3 text-xs md:grid-cols-3">
      <div>
        <p class="font-semibold text-primary-800">🧠 Intellegensi</p>
        <ul class="mt-1 space-y-0.5 text-slate-600">
          <li>⭐ ≥ 80% — Sangat Baik</li>
          <li>✅ 65-79% — Baik</li>
          <li>➡️ 50-64% — Cukup</li>
          <li>⚠️ &lt; 50% — Kurang</li>
        </ul>
      </div>
      <div>
        <p class="font-semibold text-primary-800">💚 Kepribadian</p>
        <ul class="mt-1 space-y-0.5 text-slate-600">
          <li>⭐ ≥ 85% — Sangat Baik</li>
          <li>✅ 70-84% — Baik</li>
          <li>➡️ 55-69% — Cukup</li>
          <li>⚠️ &lt; 55% — Kurang</li>
        </ul>
      </div>
      <div>
        <p class="font-semibold text-primary-800">🛡️ Integritas</p>
        <ul class="mt-1 space-y-0.5 text-slate-600">
          <li>✅ 90-100 — Sangat Jujur</li>
          <li>✅ 75-89 — Jujur</li>
          <li>⚠️ 60-74 — Mencurigakan</li>
          <li>❌ &lt; 60 — Indikasi Curang</li>
        </ul>
      </div>
    </div>
  </div>
</div>