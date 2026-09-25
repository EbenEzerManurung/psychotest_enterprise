// 003_seed_test_categories.js
import { connectToDb } from '../db.js';

export default async function seed() {
  const conn = await connectToDb();

  await conn.query(`
    INSERT INTO test_categories (id, code, name, description, total_time_seconds, time_per_question_seconds) VALUES
      (1, 'INTEL', 'Tes Intellegensi', 'Tes logika, penalaran, numerik, verbal, figural, aritmatika', 0, 60),
      (2, 'PERSONALITY', 'Tes Kepribadian', 'Tes karakter, sikap, integritas, teamwork, interpersonal', 1200, 0)
    ON DUPLICATE KEY UPDATE name = VALUES(name)
  `);

  await conn.query(`
    INSERT INTO test_subcategories (id, category_id, code, name) VALUES
      (1, 1, 'LOGIC', 'Logika & Penalaran'),
      (2, 1, 'NUMERIC', 'Pola Angka'),
      (3, 1, 'FIGURAL', 'Pola Gambar'),
      (4, 1, 'VERBAL', 'Sinonim & Antonim'),
      (5, 1, 'ANALOGY', 'Padanan Kata'),
      (6, 1, 'ARITH', 'Aritmatika')
    ON DUPLICATE KEY UPDATE name = VALUES(name)
  `);
}