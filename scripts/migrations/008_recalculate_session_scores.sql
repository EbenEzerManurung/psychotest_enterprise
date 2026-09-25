-- ============================================
-- Migration: Recalculate session scores
-- ============================================
-- Fix data lama yang dihitung dengan formula lama:
-- - Sebelumnya: max_score = jumlah soal yang DIJAWAB saja
-- - Sekarang:   max_score = jumlah SEMUA soal aktif
--
-- Data lama yang sudah terlanjur tersimpan akan di-recalculate.
-- Data baru otomatis benar karena kode submit sudah diperbaiki.
-- ============================================

-- ============================================
-- INTELLEGENSI: max_score = SUM(score_weight semua soal aktif)
-- ============================================
UPDATE test_sessions ts
SET
  ts.max_score = (
    SELECT COALESCE(SUM(iq.score_weight), 0)
    FROM intelligence_questions iq
    WHERE iq.is_active = 1
  ),
  ts.percentage = ROUND(
    (ts.total_score / NULLIF(
      (SELECT COALESCE(SUM(iq.score_weight), 0)
       FROM intelligence_questions iq
       WHERE iq.is_active = 1), 0
    )) * 100,
    2
  )
WHERE ts.category_id = 1
  AND ts.status = 'completed';

-- ============================================
-- KEPRIBADIAN: max_score = jumlah soal aktif × 3
-- ============================================
UPDATE test_sessions ts
SET
  ts.max_score = (
    SELECT COUNT(*) * 3
    FROM personality_questions
    WHERE is_active = 1
  ),
  ts.percentage = ROUND(
    (ts.total_score / NULLIF(
      (SELECT COUNT(*) * 3
       FROM personality_questions
       WHERE is_active = 1), 0
    )) * 100,
    2
  )
WHERE ts.category_id = 2
  AND ts.status = 'completed';
