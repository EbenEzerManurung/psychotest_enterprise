<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';
  import Button from '$components/ui/Button.svelte';
  import TotalTimer from '$components/ui/TotalTimer.svelte';
  import CameraGuard from '$components/ui/CameraGuard.svelte';
  import ConfirmModal from '$components/ui/ConfirmModal.svelte';
  import { logProctorEvent, saveSnapshot } from '$lib/proctor';

  let { data }: { data: PageData } = $props();

  const isIntel: boolean = data.assignment.category_code === 'INTEL';
  const totalQuestions: number = data.questions.length;
  const hasTimer: boolean = Number(data.assignment.total_time_seconds) > 0;

  // State
  let cameraReady: boolean = $state(false);
  let started: boolean = $state(false);
  let index: number = $state(0);
  let answers: Record<number, any> = $state({});
  let submitting: boolean = $state(false);
  let integrityScore: number = $state(100);
  let violationCount: number = $state(0);
  let warningMessage: string = $state('');
  let showWarning: boolean = $state(false);
  let terminate: boolean = $state(false);
  let showGrid: boolean = $state(false);
  let justClosedGrid: boolean = $state(false);

  // ✅ FLAG BARU: Stop semua proctoring saat submit/keluar halaman
  let proctorStopped: boolean = $state(false);

  // ✅ Custom confirm modal
  let confirmOpen: boolean = $state(false);
  let confirmConfig = $state<{
    title: string;
    message: string;
    variant: 'warning' | 'danger' | 'primary';
    confirmText: string;
    onYes: () => void;
  }>({
    title: '',
    message: '',
    variant: 'warning',
    confirmText: 'Ya, Lanjutkan',
    onYes: () => {}
  });

  function askConfirm(
    title: string,
    message: string,
    onYes: () => void,
    variant: 'warning' | 'danger' | 'primary' = 'warning',
    confirmText: string = 'Ya, Lanjutkan'
  ): void {
    confirmConfig = { title, message, variant, confirmText, onYes };
    confirmOpen = true;
  }

  let cameraGuardRef: any = $state(null);
  let snapshotTimer: ReturnType<typeof setInterval> | null = null;
  let devtoolsTimer: ReturnType<typeof setInterval> | null = null;

  // ============================================
  // PROCTORING — semua pakai guard yang sama
  // ============================================
  function shouldSkipProctor(): boolean {
    return !started || terminate || proctorStopped || confirmOpen;
  }

  function onBlur() {
    if (shouldSkipProctor()) return;
    logProctorEvent(data.session.id, 'blur');
    integrityScore = Math.max(0, integrityScore - 5);
    violationCount++;
    showWarningMsg('Anda meninggalkan halaman tes! (-5 poin)');
    if (violationCount >= 5) triggerTerminate();
  }

  function onFullscreenChange() {
    if (shouldSkipProctor()) return;
    if (!document.fullscreenElement) {
      logProctorEvent(data.session.id, 'fullscreen_exit');
      integrityScore = Math.max(0, integrityScore - 10);
      violationCount++;
      showWarningMsg('Anda keluar dari mode fullscreen! (-10 poin)');
      setTimeout(() => document.documentElement.requestFullscreen?.().catch(() => {}), 1000);
    }
  }

  function onContextMenu(e: MouseEvent) {
    e.preventDefault();
    if (shouldSkipProctor()) return;
    logProctorEvent(data.session.id, 'right_click');
    integrityScore = Math.max(0, integrityScore - 3);
    violationCount++;
  }

  function onCopy(e: ClipboardEvent) {
    e.preventDefault();
    if (shouldSkipProctor()) return;
    logProctorEvent(data.session.id, 'copy');
    integrityScore = Math.max(0, integrityScore - 10);
    violationCount++;
    showWarningMsg('Copy tidak diizinkan! (-10 poin)');
  }

  function onPaste(e: ClipboardEvent) {
    e.preventDefault();
    if (shouldSkipProctor()) return;
    logProctorEvent(data.session.id, 'paste');
    integrityScore = Math.max(0, integrityScore - 10);
    violationCount++;
    showWarningMsg('Paste tidak diizinkan! (-10 poin)');
  }

  function onKeyDown(e: KeyboardEvent) {
    const blocked =
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
      (e.ctrlKey && ['U', 'P', 'S'].includes(e.key.toUpperCase())) ||
      e.key === 'PrintScreen';

    if (blocked) {
      e.preventDefault();
      if (shouldSkipProctor()) return;
      logProctorEvent(data.session.id, 'devtools', `Shortcut ${e.key} diblokir`);
      integrityScore = Math.max(0, integrityScore - 15);
      violationCount++;
      showWarningMsg('Shortcut ini diblokir! (-15 poin)');
      if (violationCount >= 3) triggerTerminate();
    }
  }

  function checkDevTools() {
    if (shouldSkipProctor()) return;
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;
    if (widthDiff || heightDiff) {
      logProctorEvent(data.session.id, 'devtools', 'DevTools terdeteksi');
      integrityScore = Math.max(0, integrityScore - 30);
      violationCount++;
      showWarningMsg('DevTools terdeteksi! (-30 poin)');
      if (violationCount >= 3) triggerTerminate();
    }
  }

  function showWarningMsg(msg: string) {
    warningMessage = msg;
    showWarning = true;
    setTimeout(() => { showWarning = false; }, 4000);
  }

  function triggerTerminate() {
    terminate = true;
    stopAllTimers();
    setTimeout(async () => { await performSubmit(); }, 3000);
  }

  function stopAllTimers() {
    if (snapshotTimer) clearInterval(snapshotTimer);
    if (devtoolsTimer) clearInterval(devtoolsTimer);
    snapshotTimer = null;
    devtoolsTimer = null;
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  onMount(() => {
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('copy', onCopy);
    document.addEventListener('paste', onPaste);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('paste', onPaste);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      stopAllTimers();
    };
  });

  onDestroy(() => stopAllTimers());

  // ============================================
  // CAMERA READY
  // ============================================
  async function handleCameraReady() {
    cameraReady = true;
    try {
      await fetch('/api/proctor/camera-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: data.session.id })
      });
    } catch (e) {
      console.warn('camera-on log gagal:', e);
    }
    try {
      await document.documentElement.requestFullscreen?.();
    } catch {}
  }

  function handleCameraError(msg: string) {
    showWarningMsg(msg);
  }

  // ============================================
  // MULAI TES
  // ============================================
  function startTest() {
    started = true;

    snapshotTimer = setInterval(async () => {
      if (cameraGuardRef?.getVideo) {
        await saveSnapshot(data.session.id, cameraGuardRef.getVideo(), 'periodic');
      }
    }, 60000);

    devtoolsTimer = setInterval(checkDevTools, 1000);
  }

  // ============================================
  // NAVIGASI
  // ============================================
  const current: any = $derived(data.questions[index]);
  const currentAnswer: any = $derived(answers[current?.id] ?? {});
  const progress: number = $derived(totalQuestions > 0 ? ((index + 1) / totalQuestions) * 100 : 0);

  const answeredCount: number = $derived(
    Object.keys(answers).filter((qid) => {
      const a = answers[Number(qid)];
      if (isIntel) return !!a?.selected;
      return !!(a?.most && a?.least);
    }).length
  );

  function isAnswered(qid: number): boolean {
    const a = answers[qid];
    if (!a) return false;
    if (isIntel) return !!a.selected;
    return !!(a.most && a.least);
  }

  function goToQuestion(i: number): void {
    if (i >= 0 && i < totalQuestions) {
      index = i;
      showGrid = false;
      justClosedGrid = true;
      setTimeout(() => { justClosedGrid = false; }, 600);
    }
  }

  function nextQuestion(): void {
    if (index < totalQuestions - 1) index++;
  }

  function prevQuestion(): void {
    if (index > 0) index--;
  }

  // ============================================
  // SIMPAN JAWABAN
  // ============================================
  async function saveIntel(qid: number, selected: string): Promise<void> {
    answers[qid] = { ...answers[qid], selected };
    await fetch('/api/test/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: data.session.id,
        question_id: qid,
        selected,
        time_taken_seconds: 0
      })
    });
  }

  async function savePersonality(qid: number, most: string | null, least: string | null): Promise<void> {
    if (most && least && most === least) {
      showWarningMsg('❌ Pilihan "Paling Sesuai" dan "Paling Tidak Sesuai" tidak boleh sama');
      return;
    }

    answers[qid] = { most, least };
    if (most && least) {
      await fetch('/api/test/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: data.session.id,
          question_id: qid,
          selected_most: most,
          selected_least: least
        })
      });
    }
  }

  // ============================================
  // SUBMIT
  // ============================================
  function submitTest(forced = false): void {
    if (justClosedGrid) return;

    if (forced) {
      void performSubmit();
      return;
    }

    const unanswered = totalQuestions - answeredCount;

    if (unanswered > 0) {
      askConfirm(
        'Soal Belum Lengkap',
        `Masih ada ${unanswered} soal belum dijawab. Yakin ingin menyelesaikan tes sekarang?`,
        () => askFinalConfirm(),
        'warning',
        'Ya, Lanjutkan'
      );
      return;
    }

    askFinalConfirm();
  }

  function askFinalConfirm(): void {
    askConfirm(
      'Konfirmasi Selesai',
      'Yakin menyelesaikan tes? Jawaban tidak dapat diubah lagi setelah submit.',
      () => void performSubmit(),
      'danger',
      'Ya, Submit Sekarang'
    );
  }

  async function performSubmit(): Promise<void> {
    // ✅ STOP PROCTORING SEBELUM exitFullscreen
    proctorStopped = true;
    submitting = true;
    stopAllTimers();

    const res = await fetch('/api/test/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: data.session.id })
    });

    if (res.ok) {
      // Sekarang exitFullscreen aman — proctor sudah stopped
      try { await document.exitFullscreen?.(); } catch {}
      goto('/dashboard');
    } else {
      // Kalau gagal, hidupkan lagi proctoring
      proctorStopped = false;
      showWarningMsg('❌ Gagal submit. Silakan coba lagi.');
      submitting = false;
    }
  }

  async function handleTimeout(): Promise<void> {
    stopAllTimers();
    await performSubmit();
  }
</script>

<svelte:head><title>{data.assignment.category_name}</title></svelte:head>

<!-- CONFIRM MODAL -->
<ConfirmModal
  bind:open={confirmOpen}
  title={confirmConfig.title}
  message={confirmConfig.message}
  variant={confirmConfig.variant}
  confirmText={confirmConfig.confirmText}
  cancelText="Batal"
  onConfirm={confirmConfig.onYes}
/>

<div class="mx-auto max-w-3xl space-y-4">
  <!-- TERMINATE OVERLAY -->
  {#if terminate}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-red-600/95 p-4">
      <div class="max-w-md rounded-2xl bg-white p-6 text-center">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <span class="text-3xl">🚫</span>
        </div>
        <h2 class="mt-4 text-xl font-bold text-red-700">Tes Dibatalkan</h2>
        <p class="mt-2 text-sm text-red-600">
          Terlalu banyak pelanggaran. Tes akan otomatis di-submit.
        </p>
      </div>
    </div>
  {/if}

  <!-- WARNING BANNER -->
  {#if showWarning && !terminate}
    <div
      class="fixed left-1/2 top-4 z-40 -translate-x-1/2 transform rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-lg"
    >
      ⚠️ {warningMessage}
    </div>
  {/if}

  <!-- PRE-FLIGHT -->
  {#if !started}
    <div class="rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 to-white p-6">
      <h2 class="text-center text-xl font-bold text-primary-900">Persyaratan Sebelum Tes</h2>
      <p class="mt-1 text-center text-sm text-slate-600">
        Anda harus memenuhi syarat berikut untuk mengerjakan tes
      </p>

      <div class="mt-5 space-y-2">
        <div class="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
          <span class="text-xl">📷</span>
          <div class="flex-1">
            <p class="text-sm font-semibold text-primary-900">Kamera Aktif</p>
            <p class="text-xs text-slate-500">Wajib menyala selama tes</p>
          </div>
        </div>
        <div class="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
          <span class="text-xl">🖥️</span>
          <div class="flex-1">
            <p class="text-sm font-semibold text-primary-900">Mode Fullscreen</p>
            <p class="text-xs text-slate-500">Tes akan masuk fullscreen otomatis</p>
          </div>
        </div>
        <div class="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
          <span class="text-xl">🚫</span>
          <div class="flex-1">
            <p class="text-sm font-semibold text-primary-900">Dilarang Pindah Tab</p>
            <p class="text-xs text-slate-500">Setiap pelanggaran dicatat</p>
          </div>
        </div>
        {#if hasTimer}
          <div class="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
            <span class="text-xl">⏱️</span>
            <div class="flex-1">
              <p class="text-sm font-semibold text-primary-900">
                Waktu Total: {Math.floor(Number(data.assignment.total_time_seconds) / 60)} menit
              </p>
              <p class="text-xs text-slate-500">Anda bisa lompat antar soal</p>
            </div>
          </div>
        {:else}
          <div class="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
            <span class="text-xl">♾️</span>
            <div class="flex-1">
              <p class="text-sm font-semibold text-primary-900">Tanpa Batas Waktu</p>
              <p class="text-xs text-slate-500">Kerjakan dengan tenang, sesuai kepribadian Anda</p>
            </div>
          </div>
        {/if}
      </div>

      <div class="mt-5">
        <CameraGuard
          bind:this={cameraGuardRef}
          onReady={handleCameraReady}
          onError={handleCameraError}
        />
      </div>

      {#if cameraReady}
        <button
          onclick={startTest}
          class="mt-4 w-full rounded-lg bg-primary-700 px-6 py-3 text-base font-bold text-white transition hover:bg-primary-800"
        >
          ✓ Mulai Tes Sekarang
        </button>
      {/if}
    </div>
  {:else}
    <!-- HEADER -->
    <div class="sticky top-0 z-10 rounded-xl border border-primary-200 bg-white p-4 shadow-sm">
      <div class="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 class="font-semibold text-primary-900">{data.assignment.category_name}</h2>
          <p class="text-xs text-slate-500">
            Soal <span class="font-bold text-primary-700">{index + 1}</span> dari {totalQuestions}
            • <span class="text-green-700">✓ {answeredCount}</span>
            • <span class="text-amber-700">✗ {totalQuestions - answeredCount}</span>
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <div class="rounded-lg bg-primary-50 px-3 py-1.5">
            <p class="text-[10px] text-slate-500">Integritas</p>
            <p
              class="text-sm font-bold
                {integrityScore >= 75
                  ? 'text-green-700'
                  : integrityScore >= 60
                  ? 'text-amber-700'
                  : 'text-red-700'}"
            >
              {integrityScore}
            </p>
          </div>

          {#if hasTimer}
            <TotalTimer
              totalSeconds={Number(data.assignment.total_time_seconds)}
              initialRemaining={data.remainingSeconds}
              onTimeout={handleTimeout}
            />
          {/if}

          <button
            onclick={() => (showGrid = !showGrid)}
            class="rounded-lg border border-primary-300 bg-white px-3 py-2 text-xs font-medium text-primary-700 transition hover:bg-primary-50
              {showGrid ? 'bg-primary-50 ring-2 ring-primary-400' : ''}"
          >
            📋 {showGrid ? 'Tutup' : 'Daftar Soal'}
          </button>
        </div>
      </div>

      <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-primary-100">
        <div
          class="h-full rounded-full bg-primary-600 transition-all"
          style="width: {progress}%"
        ></div>
      </div>

      {#if showGrid}
        <div class="mt-4 border-t border-primary-100 pt-3">
          <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p class="text-xs font-semibold text-primary-900">
              📋 Klik nomor untuk lompat ke soal:
            </p>
            <div class="flex items-center gap-3 text-[10px]">
              <div class="flex items-center gap-1">
                <span class="inline-block h-3 w-3 rounded bg-primary-700"></span>
                <span class="text-slate-600">Aktif</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="inline-block h-3 w-3 rounded bg-green-500"></span>
                <span class="text-slate-600">Dijawab</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="inline-block h-3 w-3 rounded bg-slate-200"></span>
                <span class="text-slate-600">Belum</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-10 gap-1.5">
            {#each data.questions as q, i}
              {@const answered = isAnswered(q.id)}
              {@const isCurrent = i === index}
              <button
                type="button"
                onclick={() => goToQuestion(i)}
                class="flex aspect-square items-center justify-center rounded-md text-xs font-bold transition
                  {isCurrent
                    ? 'bg-primary-700 text-white ring-2 ring-primary-400'
                    : answered
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'}"
                title="Soal {i + 1}"
              >
                {i + 1}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- SOAL -->
    <div class="rounded-2xl border border-primary-200 bg-white p-6 shadow-sm">
      <div class="flex items-start gap-3">
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-sm font-bold text-primary-800"
        >
          {index + 1}
        </span>
        <p class="pt-1 text-base font-medium text-primary-900">{current.question_text}</p>
      </div>

      {#if current.image_url}
        <img src={current.image_url} alt="Soal" class="mt-4 max-h-64 rounded-lg border" />
      {/if}

      {#if isIntel}
        <div class="mt-6 space-y-2">
          {#each ['A', 'B', 'C', 'D'] as opt}
            {@const text = current[`option_${opt.toLowerCase()}`]}
            <label
              class="flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition
                {currentAnswer.selected === opt
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-primary-100 bg-white hover:border-primary-300'}"
            >
              <input
                type="radio"
                name={`q_${current.id}`}
                value={opt}
                checked={currentAnswer.selected === opt}
                onchange={() => saveIntel(current.id, opt)}
                class="h-4 w-4"
              />
              <span
                class="flex h-7 w-7 items-center justify-center rounded-lg font-bold
                  {currentAnswer.selected === opt
                    ? 'bg-primary-600 text-white'
                    : 'bg-primary-100 text-primary-800'}"
              >
                {opt}
              </span>
              <span class="flex-1 text-sm text-primary-900">{text}</span>
            </label>
          {/each}
        </div>
      {:else}
        <div class="mt-6 space-y-4">
          <div class="rounded-lg bg-primary-50 px-4 py-2 text-xs text-primary-700">
            Pilih 1 pernyataan <strong class="text-green-700">paling sesuai</strong> dan 1
            <strong class="text-red-700">paling tidak sesuai</strong>
          </div>
          {#each current.options as o}
            <div
              class="rounded-xl border-2 p-4
                {currentAnswer.most === o.option_label || currentAnswer.least === o.option_label
                  ? 'border-primary-300 bg-primary-50/50'
                  : 'border-primary-100 bg-white'}"
            >
              <div class="flex items-start gap-2">
                <span
                  class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-100 text-xs font-bold text-primary-800"
                >
                  {o.option_label}
                </span>
                <p class="flex-1 text-sm text-primary-900">{o.statement_text}</p>
              </div>
              <div class="mt-3 flex gap-2">
                <button
                  type="button"
                  onclick={() => savePersonality(current.id, o.option_label, currentAnswer.least ?? null)}
                  class="flex-1 rounded-lg px-3 py-2 text-xs font-medium
                    {currentAnswer.most === o.option_label
                      ? 'bg-green-600 text-white'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'}"
                >
                  Paling Sesuai
                </button>
                <button
                  type="button"
                  onclick={() => savePersonality(current.id, currentAnswer.most ?? null, o.option_label)}
                  class="flex-1 rounded-lg px-3 py-2 text-xs font-medium
                    {currentAnswer.least === o.option_label
                      ? 'bg-red-600 text-white'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'}"
                >
                  Paling Tidak Sesuai
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- NAVIGASI BAWAH -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <Button variant="secondary" onclick={prevQuestion} disabled={index === 0}>
        ← Sebelumnya
      </Button>

      <div class="flex flex-wrap gap-2">
        {#if index < totalQuestions - 1}
          <Button variant="ghost" onclick={nextQuestion}>Lewati →</Button>
        {/if}
        <Button variant="success" onclick={() => submitTest()} loading={submitting}>
          Selesai & Submit ✓
        </Button>
        {#if index < totalQuestions - 1}
          <Button onclick={nextQuestion}>Selanjutnya →</Button>
        {/if}
      </div>
    </div>
  {/if}
</div>