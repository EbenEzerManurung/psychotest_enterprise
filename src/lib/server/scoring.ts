export const PERSONALITY_DIMENSIONS = [
  'integritas',
  'manajemen_konflik',
  'pendirian',
  'kreativitas',
  'teamwork',
  'interpersonal'
] as const;

export type Dimension = typeof PERSONALITY_DIMENSIONS[number];

export interface IntelAnswerInput {
  questionId: number;
  selectedAnswer: string | null;
  correctAnswer: string;
  weight: number;
}

export interface ScoreResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
}

export function calculateIntelligenceScore(answers: IntelAnswerInput[]): ScoreResult {
  let totalScore = 0;
  let maxScore = 0;
  for (const a of answers) {
    maxScore += a.weight;
    if (a.selectedAnswer && a.selectedAnswer === a.correctAnswer) {
      totalScore += a.weight;
    }
  }
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  return {
    totalScore: round2(totalScore),
    maxScore: round2(maxScore),
    percentage: round2(percentage)
  };
}

export function calculatePersonalityResult(
  answers: { selectedMost: string | null; selectedLeast: string | null; options: any[] }[]
): Record<Dimension, number> {
  const scores: Record<Dimension, number> = {
    integritas: 0,
    manajemen_konflik: 0,
    pendirian: 0,
    kreativitas: 0,
    teamwork: 0,
    interpersonal: 0
  };

  for (const ans of answers) {
    const most = ans.options.find((o) => o.option_label === ans.selectedMost);
    const least = ans.options.find((o) => o.option_label === ans.selectedLeast);

    if (most) {
      const dims = typeof most.dimension_score === 'string'
        ? JSON.parse(most.dimension_score)
        : most.dimension_score;
      for (const [dim, score] of Object.entries(dims)) {
        if (dim in scores) scores[dim as Dimension] += Number(score);
      }
    }
    if (least) {
      const dims = typeof least.dimension_score === 'string'
        ? JSON.parse(least.dimension_score)
        : least.dimension_score;
      for (const [dim, score] of Object.entries(dims)) {
        if (dim in scores) scores[dim as Dimension] -= Number(score);
      }
    }
  }

  for (const k of Object.keys(scores) as Dimension[]) {
    if (scores[k] < 0) scores[k] = 0;
  }
  return scores;
}

const DIM_DESCRIPTIONS: Record<Dimension, { high: string; low: string; label: string }> = {
  integritas: {
    label: 'Integritas',
    high: 'Memiliki integritas tinggi, jujur, dan dapat dipercaya',
    low: 'Perlu penguatan dalam hal kejujuran dan konsistensi'
  },
  manajemen_konflik: {
    label: 'Manajemen Konflik',
    high: 'Mampu mengelola konflik dengan bijak dan konstruktif',
    low: 'Perlu pengembangan keterampilan resolusi konflik'
  },
  pendirian: {
    label: 'Pendirian',
    high: 'Teguh pada prinsip dan tidak mudah terpengaruh',
    low: 'Perlu penguatan pendirian dan kepercayaan diri'
  },
  kreativitas: {
    label: 'Kreativitas',
    high: 'Kreatif, inovatif, dan mampu menemukan solusi baru',
    low: 'Cenderung konvensional, perlu stimulasi kreativitas'
  },
  teamwork: {
    label: 'Team Work',
    high: 'Sangat kooperatif dan mampu bekerja dalam tim dengan baik',
    low: 'Perlu peningkatan kemampuan kolaborasi'
  },
  interpersonal: {
    label: 'Interpersonal',
    high: 'Memiliki keterampilan interpersonal yang baik',
    low: 'Perlu pengembangan kemampuan komunikasi interpersonal'
  }
};

export function generateCharacterSummary(scores: Record<Dimension, number>): string {
  const lines: string[] = [];
  for (const dim of PERSONALITY_DIMENSIONS) {
    const score = scores[dim];
    const desc = DIM_DESCRIPTIONS[dim];
    const label = score >= 5 ? 'Kuat' : score >= 3 ? 'Cukup' : 'Perlu Perhatian';
    lines.push(`${desc.label} (${label}): ${score >= 3 ? desc.high : desc.low}`);
  }
  return lines.join('\n');
}

export const DIMENSION_LABELS: Record<string, string> = {
  integritas: 'Integritas',
  manajemen_konflik: 'Manajemen Konflik',
  pendirian: 'Pendirian',
  kreativitas: 'Kreativitas',
  teamwork: 'Team Work',
  interpersonal: 'Interpersonal'
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}