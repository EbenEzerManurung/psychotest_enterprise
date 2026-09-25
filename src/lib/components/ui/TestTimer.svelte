<script lang="ts">
  let {
    totalSeconds,
    onTimeout,
    warningThreshold = 15
  }: {
    totalSeconds: number;
    onTimeout: () => void;
    warningThreshold?: number;
  } = $props();

  let remaining: number = $state(totalSeconds);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const formatted: string = $derived(
    `${Math.floor(remaining / 60).toString().padStart(2, '0')}:${(remaining % 60).toString().padStart(2, '0')}`
  );
  const percentage: number = $derived(totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0);
  const isWarning: boolean = $derived(remaining <= warningThreshold);

  function start(): void {
    if (intervalId) clearInterval(intervalId);
    remaining = totalSeconds;
    intervalId = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        stop();
        onTimeout();
      }
    }, 1000);
  }

  function stop(): void {
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
  }

  $effect(() => {
    totalSeconds;
    start();
    return () => stop();
  });
</script>

<div class="flex items-center gap-3 rounded-lg border px-4 py-2
  {isWarning ? 'border-red-200 bg-red-50 text-red-700' : 'border-primary-200 bg-primary-50 text-primary-800'}">
  <span class="font-mono text-lg font-semibold tabular-nums">{formatted}</span>
  <div class="h-1.5 w-24 overflow-hidden rounded-full bg-primary-100">
    <div class="h-full rounded-full transition-all duration-1000 {isWarning ? 'bg-red-500' : 'bg-primary-600'}"
      style="width: {percentage}%"></div>
  </div>
</div>