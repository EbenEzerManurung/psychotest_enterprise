// src/lib/scoring-labels.ts
// Helper untuk convert skor angka → label status

export type ScoreLevel = {
  label: string;
  icon: string;
  color: 'green' | 'primary' | 'amber' | 'red';
  variant: 'success' | 'info' | 'warning' | 'danger';
};

/**
 * Label untuk skor Kepribadian (0-100%)
 * Skor kepribadian ini mengukur karakter (integritas, teamwork, dll)
 */
export function personalityLevel(score: number): ScoreLevel {
  if (score >= 85) return { label: 'Sangat Baik', icon: '⭐', color: 'green', variant: 'success' };
  if (score >= 70) return { label: 'Baik', icon: '✅', color: 'primary', variant: 'success' };
  if (score >= 55) return { label: 'Cukup', icon: '➡️', color: 'amber', variant: 'warning' };
  return { label: 'Kurang', icon: '⚠️', color: 'red', variant: 'danger' };
}

/**
 * Label untuk skor Intellegensi (0-100%)
 * Mengukur kemampuan logika, numerik, verbal, dll
 */
export function intelligenceLevel(score: number): ScoreLevel {
  if (score >= 80) return { label: 'Sangat Baik', icon: '⭐', color: 'green', variant: 'success' };
  if (score >= 65) return { label: 'Baik', icon: '✅', color: 'primary', variant: 'success' };
  if (score >= 50) return { label: 'Cukup', icon: '➡️', color: 'amber', variant: 'warning' };
  return { label: 'Kurang', icon: '⚠️', color: 'red', variant: 'danger' };
}

/**
 * Label untuk skor Integritas (0-100)
 * Mengukur kejujuran berdasarkan proctoring
 */
export function integrityLevel(score: number): ScoreLevel {
  if (score >= 90) return { label: 'Sangat Jujur', icon: '✅', color: 'green', variant: 'success' };
  if (score >= 75) return { label: 'Jujur', icon: '✅', color: 'primary', variant: 'success' };
  if (score >= 60) return { label: 'Mencurigakan', icon: '⚠️', color: 'amber', variant: 'warning' };
  return { label: 'Indikasi Curang', icon: '❌', color: 'red', variant: 'danger' };
}

/**
 * Label otomatis berdasarkan kategori tes
 */
export function scoreLevelByCategory(categoryCode: string, score: number): ScoreLevel {
  if (categoryCode === 'INTEL') return intelligenceLevel(score);
  if (categoryCode === 'PERSONALITY') return personalityLevel(score);
  return personalityLevel(score);
}
