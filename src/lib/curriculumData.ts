import { CPReference, ClassRoom, Student } from '../types';

export const INITIAL_CLASSES: ClassRoom[] = [];

export const INITIAL_STUDENTS: Student[] = [];

export const SUBJECT_LIST = [
  'Bahasa Indonesia',
  'Matematika',
  'Ilmu Pengetahuan Alam (IPA)',
  'Ilmu Pengetahuan Sosial (IPS)',
  'Bahasa Inggris',
  'Pendidikan Pancasila / PPKn',
  'Informatika',
  'Fisika',
  'Biologi',
  'Kimia',
  'Sejarah',
  'Geografi',
  'Ekonomi',
  'Sosiologi',
  'Pendidikan Agama Islam & Budi Pekerti',
  'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
  'Seni Budaya & Prakarya',
  'Bimbingan Konseling (BK)',
];

export const LEVEL_PHASES = {
  SD: [
    { phase: 'Fase A', grades: 'Kelas 1 - 2' },
    { phase: 'Fase B', grades: 'Kelas 3 - 4' },
    { phase: 'Fase C', grades: 'Kelas 5 - 6' },
  ],
  SMP: [
    { phase: 'Fase D', grades: 'Kelas 7 - 9' },
  ],
  SMA: [
    { phase: 'Fase E', grades: 'Kelas 10' },
    { phase: 'Fase F', grades: 'Kelas 11 - 12' },
  ],
  SMK: [
    { phase: 'Fase E', grades: 'Kelas 10 (Kejuruan)' },
    { phase: 'Fase F', grades: 'Kelas 11 - 12 (Kejuruan)' },
  ],
};

export const INITIAL_CP_REFERENCES: CPReference[] = [
  {
    id: 'cp-sma-e-indo',
    title: 'CP Bahasa Indonesia SMA Fase E (Terbaru - SK BSKAP 032/H/KR/2024)',
    level: 'SMA',
    phase: 'Fase E',
    subject: 'Bahasa Indonesia',
    curriculumVersion: 'Kurikulum Merdeka & Pendekatan Deep Learning 2024/2025',
    uploadedAt: '2026-08-20 09:30',
    uploadedBy: 'aspianmadimu22@guru.sma.belajar.id',
    fileName: 'CP_Bahasa_Indonesia_Fase_E_2024.pdf',
    aiAnalysisSummary: 'Fokus pada kemampuan peserta didik dalam mengevaluasi informasi berupa gagasan, pikiran, pandangan, arahan atau pesan dari berbagai jenis teks (deskripsi, laporan, narasi, eksposisi, dan diskusi) secara kritis dan kreatif dengan kerangka Deep Learning (Mindful, Meaningful, Joyful).',
    elements: [
      {
        name: 'Menyimak',
        description: 'Peserta didik mampu mengevaluasi dan mengkreasi informasi berupa gagasan, pikiran, perasaan, pandangan, arahan atau pesan yang akurat dari menyimak berbagai jenis teks.',
        competencies: ['Mengevaluasi akurasi fakta', 'Menganalisis bias informasi', 'Mengkreasi tanggapan kritis'],
        essentialMaterials: ['Teks Laporan Hasil Observasi', 'Teks Anekdot Kritis', 'Teks Negosiasi Berkeadilan'],
      },
      {
        name: 'Membaca dan Memirsa',
        description: 'Peserta didik mampu mengevaluasi informasi dengan mengidentifikasi kaidah logika berpikir serta mengapresiasi nilai estetis karya sastra.',
        competencies: ['Membandingkan isi teks', 'Menilai validitas referensi', 'Menginterpretasi makna tersirat'],
        essentialMaterials: ['Teks Eksposisi Analitis', 'Resensi Karya Sastra / Hikayat', 'Infografis & Visual Data'],
      },
      {
        name: 'Berbicara dan Mempresentasikan',
        description: 'Peserta didik mampu mengolah dan menyajikan gagasan, pikiran, pandangan, atau pesan untuk tujuan pengajuan usul, perumusan masalah, dan solusi secara lisan.',
        competencies: ['Menyampaikan presentasi persuasif', 'Berdebat santun & logis', 'Melakukan negosiasi kolaboratif'],
        essentialMaterials: ['Teknik Debat Parlementer', 'Pidato Persuasif', 'Podcast Pembelajaran Kreatif'],
      },
      {
        name: 'Menulis',
        description: 'Peserta didik mampu menulis gagasan, pikiran, pandangan, arahan tertulis untuk berbagai tujuan secara logis, kritis, dan kreatif.',
        competencies: ['Menyusun teks berbasis riset mini', 'Mengembangkan cerpen berbasis kearifan lokal', 'Menyusun artikel opini publik'],
        essentialMaterials: ['Kaidah EYD V & Tata Bahasa Baku', 'Struktur Karya Ilmiah Populer', 'Menulis Puisi & Cerpen Reflektif'],
      },
    ],
  },
  {
    id: 'cp-sma-e-mat',
    title: 'CP Matematika SMA Fase E (Terbaru - Deep Learning Framework)',
    level: 'SMA',
    phase: 'Fase E',
    subject: 'Matematika',
    curriculumVersion: 'Kurikulum Merdeka 2024/2025',
    uploadedAt: '2026-08-19 14:15',
    uploadedBy: 'aspianmadimu22@guru.sma.belajar.id',
    fileName: 'CP_Matematika_Fase_E.docx',
    aiAnalysisSummary: 'Menekankan penalaran matematis, pemodelan masalah kontekstual nyata, eksponen & logaritma, barisan-deret, trigonometri segitiga siku-siku, vektor, serta statistika dan peluang menggunakan strategi pemahaman konsep mendalam.',
    elements: [
      {
        name: 'Bilangan & Aljabar',
        description: 'Mampu menggeneralisasi sifat-sifat bilangan berpangkat (eksponen) dan logaritma serta menggunakannya dalam menyelesaikan masalah pemodelan.',
        competencies: ['Menggeneralisasi eksponen', 'Menyelesaikan SPLTV', 'Memodelkan sistem pertidaksamaan linear'],
        essentialMaterials: ['Eksponen & Logaritma', 'Barisan & Deret Aritmetika/Geometri', 'SPLTV Kontekstual'],
      },
      {
        name: 'Geometri & Trigonometri',
        description: 'Menyelesaikan masalah yang berkaitan dengan perbandingan trigonometri pada segitiga siku-siku.',
        competencies: ['Menghitung sinus, cosinus, tangen', 'Mengukur tinggi/jarak objek tak langsung'],
        essentialMaterials: ['Trigonometri Dasar Segitiga Siku-siku', 'Klinometer & Pengukuran Lapangan'],
      },
      {
        name: 'Analisis Data dan Peluang',
        description: 'Mampu menampilkan dan menginterpretasi data menggunakan diagram pencar, box plot, serta mengevaluasi laporan berbasis data.',
        competencies: ['Membuat diagram pencar', 'Menghitung ukuran pemusatan data kelompok', 'Menghitung peluang majemuk'],
        essentialMaterials: ['Statistika Deskriptif', 'Diagram Pencar & Regresi Linear Sederhana', 'Peluang Kejadian Saling Lepas & Bebas'],
      },
    ],
  },
  {
    id: 'cp-smp-d-ipa',
    title: 'CP IPA SMP Fase D (Deep Learning & Etnosains Terpadu)',
    level: 'SMP',
    phase: 'Fase D',
    subject: 'Ilmu Pengetahuan Alam (IPA)',
    curriculumVersion: 'Kurikulum Merdeka 2024/2025',
    uploadedAt: '2026-08-18 11:20',
    uploadedBy: 'admin',
    fileName: 'CP_IPA_SMP_Fase_D.pdf',
    aiAnalysisSummary: 'Memahami hakikat sains, pengukuran, klasifikasi makhluk hidup, zat & perubahannya, suhu kalor, gerak gaya, sistem organ tubuh manusia, bumi antariksa, serta isu lingkungan hidup secara hands-on.',
    elements: [
      {
        name: 'Pemahaman IPA',
        description: 'Peserta didik memahami proses sains dan konsep esensial IPA tentang zat, energi, makhluk hidup, bumi dan antariksa.',
        competencies: ['Menganalisis interaksi ekosistem', 'Menjelaskan transformasi energi', 'Mengidentifikasi sistem peredaran darah'],
        essentialMaterials: ['Hakikat Sains & Metode Ilmiah', 'Zat & Perubahannya', 'Sistem Organ Manusia', 'Teknologi Ramah Lingkungan'],
      },
      {
        name: 'Keterampilan Proses',
        description: 'Mengamati, mempertanyakan, merencanakan penyelidikan, memproses data, mengevaluasi, dan mengomunikasikan hasil.',
        competencies: ['Merancang eksperimen sederhana', 'Mencatat data kuantitatif', 'Menyimpulkan bukti empiris'],
        essentialMaterials: ['Praktikum Uji Makanan', 'Praktikum Larutan Asam Basa', 'Pembuatan Kompos & Biopori'],
      },
    ],
  },
  {
    id: 'cp-sd-b-indo',
    title: 'CP Bahasa Indonesia SD Fase B (Kelas 3-4 Deep Learning)',
    level: 'SD',
    phase: 'Fase B',
    subject: 'Bahasa Indonesia',
    curriculumVersion: 'Kurikulum Merdeka 2024/2025',
    uploadedAt: '2026-08-17 08:45',
    uploadedBy: 'admin',
    fileName: 'CP_SD_Fase_B_2024.pdf',
    aiAnalysisSummary: 'Membangun literasi dasar yang bermakna, kemampuan membaca lancar dan memahami ide pokok, berbicara santun, serta menulis paragraf deskripsi dan narasi sederhana secara ceria.',
    elements: [
      {
        name: 'Menyimak & Membaca',
        description: 'Mampu memahami pesan lisan teks dongeng, cerita rakyat, dan petunjuk visual.',
        competencies: ['Menemukan ide pokok cerita', 'Menjelaskan karakter tokoh', 'Menjawab pertanyaan 5W1H'],
        essentialMaterials: ['Cerita Fabel & Karakter', 'Teks Petunjuk Pembuatan Prakarya', 'Kosakata Baru Kamus Cilik'],
      },
      {
        name: 'Berbicara & Menulis',
        description: 'Mampu berbicara santun di depan kelas dan menulis kalimat efektif dengan tanda baca yang tepat.',
        competencies: ['Menceritakan kembali pengalaman', 'Menulis paragraf deskriptif 4-5 kalimat', 'Menggunakan huruf kapital & titik'],
        essentialMaterials: ['Bercerita Pengalaman Liburan', 'Menulis Surat untuk Sahabat', 'Puisi Anak Berima Indah'],
      },
    ],
  },
];

export const CP_REFERENCES = INITIAL_CP_REFERENCES;
