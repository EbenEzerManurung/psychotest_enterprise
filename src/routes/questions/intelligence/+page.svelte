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
  let editMode: boolean = $state(false);
  let submitting: boolean = $state(false);
  let filterSub: string = $state('');
  let search: string = $state('');
  let current: any = $state({});

  const filtered = $derived(
    data.questions.filter((q: any) => {
      const okSub = !filterSub || q.subcategory_id === Number(filterSub);
      const okSearch = !search || q.question_text.toLowerCase().includes(search.toLowerCase());
      return okSub && okSearch;
    })
  );

  const subcatOptions = $derived(data.subcategories.map((s: any) => ({ value: s.id, label: s.name })));

  function emptyForm(): any {
    return {
      id: 0, subcategory_id: data.subcategories[0]?.id ?? 0,
      question_text: '', image_url: '',
      option_a: '', option_b: '', option_c: '', option_d: '',
      correct_answer: 'A', difficulty: 'medium',
      score_weight: 1, time_seconds: 60, order_number: 0
    };
  }
  function openCreate(): void { editMode = false; current = emptyForm(); modalOpen = true; }
  function openEdit(row: any): void { editMode = true; current = { ...row }; modalOpen = true; }
  async function handleDelete(id: number): Promise<void> {
    if (!confirm('Yakin hapus soal ini?')) return;
    const fd = new FormData();
    fd.append('id', String(id));
    await fetch('?/delete', { method: 'POST', body: fd });
    location.reload();
  }
</script>

<svelte:head><title>Soal Intellegensi</title></svelte:head>

<div class="space-y-5">
  <div class="flex flex-col justify-between gap-3 md:flex-row md:items-center">
    <div>
      <h2 class="text-xl font-bold text-primary-900">Bank Soal Intellegensi</h2>
      <p class="text-sm text-slate-500">Logika, pola angka, pola gambar, verbal, analogi, aritmatika</p>
    </div>
    <div class="flex flex-wrap gap-2">
      <input type="search" bind:value={search} placeholder="🔍 Cari soal..."
        class="rounded-lg border border-primary-200 px-3 py-2 text-sm" />
      <select bind:value={filterSub} class="rounded-lg border border-primary-200 px-3 py-2 text-sm">
        <option value="">Semua Sub-Kategori</option>
        {#each data.subcategories as s}<option value={s.id}>{s.name}</option>{/each}
      </select>
      <Button onclick={openCreate}>+ Tambah Soal</Button>
    </div>
  </div>

  {#if form?.error}
    <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{form.error}</div>
  {/if}
  {#if form?.success}
    <div class="rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm text-primary-800">{form.message}</div>
  {/if}

  <div class="space-y-3">
    {#each filtered as q, i}
      <div class="rounded-xl border border-primary-200 bg-white p-5">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="flex h-6 w-6 items-center justify-center rounded-md bg-primary-100 text-xs font-bold text-primary-800">{i + 1}</span>
              <Badge variant="info">{q.subcategory_name}</Badge>
              <Badge variant={q.difficulty === 'easy' ? 'success' : q.difficulty === 'hard' ? 'danger' : 'warning'}>
                {q.difficulty}
              </Badge>
              <span class="text-xs text-slate-500">⏱ {q.time_seconds}s • bobot {q.score_weight}</span>
            </div>
            <p class="mt-3 text-sm font-medium text-primary-900">{q.question_text}</p>
            {#if q.image_url}
              <img src={q.image_url} alt="Soal" class="mt-2 max-h-32 rounded-lg border border-primary-100" />
            {/if}
            <div class="mt-3 grid gap-2 md:grid-cols-2">
              {#each ['A', 'B', 'C', 'D'] as L}
                {@const isCorrect = q.correct_answer === L}
                <div class="flex items-start gap-2 rounded-lg border px-3 py-2 text-sm
                  {isCorrect ? 'border-primary-400 bg-primary-50' : 'border-primary-100 bg-white'}">
                  <span class="font-semibold {isCorrect ? 'text-primary-800' : 'text-slate-600'}">{L}.</span>
                  <span class={isCorrect ? 'font-medium text-primary-800' : 'text-slate-700'}>{q[`option_${L.toLowerCase()}`]}</span>
                </div>
              {/each}
            </div>
          </div>
          <div class="flex shrink-0 flex-col gap-1">
            <button onclick={() => openEdit(q)} class="rounded-md px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50">Edit</button>
            <button onclick={() => handleDelete(q.id)} class="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Hapus</button>
          </div>
        </div>
      </div>
    {:else}
      <div class="rounded-xl border border-dashed border-primary-300 bg-white p-12 text-center">
        <p class="text-sm text-slate-500">Belum ada soal. Klik "+ Tambah Soal" untuk mulai.</p>
      </div>
    {/each}
  </div>
</div>

<Modal bind:open={modalOpen} title={editMode ? 'Edit Soal' : 'Tambah Soal Intellegensi'} size="xl">
  <form method="POST" action={editMode ? '?/update' : '?/create'}
    use:enhance={() => {
      submitting = true;
      return async ({ update }) => { submitting = false; modalOpen = false; await update(); };
    }} class="space-y-4">
    {#if editMode}<input type="hidden" name="id" value={current.id} />{/if}
    <Select label="Sub-Kategori" name="subcategory_id" bind:value={current.subcategory_id} options={subcatOptions} required />
    <div>
      <label for="question_text_intel" class="block text-sm font-medium text-primary-900">Pertanyaan</label>
      <textarea name="question_text" bind:value={current.question_text} required rows="3"
        class="mt-1 w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"></textarea>
    </div>
    <Input label="URL Gambar (opsional)" name="image_url" bind:value={current.image_url} />
    <div class="grid gap-3 md:grid-cols-2">
      <Input label="Opsi A" name="option_a" bind:value={current.option_a} required />
      <Input label="Opsi B" name="option_b" bind:value={current.option_b} required />
      <Input label="Opsi C" name="option_c" bind:value={current.option_c} required />
      <Input label="Opsi D" name="option_d" bind:value={current.option_d} required />
    </div>
    <div class="grid gap-3 md:grid-cols-4">
      <Select label="Jawaban Benar" name="correct_answer" bind:value={current.correct_answer}
        options={[{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' }, { value: 'D', label: 'D' }]} />
      <Select label="Kesulitan" name="difficulty" bind:value={current.difficulty}
        options={[{ value: 'easy', label: 'Mudah' }, { value: 'medium', label: 'Sedang' }, { value: 'hard', label: 'Sulit' }]} />
      <Input label="Bobot Skor" name="score_weight" type="number" bind:value={current.score_weight} />
      <Input label="Waktu (detik)" name="time_seconds" type="number" bind:value={current.time_seconds} />
    </div>
    <Input label="Urutan" name="order_number" type="number" bind:value={current.order_number} />
    <div class="flex justify-end gap-2 border-t border-primary-200 pt-4">
      <Button variant="secondary" onclick={() => (modalOpen = false)}>Batal</Button>
      <Button type="submit" loading={submitting}>Simpan</Button>
    </div>
  </form>
</Modal>