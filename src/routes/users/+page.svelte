<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import type { User, Role } from '$lib/types';
  import { enhance } from '$app/forms';
  import Button from '$components/ui/Button.svelte';
  import Input from '$components/ui/Input.svelte';
  import Select from '$components/ui/Select.svelte';
  import Modal from '$components/ui/Modal.svelte';
  import Badge from '$components/ui/Badge.svelte';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  interface UserForm {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role_id: number;
    is_active: number;
    password: string;
  }

  let modalOpen: boolean = $state(false);
  let editMode: boolean = $state(false);
  let submitting: boolean = $state(false);
  let search: string = $state('');
  let current: UserForm = $state({
    id: 0, username: '', email: '', full_name: '', role_id: 2, is_active: 1, password: ''
  });

  const filtered = $derived(
    data.users.filter((u: User) =>
      [u.full_name, u.username, u.email, u.role_name]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(search.toLowerCase()))
    )
  );

  const roleOptions = $derived(data.roles.map((r: Role) => ({ value: r.id, label: r.label })));

  function openCreate(): void {
    editMode = false;
    current = { id: 0, username: '', email: '', full_name: '', role_id: 2, is_active: 1, password: '' };
    modalOpen = true;
  }
  function openEdit(row: any): void {
    editMode = true;
    current = { ...row, password: '', is_active: row.is_active ? 1 : 0 };
    modalOpen = true;
  }
  async function handleDelete(id: number, name: string, username: string): Promise<void> {
    if (username === 'superadmin') return alert('Tidak bisa menghapus superadmin');
    if (!confirm(`Yakin hapus user "${name}"?`)) return;
    const fd = new FormData();
    fd.append('id', String(id));
    fd.append('username', username);
    await fetch('?/delete', { method: 'POST', body: fd });
    location.reload();
  }
</script>

<svelte:head><title>Manage User</title></svelte:head>

<div class="space-y-5">
  <div class="flex flex-col justify-between gap-3 md:flex-row md:items-center">
    <div>
      <h2 class="text-xl font-bold text-primary-900">Manage User</h2>
      <p class="text-sm text-slate-500">Kelola semua pengguna sistem dan role aksesnya</p>
    </div>
    <div class="flex gap-2">
      <input type="search" bind:value={search} placeholder="🔍 Cari user..."
        class="rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
      <Button onclick={openCreate}>+ Tambah User</Button>
    </div>
  </div>

  {#if form?.error}
    <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{form.error}</div>
  {/if}
  {#if form?.success}
    <div class="rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm text-primary-800">{form.message}</div>
  {/if}

  <div class="overflow-hidden rounded-xl border border-primary-200 bg-white shadow-sm">
    <table class="w-full">
      <thead class="bg-primary-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Nama</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Username</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Email</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Role</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-primary-700">Status</th>
          <th class="px-4 py-3 text-right text-xs font-semibold uppercase text-primary-700">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-primary-100">
        {#each filtered as u}
          <tr class="hover:bg-primary-50/50">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                  {u.full_name.charAt(0)}
                </div>
                <span class="text-sm font-medium text-primary-900">{u.full_name}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-slate-600">{u.username}</td>
            <td class="px-4 py-3 text-sm text-slate-600">{u.email}</td>
            <td class="px-4 py-3">
              <span class="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium capitalize text-primary-800">
                {u.role_name}
              </span>
            </td>
            <td class="px-4 py-3"><Badge variant={u.is_active ? 'success' : 'danger'}>{u.is_active ? 'Aktif' : 'Nonaktif'}</Badge></td>
            <td class="px-4 py-3 text-right">
              <button onclick={() => openEdit(u)} class="rounded-md px-2 py-1 text-xs font-medium text-primary-700 hover:bg-primary-50">Edit</button>
              <button onclick={() => handleDelete(u.id, u.full_name, u.username)} class="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Hapus</button>
            </td>
          </tr>
        {:else}
          <tr><td colspan="6" class="px-4 py-10 text-center text-sm text-slate-500">Tidak ada user</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<Modal bind:open={modalOpen} title={editMode ? 'Edit User' : 'Tambah User'} size="lg">
  <form method="POST" action={editMode ? '?/update' : '?/create'}
    use:enhance={() => {
      submitting = true;
      return async ({ update }) => { submitting = false; modalOpen = false; await update(); };
    }} class="space-y-4">
    {#if editMode}<input type="hidden" name="id" value={current.id} />{/if}
    <Input label="Nama Lengkap" name="full_name" bind:value={current.full_name} required />
    <div class="grid gap-4 md:grid-cols-2">
      <Input label="Username" name="username" bind:value={current.username} required />
      <Input label="Email" name="email" type="email" bind:value={current.email} required />
    </div>
    <div class="grid gap-4 md:grid-cols-2">
      <Select label="Role" name="role_id" bind:value={current.role_id} options={roleOptions} required />
      <Input label={editMode ? 'Password (kosongkan bila tidak diubah)' : 'Password'}
        name="password" type="password" bind:value={current.password} required={!editMode} />
    </div>
    {#if editMode}
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" checked={current.is_active === 1} />
        Akun Aktif
      </label>
    {/if}
    <div class="flex justify-end gap-2 border-t border-primary-200 pt-4">
      <Button variant="secondary" onclick={() => (modalOpen = false)}>Batal</Button>
      <Button type="submit" loading={submitting}>Simpan</Button>
    </div>
  </form>
</Modal>