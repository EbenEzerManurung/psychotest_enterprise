<script lang="ts">
  import type { PageData } from './$types';
  import Badge from '$components/ui/Badge.svelte';
  import RadarChart from '$components/charts/RadarChart.svelte';

  // ✅ Type untuk proctoring log
  type ProctorLog = {
    id: number;
    event_type: string;
    severity: 'info' | 'warning' | 'critical';
    score_delta: number;
    detail: string;
    occurred_at: string;
  };

  // ✅ Extend PageData dengan field proctoring
  type DetailData = PageData & {
    proctorLogs: ProctorLog[];
    snapshotCount: number;
  };

  let { data }: { data: DetailData } = $props();

  const dims: string[] = ['integritas', 'manajemen_konflik', 'pendirian', 'kreativitas', 'teamwork', 'interpersonal'];

  const dimValues: number[] = $derived(
    data.personalityResult
      ? [
          Number(data.personalityResult.integrity_score),
          Number(data.personalityResult.conflict_mgmt_score),
          Number(data.personalityResult.conviction_score),
          Number(data.personalityResult.creativity_score),
          Number(data.personalityResult.teamwork_score),
          Number(data.personalityResult.interpersonal_score)
        ]
      : []
  );

  const maxDim: number = $derived(Math.max(10, ...dimValues) + 2);
</script>

<svelte:head><title>Detail Hasil - {data.session.candidate_name}</title></svelte:head>

<div class="space-y-6">
  <!-- Back link -->
  <a href="/results" class="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline">
    ← Kembali ke daftar hasil
  </a>

  <!-- ============================================ -->
  <!-- INTEGRITY SCORE SECTION (PROCTORING) -->
  <!-- ============================================ -->
  {#if data.session.integrity_score !== undefined && data.session.integrity_score !== null}
    {@const score = Number(data.session.integrity_score)}
    {@const level = score >= 90
      ? { label: 'Sangat Jujur', icon: '✅' }
      : score >= 75
      ? { label: 'Jujur', icon: '✅' }
      : score >= 60
      ? { label: 'Mencurigakan', icon: '⚠️' }
      : { label: 'Indikasi Curang', icon: '❌' }}

    <div
      class="rounded-2xl border-2 p-6
        {score >= 75
          ? 'border-green-200 bg-green-50'
          : score >= 60
          ? 'border-amber-200 bg-amber-50'
          : 'border-red-200 bg-red-50'}"
    >
      <div class="flex items-center justify-between">
        <h3 class="flex items-center gap-2 text-base font-bold text-primary-900">
          🛡️ Integritas Tes
        </h3>
        <span
          class="rounded-full bg-white px-3 py-1 text-xs font-semibold
            {score >= 75 ? 'text-green-700' : score >= 60 ? 'text-amber-700' : 'text-red-700'}"
        >
          {level.icon} {level.label}
        </span>
      </div>

      <div class="mt-4 grid gap-3 md:grid-cols-3">
        <div class="rounded-lg bg-white p-4 text-center shadow-sm">
          <p class="text-xs text-slate-500">Skor Integritas</p>
          <p
            class="mt-1 text-3xl font-bold
              {score >= 90
                ? 'text-green-700'
                : score >= 75
                ? 'text-primary-700'
                : score >= 60
                ? 'text-amber-700'
                : 'text-red-700'}"
          >
            {score}
          </p>
          <p class="text-[10px] text-slate-400">dari 100</p>
        </div>

        <div class="rounded-lg bg-white p-4 text-center shadow-sm">
          <p class="text-xs text-slate-500">Total Pelanggaran</p>
          <p class="mt-1 text-3xl font-bold text-primary-800">
            {data.session.violation_count ?? 0}
          </p>
          <p class="text-[10px] text-slate-400">kejadian tercatat</p>
        </div>

        <div class="rounded-lg bg-white p-4 text-center shadow-sm">
          <p class="text-xs text-slate-500">Kamera</p>
          <p class="mt-1 text-3xl font-bold {data.session.camera_enabled ? 'text-green-700' : 'text-red-700'}">
            {data.session.camera_enabled ? '✓' : '✗'}
          </p>
          <p class="text-[10px] text-slate-400">
            {data.session.camera_enabled ? 'Aktif selama tes' : 'Tidak aktif'}
          </p>
        </div>
      </div>

      {#if data.proctorLogs && data.proctorLogs.length > 0}
        <div class="mt-5">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-primary-900">
              📋 Timeline Pelanggaran ({data.proctorLogs.length})
            </p>
            {#if data.snapshotCount > 0}
              <p class="text-xs text-slate-500">
                📷 {data.snapshotCount} snapshot tersimpan
              </p>
            {/if}
          </div>
          <div class="mt-3 max-h-80 space-y-2 overflow-y-auto">
            {#each data.proctorLogs as log}
              <div class="flex items-start gap-3 rounded-lg border border-primary-100 bg-white p-3">
                <span class="text-lg">
                  {log.severity === 'critical' ? '🔴' : log.severity === 'warning' ? '⚠️' : 'ℹ️'}
                </span>
                <div class="flex-1">
                  <p class="text-sm font-medium text-primary-900">{log.detail}</p>
                  <p class="mt-0.5 text-xs text-slate-500">
                    {new Date(log.occurred_at).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                    {#if Number(log.score_delta) < 0}
                      • <span class="font-semibold text-red-700">Poin: {log.score_delta}</span>
                    {/if}
                  </p>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {:else}
        <div class="mt-5 rounded-lg bg-white p-4 text-center shadow-sm">
          <span class="text-2xl">🎉</span>
          <p class="mt-2 text-sm font-medium text-green-700">Tidak ada pelanggaran terdeteksi</p>
          <p class="mt-0.5 text-xs text-slate-500">Kandidat mengerjakan tes dengan bersih</p>
        </div>
      {/if}
    </div>
  {/if}

  <!-- ============================================ -->
  <!-- CANDIDATE INFO CARD -->
  <!-- ============================================ -->
  <div class="rounded-2xl border border-primary-200 bg-white p-6 shadow-sm">
    <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div class="flex items-center gap-4">
        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-xl font-bold text-primary-700">
          {data.session.candidate_name.charAt(0)}
        </div>
        <div>
          <h2 class="text-xl font-bold text-primary-900">{data.session.candidate_name}</h2>
          <p class="text-sm text-slate-500">{data.session.position_applied ?? '-'}</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <Badge variant="success">{data.session.status}</Badge>
        <div class="text-right">
          <p class="text-xs text-slate-500">Skor Akhir</p>
          <p class="text-2xl font-bold text-primary-800">{data.session.percentage}%</p>
        </div>
      </div>
    </div>

    <div class="mt-5 grid gap-4 border-t border-primary-100 pt-5 md:grid-cols-4">
      <div>
        <p class="text-xs text-slate-500">Kategori</p>
        <p class="mt-1 text-sm font-medium">{data.session.category_name}</p>
      </div>
      <div>
        <p class="text-xs text-slate-500">NIK</p>
        <p class="mt-1 text-sm font-medium">{data.session.nik ?? '-'}</p>
      </div>
      <div>
        <p class="text-xs text-slate-500">Pendidikan</p>
        <p class="mt-1 text-sm font-medium">{data.session.education ?? '-'}</p>
      </div>
      <div>
        <p class="text-xs text-slate-500">Durasi</p>
        <p class="mt-1 text-sm font-medium">{data.session.time_spent_seconds}s</p>
      </div>
    </div>
  </div>

  <!-- ============================================ -->
  <!-- DETAIL JAWABAN -->
  <!-- ============================================ -->
  {#if data.isIntel}
    <div class="rounded-xl border border-primary-200 bg-white">
      <div class="border-b border-primary-200 px-6 py-4">
        <h3 class="text-base font-semibold text-primary-900">Detail Jawaban Intellegensi</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-primary-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">#</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Pertanyaan</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Jawaban</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Kunci</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary-100">
            {#each data.answers as a, i}
              <tr class="hover:bg-primary-50/50">
                <td class="px-4 py-3 text-sm text-slate-500">{i + 1}</td>
                <td class="px-4 py-3 text-sm text-primary-900">{a.question_text}</td>
                <td class="px-4 py-3 text-sm font-semibold">{a.selected_answer ?? '-'}</td>
                <td class="px-4 py-3 text-sm">{a.correct_answer}</td>
                <td class="px-4 py-3">
                  {#if a.is_correct}
                    <Badge variant="success">✓ Benar</Badge>
                  {:else}
                    <Badge variant="danger">✗ Salah</Badge>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {:else}
    <!-- KEPRIBADIAN -->
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="rounded-xl border border-primary-200 bg-white p-6">
        <h3 class="mb-4 text-base font-semibold text-primary-900">Profil Kepribadian</h3>
        {#if data.personalityResult}
          <RadarChart
            labels={dims.map((d) => data.dimensionLabels[d] ?? d)}
            datasets={[{ label: 'Skor Kandidat', data: dimValues }]}
            maxValue={maxDim}
          />
        {:else}
          <p class="text-sm text-slate-500">Belum ada hasil kepribadian</p>
        {/if}
      </div>
      <div class="rounded-xl border border-primary-200 bg-white p-6">
        <h3 class="mb-4 text-base font-semibold text-primary-900">Skor per Dimensi</h3>
        {#if data.personalityResult}
          <div class="space-y-4">
            {#each dims as d}
              {@const val = dimValues[dims.indexOf(d)]}
              <div>
                <div class="flex justify-between text-sm">
                  <span class="font-medium text-primary-900">{data.dimensionLabels[d]}</span>
                  <span class="font-bold text-primary-800">{val}</span>
                </div>
                <div class="mt-1.5 h-2 overflow-hidden rounded-full bg-primary-100">
                  <div
                    class="h-full rounded-full bg-primary-600"
                    style="width: {Math.min((val / maxDim) * 100, 100)}%"
                  ></div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    {#if data.personalityResult?.character_summary}
      <div class="rounded-xl border border-primary-200 bg-gradient-to-br from-primary-50 to-white p-6">
        <h3 class="text-base font-semibold text-primary-900">📋 Deskripsi Karakter</h3>
        <div class="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">
          {data.personalityResult.character_summary}
        </div>
      </div>
    {/if}

    <div class="rounded-xl border border-primary-200 bg-white">
      <div class="border-b border-primary-200 px-6 py-4">
        <h3 class="text-base font-semibold text-primary-900">Detail Jawaban Kepribadian</h3>
      </div>
      <div class="space-y-3 p-6">
        {#each data.answers as a, i}
          <div class="rounded-lg border border-primary-100 bg-primary-50/30 p-4">
            <p class="text-sm font-medium text-primary-900">#{i + 1}. {a.question_text}</p>
            <div class="mt-3 grid gap-2 md:grid-cols-2">
              <div class="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-xs">
                <span class="font-semibold text-green-700">✓ Paling Sesuai:</span>
                <span class="font-bold text-green-800">{a.selected_most}</span>
              </div>
              <div class="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-xs">
                <span class="font-semibold text-red-700">✗ Paling Tidak Sesuai:</span>
                <span class="font-bold text-red-800">{a.selected_least}</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>