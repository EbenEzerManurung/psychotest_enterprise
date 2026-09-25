import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { execute, query, queryOne } from '$lib/server/db';
import {
  calculateIntelligenceScore,
  calculatePersonalityResult,
  generateCharacterSummary
} from '$lib/server/scoring';

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const { session_id } = await request.json();
  if (!session_id) return json({ error: 'Invalid payload' }, { status: 400 });

  const session = await queryOne<any>(
    `SELECT ts.*, tc.code AS category_code
     FROM test_sessions ts
     JOIN test_categories tc ON tc.id = ts.category_id
     WHERE ts.id = ? AND ts.status = 'in_progress'`,
    [session_id]
  );
  if (!session) return json({ error: 'Session tidak valid' }, { status: 400 });

  const startedAt = new Date(session.started_at).getTime();
  const timeSpent = Math.round((Date.now() - startedAt) / 1000);

  // ============================================
  // INTELLEGENSI — Hitung TOTAL SOAL, kosong = salah
  // ============================================
  if (session.category_code === 'INTEL') {
    // ✅ Ambil SEMUA soal aktif dengan kunci jawaban
    const allQuestions = await query<any>(
      `SELECT id, correct_answer, score_weight
       FROM intelligence_questions
       WHERE is_active = 1`
    );

    // Ambil jawaban yang tersimpan
    const savedAnswers = await query<any>(
      `SELECT question_id, selected_answer
       FROM intelligence_answers
       WHERE session_id = ?`,
      [session_id]
    );

    // Map answers by question_id
    const answerMap = new Map<number, string | null>();
    for (const a of savedAnswers) {
      answerMap.set(a.question_id, a.selected_answer);
    }

    // ✅ Bangun list semua soal — yang kosong dianggap selectedAnswer = null
    const fullAnswers = allQuestions.map((q) => ({
      questionId: q.id,
      selectedAnswer: answerMap.get(q.id) ?? null,
      correctAnswer: q.correct_answer,
      weight: Number(q.score_weight)
    }));

    const score = calculateIntelligenceScore(fullAnswers);

    await execute(
      `UPDATE test_sessions SET
        status = 'completed', finished_at = NOW(),
        total_score = ?, max_score = ?, percentage = ?, time_spent_seconds = ?
       WHERE id = ?`,
      [score.totalScore, score.maxScore, score.percentage, timeSpent, session_id]
    );
  } else {
    // ============================================
    // KEPRIBADIAN — Hitung TOTAL SOAL, kosong = 0 poin
    // ============================================
    // ✅ Ambil SEMUA soal kepribadian aktif
    const allQuestions = await query<any>(
      `SELECT id FROM personality_questions WHERE is_active = 1 ORDER BY order_number, id`
    );

    // Ambil jawaban tersimpan
    const savedAnswers = await query<any>(
      `SELECT question_id, selected_most, selected_least
       FROM personality_answers
       WHERE session_id = ?`,
      [session_id]
    );

    const answerMap = new Map<number, { most: string | null; least: string | null }>();
    for (const a of savedAnswers) {
      answerMap.set(a.question_id, {
        most: a.selected_most,
        least: a.selected_least
      });
    }

    // ✅ Bangun list lengkap semua soal
    const enriched = [];
    for (const q of allQuestions) {
      const opts = await query<any>(
        `SELECT option_label, dimension_score FROM personality_options WHERE question_id = ?`,
        [q.id]
      );
      const ans = answerMap.get(q.id) ?? { most: null, least: null };
      enriched.push({
        selectedMost: ans.most,
        selectedLeast: ans.least,
        options: opts
      });
    }

    const scores = calculatePersonalityResult(enriched);
    const summary = generateCharacterSummary(scores);
    const total = Object.values(scores).reduce((a, b) => a + b, 0);

    // ✅ Max score = jumlah soal × 3 (skor tertinggi per soal)
    const maxScore = allQuestions.length * 3;
    const percentage = maxScore > 0 ? (total / maxScore) * 100 : 0;

    await execute(
      `UPDATE test_sessions SET
        status = 'completed', finished_at = NOW(),
        total_score = ?, max_score = ?, percentage = ?, time_spent_seconds = ?
       WHERE id = ?`,
      [total, maxScore, Math.min(percentage, 100).toFixed(2), timeSpent, session_id]
    );

    await execute(
      `INSERT INTO personality_results
        (session_id, candidate_id, integrity_score, conflict_mgmt_score, conviction_score,
         creativity_score, teamwork_score, interpersonal_score, character_summary, raw_dimension_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         integrity_score=VALUES(integrity_score), conflict_mgmt_score=VALUES(conflict_mgmt_score),
         conviction_score=VALUES(conviction_score), creativity_score=VALUES(creativity_score),
         teamwork_score=VALUES(teamwork_score), interpersonal_score=VALUES(interpersonal_score),
         character_summary=VALUES(character_summary)`,
      [
        session_id, session.candidate_id,
        scores.integritas, scores.manajemen_konflik, scores.pendirian,
        scores.kreativitas, scores.teamwork, scores.interpersonal,
        summary, JSON.stringify(scores)
      ]
    );
  }

  // Tandai assignment terpakai
  await execute(
    `UPDATE test_assignments SET is_used = 1
     WHERE candidate_id = ? AND category_id = ? AND is_used = 0`,
    [session.candidate_id, session.category_id]
  );

  return json({ success: true });
};