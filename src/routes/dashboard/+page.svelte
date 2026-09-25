<script lang="ts">
  import type { PageData } from './$types';
  import Badge from '$components/ui/Badge.svelte';

  let { data }: { data: PageData } = $props();

  function statusBadge(status: string): any {
    const map: Record<string, any> = {
      completed: 'success', in_progress: 'info', timeout: 'warning', abandoned: 'danger',
      registered: 'info', testing: 'warning', hired: 'success', rejected: 'danger'
    };
    return map[status] ?? 'default';
  }

  function statusLabel(s: string): string {
    return ({
      registered: 'Terdaftar', testing: 'Sedang Tes', completed: 'Selesai',
      hired: 'Diterima', rejected: 'Ditolak', in_progress: 'Berlangsung',
      timeout: 'Timeout', abandoned: 'Dibatalkan'
    } as any)[s] ?? s;
  }

  function scoreColor(p: number): string {
    if (p >= 75) return 'text-primary-700';
    if (p >= 50) return 'text-amber-700';
    return 'text-red-700';
  }
</script>

<svelte:head><title>Dashboard</title></svelte:head>

{#if data.role === 'candidate'}
  <div class="space-y-6">
    <!-- Hero kandidat -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 p-6 text-white shadow-lg">
      <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10"></div>
      <div class="absolute -bottom-10 right-16 h-24 w-24 rounded-full bg-white/5"></div>
      <div class="relative">
        <p class="text-sm text-primary-100">Selamat datang,</p>
        <h2 class="mt-1 text-2xl font-bold">{data.candidate?.full_name ?? 'Kandidat'}</h2>
        <div class="mt-3 flex flex-wrap gap-3 text-sm">
          <span class="rounded-full bg-white/20 px-3 py-1 backdrop-blur">📋 {data.candidate?.position_applied ?? '-'}</span>
          <span class="rounded-full bg-white/20 px-3 py-1 backdrop-blur">🎓 {data.candidate?.education ?? '-'}</span>
        </div>
      </div>
    </div>

    <!-- Tes yang tersedia -->
    {#if data.assignments && data.assignments.length > 0}
      <div class="rounded-xl border border-primary-200 bg-white p-5">
        <h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-primary-900">
          <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 text-primary-700">⚡</span>
          Tes yang Tersedia
        </h3>
        <div class="grid gap-4 md:grid-cols-2">
          {#each data.assignments as a}
            {@const seconds = Number(a.seconds_left ?? 0)}
            {@const days = Math.floor(seconds / 86400)}
            {@const hours = Math.floor((seconds % 86400) / 3600)}
            {@const isUrgent = seconds > 0 && seconds < 24 * 3600}
            <div class="rounded-xl border-2 {isUrgent ? 'border-red-300 bg-red-50' : 'border-primary-200 bg-gradient-to-br from-primary-50 to-white'} p-5 transition hover:shadow-md">
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1">
                  <p class="text-base font-semibold text-primary-900">
                    {a.category_code === 'INTEL' ? '🧠' : '💚'} {a.category_name}
                  </p>
                  <p class="mt-1 text-xs {isUrgent ? 'font-semibold text-red-700' : 'text-primary-600'}">
                    ⏰ {#if days > 0}Sisa {days} hari {hours} jam{:else}Sisa {hours} jam{/if}
                  </p>
                  <p class="mt-0.5 text-[10px] text-slate-500">
                    s/d {new Date(a.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span class="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800">
                  {a.category_code}
                </span>
              </div>
              <a href={`/test/take?token=${a.access_token}`}
                class="mt-4 inline-flex w-full items-center justify-center rounded-lg {isUrgent ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-700 hover:bg-primary-800'} px-4 py-2.5 text-sm font-medium text-white transition">
                Mulai Tes →
              </a>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Hasil Tes Saya (TANPA tombol detail) -->
    {#if data.myResults && data.myResults.length > 0}
      <div class="rounded-xl border border-primary-200 bg-white">
        <div class="border-b border-primary-200 px-6 py-4">
          <h3 class="text-base font-semibold text-primary-900">📊 Hasil Tes Saya</h3>
          <p class="mt-1 text-xs text-slate-500">
            Hasil detail dapat diakses oleh tim HR
          </p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-primary-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase text-primary-700">Kategori</th>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase text-primary-700">Status</th>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase text-primary-700">Skor</th>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase text-primary-700">Tanggal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary-100">
              {#each data.myResults as r}
                <tr class="hover:bg-primary-50/50">
                  <td class="px-6 py-3">
                    <div class="flex items-center gap-2">
                      <span class="text-lg">
                        {r.category_code === 'INTEL' ? '🧠' : '💚'}
                      </span>
                      <span class="text-sm font-medium text-primary-900">{r.category_name}</span>
                    </div>
                  </td>
                  <td class="px-6 py-3">
                    <Badge variant={statusBadge(r.status)}>{statusLabel(r.status)}</Badge>
                  </td>
                  <td class="px-6 py-3">
                    <div class="flex items-baseline gap-2">
                      <span class="text-base font-bold {scoreColor(Number(r.percentage))}">
                        {r.percentage}%
                      </span>
                    </div>
                    <div class="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-primary-100">
                      <div class="h-full rounded-full bg-primary-600" style="width: {r.percentage}%"></div>
                    </div>
                  </td>
                  <td class="px-6 py-3 text-sm text-slate-500">
                    {new Date(r.started_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {:else}
      <div class="rounded-xl border border-dashed border-primary-300 bg-white p-10 text-center">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
          <span class="text-3xl">📊</span>
        </div>
        <p class="mt-4 text-sm font-medium text-slate-600">Belum ada hasil tes</p>
        <p class="mt-1 text-xs text-slate-500">Kerjakan tes yang tersedia untuk melihat hasil di sini</p>
      </div>
    {/if}
  </div>
{:else}
  <!-- ============================================ -->
  <!-- DASHBOARD HR / SUPERADMIN -->
  <!-- ============================================ -->
  <div class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {#each [
        { label: 'Total Pengguna', value: data.stats?.totalUsers, icon: '👥' },
        { label: 'Total Kandidat', value: data.stats?.totalCandidates, icon: '💼' },
        { label: 'Total Soal', value: data.stats?.totalQuestions, icon: '📝' },
        { label: 'Tes Selesai', value: data.stats?.completedTests, icon: '✅' }
      ] as stat}
        <div class="rounded-xl border border-primary-200 bg-white p-5 transition hover:shadow-md">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-xl">{stat.icon}</div>
          <p class="mt-3 text-xs font-medium text-slate-500">{stat.label}</p>
          <p class="mt-1 text-2xl font-bold text-primary-900">{stat.value}</p>
        </div>
      {/each}
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <div class="rounded-xl border border-primary-200 bg-white p-5">
        <p class="text-sm font-medium text-slate-600">🧠 Rata-rata Skor Intellegensi</p>
        <p class="mt-2 text-3xl font-bold text-primary-800">{data.intelAvg}%</p>
        <div class="mt-3 h-2 overflow-hidden rounded-full bg-primary-100">
          <div class="h-full rounded-full bg-primary-600" style="width: {data.intelAvg}%"></div>
        </div>
      </div>

      <div class="rounded-xl border border-primary-200 bg-white p-5 lg:col-span-2">
        <p class="text-sm font-medium text-slate-600">💚 Rata-rata Profil Kepribadian</p>
        <div class="mt-3 grid grid-cols-3 gap-3 text-center">
          {#each [
            { label: 'Integritas', val: data.personalityAvg.integritas },
            { label: 'Teamwork', val: data.personalityAvg.teamwork },
            { label: 'Kreativitas', val: data.personalityAvg.kreativitas },
            { label: 'Konflik', val: data.personalityAvg.konflik },
            { label: 'Pendirian', val: data.personalityAvg.pendirian },
            { label: 'Interpersonal', val: data.personalityAvg.interpersonal }
          ] as d}
            <div class="rounded-lg bg-primary-50 p-2">
              <p class="text-xs text-slate-500">{d.label}</p>
              <p class="text-lg font-bold text-primary-800">{Number(d.val ?? 0).toFixed(1)}</p>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-primary-200 bg-white">
      <div class="flex items-center justify-between border-b border-primary-200 px-6 py-4">
        <h3 class="text-base font-semibold text-primary-900">🕒 Aktivitas Tes Terbaru</h3>
        <a href="/results" class="text-xs font-medium text-primary-700 hover:underline">Lihat Semua →</a>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-primary-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase text-primary-700">Kandidat</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase text-primary-700">Kategori</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase text-primary-700">Status</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase text-primary-700">Skor</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase text-primary-700">Tanggal</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary-100">
            {#each data.recentSessions as s}
              <tr class="hover:bg-primary-50/50">
                <td class="px-6 py-3 text-sm font-medium text-primary-900">{s.candidate_name}</td>
                <td class="px-6 py-3 text-sm text-slate-600">{s.category_name}</td>
                <td class="px-6 py-3"><Badge variant={statusBadge(s.status)}>{statusLabel(s.status)}</Badge></td>
                <td class="px-6 py-3 text-sm font-semibold text-primary-800">{s.percentage}%</td>
                <td class="px-6 py-3 text-sm text-slate-500">
                  {new Date(s.started_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="5" class="px-6 py-8 text-center text-sm text-slate-500">Belum ada aktivitas</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
{/if}