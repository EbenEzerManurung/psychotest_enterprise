<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';
  import Button from '$components/ui/Button.svelte';
  import TestTimer from '$components/ui/TestTimer.svelte';
  import CameraGuard from '$components/ui/CameraGuard.svelte';
  import { logProctorEvent, saveSnapshot, RULES } from '$lib/proctor';

  let { data }: { data: PageData } = $props();

  const isIntel: boolean = data.assignment.category_code === 'INTEL';
  const totalQuestions: number = data.questions.length;

  // State
  let cameraReady: boolean = $state(false);
  let started: boolean = $state(false);
  let index: number = $state(0);
  let answers: Record<number, any> = $state({});
  let submitting: boolean = $state(false);
  let questionStartTime: number = $state(Date.now());
  let integrityScore: number = $state(100);
  let violationCount: number = $state(0);
  let warningMessage: string = $state('');
  let showWarning: boolean = $state(false);
  let terminate: boolean = $state(false);

  // Refs
  let cameraGuardRef: any = $state(null);
  let faceCheckTimer: ReturnType<typeof setInterval> | null = null;
  let snapshotTimer: ReturnType<typeof setInterval> | null = null;
  let devtoolsTimer: ReturnType<typeof setInterval> | null = null;
  let noFaceCount: number = 0;
  let lookingDownCount: number = 0;

  // Face detection state
  let faceapi: any = null;
  let faceModelLoaded: boolean = false;
  let lastFaceDetectedTime: number = Date.now();

  // ============================================
  // LOAD FACE DETECTION MODEL
  // ============================================
  async function loadFaceModel() {
    try {
      // Dynamic import agar tidak block initial render
      faceapi = await import('@vladmandic/face-api');
      const MODEL_URL = '/models';
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      faceModelLoaded = true;
      console.log('✅ Face model loaded');
    } catch (e) {
      console.warn('⚠️ Face model gagal dimuat:', e);
    }
  }

  // ============================================
  // CEK WAJAH SETIAP 2 DETIK
  // ============================================
  async function checkFace() {
    if (!faceModelLoaded || !cameraGuardRef?.getStream) return;
    const stream = cameraGuardRef.getStream();
    if (!stream) return;

    // Buat video element sementara untuk detection
    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    await video.play();
    await new Promise((r) => setTimeout(r, 100));

    try {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 }))
        .withFaceLandmarks();

      video.pause();
      video.srcObject = null;

      // === Multiple faces ===
      if (detections.length > 1) {
        await logProctorEvent(data.session.id, 'multiple_faces', `${detections.length} wajah terdeteksi`);
        integrityScore -= 20;
        violationCount++;
        showWarningMsg('Terdeteksi lebih dari 1 wajah. Tes dapat dibatalkan!');
        await saveSnapshot(data.session.id, cameraGuardRef.getVideo?.(), 'multiple_faces');
        if (violationCount >= 5) triggerTerminate();
        return;
      }

      // === No face ===
      if (detections.length === 0) {
        noFaceCount++;
        const elapsed = Date.now() - lastFaceDetectedTime;
        if (noFaceCount >= 3 && elapsed > 5000) {
          await logProctorEvent(data.session.id, 'no_face', 'Wajah tidak terlihat >5 detik');
          integrityScore -= 8;
          violationCount++;
          showWarningMsg('Wajah Anda tidak terlihat di kamera. Mohon hadap ke depan!');
          noFaceCount = 0;
          lastFaceDetectedTime = Date.now();
          await saveSnapshot(data.session.id, cameraGuardRef.getVideo?.(), 'no_face');
        }
        return;
      }

      // === Face detected, cek head pose ===
      noFaceCount = 0;
      lastFaceDetectedTime = Date.now();
      const landmarks = detections[0].landmarks;
      const nose = landmarks.getNose();
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();

      // Rata-rata posisi mata
      const eyeY = (leftEye[0].y + rightEye[0].y) / 2;
      const noseY = nose[2]?.y ?? nose[0].y; // ujung hidung

      // Rasio: kalau hidung jauh di bawah mata → menunduk
      const ratio = (noseY - eyeY) / 40; // normal ratio ~0.5-1.0

      if (ratio > 1.5) {
        lookingDownCount++;
        if (lookingDownCount >= 4) { // ~8 detik menunduk
          await logProctorEvent(data.session.id, 'looking_down', 'Menunduk terlalu lama');
          integrityScore -= 5;
          violationCount++;
          showWarningMsg('Terlalu lama menunduk. Mohon hadap ke layar!');
          lookingDownCount = 0;
          await saveSnapshot(data.session.id, cameraGuardRef.getVideo?.(), 'looking_down');
        }
      } else {
        lookingDownCount = 0;
      }
    } catch (e) {
      console.warn('Face check error:', e);
    }
  }

  // ============================================
  // DETEKSI DEVTools (window size heuristic)
  // ============================================
  function checkDevTools() {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;
    if (widthDiff || heightDiff) {
      logProctorEvent(data.session.id, 'devtools', 'DevTools terdeteksi');
      integrityScore -= 30;
      violationCount++;
      showWarningMsg('DevTools terdeteksi. Harap tutup panel developer!');
      if (violationCount >= 3) triggerTerminate();
    }
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================
  function onBlur() {
    if (!started) return;
    logProctorEvent(data.session.id, 'blur');
    integrityScore -= 5;
    violationCount++;
    showWarningMsg('Anda meninggalkan halaman tes!');
    if (violationCount >= 5) triggerTerminate();
  }

  function onFullscreenChange() {
    if (!started) return;
    if (!document.fullscreenElement) {
      logProctorEvent(data.session.id, 'fullscreen_exit');
      integrityScore -= 10;
      violationCount++;
      showWarningMsg('Anda keluar dari mode fullscreen!');
      // Coba masuk lagi
      setTimeout(() => document.documentElement.requestFullscreen?.().catch(() => {}), 1000);
    }
  }

  function onContextMenu(e: MouseEvent) {
    e.preventDefault();
    if (!started) return;
    logProctorEvent(data.session.id, 'right_click');
    integrityScore -= 3;
    violationCount++;
  }

  function onCopy(e: ClipboardEvent) {
    e.preventDefault();
    if (!started) return;
    logProctorEvent(data.session.id, 'copy');
    integrityScore -= 10;
    violationCount++;
    showWarningMsg('Copy tidak diizinkan!');
  }

  function onPaste(e: ClipboardEvent) {
    e.preventDefault();
    if (!started) return;
    logProctorEvent(data.session.id, 'paste');
    integrityScore -= 10;
    violationCount++;
    showWarningMsg('Paste tidak diizinkan!');
  }

  function onKeyDown(e: KeyboardEvent) {
    // Blokir F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+P, PrintScreen
    const blocked =
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
      (e.ctrlKey && ['U', 'P', 'S'].includes(e.key.toUpperCase())) ||
      e.key === 'PrintScreen';

    if (blocked) {
      e.preventDefault();
      logProctorEvent(data.session.id, 'devtools', `Shortcut ${e.key} diblokir`);
      integrityScore -= 15;
      violationCount++;
      showWarningMsg('Shortcut ini diblokir!');
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
    setTimeout(async () => {
      await submitTest(true);
    }, 3000);
  }

  function stopAllTimers() {
    if (faceCheckTimer) clearInterval(faceCheckTimer);
    if (snapshotTimer) clearInterval(snapshotTimer);
    if (devtoolsTimer) clearInterval(devtoolsTimer);
  }

  // ============================================
  // LIFE CYCLE
  // ============================================
  onMount(() => {
    // Prevent default di seluruh document
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

  onDestroy(() => {
    stopAllTimers();
  });

  // ============================================
  // CAMERA READY → MULAI
  // ============================================
  async function handleCameraReady() {
    cameraReady = true;
    // Load face model
    await loadFaceModel();
    // Tandai camera_enabled di server
    await fetch('/api/proctor/camera-on', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: data.session.id })
    });
    // Masuk fullscreen
    try {
      await document.documentElement.requestFullscreen?.();
    } catch {}
  }

  function startTest() {
    started = true;
    questionStartTime = Date.now();

    // Timer cek wajah setiap 2 detik
    faceCheckTimer = setInterval(checkFace, 2000);

    // Snapshot periodik tiap 30 detik
    snapshotTimer = setInterval(async () => {
      if (cameraGuardRef?.getVideo) {
        await saveSnapshot(data.session.id, cameraGuardRef.getVideo(), 'periodic');
      }
    }, 30000);

    // Cek DevTools setiap 1 detik
    devtoolsTimer = setInterval(checkDevTools, 1000);
  }

  // ============================================
  // NAVIGASI SOAL
  // ============================================
  const current: any = $derived(data.questions[index]);
  const currentAnswer: any = $derived(answers[current?.id] ?? {});
  const progress: number = $derived(totalQuestions > 0 ? ((index + 1) / totalQuestions) * 100 : 0);
  const timeForThis: number = $derived(
    isIntel ? (current?.time_seconds || data.assignment.time_per_question_seconds || 60) : 0
  );

  async function saveIntel(qid: number, selected: string): Promise<void> {
    answers[qid] = { ...answers[qid], selected };
    await fetch('/api/test/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: data.session.id,
        question_id: qid,
        selected,
        time_taken_seconds: Math.round((Date.now() - questionStartTime) / 1000)
      })
    });
  }

  async function savePersonality(qid: number, most: string | null, least: string | null): Promise<void> {
    if (most && least && most === least) return alert('Pilihan tidak boleh sama');
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

  function nextQuestion(): void {
    if (index < totalQuestions - 1) {
      index++;
      questionStartTime = Date.now();
    }
  }
  function prevQuestion(): void {
    if (index > 0) {
      index--;
      questionStartTime = Date.now();
    }
  }

  async function submitTest(forced = false): Promise<void> {
    if (!forced && !confirm('Yakin menyelesaikan tes? Jawaban tidak dapat diubah lagi.')) return;
    submitting = true;
    stopAllTimers();

    const res = await fetch('/api/test/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: data.session.id })
    });

    if (res.ok) {
      try { await document.exitFullscreen?.(); } catch {}
      goto('/dashboard');
    } else {
      alert('Gagal submit');
      submitting = false;
    }
  }

  async function handleTimeout(): Promise<void> {
    if (isIntel && index < totalQuestions - 1) nextQuestion();
    else await submitTest();
  }

  function canNext(): boolean {
    if (isIntel) return !!currentAnswer.selected;
    return !!(currentAnswer.most && currentAnswer.least);
  }
</script>

<svelte:head><title>{data.assignment.category_name}</title></svelte:head>

<div class="mx-auto max-w-3xl space-y-4">
  <!-- 🔴 TERMINATE OVERLAY -->
  {#if terminate}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-red-600/95 p-4">
      <div class="max-w-md rounded-2xl bg-white p-6 text-center">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <span class="text-3xl">🚫</span>
        </div>
        <h2 class="mt-4 text-xl font-bold text-red-700">Tes Dibatalkan</h2>
        <p class="mt-2 text-sm text-red-600">
          Terlalu banyak pelanggaran terdeteksi. Tes Anda akan otomatis di-submit.
        </p>
        <p class="mt-4 text-xs text-slate-500">Anda akan diarahkan ke dashboard dalam beberapa detik...</p>
      </div>
    </div>
  {/if}

  <!-- ⚠️ WARNING BANNER -->
  {#if showWarning && !terminate}
    <div class="fixed left-1/2 top-4 z-40 -translate-x-1/2 transform rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-lg">
      ⚠️ {warningMessage}
    </div>
  {/if}

  <!-- 🔒 PRE-FLIGHT: CAMERA GUARD -->
  {#if !cameraReady}
    <div class="rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 to-white p-6">
      <h2 class="text-center text-xl font-bold text-primary-900">
        Persyaratan Sebelum Tes
      </h2>
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
            <p class="text-xs text-slate-500">Setiap pelanggaran akan dicatat</p>
          </div>
        </div>
        <div class="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
          <span class="text-xl">👁️</span>
          <div class="flex-1">
            <p class="text-sm font-semibold text-primary-900">Wajah Terlihat</p>
            <p class="text-xs text-slate-500">Tatap layar, jangan menunduk</p>
          </div>
        </div>
      </div>

      <div class="mt-5">
        <CameraGuard
          bind:this={cameraGuardRef}
          onReady={handleCameraReady}
          onError={(msg) => showWarningMsg(msg)}
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
  {:else if !started}
    <!-- Kamera siap, tombol sudah di dalam CameraGuard -->
  {:else}
    <!-- ============================ -->
    <!-- HALAMAN SOAL -->
    <!-- ============================ -->
    <div class="sticky top-0 z-10 rounded-xl border border-primary-200 bg-white p-4 shadow-sm">
      <div class="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 class="font-semibold text-primary-900">{data.assignment.category_name}</h2>
          <p class="text-xs text-slate-500">Soal {index + 1} dari {totalQuestions}</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="rounded-lg bg-primary-50 px-3 py-1.5">
            <p class="text-[10px] text-slate-500">Integritas</p>
            <p class="text-sm font-bold {integrityScore >= 75 ? 'text-green-700' : integrityScore >= 60 ? 'text-amber-700' : 'text-red-700'}">
              {integrityScore}
            </p>
          </div>
          {#if isIntel && timeForThis > 0}
            <TestTimer totalSeconds={timeForThis} onTimeout={handleTimeout} warningThreshold={15} />
          {/if}
        </div>
      </div>
      <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-primary-100">
        <div class="h-full rounded-full bg-primary-600 transition-all" style="width: {progress}%"></div>
      </div>
    </div>

    <div class="rounded-2xl border border-primary-200 bg-white p-6 shadow-sm">
      <div class="flex items-start gap-3">
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-sm font-bold text-primary-800">
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
            <label class="flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition
              {currentAnswer.selected === opt ? 'border-primary-500 bg-primary-50' : 'border-primary-100 bg-white hover:border-primary-300'}">
              <input type="radio" name={`q_${current.id}`} value={opt}
                checked={currentAnswer.selected === opt}
                onchange={() => saveIntel(current.id, opt)}
                class="h-4 w-4" />
              <span class="flex h-7 w-7 items-center justify-center rounded-lg font-bold
                {currentAnswer.selected === opt ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-800'}">
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
            <div class="rounded-xl border-2 p-4
              {currentAnswer.most === o.option_label || currentAnswer.least === o.option_label
                ? 'border-primary-300 bg-primary-50/50' : 'border-primary-100 bg-white'}">
              <div class="flex items-start gap-2">
                <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-100 text-xs font-bold text-primary-800">
                  {o.option_label}
                </span>
                <p class="flex-1 text-sm text-primary-900">{o.statement_text}</p>
              </div>
              <div class="mt-3 flex gap-2">
                <button type="button"
                  onclick={() => savePersonality(current.id, o.option_label, currentAnswer.least ?? null)}
                  class="flex-1 rounded-lg px-3 py-2 text-xs font-medium
                    {currentAnswer.most === o.option_label ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}">
                  Paling Sesuai
                </button>
                <button type="button"
                  onclick={() => savePersonality(current.id, currentAnswer.most ?? null, o.option_label)}
                  class="flex-1 rounded-lg px-3 py-2 text-xs font-medium
                    {currentAnswer.least === o.option_label ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}">
                  Paling Tidak Sesuai
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <div class="flex items-center justify-between gap-3">
      <Button variant="secondary" onclick={prevQuestion} disabled={index === 0}>← Sebelumnya</Button>
      {#if index === totalQuestions - 1}
        <Button variant="success" onclick={() => submitTest()} loading={submitting} disabled={!canNext()}>Selesai & Submit ✓</Button>
      {:else}
        <Button onclick={nextQuestion} disabled={!canNext()}>Selanjutnya →</Button>
      {/if}
    </div>
  {/if}
</div>