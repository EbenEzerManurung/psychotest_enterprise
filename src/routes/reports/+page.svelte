<script lang="ts">
  import type { PageData } from './$types';
  import Button from '$components/ui/Button.svelte';
  import Badge from '$components/ui/Badge.svelte';

  let { data }: { data: PageData } = $props();
  let exporting: boolean = $state(false);

  async function exportExcel(): Promise<void> {
    exporting = true;
    try {
      const res = await fetch('/api/export');
      if (!res.ok) throw new Error('Gagal export');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `psikotest-report-${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert('Gagal export: ' + e.message);
    } finally {
      exporting = false;
    }
  }

  function statusVariant(s: string): any {
    return ({ registered: 'info', testing: 'warning', completed: 'success', hired: 'success', rejected: 'danger' } as any)[s] ?? 'default';
  }

  const completedCount: number = $derived(data.summary.filter((s: any) => s.intel_pct !== null).length);
</script>

<svelte:head><title>Laporan</title></svelte:head>

<div class="space-y-6">
  <div class="flex flex-col justify-between gap-3 md:flex-row md:items-center">
    <div>
      <h2 class="text-xl font-bold text-primary-900">Laporan Hasil Test</h2>
      <p class="text-sm text-slate-500">Rekap seluruh hasil test calon karyawan</p>
    </div>
    <Button onclick={exportExcel} loading={exporting}>📥 Export Excel</Button>
  </div>

  <div class="grid gap-4 md:grid-cols-3">
    <div class="rounded-xl border border-primary-200 bg-white p-5">
      <p class="text-xs font-medium text-slate-500">Rata-rata Skor Intellegensi</p>
      <p class="mt-2 text-3xl font-bold text-primary-800">{Number(data.avgScores?.avg_intel ?? 0).toFixed(1)}%</p>
    </div>
    <div class="rounded-xl border border-primary-200 bg-white p-5">
      <p class="text-xs font-medium text-slate-500">Total Kandidat</p>
      <p class="mt-2 text-3xl font-bold text-primary-800">{data.summary.length}</p>
    </div>
    <div class="rounded-xl border border-primary-200 bg-white p-5">
      <p class="text-xs font-medium text-slate-500">Sudah Menyelesaikan Tes</p>
      <p class="mt-2 text-3xl font-bold text-primary-800">{completedCount}</p>
    </div>
  </div>

  <div class="overflow-hidden rounded-xl border border-primary-200 bg-white shadow-sm">
    <table class="w-full">
      <thead class="bg-primary-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Nama</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Posisi</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Intellegensi</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Kepribadian</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Integritas</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Teamwork</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Status</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-primary-100">
        {#each data.summary as s}
          <tr class="hover:bg-primary-50/50">
            <td class="px-4 py-3 text-sm font-medium text-primary-900">{s.full_name}</td>
            <td class="px-4 py-3 text-sm text-slate-600">{s.position_applied ?? '-'}</td>
            <td class="px-4 py-3 text-sm font-semibold text-primary-800">
              {s.intel_pct !== null ? `${Number(s.intel_pct).toFixed(1)}%` : '-'}
            </td>
            <td class="px-4 py-3 text-sm font-semibold text-primary-800">
              {s.personality_pct !== null ? `${Number(s.personality_pct).toFixed(1)}%` : '-'}
            </td>
            <td class="px-4 py-3 text-sm text-slate-700">{s.integrity_score ?? '-'}</td>
            <td class="px-4 py-3 text-sm text-slate-700">{s.teamwork_score ?? '-'}</td>
            <td class="px-4 py-3"><Badge variant={statusVariant(s.status)}>{s.status}</Badge></td>
          </tr>
        {:else}
          <tr><td colspan="7" class="px-4 py-10 text-center text-sm text-slate-500">Belum ada data</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>