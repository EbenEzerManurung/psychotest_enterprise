// 004_seed_questions.ts
import { connectToDb } from '../db.js';

export default async function seed(): Promise<void> {
  const conn = await connectToDb();

  // ============================================
  // 60 SOAL INTELLEGENSI (10 per sub-kategori)
  // ============================================
  await conn.query(`
    INSERT INTO intelligence_questions
      (id, subcategory_id, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty, score_weight, time_seconds, order_number) VALUES
      (1, 1, 'Jika semua A adalah B, dan semua B adalah C, maka...',
       'Semua A adalah C', 'Semua C adalah A', 'Tidak ada A yang C', 'Sebagian A bukan C', 'A', 'medium', 1, 60, 1),
      (2, 1, 'Semua mahasiswa harus membaca buku. Budi adalah mahasiswa. Kesimpulannya...',
       'Budi tidak harus membaca', 'Budi harus membaca buku', 'Budi boleh membaca', 'Budi dilarang membaca', 'B', 'easy', 1, 60, 2),
      (3, 1, 'Jika hari hujan, maka jalan basah. Hari ini hujan. Maka...',
       'Jalan tidak basah', 'Jalan basah', 'Jalan mungkin basah', 'Tidak dapat disimpulkan', 'B', 'easy', 1, 60, 3),
      (4, 1, 'Jika A > B dan B > C, maka...',
       'A < C', 'A = C', 'A > C', 'Tidak dapat disimpulkan', 'C', 'easy', 1, 60, 4),
      (5, 1, 'Tidak ada A yang B. Semua C adalah A. Maka...',
       'Semua C adalah B', 'Tidak ada C yang B', 'Sebagian C adalah B', 'Tidak dapat disimpulkan', 'B', 'medium', 1, 60, 5),
      (6, 1, 'Jika P maka Q. Ternyata tidak Q. Maka...',
       'P benar', 'P salah', 'Q benar', 'Tidak dapat disimpulkan', 'B', 'medium', 1, 60, 6),
      (7, 1, 'Semua dokter pandai. Andi bukan dokter. Maka...',
       'Andi pandai', 'Andi tidak pandai', 'Andi mungkin pandai', 'Tidak dapat disimpulkan', 'D', 'medium', 1, 60, 7),
      (8, 1, 'Budi lebih tinggi dari Andi. Andi lebih tinggi dari Cici. Siapa yang paling pendek?',
       'Budi', 'Andi', 'Cici', 'Semua sama', 'C', 'easy', 1, 60, 8),
      (9, 1, 'Sebagian pelajar suka matematika. Semua yang suka matematika rajin. Maka...',
       'Semua pelajar rajin', 'Sebagian pelajar rajin', 'Tidak ada pelajar rajin', 'Tidak dapat disimpulkan', 'B', 'medium', 1, 60, 9),
      (10, 1, 'Jika logam dipanaskan memuai. Benda X tidak memuai. Maka...',
       'Benda X logam', 'Benda X bukan logam', 'Benda X mungkin logam', 'Tidak dapat disimpulkan', 'B', 'hard', 1, 60, 10),
      (11, 2, 'Lanjutkan pola: 2, 4, 8, 16, ...',
       '20', '24', '32', '36', 'C', 'easy', 1, 60, 11),
      (12, 2, 'Lanjutkan pola: 1, 4, 9, 16, 25, ...',
       '30', '36', '42', '49', 'B', 'easy', 1, 60, 12),
      (13, 2, 'Lanjutkan pola: 1, 1, 2, 3, 5, 8, ...',
       '11', '12', '13', '14', 'C', 'medium', 1, 60, 13),
      (14, 2, 'Lanjutkan pola: 3, 6, 12, 24, ...',
       '36', '42', '48', '54', 'C', 'easy', 1, 60, 14),
      (15, 2, 'Lanjutkan pola: 1, 3, 5, 7, ...',
       '8', '9', '10', '11', 'B', 'easy', 1, 45, 15),
      (16, 2, 'Lanjutkan pola: 2, 6, 12, 20, 30, ...',
       '36', '40', '42', '46', 'C', 'medium', 1, 60, 16),
      (17, 2, 'Lanjutkan pola: 100, 50, 25, 12.5, ...',
       '5', '6', '6.25', '7.5', 'C', 'medium', 1, 60, 17),
      (18, 2, 'Lanjutkan pola: 1, 8, 27, 64, ...',
       '100', '121', '125', '144', 'C', 'medium', 1, 60, 18),
      (19, 2, 'Lanjutkan pola: 1, 2, 6, 24, 120, ...',
       '240', '480', '600', '720', 'D', 'hard', 1, 90, 19),
      (20, 2, 'Lanjutkan pola: 1, 4, 9, 16, 25, 36, ...',
       '42', '45', '49', '56', 'C', 'easy', 1, 60, 20),
      (21, 3, 'Jika gambar lingkaran diputar 90 derajat, bentuknya akan menjadi...',
       'Tetap lingkaran', 'Oval horizontal', 'Oval vertikal', 'Persegi', 'A', 'easy', 1, 30, 21),
      (22, 3, 'Berapa jumlah sisi pada bangun segi enam?',
       '5', '6', '7', '8', 'B', 'easy', 1, 30, 22),
      (23, 3, 'Bangun datar dengan 4 sisi sama panjang dan 4 sudut siku-siku adalah...',
       'Persegi panjang', 'Belah ketupat', 'Persegi', 'Trapesium', 'C', 'easy', 1, 30, 23),
      (24, 3, 'Jumlah rusuk pada bangun balok adalah...',
       '8', '10', '12', '14', 'C', 'medium', 1, 45, 24),
      (25, 3, 'Segitiga sama sisi memiliki besar sudut masing-masing...',
       '45°', '60°', '90°', '120°', 'B', 'easy', 1, 30, 25),
      (26, 3, 'Jaring-jaring 6 persegi identik akan membentuk...',
       'Balok', 'Kubus', 'Limas', 'Prisma', 'B', 'medium', 1, 45, 26),
      (27, 3, 'Bangun ruang dengan 5 sisi (1 persegi dan 4 segitiga) adalah...',
       'Kubus', 'Balok', 'Limas segiempat', 'Prisma segitiga', 'C', 'medium', 1, 45, 27),
      (28, 3, 'Total sudut dalam sebuah segitiga adalah...',
       '90°', '120°', '180°', '360°', 'C', 'easy', 1, 30, 28),
      (29, 3, 'Banyak simetri lipat pada bangun persegi adalah...',
       '1', '2', '3', '4', 'D', 'medium', 1, 45, 29),
      (30, 3, 'Jika kubus dipotong 8 kubus kecil, total rusuk semua kubus kecil?',
       '48', '72', '96', '120', 'C', 'hard', 1, 90, 30),
      (31, 4, 'Sinonim dari kata "ABOLISI" adalah...',
       'Penghapusan', 'Penambahan', 'Pengurangan', 'Pembagian', 'A', 'medium', 1, 30, 31),
      (32, 4, 'Antonim dari kata "GERSANG" adalah...',
       'Kering', 'Subur', 'Tandus', 'Panas', 'B', 'medium', 1, 30, 32),
      (33, 4, 'Sinonim dari kata "INSENTIF" adalah...',
       'Denda', 'Bonus', 'Pajak', 'Utang', 'B', 'medium', 1, 30, 33),
      (34, 4, 'Antonim dari kata "MAYOR" adalah...',
       'Minor', 'Besar', 'Utama', 'Banyak', 'A', 'easy', 1, 30, 34),
      (35, 4, 'Sinonim dari kata "KONTRADIKSI" adalah...',
       'Persetujuan', 'Pertentangan', 'Kerjasama', 'Perdamaian', 'B', 'medium', 1, 30, 35),
      (36, 4, 'Antonim dari kata "ANARKI" adalah...',
       'Kekacauan', 'Keteraturan', 'Kekerasan', 'Kerusuhan', 'B', 'hard', 1, 30, 36),
      (37, 4, 'Sinonim dari kata "EVOKASI" adalah...',
       'Penolakan', 'Penggugah', 'Penyimpanan', 'Penghapusan', 'B', 'hard', 1, 45, 37),
      (38, 4, 'Antonim dari kata "PROMINEN" adalah...',
       'Terkenal', 'Biasa', 'Penting', 'Menonjol', 'B', 'medium', 1, 30, 38),
      (39, 4, 'Sinonim dari kata "RANCU" adalah...',
       'Rapi', 'Kacau', 'Jelas', 'Teratur', 'B', 'easy', 1, 30, 39),
      (40, 4, 'Antonim dari kata "KONKRET" adalah...',
       'Nyata', 'Abstrak', 'Jelas', 'Pasti', 'B', 'medium', 1, 30, 40),
      (41, 5, 'Dokter : Rumah Sakit = Guru : ...',
       'Murid', 'Buku', 'Sekolah', 'Papan Tulis', 'C', 'easy', 1, 45, 41),
      (42, 5, 'Kucing : Meong = Anjing : ...',
       'Mengaum', 'Guk', 'Cit', 'Kukuruyuk', 'B', 'easy', 1, 30, 42),
      (43, 5, 'Buku : Halaman = Rumah : ...',
       'Pintu', 'Kamar', 'Atap', 'Dinding', 'B', 'medium', 1, 45, 43),
      (44, 5, 'Air : Haus = Makanan : ...',
       'Kenyang', 'Lapar', 'Enak', 'Sehat', 'B', 'medium', 1, 45, 44),
      (45, 5, 'Pena : Menulis = Pisau : ...',
       'Tajam', 'Memotong', 'Besi', 'Dapur', 'B', 'easy', 1, 30, 45),
      (46, 5, 'Mata : Melihat = Telinga : ...',
       'Berbicara', 'Mendengar', 'Mencium', 'Meraba', 'B', 'easy', 1, 30, 46),
      (47, 5, 'Petani : Sawah = Nelayan : ...',
       'Perahu', 'Ikan', 'Laut', 'Jaring', 'C', 'easy', 1, 30, 47),
      (48, 5, 'Kunci : Pintu = Password : ...',
       'Komputer', 'Akun', 'Internet', 'Email', 'B', 'medium', 1, 45, 48),
      (49, 5, 'Kaki : Sepatu = Tangan : ...',
       'Cincin', 'Sarung tangan', 'Gelang', 'Jam', 'B', 'medium', 1, 45, 49),
      (50, 5, 'Bulan : Tahun = Hari : ...',
       'Jam', 'Minggu', 'Detik', 'Menit', 'B', 'medium', 1, 45, 50),
      (51, 6, 'Jika 3x + 5 = 20, maka nilai x adalah...',
       '3', '4', '5', '6', 'C', 'easy', 1, 60, 51),
      (52, 6, 'Barang dijual Rp 120.000 diskon 25%. Harga asli adalah...',
       'Rp 150.000', 'Rp 160.000', 'Rp 170.000', 'Rp 180.000', 'B', 'medium', 1, 90, 52),
      (53, 6, '15% dari 200 adalah...',
       '15', '20', '30', '40', 'C', 'easy', 1, 60, 53),
      (54, 6, 'Jika 2x - 4 = 10, maka nilai x adalah...',
       '5', '6', '7', '8', 'C', 'easy', 1, 60, 54),
      (55, 6, 'Mobil menempuh 240 km dalam 4 jam. Kecepatan rata-rata...',
       '50 km/jam', '60 km/jam', '70 km/jam', '80 km/jam', 'B', 'easy', 1, 60, 55),
      (56, 6, 'Harga Rp 80.000 naik 20%. Harga baru...',
       'Rp 92.000', 'Rp 94.000', 'Rp 96.000', 'Rp 98.000', 'C', 'medium', 1, 90, 56),
      (57, 6, '5 pekerja butuh 10 hari. 10 pekerja akan butuh...',
       '2 hari', '5 hari', '10 hari', '20 hari', 'B', 'medium', 1, 90, 57),
      (58, 6, 'Rata-rata dari 4, 6, 8, 10 adalah...',
       '6', '7', '8', '9', 'B', 'easy', 1, 60, 58),
      (59, 6, 'Tabungan Rp 500.000 bunga 5%/tahun. Bunga setelah 1 tahun...',
       'Rp 20.000', 'Rp 25.000', 'Rp 30.000', 'Rp 50.000', 'B', 'medium', 1, 90, 59),
      (60, 6, 'Hasil dari (15 + 5) × 2 - 10 ÷ 2 adalah...',
       '30', '35', '40', '45', 'B', 'hard', 1, 90, 60)
    ON DUPLICATE KEY UPDATE question_text = VALUES(question_text)
  `);

  // ============================================
  // 90 SOAL KEPRIBADIAN (15 per dimensi)
  // ============================================
  const bankSoal: Record<string, Array<[string, string, string, string]>> = {
    integritas: [
      ['Saya selalu berkata jujur meskipun sulit', 'Saya suka bercanda berlebihan', 'Saya menyelesaikan tugas tepat waktu', 'Saya sering menunda pekerjaan'],
      ['Saya mengakui kesalahan yang saya buat', 'Saya sulit mengakui kesalahan', 'Saya bertanggung jawab atas tindakan saya', 'Saya cenderung menyalahkan orang lain'],
      ['Saya menepati janji yang saya ucapkan', 'Saya sering lupa janji', 'Saya berusaha menepati komitmen', 'Saya mudah membatalkan janji'],
      ['Saya tidak menyontek saat ujian', 'Saya pernah menyontek', 'Saya mengerjakan sendiri tugas saya', 'Saya suka minta jawaban orang lain'],
      ['Saya transparan soal kesalahan saya', 'Saya menyembunyikan kesalahan', 'Saya terbuka soal kekurangan saya', 'Saya menutupi kelemahan saya'],
      ['Saya mengembalikan uang lebih yang bukan hak saya', 'Saya sering ambil kelebihan', 'Saya teliti dalam hitungan uang', 'Saya kurang peduli soal uang kecil'],
      ['Saya tidak memanipulasi data', 'Saya pernah memanipulasi data', 'Saya menjaga akurasi laporan saya', 'Saya suka melebih-lebihkan hasil'],
      ['Saya setia pada aturan yang berlaku', 'Saya suka melanggar aturan kecil', 'Saya menghormati kebijakan perusahaan', 'Saya sering cari celah aturan'],
      ['Saya jujur soal kemampuan saya', 'Saya suka melebih-lebihkan kemampuan', 'Saya mengakui hal yang belum saya kuasai', 'Saya sulit mengakui kekurangan'],
      ['Saya tidak mengambil barang kantor', 'Saya pernah pakai fasilitas kantor pribadi', 'Saya menjaga aset perusahaan', 'Saya kurang peduli aset kantor'],
      ['Saya berkata apa adanya', 'Saya suka memutar balik fakta', 'Saya menyampaikan kebenaran', 'Saya suka menambah cerita'],
      ['Saya konsisten antara ucapan dan tindakan', 'Saya sering tidak konsisten', 'Saya berusaha menepati kata-kata saya', 'Saya mudah berubah pikiran'],
      ['Saya menolak suap dalam bentuk apapun', 'Saya sulit menolak hadiah', 'Saya menjaga etika profesional', 'Saya suka terima gratifikasi'],
      ['Saya melaporkan pelanggaran yang saya lihat', 'Saya cenderung diam saat lihat pelanggaran', 'Saya berani speak up', 'Saya takut melaporkan kesalahan'],
      ['Saya menjaga rahasia perusahaan', 'Saya suka gosip tentang kantor', 'Saya menjaga kerahasiaan data', 'Saya suka berbagi info internal']
    ],
    teamwork: [
      ['Saya senang bekerja dalam tim', 'Saya lebih suka bekerja sendiri', 'Saya suka kolaborasi dengan rekan', 'Saya tidak nyaman kerja kelompok'],
      ['Saya suka membantu rekan yang kesulitan', 'Saya tidak peduli rekan yang kesulitan', 'Saya aktif menawarkan bantuan', 'Saya sibuk dengan pekerjaan sendiri'],
      ['Saya mendengarkan pendapat orang lain', 'Saya hanya mau pendapat saya dipakai', 'Saya terbuka pada ide berbeda', 'Saya sulit menerima kritik'],
      ['Saya berbagi kredit keberhasilan dengan tim', 'Saya suka mengklaim keberhasilan sendiri', 'Saya mengakui kontribusi orang lain', 'Saya suka menonjolkan diri'],
      ['Saya mengutamakan tujuan tim', 'Saya hanya peduli tujuan pribadi', 'Saya kooperatif dengan keputusan tim', 'Saya suka bertindak sendiri'],
      ['Saya menghargai keragaman anggota tim', 'Saya sulit bekerja dengan orang berbeda', 'Saya adaptif dengan berbagai karakter', 'Saya suka memilih rekan kerja'],
      ['Saya aktif komunikasi dengan rekan', 'Saya suka menyimpan informasi sendiri', 'Saya sering diskusi dengan tim', 'Saya jarang berkomunikasi'],
      ['Saya memuji rekan atas kerja bagus', 'Saya jarang memberi pujian', 'Saya mengapresiasi usaha orang lain', 'Saya cuek pada kerja rekan'],
      ['Saya berkompromi saat terjadi perbedaan', 'Saya keras kepala dengan pendapat saya', 'Saya mencari solusi bersama', 'Saya sulit kompromi'],
      ['Saya mendukung rekan yang terpuruk', 'Saya tidak peduli rekan gagal', 'Saya suka memotivasi rekan', 'Saya sibuk urusan sendiri'],
      ['Saya menghargai waktu rekan kerja', 'Saya sering bikin orang menunggu', 'Saya hadir tepat waktu di rapat tim', 'Saya sering terlambat'],
      ['Saya berbagi ilmu dengan rekan baru', 'Saya cuek pada rekan baru', 'Saya suka mengajari rekan', 'Saya suka menyimpan ilmu sendiri'],
      ['Saya menerima tugas yang diberikan tim', 'Saya suka memilih-milih tugas', 'Saya bertanggung jawab pada tugas saya', 'Saya suka menolak tugas'],
      ['Saya bekerja sama tanpa memandang jabatan', 'Saya sulit bekerja dengan atasan', 'Saya ramah pada semua level', 'Saya suka membeda-bedakan orang'],
      ['Saya menyelesaikan konflik dengan kepala dingin', 'Saya suka memperkeruh masalah', 'Saya mencari solusi menang-menang', 'Saya suka mendominasi']
    ],
    kreativitas: [
      ['Saya sering mencoba cara-cara baru', 'Saya lebih suka cara lama yang terbukti', 'Saya suka mencari solusi alternatif', 'Saya tidak tertarik ide baru'],
      ['Saya berpikir out of the box', 'Saya berpikir konvensional saja', 'Saya suka eksplorasi ide', 'Saya mengikuti cara standar'],
      ['Saya suka brainstorm ide-ide baru', 'Saya malas diskusi ide', 'Saya aktif memberi masukan', 'Saya diam saja saat rapat'],
      ['Saya berani mengambil risiko terukur', 'Saya menghindari risiko', 'Saya suka mencoba hal baru', 'Saya takut gagal'],
      ['Saya melihat masalah dari berbagai sudut', 'Saya hanya lihat satu sisi', 'Saya fleksibel dalam berpikir', 'Saya kaku dengan cara saya'],
      ['Saya suka belajar hal baru', 'Saya malas belajar hal baru', 'Saya cepat adaptasi teknologi', 'Saya gagap teknologi baru'],
      ['Saya suka membuat inovasi kecil', 'Saya puas dengan cara lama', 'Saya selalu cari cara lebih efisien', 'Saya tidak peduli efisiensi'],
      ['Saya berani bereksperimen', 'Saya takut mencoba hal baru', 'Saya suka uji coba ide', 'Saya selalu ikut aturan lama'],
      ['Saya senang tantangan baru', 'Saya suka rutinitas', 'Saya suka pekerjaan variatif', 'Saya bosan dengan hal baru'],
      ['Saya bisa menemukan solusi unik', 'Saya butuh arahan detail', 'Saya suka improvisasi', 'Saya selalu butuh panduan'],
      ['Saya suka membaca untuk ide', 'Saya jarang baca buku', 'Saya suka belajar dari berbagai sumber', 'Saya cukup dengan pengetahuan saya'],
      ['Saya suka berbagi ide dengan tim', 'Saya menyimpan ide sendiri', 'Saya terbuka dengan ide orang lain', 'Saya kaku dengan ide saya'],
      ['Saya tidak takut ide saya ditolak', 'Saya takut ide saya ditolak', 'Saya terus mencari ide lebih baik', 'Saya cepat menyerah dengan ide'],
      ['Saya suka mengotak-atik sistem', 'Saya suka mengikuti sistem apa adanya', 'Saya melihat peluang perbaikan', 'Saya tidak peduli perbaikan'],
      ['Saya suka kombinasi ide baru', 'Saya suka hal monoton', 'Saya suka mixing konsep', 'Saya tidak suka kombinasi aneh']
    ],
    manajemen_konflik: [
      ['Saya tetap tenang saat terjadi konflik', 'Saya mudah marah saat konflik', 'Saya fokus pada solusi', 'Saya suka memperkeruh suasana'],
      ['Saya mencari jalan tengah', 'Saya suka memaksakan pendapat', 'Saya mendengarkan semua pihak', 'Saya hanya dengar satu pihak'],
      ['Saya berkomunikasi terbuka saat konflik', 'Saya suka diam dan memendam', 'Saya berani bicara langsung', 'Saya suka gosip di belakang'],
      ['Saya memisahkan masalah pribadi dan kerja', 'Saya bawa perasaan pribadi', 'Saya profesional dalam konflik', 'Saya suka bawa emosi'],
      ['Saya menunda konflik jika belum siap', 'Saya suka memancing konflik', 'Saya pilih waktu tepat untuk bicara', 'Saya bicara saat emosi'],
      ['Saya mencari akar masalah', 'Saya suka menyalahkan orang', 'Saya analitis saat konflik', 'Saya suka emosi dulu'],
      ['Saya mau mengalah untuk kebaikan bersama', 'Saya harus selalu menang', 'Saya fleksibel dalam konflik', 'Saya keras kepala'],
      ['Saya bisa meminta maaf lebih dulu', 'Saya sulit minta maaf', 'Saya mengakui kesalahan', 'Saya suka menunggu disalahkan'],
      ['Saya melihat konflik sebagai peluang', 'Saya melihat konflik sebagai ancaman', 'Saya belajar dari konflik', 'Saya dendam setelah konflik'],
      ['Saya melibatkan pihak ketiga jika perlu', 'Saya suka selesaikan sendiri tanpa bantuan', 'Saya terbuka pada mediasi', 'Saya menolak intervensi'],
      ['Saya menjaga hubungan setelah konflik', 'Saya memutus hubungan setelah konflik', 'Saya bisa move on dari konflik', 'Saya suka menyimpan dendam'],
      ['Saya fokus pada masalah bukan pribadi', 'Saya suka serang pribadi orang', 'Saya kritik ide bukan orangnya', 'Saya suka menyerang karakter'],
      ['Saya menyampaikan ketidaksetujuan dengan sopan', 'Saya suka kasar saat berbeda pendapat', 'Saya hormati pendapat berbeda', 'Saya tidak toleran'],
      ['Saya mencari solusi menang-menang', 'Saya ingin menang sendiri', 'Saya akomodatif dalam negosiasi', 'Saya tidak mau kompromi'],
      ['Saya menjaga emosi saat dikritik', 'Saya defensif saat dikritik', 'Saya terima kritik membangun', 'Saya sulit terima kritik']
    ],
    pendirian: [
      ['Saya berpegang teguh pada prinsip saya', 'Saya mudah terpengaruh orang lain', 'Saya berani menyampaikan pendapat', 'Saya lebih suka diam saja'],
      ['Saya tidak mudah goyah oleh tekanan', 'Saya cepat berubah pikiran', 'Saya konsisten dengan nilai saya', 'Saya suka ikut-ikutan'],
      ['Saya berani bilang tidak pada hal salah', 'Saya sulit menolak permintaan', 'Saya punya batasan yang jelas', 'Saya sering dimanfaatkan orang'],
      ['Saya berani ambil keputusan sulit', 'Saya suka menghindari keputusan', 'Saya bertanggung jawab pada keputusan', 'Saya suka melempar tanggung jawab'],
      ['Saya tidak mudah diprovokasi', 'Saya mudah terprovokasi', 'Saya tenang dalam tekanan', 'Saya suka reaktif'],
      ['Saya punya nilai hidup yang jelas', 'Saya belum punya nilai tetap', 'Saya tahu apa yang saya perjuangkan', 'Saya bingung arah hidup'],
      ['Saya menolak tekanan untuk melanggar aturan', 'Saya sering ikut pelanggaran', 'Saya komit pada etika saya', 'Saya suka cari celah'],
      ['Saya berani berbeda pendapat dengan atasan', 'Saya takut berbeda dengan atasan', 'Saya sampaikan pendapat dengan sopan', 'Saya selalu ikut atasan'],
      ['Saya tidak mudah terpengaruh tren', 'Saya suka ikut tren', 'Saya pikirkan sebelum ikut', 'Saya FOMO dengan tren'],
      ['Saya berani membela yang benar', 'Saya diam saja saat ada ketidakadilan', 'Saya vokal pada ketidakadilan', 'Saya cuek pada ketidakadilan'],
      ['Saya punya pendirian yang stabil', 'Saya plin-plan', 'Saya konsisten dengan ucapan saya', 'Saya suka berubah-ubah'],
      ['Saya menolak ikut arus negatif', 'Saya mudah ikut arus', 'Saya pilih lingkaran positif', 'Saya tidak selektif berteman'],
      ['Saya berani tolak pekerjaan tidak etis', 'Saya terima saja apapun tugasnya', 'Saya selektif dengan pekerjaan', 'Saya tidak peduli etika'],
      ['Saya mempertahankan keyakinan saya', 'Saya mudah goyah keyakinan', 'Saya punya alasan untuk pendirian', 'Saya ikut kata orang'],
      ['Saya tidak mudah diintimidasi', 'Saya mudah takut pada ancaman', 'Saya hadapi tekanan dengan tenang', 'Saya kabur dari masalah']
    ],
    interpersonal: [
      ['Saya mudah bergaul dengan siapa saja', 'Saya sulit memulai percakapan', 'Saya mendengarkan dengan empati', 'Saya tidak peduli perasaan orang'],
      ['Saya bisa membaca suasana', 'Saya tidak peka pada perasaan orang', 'Saya empati pada masalah orang', 'Saya cuek dengan sekitar'],
      ['Saya suka berkenalan dengan orang baru', 'Saya menghindari orang baru', 'Saya ramah pada semua orang', 'Saya kaku dengan orang asing'],
      ['Saya menjaga hubungan baik dengan rekan', 'Saya suka putus hubungan', 'Saya mudah memaafkan', 'Saya pendendam'],
      ['Saya bisa bekerja dengan berbagai tipe orang', 'Saya hanya cocok dengan tipe tertentu', 'Saya adaptif secara sosial', 'Saya sulit beradaptasi'],
      ['Saya suka membantu orang lain', 'Saya cuek pada masalah orang', 'Saya aktif dalam kegiatan sosial', 'Saya suka menyendiri'],
      ['Saya bisa jadi pendengar yang baik', 'Saya suka bicara sendiri', 'Saya perhatian pada cerita orang', 'Saya tidak sabar mendengar'],
      ['Saya bisa menyesuaikan diri di lingkungan baru', 'Saya butuh waktu lama menyesuaikan', 'Saya cepat akrab dengan orang', 'Saya kaku di lingkungan baru'],
      ['Saya menghargai perbedaan pendapat', 'Saya suka memaksakan pendapat', 'Saya terbuka dengan pandangan orang', 'Saya tidak toleran pada perbedaan'],
      ['Saya suka memberi dukungan moral', 'Saya cuek dengan masalah orang', 'Saya peduli pada kesejahteraan orang', 'Saya egois'],
      ['Saya bisa memuji orang dengan tulus', 'Saya jarang memuji orang', 'Saya ekspresif dalam apresiasi', 'Saya kering pada pujian'],
      ['Saya bisa menahan emosi negatif', 'Saya suka meledak-ledak', 'Saya sabar menghadapi orang sulit', 'Saya cepat marah'],
      ['Saya suka kerja sama dengan orang', 'Saya suka kerja sendiri', 'Saya aktif dalam grup', 'Saya pasif dalam sosial'],
      ['Saya bisa berkomunikasi lintas generasi', 'Saya sulit dengan beda generasi', 'Saya fleksibel bergaul', 'Saya kaku pada senioritas'],
      ['Saya mudah dipercaya orang', 'Saya sering dicurigai orang', 'Saya terbuka pada orang lain', 'Saya tertutup pada orang']
    ]
  };

  const scoreWeights = [3, 1, 2, 0];

  let qid = 1;
  for (const [dim, sets] of Object.entries(bankSoal)) {
    for (const set of sets) {
      await conn.query(
        `INSERT INTO personality_questions (id, question_text, question_type, dimension, order_number)
         VALUES (?, ?, 'ipsative', ?, ?)
         ON DUPLICATE KEY UPDATE question_text = VALUES(question_text), dimension = VALUES(dimension)`,
        [qid, 'Pilih pernyataan yang paling sesuai dan paling tidak sesuai dengan diri Anda:', dim, qid]
      );

      const labels = ['A', 'B', 'C', 'D'];
      for (let i = 0; i < 4; i++) {
        const scoreJson = JSON.stringify({ [dim]: scoreWeights[i] });
        await conn.query(
          `INSERT INTO personality_options (question_id, option_label, statement_text, dimension_score)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE statement_text = VALUES(statement_text), dimension_score = VALUES(dimension_score)`,
          [qid, labels[i], set[i], scoreJson]
        );
      }

      qid++;
    }
  }
}