<script lang="ts">
  let {
    totalSeconds,
    initialRemaining,
    onTimeout
  }: {
    totalSeconds: number;
    initialRemaining: number;
    onTimeout: () => void;
  } = $props();

  let remaining: number = $state(Math.max(0, initialRemaining));
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const hours: string = $derived(Math.floor(remaining / 3600).toString().padStart(2, '0'));
  const minutes: string = $derived(Math.floor((remaining % 3600) / 60).toString().padStart(2, '0'));
  const seconds: string = $derived((remaining % 60).toString().padStart(2, '0'));
  const formatted: string = $derived(`${hours}:${minutes}:${seconds}`);
  const percentage: number = $derived(totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0);

  // Warning ketika < 5 menit (300 detik)
  const isWarning: boolean = $derived(remaining <= 300);
  // Critical ketika < 1 menit
  const isCritical: boolean = $derived(remaining <= 60);

  function start(): void {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        stop();
        onTimeout();
      }
    }, 1000);
  }

  function stop(): void {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  $effect(() => {
    start();
    return () => stop();
  });
</script>

<div
  class="flex items-center gap-3 rounded-lg border-2 px-4 py-2 transition
    {isCritical
      ? 'border-red-400 bg-red-50 text-red-700 animate-pulse'
      : isWarning
      ? 'border-amber-300 bg-amber-50 text-amber-700'
      : 'border-primary-200 bg-primary-50 text-primary-800'}"
>
  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
  <div class="flex flex-col">
    <span class="text-[10px] font-medium uppercase opacity-70">
      {isCritical ? '⚠️ Waktu Hampir Habis' : isWarning ? '⚠️ Sisa Waktu' : 'Total Waktu'}
    </span>
    <span class="font-mono text-lg font-bold tabular-nums leading-none">{formatted}</span>
  </div>
  <div class="ml-2 h-1.5 w-20 overflow-hidden rounded-full bg-white">
    <div
      class="h-full rounded-full transition-all duration-1000
        {isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-primary-600'}"
      style="width: {percentage}%"
    ></div>
  </div>
</div>
