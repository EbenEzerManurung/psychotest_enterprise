import { connectToDb } from '../db.js';

export default async function seed(): Promise<void> {
  const conn = await connectToDb();

  await conn.query(`
    INSERT INTO test_categories (id, code, name, description, total_time_seconds, time_per_question_seconds) VALUES
      (1, 'INTEL', 'Tes Intellegensi', 'Tes logika, penalaran, numerik, verbal, figural, aritmatika',
       2400, 0),
      (2, 'PERSONALITY', 'Tes Kepribadian', 'Tes karakter, sikap, integritas, teamwork, interpersonal',
       0, 0)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      description = VALUES(description),
      total_time_seconds = VALUES(total_time_seconds),
      time_per_question_seconds = VALUES(time_per_question_seconds)
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