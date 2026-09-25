// 004_seed_questions.js
import { connectToDb } from '../db.js';

export default async function seed() {
  const conn = await connectToDb();

  await conn.query(`
    INSERT INTO intelligence_questions
      (id, subcategory_id, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty, score_weight, time_seconds, order_number) VALUES
      (1, 1, 'Jika semua A adalah B, dan semua B adalah C, maka...',
       'Semua A adalah C', 'Semua C adalah A', 'Tidak ada A yang C', 'Sebagian A bukan C', 'A', 'medium', 1, 60, 1),
      (2, 2, 'Lanjutkan pola: 2, 4, 8, 16, ...',
       '20', '24', '32', '36', 'C', 'easy', 1, 60, 2),
      (3, 2, 'Lanjutkan pola: 1, 4, 9, 16, 25, ...',
       '30', '36', '42', '49', 'B', 'easy', 1, 60, 3),
      (4, 5, 'Dokter : Rumah Sakit = Guru : ...',
       'Murid', 'Buku', 'Sekolah', 'Papan Tulis', 'C', 'easy', 1, 45, 4),
      (5, 4, 'Sinonim dari kata "ABOLISI" adalah...',
       'Penghapusan', 'Penambahan', 'Pengurangan', 'Pembagian', 'A', 'medium', 1, 30, 5),
      (6, 4, 'Antonim dari kata "GERSANG" adalah...',
       'Kering', 'Subur', 'Tandus', 'Panas', 'B', 'medium', 1, 30, 6),
      (7, 6, 'Jika 3x + 5 = 20, maka nilai x adalah...',
       '3', '4', '5', '6', 'C', 'easy', 1, 60, 7),
      (8, 6, 'Sebuah barang dijual Rp 120.000 dengan diskon 25%. Harga asli barang adalah...',
       'Rp 150.000', 'Rp 160.000', 'Rp 170.000', 'Rp 180.000', 'B', 'medium', 1, 90, 8),
      (9, 3, 'Jika gambar lingkaran diputar 90 derajat, bentuknya akan menjadi...',
       'Tetap lingkaran', 'Oval horizontal', 'Oval vertikal', 'Persegi', 'A', 'easy', 1, 30, 9),
      (10, 1, 'Semua mahasiswa harus membaca buku. Budi adalah mahasiswa. Kesimpulannya...',
       'Budi tidak harus membaca', 'Budi harus membaca buku', 'Budi boleh membaca', 'Budi dilarang membaca', 'B', 'easy', 1, 60, 10)
    ON DUPLICATE KEY UPDATE question_text = VALUES(question_text)
  `);

  await conn.query(`
    INSERT INTO personality_questions (id, question_text, question_type, dimension, order_number) VALUES
      (1, 'Pilih pernyataan yang paling sesuai dan paling tidak sesuai dengan diri Anda:', 'ipsative', 'integritas', 1),
      (2, 'Pilih pernyataan yang paling sesuai dan paling tidak sesuai dengan diri Anda:', 'ipsative', 'teamwork', 2),
      (3, 'Pilih pernyataan yang paling sesuai dan paling tidak sesuai dengan diri Anda:', 'ipsative', 'kreativitas', 3),
      (4, 'Pilih pernyataan yang paling sesuai dan paling tidak sesuai dengan diri Anda:', 'ipsative', 'manajemen_konflik', 4),
      (5, 'Pilih pernyataan yang paling sesuai dan paling tidak sesuai dengan diri Anda:', 'ipsative', 'pendirian', 5),
      (6, 'Pilih pernyataan yang paling sesuai dan paling tidak sesuai dengan diri Anda:', 'ipsative', 'interpersonal', 6)
    ON DUPLICATE KEY UPDATE question_text = VALUES(question_text)
  `);

  await conn.query(`
    INSERT INTO personality_options (question_id, option_label, statement_text, dimension_score) VALUES
      (1,'A','Saya selalu berkata jujur meskipun sulit', '{"integritas":3,"pendirian":1}'),
      (1,'B','Saya cenderung mengikuti apa kata orang lain', '{"integritas":0,"pendirian":0}'),
      (1,'C','Saya menyelesaikan tugas tepat waktu', '{"integritas":2,"teamwork":1}'),
      (1,'D','Saya sering menunda pekerjaan', '{"integritas":0,"pendirian":0}'),
      (2,'A','Saya senang bekerja dalam tim', '{"teamwork":3,"interpersonal":2}'),
      (2,'B','Saya lebih suka bekerja sendiri', '{"teamwork":0,"interpersonal":0}'),
      (2,'C','Saya suka membantu rekan yang kesulitan', '{"teamwork":3,"interpersonal":2}'),
      (2,'D','Saya tidak peduli dengan rekan kerja', '{"teamwork":0,"interpersonal":0}'),
      (3,'A','Saya sering mencoba cara-cara baru', '{"kreativitas":3}'),
      (3,'B','Saya lebih suka cara lama yang sudah terbukti', '{"kreativitas":1}'),
      (3,'C','Saya senang mencari solusi alternatif', '{"kreativitas":3}'),
      (3,'D','Saya tidak tertarik dengan ide-ide baru', '{"kreativitas":0}'),
      (4,'A','Saya tetap tenang saat terjadi konflik', '{"manajemen_konflik":3}'),
      (4,'B','Saya cenderung menghindari konflik', '{"manajemen_konflik":1}'),
      (4,'C','Saya berusaha mencari jalan tengah', '{"manajemen_konflik":3}'),
      (4,'D','Saya suka memperkeruh suasana', '{"manajemen_konflik":0}'),
      (5,'A','Saya berpegang teguh pada prinsip saya', '{"pendirian":3}'),
      (5,'B','Saya mudah terpengaruh orang lain', '{"pendirian":0}'),
      (5,'C','Saya berani menyampaikan pendapat', '{"pendirian":3}'),
      (5,'D','Saya lebih suka diam saja', '{"pendirian":1}'),
      (6,'A','Saya mudah bergaul dengan siapa saja', '{"interpersonal":3}'),
      (6,'B','Saya sulit memulai percakapan', '{"interpersonal":0}'),
      (6,'C','Saya mendengarkan dengan empati', '{"interpersonal":3}'),
      (6,'D','Saya tidak peduli perasaan orang lain', '{"interpersonal":0}')
    ON DUPLICATE KEY UPDATE statement_text = VALUES(statement_text)
  `);
}