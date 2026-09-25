<script lang="ts">
  import { onMount } from 'svelte';
  import { Chart, registerables } from 'chart.js';

  Chart.register(...registerables);

  let {
    labels,
    datasets,
    maxValue = 10
  }: {
    labels: string[];
    datasets: { label: string; data: number[]; color?: string }[];
    maxValue?: number;
  } = $props();

  let canvas: HTMLCanvasElement;
  let chart: Chart | null = null;

  const palette: string[] = ['#15803d', '#22c55e', '#4ade80', '#86efac', '#166534', '#16a34a'];

  function buildChart(): void {
    if (!canvas) return;
    if (chart) chart.destroy();

    chart = new Chart(canvas, {
      type: 'radar',
      data: {
        labels,
        datasets: datasets.map((d, i) => ({
          label: d.label,
          data: d.data,
          backgroundColor: (d.color ?? palette[i % palette.length]) + '33',
          borderColor: d.color ?? palette[i % palette.length],
          borderWidth: 2,
          pointBackgroundColor: d.color ?? palette[i % palette.length]
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: maxValue,
            ticks: { stepSize: Math.ceil(maxValue / 5), backdropColor: 'transparent' },
            grid: { color: '#d1fae5' },
            angleLines: { color: '#d1fae5' },
            pointLabels: { font: { size: 12, weight: 500 }, color: '#14532d' }
          }
        },
        plugins: { legend: { position: 'bottom', labels: { color: '#14532d' } } }
      }
    });
  }

  onMount(() => {
    buildChart();
    return () => chart?.destroy();
  });

  $effect(() => {
    JSON.stringify(datasets);
    buildChart();
  });
</script>

<div class="relative h-80 w-full">
  <canvas bind:this={canvas}></canvas>
</div>