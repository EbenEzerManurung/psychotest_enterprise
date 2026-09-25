// src/lib/proctor.ts
// Semua logika monitoring di sini

export interface ProctorEvent {
  type: string;
  severity: 'info' | 'warning' | 'critical';
  scoreDelta: number;
  detail?: string;
}

// Aturan skor integritas
export const RULES = {
  camera_off: { severity: 'critical' as const, scoreDelta: -15, label: 'Kamera dimatikan' },
  blur: { severity: 'warning' as const, scoreDelta: -5, label: 'Berpindah dari halaman tes' },
  fullscreen_exit: { severity: 'warning' as const, scoreDelta: -10, label: 'Keluar dari fullscreen' },
  right_click: { severity: 'warning' as const, scoreDelta: -3, label: 'Klik kanan (indikasi copy)' },
  copy: { severity: 'warning' as const, scoreDelta: -10, label: 'Copy soal' },
  paste: { severity: 'warning' as const, scoreDelta: -10, label: 'Paste jawaban' },
  devtools: { severity: 'critical' as const, scoreDelta: -30, label: 'DevTools terdeteksi' },
  no_face: { severity: 'warning' as const, scoreDelta: -8, label: 'Wajah tidak terdeteksi' },
  multiple_faces: { severity: 'critical' as const, scoreDelta: -20, label: 'Lebih dari 1 wajah terdeteksi' },
  looking_down: { severity: 'warning' as const, scoreDelta: -5, label: 'Menunduk terlalu lama' },
  looking_away: { severity: 'warning' as const, scoreDelta: -4, label: 'Menoleh dari layar' },
  screenshot: { severity: 'warning' as const, scoreDelta: -5, label: 'Percobaan screenshot' }
} as const;

export type RuleKey = keyof typeof RULES;

// Kirim log ke server
export async function logProctorEvent(
  sessionId: number,
  rule: RuleKey,
  detail?: string
): Promise<void> {
  const r = RULES[rule];
  try {
    await fetch('/api/proctor/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        event_type: rule,
        severity: r.severity,
        score_delta: r.scoreDelta,
        detail: detail ?? r.label
      })
    });
  } catch (e) {
    console.warn('Gagal log proctor event:', e);
  }
}

// Snapshot kamera ke server
export async function saveSnapshot(
  sessionId: number,
  video: HTMLVideoElement,
  reason: string
): Promise<void> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
    await fetch('/api/proctor/snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, image_data: dataUrl, reason })
    });
  } catch (e) {
    console.warn('Gagal simpan snapshot:', e);
  }
}

// Ambil nilai integrity dari skor
export function integrityBadge(score: number): { label: string; color: string; variant: 'success' | 'warning' | 'danger' | 'info' } {
  if (score >= 90) return { label: 'Sangat Jujur', color: 'text-green-700', variant: 'success' };
  if (score >= 75) return { label: 'Jujur', color: 'text-primary-700', variant: 'success' };
  if (score >= 60) return { label: 'Mencurigakan', color: 'text-amber-700', variant: 'warning' };
  return { label: 'Indikasi Curang', color: 'text-red-700', variant: 'danger' };
}