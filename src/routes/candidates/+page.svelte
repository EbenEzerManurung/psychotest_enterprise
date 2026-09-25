<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import { enhance } from '$app/forms';
  import Button from '$components/ui/Button.svelte';
  import Input from '$components/ui/Input.svelte';
  import Select from '$components/ui/Select.svelte';
  import Modal from '$components/ui/Modal.svelte';
  import Badge from '$components/ui/Badge.svelte';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let modalOpen: boolean = $state(false);
  let assignOpen: boolean = $state(false);
  let editMode: boolean = $state(false);
  let submitting: boolean = $state(false);
  let search: string = $state('');
  let filterStatus: string = $state('');
  let current: any = $state({});

  // ✅ Multi-category: array of category IDs
  let assignData: any = $state({
    candidate_id: 0,
    category_ids: [1, 2],       // default: kedua tes tercentang
    start_date: '',
    end_date: '',
    candidate_name: ''
  });

  const filtered = $derived(
    data.candidates.filter((c: any) => {
      const okSearch = !search || [c.full_name, c.username, c.email, c.position_applied, c.nik]
        .filter(Boolean).some((v: string) => v.toLowerCase().includes(search.toLowerCase()));
      const okStatus = !filterStatus || c.status === filterStatus;
      return okSearch && okStatus;
    })
  );

  const statusOptions = [
    { value: 'registered', label: 'Terdaftar' },
    { value: 'testing', label: 'Sedang Tes' },
    { value: 'completed', label: 'Selesai' },
    { value: 'hired', label: 'Diterima' },
    { value: 'rejected', label: 'Ditolak' }
  ];

  // Kategori yang dipilih
  const selectedCategories = $derived(
    data.categories.filter((c: any) => assignData.category_ids.includes(c.id))
  );

  // Hitung total hari dari range
  const totalDays = $derived.by(() => {
    if (!assignData.start_date || !assignData.end_date) return 0;
    const start = new Date(assignData.start_date);
    const end = new Date(assignData.end_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    const diff = end.getTime() - start.getTime();
    return diff > 0 ? Math.ceil(diff / 86400000) : 0;
  });

  const isDurationValid = $derived(totalDays >= 1 && totalDays <= 90);
  const hasAtLeastOneCategory = $derived(assignData.category_ids.length > 0);

  // Toggle pilih kategori
  function toggleCategory(id: number): void {
    const idx = assignData.category_ids.indexOf(id);
    if (idx >= 0) {
      assignData.category_ids = assignData.category_ids.filter((x: number) => x !== id);
    } else {
      assignData.category_ids = [...assignData.category_ids, id];
    }
  }

  // Format datetime-local
  function toLocalInput(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  // Set preset durasi
  function setPreset(days: number): void {
    const now = new Date();
    const end = new Date(now.getTime() + days * 24 * 3600 * 1000);
    assignData.start_date = toLocalInput(now);
    assignData.end_date = toLocalInput(end);
  }

  function statusVariant(s: string): any {
    return ({ registered: 'info', testing: 'warning', completed: 'success', hired: 'success', rejected: 'danger' } as any)[s] ?? 'default';
  }

  function countAssignments(cid: number): number {
    return data.assignments.filter((a: any) => a.candidate_id === cid).length;
  }

  function openCreate(): void {
    editMode = false;
    current = {
      username: '', email: '', full_name: '', password: 'candidate123',
      nik: '', phone: '', birth_date: '', gender: 'L',
      address: '', education: '', position_applied: ''
    };
    modalOpen = true;
  }

  function openEdit(row: any): void {
    editMode = true;
    current = { ...row };
    modalOpen = true;
  }

  function openAssign(row: any): void {
    const now = new Date();
    const end = new Date(now.getTime() + 3 * 24 * 3600 * 1000);
    assignData = {
      candidate_id: row.id,
      category_ids: [1, 2], // ✅ default: kedua tes
      start_date: toLocalInput(now),
      end_date: toLocalInput(end),
      candidate_name: row.full_name
    };
    assignOpen = true;
  }

  async function handleDelete(id: number, name: string): Promise<void> {
    if (!confirm(`Yakin hapus kandidat "${name}"?`)) return;
    const fd = new FormData();
    fd.append('id', String(id));
    await fetch('?/delete', { method: 'POST', body: fd });
    location.reload();
  }
</script>

<svelte:head><title>Calon Karyawan</title></svelte:head>

<div class="space-y-5">
  <div class="flex flex-col justify-between gap-3 md:flex-row md:items-center">
    <div>
      <h2 class="text-xl font-bold text-primary-900">Data Calon Karyawan</h2>
      <p class="text-sm text-slate-500">Kelola data kandidat dan berikan akses tes psikotes</p>
    </div>
    <div class="flex flex-wrap gap-2">
      <input type="search" bind:value={search} placeholder="🔍 Cari kandidat..."
        class="rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
      <select bind:value={filterStatus}
        class="rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none">
        <option value="">Semua Status</option>
        {#each statusOptions as s}<option value={s.value}>{s.label}</option>{/each}
      </select>
      <Button onclick={openCreate}>+ Tambah Kandidat</Button>
    </div>
  </div>

  {#if form?.error}
    <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{form.error}</div>
  {/if}
  {#if form?.success}
    <div class="rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm text-primary-800">
      {form.message}
    </div>
  {/if}

  <div class="overflow-hidden rounded-xl border border-primary-200 bg-white shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-primary-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Nama</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">NIK</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Posisi</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Pendidikan</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Status</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Tes Aktif</th>
            <th class="px-4 py-3 text-right text-xs font-semibold uppercase text-primary-700">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-primary-100">
          {#each filtered as c}
            <tr class="hover:bg-primary-50/50">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                    {c.full_name.charAt(0)}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-primary-900">{c.full_name}</div>
                    <div class="text-xs text-slate-500">{c.email}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600">{c.nik ?? '-'}</td>
              <td class="px-4 py-3 text-sm text-slate-600">{c.position_applied ?? '-'}</td>
              <td class="px-4 py-3 text-sm text-slate-600">{c.education ?? '-'}</td>
              <td class="px-4 py-3"><Badge variant={statusVariant(c.status)}>{c.status}</Badge></td>
              <td class="px-4 py-3">
                {#if countAssignments(c.id) > 0}
                  <span class="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800">
                    ⚡ {countAssignments(c.id)} tes
                  </span>
                {:else}
                  <span class="text-xs text-slate-400">-</span>
                {/if}
              </td>
              <td class="px-4 py-3 text-right whitespace-nowrap">
                <button onclick={() => openAssign(c)}
                  class="rounded-md px-2 py-1 text-xs font-medium text-primary-700 hover:bg-primary-50">
                  Akses Tes
                </button>
                <button onclick={() => openEdit(c)}
                  class="rounded-md px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50">
                  Edit
                </button>
                <button onclick={() => handleDelete(c.id, c.full_name)}
                  class="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">
                  Hapus
                </button>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="7" class="px-4 py-10 text-center text-sm text-slate-500">Belum ada kandidat</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- ============================================ -->
<!-- MODAL: TAMBAH / EDIT KANDIDAT -->
<!-- ============================================ -->
<Modal bind:open={modalOpen} title={editMode ? 'Edit Kandidat' : 'Tambah Kandidat'} size="lg">
  <form method="POST" action={editMode ? '?/update' : '?/create'}
    use:enhance={() => {
      submitting = true;
      return async ({ update }) => { submitting = false; modalOpen = false; await update(); };
    }} class="space-y-4">
    {#if editMode}<input type="hidden" name="id" value={current.id} />{/if}

    <Input label="Nama Lengkap" name="full_name" bind:value={current.full_name} required />

    {#if !editMode}
      <div class="grid gap-4 md:grid-cols-2">
        <Input label="Username" name="username" bind:value={current.username} required />
        <Input label="Email" name="email" type="email" bind:value={current.email} required />
      </div>
      <Input label="Password" name="password" type="password" bind:value={current.password} required />
    {/if}

    <div class="grid gap-4 md:grid-cols-2">
      <Input label="NIK" name="nik" bind:value={current.nik} />
      <Input label="No. Telepon" name="phone" bind:value={current.phone} />
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <Input label="Tanggal Lahir" name="birth_date" type="date" bind:value={current.birth_date} />
      <Select label="Jenis Kelamin" name="gender" bind:value={current.gender}
        options={[{ value: 'L', label: 'Laki-laki' }, { value: 'P', label: 'Perempuan' }]} />
    </div>

    <Input label="Pendidikan" name="education" bind:value={current.education} />
    <Input label="Posisi Dilamar" name="position_applied" bind:value={current.position_applied} />

    {#if editMode}
      <Select label="Status" name="status" bind:value={current.status} options={statusOptions} />
    {/if}

    <div class="flex justify-end gap-2 border-t border-primary-200 pt-4">
      <Button variant="secondary" onclick={() => (modalOpen = false)}>Batal</Button>
      <Button type="submit" loading={submitting}>Simpan</Button>
    </div>
  </form>
</Modal>

<!-- ============================================ -->
<!-- MODAL: BERIKAN AKSES TES — CHECKBOX GANDA -->
<!-- ============================================ -->
<Modal bind:open={assignOpen} title="Berikan Akses Tes" size="md">
  <form method="POST" action="?/assign"
    use:enhance={() => {
      submitting = true;
      return async ({ update }) => { submitting = false; assignOpen = false; await update(); };
    }} class="space-y-4">

    <input type="hidden" name="candidate_id" value={assignData.candidate_id} />

    <!-- Info kandidat -->
    <div class="rounded-lg border border-primary-200 bg-primary-50 p-3">
      <p class="text-xs text-slate-500">Kandidat</p>
      <p class="text-sm font-semibold text-primary-900">{assignData.candidate_name}</p>
    </div>

    <!-- ✅ PILIH KATEGORI (CHECKBOX) -->
    <div>
      <label class="mb-2 block text-sm font-medium text-primary-900">
        Kategori Tes <span class="text-red-500">*</span>
      </label>
      <p class="mb-3 text-xs text-slate-500">
        Pilih tes yang akan diberikan. Centang keduanya untuk assign sekaligus.
      </p>

      <div class="space-y-2">
        {#each data.categories as cat}
          {@const checked = assignData.category_ids.includes(cat.id)}
          <label
            class="flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition
              {checked
                ? 'border-primary-600 bg-primary-50 shadow-sm'
                : 'border-primary-200 bg-white hover:border-primary-400'}"
          >
            <input
              type="checkbox"
              name="category_ids"
              value={cat.id}
              checked={checked}
              onchange={() => toggleCategory(cat.id)}
              class="mt-0.5 h-4 w-4 rounded text-primary-600 focus:ring-primary-500"
            />
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-lg">
                  {cat.code === 'INTEL' ? '🧠' : '💚'}
                </span>
                <p class="text-sm font-semibold {checked ? 'text-primary-800' : 'text-slate-700'}">
                  {cat.name}
                </p>
              </div>
              <p class="mt-1 text-xs text-slate-500">
                {#if cat.code === 'INTEL'}
                  ⏱ 60 detik per soal (otomatis submit saat habis)
                {:else}
                  ⏱ Total ~20 menit untuk semua soal
                {/if}
              </p>
            </div>
            {#if checked}
              <span class="rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold text-white">
                ✓
              </span>
            {/if}
          </label>
        {/each}
      </div>

      {#if !hasAtLeastOneCategory}
        <p class="mt-2 text-xs text-red-600">
          ⚠️ Pilih minimal satu kategori tes
        </p>
      {/if}
    </div>

    <!-- ============ RANGE TANGGAL ============ -->
    <div class="rounded-lg border border-primary-200 bg-primary-50/50 p-4">
      <p class="mb-3 flex items-center gap-2 text-sm font-semibold text-primary-900">
        <span>📅</span> Periode Akses Tes
      </p>

      <div class="space-y-3">
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600">
            Tanggal &amp; Jam Mulai <span class="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="start_date"
            bind:value={assignData.start_date}
            required
            class="w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600">
            Tanggal &amp; Jam Berakhir <span class="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="end_date"
            bind:value={assignData.end_date}
            required
            class="w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>
      </div>

      <!-- Quick preset -->
      <div class="mt-3">
        <p class="mb-2 text-xs font-medium text-slate-600">Durasi cepat (dari sekarang):</p>
        <div class="flex flex-wrap gap-2">
          {#each [
            { days: 1, label: '1 hari' },
            { days: 3, label: '3 hari' },
            { days: 7, label: '7 hari' },
            { days: 14, label: '14 hari' },
            { days: 30, label: '30 hari' }
          ] as preset}
            <button
              type="button"
              onclick={() => setPreset(preset.days)}
              class="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-primary-700 ring-1 ring-primary-300 transition hover:bg-primary-100"
            >
              {preset.label}
            </button>
          {/each}
        </div>
      </div>

      <!-- Preview durasi -->
      {#if assignData.start_date && assignData.end_date}
        {#if totalDays > 0 && totalDays <= 90}
          <div class="mt-3 rounded-md bg-white p-3 ring-1 ring-primary-200">
            <div class="flex items-center justify-between">
              <p class="text-xs text-slate-600">Total durasi:</p>
              <p class="text-sm font-bold text-primary-800">{totalDays} hari</p>
            </div>
            <p class="mt-2 text-[11px] leading-relaxed text-slate-500">
              <strong>Mulai:</strong> {new Date(assignData.start_date).toLocaleString('id-ID', {
                weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
              <br />
              <strong>Berakhir:</strong> {new Date(assignData.end_date).toLocaleString('id-ID', {
                weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        {:else if totalDays > 90}
          <div class="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2">
            <p class="text-xs text-amber-800">
              ⚠️ Durasi maksimal 90 hari. Saat ini {totalDays} hari.
            </p>
          </div>
        {:else if assignData.start_date && assignData.end_date}
          <div class="mt-3 rounded-md border border-red-200 bg-red-50 p-2">
            <p class="text-xs text-red-700">
              ⚠️ Tanggal berakhir harus setelah tanggal mulai
            </p>
          </div>
        {/if}
      {/if}
    </div>

    <!-- Ringkasan -->
    {#if hasAtLeastOneCategory && isDurationValid}
      <div class="rounded-lg border border-primary-300 bg-primary-100 p-3">
        <p class="text-xs font-semibold text-primary-900">📋 Ringkasan:</p>
        <p class="mt-1 text-xs text-primary-800">
          Akan memberikan <strong>{assignData.category_ids.length} tes</strong>
          ({selectedCategories.map((c: any) => c.name).join(' + ')})
          selama <strong>{totalDays} hari</strong>.
        </p>
      </div>
    {/if}

    <!-- Tombol aksi -->
    <div class="flex justify-end gap-2 border-t border-primary-200 pt-4">
      <Button variant="secondary" onclick={() => (assignOpen = false)}>Batal</Button>
      <Button
        type="submit"
        loading={submitting}
        disabled={!isDurationValid || !hasAtLeastOneCategory}
      >
        Berikan Akses ({assignData.category_ids.length} tes)
      </Button>
    </div>
  </form>
</Modal>