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
  let current: any = $state({});

  const dimensionOptions = [
    { value: 'integritas', label: 'Integritas' },
    { value: 'manajemen_konflik', label: 'Manajemen Konflik' },
    { value: 'pendirian', label: 'Pendirian' },
    { value: 'kreativitas', label: 'Kreativitas' },
    { value: 'teamwork', label: 'Team Work' },
    { value: 'interpersonal', label: 'Interpersonal' }
  ];

  const grouped = $derived(
    data.questions.map((q: any) => ({
      ...q,
      options: data.options.filter((o: any) => o.question_id === q.id)
    }))
  );

  function emptyForm(): any {
    return {
      id: 0,
      question_text: 'Pilih pernyataan yang paling sesuai dan paling tidak sesuai dengan diri Anda:',
      dimension: 'integritas', order_number: 0,
      option_a_text: '', option_a_score: '{"integritas":3}',
      option_b_text: '', option_b_score: '{"integritas":1}',
      option_c_text: '', option_c_score: '{"integritas":2}',
      option_d_text: '', option_d_score: '{"integritas":0}'
    };
  }
  function openCreate(): void { editMode = false; current = emptyForm(); modalOpen = true; }
  function openEdit(q: any): void {
    editMode = true;
    const opts = q.options;
    const get = (label: string) => opts.find((o: any) => o.option_label === label);
    current = {
      id: q.id, question_text: q.question_text, dimension: q.dimension, order_number: q.order_number,
      option_a_text: get('A')?.statement_text ?? '', option_a_score: get('A')?.dimension_score ?? '{}',
      option_b_text: get('B')?.statement_text ?? '', option_b_score: get('B')?.dimension_score ?? '{}',
      option_c_text: get('C')?.statement_text ?? '', option_c_score: get('C')?.dimension_score ?? '{}',
      option_d_text: get('D')?.statement_text ?? '', option_d_score: get('D')?.dimension_score ?? '{}'
    };
    modalOpen = true;
  }
  async function handleDelete(id: number): Promise<void> {
    if (!confirm('Yakin hapus soal ini?')) return;
    const fd = new FormData();
    fd.append('id', String(id));
    await fetch('?/delete', { method: 'POST', body: fd });
    location.reload();
  }
</script>

<svelte:head><title>Soal Kepribadian</title></svelte:head>

<div class="space-y-5">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-xl font-bold text-primary-900">Bank Soal Kepribadian</h2>
      <p class="text-sm text-slate-500">Format ipsative: pilih paling sesuai & paling tidak sesuai</p>
    </div>
    <Button onclick={openCreate}>+ Tambah Soal</Button>
  </div>

  {#if form?.error}
    <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{form.error}</div>
  {/if}
  {#if form?.success}
    <div class="rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm text-primary-800">{form.message}</div>
  {/if}

  <div class="space-y-3">
    {#each grouped as q, i}
      <div class="rounded-xl border border-primary-200 bg-white p-5">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="flex h-6 w-6 items-center justify-center rounded-md bg-primary-100 text-xs font-bold text-primary-800">{i + 1}</span>
              <Badge variant="info">{q.dimension}</Badge>
            </div>
            <p class="mt-2 text-sm font-medium text-primary-900">{q.question_text}</p>
            <div class="mt-3 space-y-2">
              {#each q.options as o}
                <div class="flex items-start gap-2 rounded-lg border border-primary-100 bg-primary-50/30 px-3 py-2">
                  <span class="font-semibold text-primary-700">{o.option_label}.</span>
                  <span class="flex-1 text-sm text-slate-700">{o.statement_text}</span>
                  <code class="rounded bg-primary-100 px-1.5 py-0.5 text-[10px] text-primary-800">{o.dimension_score}</code>
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
        <p class="text-sm text-slate-500">Belum ada soal kepribadian.</p>
      </div>
    {/each}
  </div>
</div>

<Modal bind:open={modalOpen} title={editMode ? 'Edit Soal Kepribadian' : 'Tambah Soal Kepribadian'} size="xl">
  <form method="POST" action={editMode ? '?/update' : '?/create'}
    use:enhance={() => {
      submitting = true;
      return async ({ update }) => { submitting = false; modalOpen = false; await update(); };
    }} class="space-y-4">
    {#if editMode}<input type="hidden" name="id" value={current.id} />{/if}
    <div>
      <label for="question_text_intel" class="block text-sm font-medium text-primary-900">Pertanyaan</label>
      <textarea name="question_text" bind:value={current.question_text} required rows="2"
        class="mt-1 w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"></textarea>
    </div>
    <div class="grid gap-3 md:grid-cols-2">
      <Select label="Dimensi Utama" name="dimension" bind:value={current.dimension} options={dimensionOptions} />
      <Input label="Urutan" name="order_number" type="number" bind:value={current.order_number} />
    </div>
    <div class="space-y-3 rounded-lg border border-primary-200 bg-primary-50 p-3">
      <p class="text-xs font-semibold text-primary-700">
        Opsi &amp; skor dimensi (JSON). Contoh: <code class="rounded bg-white px-1">&#123;"integritas":3,"teamwork":1&#125;</code>
      </p>
      {#each ['a', 'b', 'c', 'd'] as L}
        <div class="grid gap-2 md:grid-cols-3">
          <Input label={`Opsi ${L.toUpperCase()} - Teks`} name={`option_${L}_text`} bind:value={current[`option_${L}_text`]} />
          <div class="md:col-span-2">
            <Input label="Skor JSON" name={`option_${L}_score`} bind:value={current[`option_${L}_score`]} />
          </div>
        </div>
      {/each}
    </div>
    <div class="flex justify-end gap-2 border-t border-primary-200 pt-4">
      <Button variant="secondary" onclick={() => (modalOpen = false)}>Batal</Button>
      <Button type="submit" loading={submitting}>Simpan</Button>
    </div>
  </form>
</Modal>