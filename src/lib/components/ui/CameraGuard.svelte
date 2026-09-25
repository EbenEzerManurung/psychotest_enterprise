<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let {
    onReady,
    onError
  }: {
    onReady: () => void;
    onError: (msg: string) => void;
  } = $props();

  let videoEl: HTMLVideoElement;
  let status: 'idle' | 'requesting' | 'ready' | 'denied' | 'error' = $state('idle');
  let errorMsg: string = $state('');
  let stream: MediaStream | null = null;

  export async function requestCamera(): Promise<MediaStream | null> {
    status = 'requesting';
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: 'user'
        },
        audio: false
      });
      if (videoEl) {
        videoEl.srcObject = stream;
        await videoEl.play();
      }
      status = 'ready';
      return stream;
    } catch (err: any) {
      status = 'denied';
      errorMsg = err?.message || 'Izin kamera ditolak';
      onError(errorMsg);
      return null;
    }
  }

  export function stopCamera(): void {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
  }

  export function getStream(): MediaStream | null {
    return stream;
  }

  onMount(() => {
    // Auto-request saat mount
    requestCamera();
  });

  onDestroy(() => {
    stopCamera();
  });
</script>

<div class="rounded-2xl border-2 border-primary-200 bg-white p-6">
  <!-- Status: request -->
  {#if status === 'requesting' || status === 'idle'}
    <div class="text-center">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
        <svg class="h-8 w-8 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>
      <p class="mt-4 text-sm font-medium text-slate-700">Meminta izin kamera...</p>
      <p class="mt-1 text-xs text-slate-500">Klik "Allow"/"Izinkan" pada prompt browser</p>
    </div>
  {/if}

  <!-- Status: ready -->
  {#if status === 'ready'}
    <div class="text-center">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p class="mt-4 text-sm font-medium text-green-700">Kamera aktif</p>
      <p class="mt-1 text-xs text-slate-500">Anda siap mengerjakan tes</p>
      <button
        onclick={() => onReady()}
        class="mt-4 rounded-lg bg-primary-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800"
      >
        Mulai Tes Sekarang →
      </button>
    </div>
  {/if}

  <!-- Status: denied / error -->
  {#if status === 'denied' || status === 'error'}
    <div class="text-center">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-2.99L13.74 4a2 2 0 00-3.48 0L3.33 16.01A2 2 0 005.07 19z" />
        </svg>
      </div>
      <p class="mt-4 text-base font-bold text-red-700">Kamera Tidak Aktif</p>
      <p class="mt-2 text-sm text-red-600">
        Anda <strong>WAJIB</strong> mengaktifkan kamera untuk mengikuti tes ini.
      </p>

      <div class="mt-4 rounded-lg bg-red-50 p-3 text-left text-xs text-red-700">
        <p class="font-semibold">Cara mengaktifkan:</p>
        <ol class="mt-1 list-decimal pl-4">
          <li>Klik ikon 🔒 di address bar browser</li>
          <li>Cari "Camera" → ubah ke "Allow"</li>
          <li>Refresh halaman ini (F5)</li>
        </ol>
      </div>

      <button
        onclick={() => requestCamera()}
        class="mt-4 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        🔄 Coba Lagi
      </button>
    </div>
  {/if}

  <!-- Video preview (hidden untuk user, hanya untuk proses) -->
  <video
    bind:this={videoEl}
    autoplay
    muted
    playsinline
    class="mx-auto mt-4 h-32 w-40 rounded-lg bg-slate-900 {status === 'ready' ? '' : 'hidden'}"
  ></video>
</div>