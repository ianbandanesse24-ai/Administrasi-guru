import { CPMaterialItem, ActiveMasterCPData, CPDistributionPlan, CPReference, SchoolLevel } from '../types';
import { StorageService } from './storage';

export interface SubjectPreset {
  subject: string;
  level: SchoolLevel;
  grade: number;
  phase: string;
  totalHoursPerYear: number;
  jpPerWeek?: number;
  cpSummary: string;
  elements?: {
    name: string;
    description: string;
    competencies?: string[];
    essentialMaterials?: string[];
  }[];
  materialsSem1: Omit<CPMaterialItem, 'id'>[];
  materialsSem2: Omit<CPMaterialItem, 'id'>[];
}

export const SUBJECT_MATERIAL_PRESETS: SubjectPreset[] = [
  // ==========================================
  // SMA - FISIKA (FASE E & F)
  // ==========================================
  {
    subject: 'Fisika',
    level: 'SMA',
    grade: 10,
    phase: 'Fase E',
    totalHoursPerYear: 108,
    jpPerWeek: 3,
    cpSummary: 'Peserta didik mampu mengamati, menyelidiki, dan menganalisis fenomena fisis dalam kehidupan sehari-hari (pengukuran, energi terbarukan, dan pemanasan global) dengan pendekatan Deep Learning (Mindful, Meaningful, Joyful).',
    elements: [
      {
        name: 'Pemahaman Fisika',
        description: 'Peserta didik mengidentifikasi besaran fisika, menganalisis konversi energi, dan mengevaluasi dampak krisis iklim global.',
        competencies: ['Mengidentifikasi besaran fisika', 'Menganalisis efisiensi energi', 'Mengevaluasi mitigasi iklim'],
        essentialMaterials: ['Pengukuran & Angka Penting', 'Energi Terbarukan', 'Pemanasan Global'],
      },
      {
        name: 'Keterampilan Proses',
        description: 'Peserta didik merancang eksperimen ilmiah, mengolah data kuantitatif, dan mengomunikasikan purwarupa teknologi ramah lingkungan.',
        competencies: ['Merancang percobaan ilmiah', 'Mengolah data laboratorium', 'Mempresentasikan purwarupa'],
        essentialMaterials: ['Metode Ilmiah', 'Prototipe Turbin Angin/Surya', 'Kampanye Lingkungan Hidup'],
      },
    ],
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.10.1.1',
        tpName: 'Menerapkan prinsip-prinsip pengukuran besaran fisis, ketidakpastian, dan angka penting dalam penyelidikan ilmiah.',
        essentialMaterial: 'Hakikat Fisika, Metode Ilmiah, Besaran & Satuan, Pengukuran dan Ketidakpastian',
        elementName: 'Pemahaman Sains & Keterampilan Proses',
        allocatedHours: 18,
        assessmentStrategy: 'Tes Kinerja Praktikum Pengukuran & Tes Tertulis Formatif',
        deepLearningMethod: 'Mindful: Kesadaran presisi pengukuran dan observasi teliti di laboratorium.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.10.1.2',
        tpName: 'Menganalisis konsep energi, ragam bentuk energi, dan hukum kekekalan energi dalam kehidupan sehari-hari.',
        essentialMaterial: 'Bentuk-Bentuk Energi, Usaha dan Daya, serta Hukum Kekekalan Energi Mekanik',
        elementName: 'Pemahaman Sains',
        allocatedHours: 18,
        assessmentStrategy: 'Penilaian Formatif Studi Kasus Konversi Energi & Kuis Interaktif',
        deepLearningMethod: 'Meaningful: Kontekstualisasi sistem PLTA/PLTS dan konsumsi energi rumah tangga.',
      },
      {
        semester: 1,
        orderNumber: 3,
        tpCode: 'TP.10.1.3',
        tpName: 'Merancang purwarupa pemanfaatan sumber energi terbarukan berdasarkan potensi geografis lokal.',
        essentialMaterial: 'Energi Terbarukan (Surya, Angin, Biomassa, Mikrohidro) dan Analisis Efisiensi',
        elementName: 'Keterampilan Proses & Rekayasa',
        allocatedHours: 18,
        assessmentStrategy: 'Asesmen Sumatif Proyek Miniatur Pembangkit Listrik Ramah Lingkungan',
        deepLearningMethod: 'Joyful: Perakitan prototipe turbin angin sederhana secara kolaboratif.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.10.2.1',
        tpName: 'Menganalisis fenomena pemanasan global, efek rumah kaca, dan dampaknya terhadap anomali iklim global.',
        essentialMaterial: 'Pemanasan Global, Gas Rumah Kaca, Jejak Karbon, dan Kerusakan Lapisan Ozon',
        elementName: 'Pemahaman Sains',
        allocatedHours: 18,
        assessmentStrategy: 'Analisis Data Infografis BMKG/IPCC & Tes Formatif',
        deepLearningMethod: 'Mindful: Refleksi jejak karbon harian individu dan etika lingkungan hidup.',
      },
      {
        semester: 2,
        orderNumber: 5,
        tpCode: 'TP.10.2.2',
        tpName: 'Mengajukan solusi mitigasi dan adaptasi pemanasan global berbasis inovasi sains dan kearifan lokal.',
        essentialMaterial: 'Aksi Nyata Mitigasi Perubahan Iklim, Green Chemistry, dan Efisiensi Energi',
        elementName: 'Keterampilan Proses & Aksi Nyata',
        allocatedHours: 18,
        assessmentStrategy: 'Penilaian Kampanye Digital & Poster Infografis Mitigasi Iklim',
        deepLearningMethod: 'Joyful: Pembuatan konten edukasi digital interaktif di media sosial.',
      },
      {
        semester: 2,
        orderNumber: 6,
        tpCode: 'TP.10.2.3',
        tpName: 'Mengevaluasi integrasi prinsip fisika dalam teknologi ramah lingkungan dan kebijakan pembangunan berkelanjutan.',
        essentialMaterial: 'Teknologi Ramah Lingkungan, Penilaian Daur Hidup Produk, dan Pembangunan Berkelanjutan (SDGs)',
        elementName: 'Pemahaman Sains & Asesmen Sumatif',
        allocatedHours: 18,
        assessmentStrategy: 'Asesmen Sumatif Akhir Semester (SAS) & Uji Komprehensif',
        deepLearningMethod: 'Meaningful: Diskusi panel isu krisis energi dan ketahanan lingkungan maritim.',
      },
    ],
  },
  {
    subject: 'Fisika',
    level: 'SMA',
    grade: 11,
    phase: 'Fase F',
    totalHoursPerYear: 180,
    jpPerWeek: 5,
    cpSummary: 'Peserta didik mampu menganalisis konsep mekanika benda tegar, fluida dinamis, termodinamika, gelombang mekanik, serta merancang eksperimen pembuktian hukum fisika klasik secara mendalam.',
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.11.1.1',
        tpName: 'Menganalisis vektor posisi, kecepatan, dan percepatan pada gerak lurus, gerak parabola, dan gerak melingkar.',
        essentialMaterial: 'Kinematika Gerak Vektor: GLB, GLBB, Gerak Parabola, dan Gerak Melingkar Beraturan',
        elementName: 'Pemahaman Fisika',
        allocatedHours: 25,
        assessmentStrategy: 'Tes Praktikum Analisis Video Gerak & Tes Formatif',
        deepLearningMethod: 'Meaningful: Simulasi peluncuran proyektil dan orbit satelit cuaca.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.11.1.2',
        tpName: 'Menerapkan Hukum Gravitasi Newton dan Hukum Kepler dalam analisis pergerakan benda langit.',
        essentialMaterial: 'Gaya Gravitasi Newton, Kuat Medan Gravitasi, Energi Potensial Gravitasi, dan Hukum Kepler',
        elementName: 'Pemahaman Fisika',
        allocatedHours: 20,
        assessmentStrategy: 'Kuis Astronomi & Tugas Analisis Data Periode Planet',
        deepLearningMethod: 'Mindful: Kontemplasi keagungan keteraturan tata surya dan jagat raya.',
      },
      {
        semester: 1,
        orderNumber: 3,
        tpCode: 'TP.11.1.3',
        tpName: 'Menganalisis hubungan antara usaha, perubahan energi, momentum linier, dan hukum kekekalan momentum tumbukan.',
        essentialMaterial: 'Teorema Usaha-Energi, Daya, Impuls, Momentum Linier, dan Tumbukan 1D/2D',
        elementName: 'Keterampilan Proses & Pemahaman',
        allocatedHours: 25,
        assessmentStrategy: 'Asesmen Sumatif Proyek Uji Tumbukan Airbag Kendaraan',
        deepLearningMethod: 'Joyful: Eksperimen tabrakan troli dinamika berbantuan sensor digital.',
      },
      {
        semester: 1,
        orderNumber: 4,
        tpCode: 'TP.11.1.4',
        tpName: 'Menganalisis dinamika rotasi, momen inersia, torsi, dan kesetimbangan benda tegar dalam arsitektur.',
        essentialMaterial: 'Momen Gaya (Torsi), Momen Inersia, Hukum II Newton Rotasi, dan Titik Berat Benda Tegar',
        elementName: 'Pemahaman & Rekayasa',
        allocatedHours: 20,
        assessmentStrategy: 'Desain Miniatur Jembatan Gantung & Uji Beban',
        deepLearningMethod: 'Meaningful: Analisis konstruksi jembatan dan struktur bangunan tahan gempa.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 5,
        tpCode: 'TP.11.2.1',
        tpName: 'Menganalisis hukum-hukum fluida statis (Pascal, Archimedes) dan fluida dinamis (Kontinuitas, Bernoulli).',
        essentialMaterial: 'Tekanan Hidrostatis, Hukum Pascal, Hukum Archimedes, Tegangan Permukaan, Persamaan Bernoulli',
        elementName: 'Pemahaman Sains',
        allocatedHours: 25,
        assessmentStrategy: 'Praktikum Tabung Venturi & Desain Sayap Pesawat Terbang',
        deepLearningMethod: 'Joyful: Eksperimen daya angkat sayap pesawat aerodinamis mini.',
      },
      {
        semester: 2,
        orderNumber: 6,
        tpCode: 'TP.11.2.2',
        tpName: 'Menganalisis perpindahan kalor, teori kinetik gas ideal, dan hukum-hukum termodinamika pada mesin kalor.',
        essentialMaterial: 'Suhu Kalor, Azas Black, Teori Kinetik Gas, Siklus Carnot, Efisiensi Mesin Kalor & Pendingin',
        elementName: 'Pemahaman & Penerapan',
        allocatedHours: 35,
        assessmentStrategy: 'Tes Formatif & Analisis Efisiensi Termal Mesin Motor/Mobil',
        deepLearningMethod: 'Meaningful: Menghitung efisiensi energi kendaraan dan jejak pembuangan panas.',
      },
      {
        semester: 2,
        orderNumber: 7,
        tpCode: 'TP.11.2.3',
        tpName: 'Menganalisis karakteristik gelombang mekanik, gelombang bunyi, dan gelombang cahaya (interferensi, difraksi).',
        essentialMaterial: 'Gelombang Berjalan, Gelombang Stasioner, Efek Doppler Bunyi, Cepat Rambat, Difraksi Cahaya',
        elementName: 'Pemahaman & Eksperimen',
        allocatedHours: 30,
        assessmentStrategy: 'Asesmen Sumatif Akhir Tahun & Konser Resonansi Akustik Alat Musik',
        deepLearningMethod: 'Joyful: Eksplorasi frekuensi harmonik alat musik tradisional daerah.',
      },
    ],
  },
  {
    subject: 'Fisika',
    level: 'SMA',
    grade: 12,
    phase: 'Fase F',
    totalHoursPerYear: 180,
    jpPerWeek: 5,
    cpSummary: 'Peserta didik menguasai elektrostatika, elektrodinamika arus searah dan bolak-balik, induksi elektromagnetik, fisika kuantum, relativitas khusus, fisika inti, dan teknologi digital masa depan.',
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.12.1.1',
        tpName: 'Menganalisis rangkaian listrik arus searah (DC) menggunakan Hukum Ohm dan Hukum Kirchhoff.',
        essentialMaterial: 'Rangkaian Hambatan Seri-Paralel, Hukum I & II Kirchhoff, Jembatan Wheatstone, dan Energi Listrik',
        elementName: 'Pemahaman & Praktikum',
        allocatedHours: 25,
        assessmentStrategy: 'Praktikum Multitester / Multimeter Digital & Tes Formatif',
        deepLearningMethod: 'Meaningful: Analisis instalasi listrik rumah tangga dan audit keselamatan korsleting.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.12.1.2',
        tpName: 'Menganalisis gaya Coulomb, medan listrik, potensial listrik, dan kapasitor dalam teknologi penyimpan daya.',
        essentialMaterial: 'Listrik Statis: Hukum Coulomb, Hukum Gauss, Energi Potensial Elektrostatik, dan Kapasitor Bank',
        elementName: 'Pemahaman Sains',
        allocatedHours: 25,
        assessmentStrategy: 'Uji Teori Elektrostatik & Desain Kapasitor Keping Sejajar',
        deepLearningMethod: 'Mindful: Menyelidiki fenomena petir dan penangkal petir gedung tinggi.',
      },
      {
        semester: 1,
        orderNumber: 3,
        tpCode: 'TP.12.1.3',
        tpName: 'Menganalisis medan magnetik kawat berarus, gaya Lorentz, dan prinsip kerja motor listrik.',
        essentialMaterial: 'Medan Magnetik Hukum Biot-Savart, Gaya Lorentz, Spektrometer Massa, dan Motor Listrik',
        elementName: 'Pemahaman & Keterampilan Proses',
        allocatedHours: 20,
        assessmentStrategy: 'Perakitan Motor Listrik Sederhana dari Kawat Tembaga & Magnet Neodymium',
        deepLearningMethod: 'Joyful: Lomba kecepatan putar motor listrik mini karya mandiri.',
      },
      {
        semester: 1,
        orderNumber: 4,
        tpCode: 'TP.12.1.4',
        tpName: 'Menerapkan Hukum Faraday, Hukum Lenz, dan konsep induktansi pada generator listrik dan transformator.',
        essentialMaterial: 'Fluks Magnetik, GGL Induksi Faraday-Lenz, Trafo Step-Up/Step-Down, Arus Bolak-Balik R-L-C',
        elementName: 'Pemahaman & Rekayasa',
        allocatedHours: 20,
        assessmentStrategy: 'Asesmen Sumatif Proyek Generator Sederhana & Analisis Jala-Jala PLN',
        deepLearningMethod: 'Meaningful: Pahami distribusi transmisi tegangan ekstra tinggi (SUTET).',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 5,
        tpCode: 'TP.12.2.1',
        tpName: 'Menganalisis radiasi gelombang elektromagnetik, spektrum elektromagnetik, dan aplikasinya dalam komunikasi.',
        essentialMaterial: 'Spektrum Gelombang Elektromagnetik: Radio, Mikro, Inframerah, Optik, UV, Sinar-X, Gamma',
        elementName: 'Pemahaman Fisika Modern',
        allocatedHours: 25,
        assessmentStrategy: 'Infografis Pemanfaatan Sinar-X & Radioterapi Kanker di Bidang Medis',
        deepLearningMethod: 'Meaningful: Memahami transmisi sinyal 5G dan keselamatan radiasi gawai.',
      },
      {
        semester: 2,
        orderNumber: 6,
        tpCode: 'TP.12.2.2',
        tpName: 'Menganalisis konsep relativitas khusus Einstein (dilatasi waktu, kontraksi panjang, dan kesetaraan massa-energi).',
        essentialMaterial: 'Relativitas Khusus: Postulat Einstein, Transformasi Lorentz, Paradoks Kembar, E=mc²',
        elementName: 'Pemahaman Konsep Kritis',
        allocatedHours: 30,
        assessmentStrategy: 'Tes Formatif & Debat Ilmiah Fisika Relativistik',
        deepLearningMethod: 'Mindful: Kontemplasi sifat ruang dan waktu di alam semesta.',
      },
      {
        semester: 2,
        orderNumber: 7,
        tpCode: 'TP.12.2.3',
        tpName: 'Menganalisis dualisme gelombang-partikel, efek fotolistrik, struktur inti atom, dan reaksi fusi/fisi nuklir.',
        essentialMaterial: 'Fisika Kuantum: Efek Fotolistrik, Teori De Broglie, Radioaktivitas, Reaksi Inti, PLTN Ramah Lingkungan',
        elementName: 'Pemahaman Sains & Asesmen Sumatif',
        allocatedHours: 35,
        assessmentStrategy: 'Asesmen Sumatif Akhir Jenjang & Makalah Prospek PLTN di Indonesia',
        deepLearningMethod: 'Meaningful: Diskusi energi bersih masa depan berbasis tenaga nuklir aman.',
      },
    ],
  },

  // ==========================================
  // SMA - BAHASA INDONESIA (FASE E & F)
  // ==========================================
  {
    subject: 'Bahasa Indonesia',
    level: 'SMA',
    grade: 10,
    phase: 'Fase E',
    totalHoursPerYear: 108,
    jpPerWeek: 3,
    cpSummary: 'Peserta didik memiliki kemampuan berbahasa untuk berkomunikasi dan bernalar sesuai tujuan konteks sosial, akademis, dan dunia kerja melalui teks LHO, anekdot, eksposisi, hikayat, negosiasi, dan biografi.',
    elements: [
      {
        name: 'Menyimak & Membaca',
        description: 'Peserta didik mengevaluasi gagasan teks lho, eksposisi, dan sastra hikayat secara kritis.',
        competencies: ['Menganalisis informasi tersurat/tersirat', 'Menilai keakuratan data fakta'],
        essentialMaterials: ['Teks LHO', 'Teks Eksposisi', 'Teks Hikayat & Cerpen'],
      },
      {
        name: 'Berbicara & Menulis',
        description: 'Peserta didik mengkreasikan teks anekdot, negosiasi, dan biografi tokoh dengan kaidah baku.',
        competencies: ['Bernegosiasi santun', 'Menulis karya ilmiah populer', 'Menyampaikan humor kritik'],
        essentialMaterials: ['Teks Anekdot', 'Teks Negosiasi', 'Teks Biografi Tokoh'],
      },
    ],
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.10.1.1',
        tpName: 'Menganalisis dan mengevaluasi informasi akurat dalam Teks Laporan Hasil Observasi (LHO) lingkungan sekitar secara kritis dan objektif.',
        essentialMaterial: 'Teks Laporan Hasil Observasi (LHO) & Kaidah Kebahasaan Objektif',
        elementName: 'Menyimak & Membaca',
        allocatedHours: 18,
        assessmentStrategy: 'Tes Formatif & Kinerja Observasi Lapangan',
        deepLearningMethod: 'Mindful: Observasi teliti kekayaan flora/fauna lingkungan sekitar.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.10.1.2',
        tpName: 'Mengkreasi gagasan kritik sosial secara santun dan bernalar dalam bentuk Teks Anekdot bertema fenomena masa kini.',
        essentialMaterial: 'Teks Anekdot & Struktur Humor Kritik Santun',
        elementName: 'Berbicara & Menulis',
        allocatedHours: 18,
        assessmentStrategy: 'Unjuk Kerja Komedi Edukatif & Portofolio Teks',
        deepLearningMethod: 'Joyful: Menulis skrip komedi cerdas yang mengedukasi masyarakat.',
      },
      {
        semester: 1,
        orderNumber: 3,
        tpCode: 'TP.10.1.3',
        tpName: 'Menyusun argumen logis dan memvalidasi fakta empiris dalam Teks Eksposisi bertema konservasi lingkungan.',
        essentialMaterial: 'Teks Eksposisi Analitis & Struktur Argumen Berbasis Data',
        elementName: 'Membaca & Menulis',
        allocatedHours: 18,
        assessmentStrategy: 'Tes Tertulis Argumen & Rubrik Kritis 6C',
        deepLearningMethod: 'Meaningful: Mengadvokasi pelestarian alam lewat tulisan ilmiah.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.10.2.1',
        tpName: 'Mengevaluasi nilai-nilai karakter luhur dalam Hikayat dan mentransformasikan ke dalam cerpen kontekstual kehidupan modern.',
        essentialMaterial: 'Hikayat Klasik & Transformasi Nilai Cerpen Kontekstual',
        elementName: 'Membaca & Menulis',
        allocatedHours: 18,
        assessmentStrategy: 'Penilaian Proyek Menulis Cerpen & Resensi Sastra',
        deepLearningMethod: 'Mindful: Refleksi budi pekerti luhur warisan sastra nusantara.',
      },
      {
        semester: 2,
        orderNumber: 5,
        tpCode: 'TP.10.2.2',
        tpName: 'Menerapkan strategi negosiasi kolaboratif untuk mencapai kesepakatan win-win solution dalam simulasi problem sosial.',
        essentialMaterial: 'Teks Negosiasi & Komunikasi Efektif Persuasif',
        elementName: 'Berbicara & Mempresentasikan',
        allocatedHours: 18,
        assessmentStrategy: 'Simulasi Praktik Negosiasi & Asesmen Rekan Sejawat',
        deepLearningMethod: 'Joyful: Roleplay interaktif negosiasi pasar dan kontrak kerja.',
      },
      {
        semester: 2,
        orderNumber: 6,
        tpCode: 'TP.10.2.3',
        tpName: 'Menulis teks biografi tokoh inspiratif daerah dengan kaidah penulisan ilmiah populer yang runut dan estetik.',
        essentialMaterial: 'Teks Biografi Tokoh Pejuang/Inspiratif & Literasi Populer',
        elementName: 'Menulis & Membaca',
        allocatedHours: 18,
        assessmentStrategy: 'Portofolio Biografi & Pameran Karya Literasi Siswa',
        deepLearningMethod: 'Meaningful: Meneladani integritas dan etos perjuangan tokoh bangsa.',
      },
    ],
  },
  {
    subject: 'Bahasa Indonesia',
    level: 'SMA',
    grade: 11,
    phase: 'Fase F',
    totalHoursPerYear: 108,
    jpPerWeek: 3,
    cpSummary: 'Peserta didik menguasai analisis teks argumentasi ketahanan pangan, teks berita terkini, cerpen pergerakan kemerdekaan, karya tulis ilmiah, dan naskah drama pementasan.',
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.11.1.1',
        tpName: 'Menganalisis teks argumentasi dan poster ketahanan pangan lokal berbasis fakta empiris.',
        essentialMaterial: 'Teks Argumentasi Ketahanan Pangan Lokal & Poster Edukasi',
        elementName: 'Membaca & Memirsa',
        allocatedHours: 18,
        assessmentStrategy: 'Uji Analisis Data Grafik & Debat Pangan Lokal',
        deepLearningMethod: 'Meaningful: Mengurangi ketergantungan beras dengan ubi/sagu lokal.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.11.1.2',
        tpName: 'Menulis teks berita faktual aktual berprinsip 5W+1H dan etika jurnalisme warga.',
        essentialMaterial: 'Teks Berita Cetak & Daring, Vlog Berita, Etika Jurnalisme',
        elementName: 'Menulis & Mempresentasikan',
        allocatedHours: 18,
        assessmentStrategy: 'Produksi Podcast / Video Berita Sekolah',
        deepLearningMethod: 'Joyful: Menjadi presenter berita profesional studio mini.',
      },
      {
        semester: 1,
        orderNumber: 3,
        tpCode: 'TP.11.1.3',
        tpName: 'Menggali nilai sejarah perjuangan bangsa dalam cerpen dan novel berlatar sejarah kemerdekaan.',
        essentialMaterial: 'Cerpen dan Novel Sejarah Indonesia: Unsur Intrinsik & Ekstrinsik',
        elementName: 'Membaca & Menulis',
        allocatedHours: 18,
        assessmentStrategy: 'Resensi Kritis Cerpen Sejarah & Menulis Cerpen Kreatif',
        deepLearningMethod: 'Mindful: Menghayati pengorbanan para pahlawan bangsa.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.11.2.1',
        tpName: 'Menyusun proposal kegiatan sekolah dan proposal penelitian sederhana secara sistematis.',
        essentialMaterial: 'Proposal Kegiatan & Proposal Penelitian: Sistematika dan Anggaran',
        elementName: 'Menulis Ilmiah',
        allocatedHours: 18,
        assessmentStrategy: 'Presentasi Pitching Proposal di Hadapan Dewan Guru',
        deepLearningMethod: 'Meaningful: Merencanakan program OSIS yang berdampak nyata.',
      },
      {
        semester: 2,
        orderNumber: 5,
        tpCode: 'TP.11.2.2',
        tpName: 'Menyusun karya tulis ilmiah populer dengan metodologi sederhana dan sitasi yang sahih.',
        essentialMaterial: 'Karya Ilmiah Remaja (KIR): Abstrak, Kajian Teori, Metodologi, Sitasi APA',
        elementName: 'Menulis & Keterampilan Proses',
        allocatedHours: 18,
        assessmentStrategy: 'Sidang Mini Karya Tulis Ilmiah Siswa',
        deepLearningMethod: 'Mindful: Menjunjung tinggi kejujuran akademik bebas plagiarisme.',
      },
      {
        semester: 2,
        orderNumber: 6,
        tpCode: 'TP.11.2.3',
        tpName: 'Mementaskan pertunjukan drama teater berdasarkan naskah karya mandiri bertema pesan moral.',
        essentialMaterial: 'Naskah Drama, Seni Peran (Olah Vokal/Tubuh), Tata Panggung & Artistik',
        elementName: 'Berbicara & Mempresentasikan',
        allocatedHours: 18,
        assessmentStrategy: 'Asesmen Sumatif Festival Teater Mini Antarkelas',
        deepLearningMethod: 'Joyful: Kolaborasi akting ekspresif di atas panggung seni.',
      },
    ],
  },

  // ==========================================
  // SMA - MATEMATIKA (FASE E & F)
  // ==========================================
  {
    subject: 'Matematika',
    level: 'SMA',
    grade: 10,
    phase: 'Fase E',
    totalHoursPerYear: 108,
    jpPerWeek: 3,
    cpSummary: 'Peserta didik menguasai konsep eksponen dan logaritma, barisan dan deret aritmetika/geometri, trigonometri dasar (perbandingan sin, cos, tan), vektor pada bidang datar, serta analisis data dan peluang kejadian majemuk.',
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.10.1.1',
        tpName: 'Menerapkan sifat-sifat eksponen dan bentuk akar dalam penyederhanaan bentuk aljabar dan pemodelan pertumbuhan/peluruhan.',
        essentialMaterial: 'Eksponen dan Logaritma: Sifat Operasi, Bentuk Akar, Persamaan Eksponensial, dan Aplikasi Bunga Majemuk',
        elementName: 'Bilangan & Aljabar',
        allocatedHours: 18,
        assessmentStrategy: 'Tes Tertulis Formatif Eksponen & Kuis Permainan Edukatif',
        deepLearningMethod: 'Meaningful: Menghitung laju pertumbuhan bakteri dan peluruhan radioaktif.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.10.1.2',
        tpName: 'Menganalisis pola bilangan, suku ke-n, dan jumlah n suku pertama pada barisan dan deret aritmetika serta geometri.',
        essentialMaterial: 'Barisan dan Deret: Pola Aritmetika, Geometri, Deret Geometri Tak Hingga, dan Masalah Kontekstual',
        elementName: 'Aljabar & Pola',
        allocatedHours: 18,
        assessmentStrategy: 'Penugasan Terstruktur Studi Kasus Angsuran Anuitas & Kuis',
        deepLearningMethod: 'Mindful: Mengamati keteraturan pola fraktal alami pada bunga dan cangkang kerang.',
      },
      {
        semester: 1,
        orderNumber: 3,
        tpCode: 'TP.10.1.3',
        tpName: 'Menganalisis fungsi kuadrat dan sistem pertidaksamaan linear dua variabel untuk menyelesaikan masalah optimasi.',
        essentialMaterial: 'Fungsi Kuadrat, Titik Ekstrem Parabola, dan Program Linear Grafis Sederhana',
        elementName: 'Aljabar & Fungsi',
        allocatedHours: 18,
        assessmentStrategy: 'Asesmen Sumatif Proyek Pemodelan Lintasan Bola Basket dengan GeoGebra',
        deepLearningMethod: 'Joyful: Eksplorasi kurva parabola menggunakan gawai dan perangkat lunak visual.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.10.2.1',
        tpName: 'Menentukan perbandingan trigonometri (sinus, cosinus, tangen) pada segitiga siku-siku dan sudut istimewa.',
        essentialMaterial: 'Trigonometri: Perbandingan Sisi Siku-Siku, Sudut Istimewa 0-90°, dan Pengukuran Klinometer',
        elementName: 'Geometri & Pengukuran',
        allocatedHours: 18,
        assessmentStrategy: 'Praktikum Lapangan Pengukuran Tinggi Tiang Bendera / Gedung Sekolah',
        deepLearningMethod: 'Joyful: Terjun langsung ke lapangan mengukur ketinggian bangunan dengan klinometer mini.',
      },
      {
        semester: 2,
        orderNumber: 5,
        tpCode: 'TP.10.2.2',
        tpName: 'Menganalisis vektor dimensi dua (R2), operasi aljabar vektor, dan representasi geometris arah gaya.',
        essentialMaterial: 'Vektor Dimensi Dua: Notasi Komponen, Panjang Vektor, Dot Product, dan Aplikasi Navigasi Kapal',
        elementName: 'Geometri & Aljabar',
        allocatedHours: 18,
        assessmentStrategy: 'Desain Peta Jalur Navigasi Vektor & Tes Formatif',
        deepLearningMethod: 'Meaningful: Memahami navigasi haluan kapal laut dan pesawat udara terhadap arah angin.',
      },
      {
        semester: 2,
        orderNumber: 6,
        tpCode: 'TP.10.2.3',
        tpName: 'Menganalisis ukuran pemusatan dan penyebaran data kelompok serta menentukan peluang kejadian saling lepas/bebas.',
        essentialMaterial: 'Statistika Data Kelompok (Histogram, Mean, Median, Modus, Kuartil) & Teori Peluang Majemuk',
        elementName: 'Analisis Data dan Peluang',
        allocatedHours: 18,
        assessmentStrategy: 'Asesmen Sumatif Akhir Tahun: Analisis Survei Statistik Kebiasaan Belajar Siswa',
        deepLearningMethod: 'Mindful: Mengolah data nyata secara jujur, objektif, dan bernalar kritis.',
      },
    ],
  },
  {
    subject: 'Matematika',
    level: 'SMA',
    grade: 11,
    phase: 'Fase F',
    totalHoursPerYear: 144,
    jpPerWeek: 4,
    cpSummary: 'Peserta didik menguasai komposisi dan invers fungsi, geometri lingkaran (sudut keliling, garis singgung), matriks dan operasinya, serta dasar-dasar kalkulus diferensial dan aplikasinya.',
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.11.1.1',
        tpName: 'Menganalisis fungsi komposisi (fog) dan fungsi invers (f^-1) beserta domain dan range fungsinya.',
        essentialMaterial: 'Fungsi Komposisi dan Invers: Sifat Asosiatif, Syarat Invers Bijektif, dan Pemodelan Industri',
        elementName: 'Aljabar & Fungsi',
        allocatedHours: 24,
        assessmentStrategy: 'Tes Formatif & Studi Kasus Tahapan Produksi Pabrik',
        deepLearningMethod: 'Meaningful: Konsep tahapan ganda pengolahan bahan baku menjadi produk jadi.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.11.1.2',
        tpName: 'Menerapkan teorema sudut pusat, sudut keliling, dan persamaan garis singgung lingkaran.',
        essentialMaterial: 'Geometri Lingkaran: Sudut Pusat & Keliling, Segi Empat Tali Busur, Garis Singgung Persekutuan',
        elementName: 'Geometri',
        allocatedHours: 24,
        assessmentStrategy: 'Konstruksi Geometri Jangka & Desain Rantai Roda Gigi Sepeda',
        deepLearningMethod: 'Mindful: Kerapian dan ketelitian menggambar konstruksi lingkaran geometris.',
      },
      {
        semester: 1,
        orderNumber: 3,
        tpCode: 'TP.11.1.3',
        tpName: 'Menganalisis operasi penjumlahan, perkalian matriks, determinan, dan invers matriks ordo 2x2 dan 3x3.',
        essentialMaterial: 'Matriks: Operasi Matriks, Determinan, Invers Matriks, dan Sistem Persamaan Linear (Metode Cramer)',
        elementName: 'Aljabar Linear',
        allocatedHours: 24,
        assessmentStrategy: 'Asesmen Sumatif Proyek Kriptografi Enkripsi Pesan Rahasia Matriks',
        deepLearningMethod: 'Joyful: Permainan sandi rahasia spionase dengan enkripsi matriks.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.11.2.1',
        tpName: 'Menganalisis matriks transformasi geometri (translasi, refleksi, rotasi, dilatasi) dan komposisinya.',
        essentialMaterial: 'Transformasi Geometri: Pemetaan Koordinat, Matriks Transformasi, dan Desain Motif Batik Geometris',
        elementName: 'Geometri Transformasi',
        allocatedHours: 24,
        assessmentStrategy: 'Desain Komputasi Motif Kain Tenun / Batik Tradisional Berbantuan Komputer',
        deepLearningMethod: 'Joyful: Kreasi seni digital pergeseran dan perputaran pola etnomatematika.',
      },
      {
        semester: 2,
        orderNumber: 5,
        tpCode: 'TP.11.2.2',
        tpName: 'Menganalisis konsep limit fungsi aljabar dan turunan pertama fungsi aljabar serta aturan rantai.',
        essentialMaterial: 'Kalkulus Diferensial: Limit Fungsi Mendekati Titik/Tak Hingga, Definisi Turunan, Aturan Turunan',
        elementName: 'Kalkulus',
        allocatedHours: 24,
        assessmentStrategy: 'Tes Formatif & Kuis Laju Perubahan Sesaat',
        deepLearningMethod: 'Mindful: Konsep laju perubahan kecepatan seketika pada speedometer.',
      },
      {
        semester: 2,
        orderNumber: 6,
        tpCode: 'TP.11.2.3',
        tpName: 'Menerapkan turunan fungsi untuk menentukan interval naik/turun, titik stasioner, dan nilai optimum biaya.',
        essentialMaterial: 'Aplikasi Turunan: Garis Singgung Kurva, Uji Turunan Pertama/Kedua, Optimasi Laba Maksimum',
        elementName: 'Kalkulus & Optimasi',
        allocatedHours: 24,
        assessmentStrategy: 'Asesmen Sumatif Akhir Tahun & Studi Kasus Efisiensi Bahan Kemasan UMKM',
        deepLearningMethod: 'Meaningful: Memaksimalkan volume kotak kemasan dengan luas karton minimum.',
      },
    ],
  },

  // ==========================================
  // SMA - KIMIA (FASE E & F)
  // ==========================================
  {
    subject: 'Kimia',
    level: 'SMA',
    grade: 10,
    phase: 'Fase E',
    totalHoursPerYear: 108,
    jpPerWeek: 3,
    cpSummary: 'Peserta didik memahami struktur atom, tabel periodik unsur, ikatan kimia, hukum-hukum dasar kimia, konsep mol, serta prinsip Kimia Hijau (Green Chemistry) untuk pembangunan berkelanjutan.',
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.10.1.1',
        tpName: 'Menerapkan 12 prinsip kimia hijau dalam pengelolaan bahan kimia rumah tangga dan laboratorium.',
        essentialMaterial: 'Prinsip Kimia Hijau (Green Chemistry), Pengelolaan Limbah, dan Keselamatan Bahan Kimia',
        elementName: 'Pemahaman Kimia',
        allocatedHours: 18,
        assessmentStrategy: 'Audit Bahan Kimia Ramah Lingkungan di Dapur Rumah & Tes Formatif',
        deepLearningMethod: 'Mindful: Kesadaran meminimalkan racun kimia dan plastik sekali pakai.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.10.1.2',
        tpName: 'Menganalisis perkembangan model atom, partikel subatomik (proton, neutron, elektron), dan konfigurasi elektron Bohr/Mekanika Kuantum.',
        essentialMaterial: 'Struktur Atom: Nomor Atom, Massa Atom, Isotop, dan Konfigurasi Elektron',
        elementName: 'Pemahaman Kimia',
        allocatedHours: 18,
        assessmentStrategy: 'Kuis Struktur Atom & Pembuatan Model 3D Atom dari Plastisin',
        deepLearningMethod: 'Joyful: Berkreasi membuat miniatur orbital atom aneka warna.',
      },
      {
        semester: 1,
        orderNumber: 3,
        tpCode: 'TP.10.1.3',
        tpName: 'Menganalisis letak unsur dalam tabel periodik dan tren sifat keperiodikan unsur (jari-jari, energi ionisasi, elektronegativitas).',
        essentialMaterial: 'Tabel Periodik Unsur: Golongan, Periode, Jari-jari Atom, dan Kereaktifan Logam/Nonlogam',
        elementName: 'Pemahaman & Penalaran',
        allocatedHours: 18,
        assessmentStrategy: 'Asesmen Sumatif Proyek Kartu Kuartet Tabel Periodik Unsur',
        deepLearningMethod: 'Joyful: Bermain gim kartu sains mengenal sifat unsur kimia.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.10.2.1',
        tpName: 'Menganalisis pembentukan ikatan ion, ikatan kovalen (tunggal, rangkap, koordinasi), dan ikatan logam.',
        essentialMaterial: 'Ikatan Kimia: Kaidah Oktet, Struktur Lewis, Kepolaran Senyawa, dan Sifat Fisik Senyawa',
        elementName: 'Pemahaman Kimia',
        allocatedHours: 18,
        assessmentStrategy: 'Praktikum Uji Daya Hantar Listrik & Kepolaran Larutan',
        deepLearningMethod: 'Meaningful: Memahami mengapa garam larut dalam air dan minyak tidak.',
      },
      {
        semester: 2,
        orderNumber: 5,
        tpCode: 'TP.10.2.2',
        tpName: 'Menyetarakan persamaan reaksi kimia dan menerapkan hukum-hukum dasar kimia (Lavoisier, Proust, Dalton, Gay-Lussac, Avogadro).',
        essentialMaterial: 'Reaksi Kimia & Hukum Dasar Kimia: Kekekalan Massa, Perbandingan Tetap, Perbandingan Volume',
        elementName: 'Keterampilan Proses',
        allocatedHours: 18,
        assessmentStrategy: 'Praktikum Pembakaran Pita Magnesium & Penimbangan Massa Reaktan/Produk',
        deepLearningMethod: 'Mindful: Membuktikan secara presisi bahwa materi tidak pernah musnah.',
      },
      {
        semester: 2,
        orderNumber: 6,
        tpCode: 'TP.10.2.3',
        tpName: 'Menerapkan konsep mol dan stoikiometri larutan dalam perhitungan kuantitatif reaksi kimia.',
        essentialMaterial: 'Stoikiometri: Massa Molar, Volume Molar Gas STP, Molaritas, dan Pereaksi Pembatas',
        elementName: 'Perhitungan & Asesmen Sumatif',
        allocatedHours: 18,
        assessmentStrategy: 'Asesmen Sumatif Akhir Tahun: Tes Stoikiometri Kuantitatif Terpadu',
        deepLearningMethod: 'Meaningful: Menghitung takaran tepat reagen pembuatan pupuk pertanian.',
      },
    ],
  },

  // ==========================================
  // SMA - BIOLOGI (FASE E & F)
  // ==========================================
  {
    subject: 'Biologi',
    level: 'SMA',
    grade: 10,
    phase: 'Fase E',
    totalHoursPerYear: 108,
    jpPerWeek: 3,
    cpSummary: 'Peserta didik memahami keanekaragaman hayati Indonesia, virus dan peranannya, bioteknologi konvensional dan modern, serta inovasi pelestarian lingkungan dan ekosistem maritim/daratan.',
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.10.1.1',
        tpName: 'Menganalisis tingkat keanekaragaman hayati (gen, jenis, ekosistem) dan sebaran flora fauna Garis Wallace/Weber di Indonesia.',
        essentialMaterial: 'Keanekaragaman Hayati Indonesia: Endemisme, Konservasi In-Situ/Ex-Situ, dan Manfaat Plasma Nutfah',
        elementName: 'Pemahaman Sains',
        allocatedHours: 18,
        assessmentStrategy: 'Observasi Flora Fauna Taman Sekolah & Penyusunan Ensiklopedia Mini',
        deepLearningMethod: 'Mindful: Bersyukur atas anugerah megabiodiversitas kepulauan nusantara.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.10.1.2',
        tpName: 'Menganalisis struktur replikasi virus (siklus litik & lisogenik) serta peranannya dalam vaksinasi dan terapi gen.',
        essentialMaterial: 'Struktur Virus, Penyakit Akibat Virus (COVID-19, DBD, HIV), Vaksin, dan Rekayasa Biomedis',
        elementName: 'Pemahaman Sains',
        allocatedHours: 18,
        assessmentStrategy: 'Infografis Edukasi Pentingnya Imunisasi & Kuis Virus',
        deepLearningMethod: 'Meaningful: Memahami mekanisme kerja vaksin melindungi imunitas komunal.',
      },
      {
        semester: 1,
        orderNumber: 3,
        tpCode: 'TP.10.1.3',
        tpName: 'Mengklasifikasikan mikroorganisme bakteri dan jamur serta peranannya dalam fermentasi pangan lokal.',
        essentialMaterial: 'Monera & Fungi: Bakteri Gram, Fisiologi Jamur, Fermentasi Tempe/Yogurt, dan Jamur Konsumsi',
        elementName: 'Keterampilan Proses',
        allocatedHours: 18,
        assessmentStrategy: 'Asesmen Sumatif Proyek Pembuatan Makanan Fermentasi Tradisional',
        deepLearningMethod: 'Joyful: Praktik asyik membuat yoghurt buah dan tempe higienis.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.10.2.1',
        tpName: 'Menganalisis interaksi komponen biotik-abiotik, rantai makanan, piramida ekologi, dan daur biogeokimia (C, N, P, H2O).',
        essentialMaterial: 'Ekologi: Suksesi Ekosistem, Jaring Makanan, Daur Biogeokimia, dan Daya Dukung Lingkungan',
        elementName: 'Pemahaman Sains',
        allocatedHours: 18,
        assessmentStrategy: 'Mini Riset Ekosistem Pesisir / Hutan Bakau & Analisis Kualitas Air',
        deepLearningMethod: 'Meaningful: Menyelidiki peran krusial hutan mangrove mencegah abrasi pantai.',
      },
      {
        semester: 2,
        orderNumber: 5,
        tpCode: 'TP.10.2.2',
        tpName: 'Menganalisis dampak pencemaran air, udara, tanah, dan mikroplastik terhadap krisis keanekaragaman hayati.',
        essentialMaterial: 'Pencemaran Lingkungan: Eutrofikasi, Mikroplastik Laut, Bioakumulasi, dan B3',
        elementName: 'Keterampilan Proses & Aksi',
        allocatedHours: 18,
        assessmentStrategy: 'Kampanye Zero Waste & Pengolahan Sampah Organik Menjadi Eco-Enzyme',
        deepLearningMethod: 'Mindful: Membuat cairan eco-enzyme pembersih alami dari kulit buah sisa.',
      },
      {
        semester: 2,
        orderNumber: 6,
        tpCode: 'TP.10.2.3',
        tpName: 'Mengevaluasi prinsip bioteknologi modern (kultur jaringan, kloning, CRISPR) serta etika biologi (bioetika).',
        essentialMaterial: 'Bioteknologi Modern: Rekayasa Genetika, GMO, Kultur Jaringan, Bioetika dan Regulasi Keamanan Hayati',
        elementName: 'Pemahaman & Asesmen Sumatif',
        allocatedHours: 18,
        assessmentStrategy: 'Asesmen Sumatif Akhir Tahun & Debat Bioetika Tanaman Transgenik',
        deepLearningMethod: 'Meaningful: Berpikir kritis membedakan fakta sains vs mitos rekayasa genetika.',
      },
    ],
  },

  // ==========================================
  // SMA - INFORMATIKA (FASE E & F)
  // ==========================================
  {
    subject: 'Informatika',
    level: 'SMA',
    grade: 10,
    phase: 'Fase E',
    totalHoursPerYear: 108,
    jpPerWeek: 3,
    cpSummary: 'Peserta didik menguasai Berpikir Komputasional (BK), Teknologi Informasi & Komunikasi (TIK), Sistem Komputer (SK), Jaringan Komputer & Internet (JKI), Analisis Data (AD), Algoritma & Pemrograman (AP), Dampak Sosial Informatika (DSI), dan Praktik Lintas Bidang (PLB).',
    elements: [
      {
        name: 'Berpikir Komputasional & Pemrograman',
        description: 'Dekomposisi, pengenalan pola, abstraksi, algoritma, dan pemrograman berbasis teks (Python/C++).',
        competencies: ['Menyusun algoritma rekursif', 'Mengoding solusi Python', 'Debugging kode program'],
        essentialMaterials: ['Struktur Data Stack/Queue', 'Dasar Python', 'Pengkondisian & Perulangan'],
      },
      {
        name: 'Analisis Data & Jaringan',
        description: 'Pengolahan big data, visualisasi data, keamanan siber, dan arsitektur jaringan lokal/internet.',
        competencies: ['Memvisualisasikan data interaktif', 'Menganalisis celah keamanan siber', 'Mengonfigurasi IP Address'],
        essentialMaterials: ['Spreadsheet Lanjutan', 'Python Pandas', 'Keamanan Siber & Enkripsi'],
      },
    ],
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.10.1.1',
        tpName: 'Menerapkan 4 pilar Berpikir Komputasional dalam merancang algoritma pencarian (searching) dan pengurutan (sorting).',
        essentialMaterial: 'Berpikir Komputasional: Binary Search, Bubble Sort, Merge Sort, dan Struktur Data Stack/Queue',
        elementName: 'Berpikir Komputasional (BK)',
        allocatedHours: 18,
        assessmentStrategy: 'Simulasi Logika Algoritma Papan Kartu & Tes Formatif',
        deepLearningMethod: 'Joyful: Permainan tebak angka algoritma biner berhadiah.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.10.1.2',
        tpName: 'Mengintegrasikan fitur kolaborasi cloud, mail merge, dan otomatisasi dokumen perkantoran terpadu.',
        essentialMaterial: 'Teknologi Informasi & Komunikasi: Integrasi Aplikasi Perkantoran & Otomasi Dokumen',
        elementName: 'Teknologi Informasi & Komunikasi (TIK)',
        allocatedHours: 18,
        assessmentStrategy: 'Proyek Desain Laporan Digital Multi-Aplikasi (Spreadsheet ke Word/Slides)',
        deepLearningMethod: 'Meaningful: Efisiensi pembuatan sertifikat otomatis ratusan peserta.',
      },
      {
        semester: 1,
        orderNumber: 3,
        tpCode: 'TP.10.1.3',
        tpName: 'Menganalisis interaksi perangkat keras, sistem operasi (OS), dan siklus eksekusi CPU (Fetch-Decode-Execute).',
        essentialMaterial: 'Sistem Komputer: Komponen Hardware, Multitasking OS, Driver, dan Arsitektur Von Neumann',
        elementName: 'Sistem Komputer (SK)',
        allocatedHours: 18,
        assessmentStrategy: 'Asesmen Sumatif Proyek Merakit Komputer Virtual & Optimasi RAM',
        deepLearningMethod: 'Joyful: Simulasi bongkar pasang PC berbantuan simulator 3D interaktif.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.10.2.1',
        tpName: 'Menganalisis arsitektur jaringan lokal (LAN), topologi, subnetting IP address, serta enkripsi data SSL/TLS.',
        essentialMaterial: 'Jaringan Komputer dan Internet: Model TCP/IP, IPV4/IPV6, Routing, Firewall, dan Cyber Security',
        elementName: 'Jaringan Komputer & Internet (JKI)',
        allocatedHours: 18,
        assessmentStrategy: 'Simulasi Topologi Jaringan Sekolah di Cisco Packet Tracer',
        deepLearningMethod: 'Meaningful: Mengamankan jaringan WiFi sekolah dari peretasan.',
      },
      {
        semester: 2,
        orderNumber: 5,
        tpCode: 'TP.10.2.2',
        tpName: 'Melakukan pembersihan data, pengolahan statistik, dan visualisasi grafik interaktif menggunakan Python Pandas.',
        essentialMaterial: 'Analisis Data (AD): Data Cleaning, Visualisasi Matplotlib/Seaborn, dan Pengambilan Keputusan',
        elementName: 'Analisis Data (AD)',
        allocatedHours: 18,
        assessmentStrategy: 'Dashboard Visualisasi Data Penjualan UMKM / Nilai Akademik Siswa',
        deepLearningMethod: 'Mindful: Menafsirkan tren data secara jujur tanpa manipulasi visual.',
      },
      {
        semester: 2,
        orderNumber: 6,
        tpCode: 'TP.10.2.3',
        tpName: 'Merancang program aplikasi sederhana berbasis teks/GUI menggunakan bahasa Python dengan fungsi modular.',
        essentialMaterial: 'Algoritma & Pemrograman (AP): Variabel, Tipe Data, Looping, Fungsi Kustom, dan PLB Aplikasi Solutif',
        elementName: 'Algoritma & Pemrograman (AP) / PLB',
        allocatedHours: 18,
        assessmentStrategy: 'Asesmen Sumatif Akhir Tahun: Showcase Aplikasi Kasir / Kuis Cerdas Buatan Siswa',
        deepLearningMethod: 'Joyful: Pameran aplikasi digital kreasi mandiri siswa di depan publik.',
      },
    ],
  },

  // ==========================================
  // SMA - PENDIDIKAN PANCASILA (FASE E & F)
  // ==========================================
  {
    subject: 'Pendidikan Pancasila',
    level: 'SMA',
    grade: 10,
    phase: 'Fase E',
    totalHoursPerYear: 72,
    jpPerWeek: 2,
    cpSummary: 'Peserta didik menganalisis kedudukan Pancasila sebagai ideologi terbuka, norma dan UUD NRI 1945, Bhinneka Tunggal Ika dalam harmoni keberagaman, serta NKRI dan kedaulatan wilayah kepulauan Indonesia.',
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.10.1.1',
        tpName: 'Menganalisis proses perumusan dan nilai-nilai luhur Pancasila sebagai ideologi terbuka dan pandangan hidup bangsa.',
        essentialMaterial: 'Pancasila: Sejarah Kelahiran, Piagam Jakarta, Nilai Instrumental/Praksis, dan Tantangan Era Digital',
        elementName: 'Pancasila',
        allocatedHours: 18,
        assessmentStrategy: 'Analisis Video Studi Kasus Toleransi Beragama & Tes Formatif',
        deepLearningMethod: 'Mindful: Internalisasi nilai kemanusiaan dan keadilan dalam pergaulan sehari-hari.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.10.1.2',
        tpName: 'Menganalisis kedudukan UUD NRI Tahun 1945 sebagai hukum dasar tertinggi, tata urutan peraturan, dan penegakan HAM.',
        essentialMaterial: 'UUD NRI 1945: Hierarki Peraturan Perundang-undangan, Hak dan Kewajiban Warga Negara, Penegakan HAM',
        elementName: 'Undang-Undang Dasar NRI 1945',
        allocatedHours: 18,
        assessmentStrategy: 'Asesmen Sumatif Proyek Sidang Mahkamah Konstitusi Mini / Uji Materi Undang-Undang',
        deepLearningMethod: 'Meaningful: Berani bersuara membela kebenaran dan hak-hak asasi sesama.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 3,
        tpCode: 'TP.10.2.1',
        tpName: 'Menganalisis strategi resolusi konflik dan merajut kerukunan dalam bingkai Bhinneka Tunggal Ika di tengah masyarakat majemuk.',
        essentialMaterial: 'Bhinneka Tunggal Ika: Harmoni Multikultural, Pencegahan Diskriminasi SARA, dan Moderasi Beragama',
        elementName: 'Bhinneka Tunggal Ika',
        allocatedHours: 18,
        assessmentStrategy: 'Pentas Festival Budaya Keberagaman & Pembuatan Film Pendek Moderasi',
        deepLearningMethod: 'Joyful: Festival pawai baju adat dan sajian kuliner khas nusantara.',
      },
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.10.2.2',
        tpName: 'Menganalisis konsep bela negara, kedaulatan maritim, dan menjaga keutuhan Negara Kesatuan Republik Indonesia (NKRI).',
        essentialMaterial: 'NKRI: Batas Wilayah Darat/Laut/Udara, Ancaman Militer/Nonmiliter, Peran Generasi Muda Menjaga NKRI',
        elementName: 'Negara Kesatuan Republik Indonesia (NKRI)',
        allocatedHours: 18,
        assessmentStrategy: 'Asesmen Sumatif Akhir Tahun: Ikrar Aksi Nyata Bela Negara Siswa',
        deepLearningMethod: 'Meaningful: Komitmen pemuda menjaga kedaulatan kepulauan terluar Indonesia.',
      },
    ],
  },

  // ==========================================
  // SMA - PAI (PENDIDIKAN AGAMA ISLAM)
  // ==========================================
  {
    subject: 'Pendidikan Agama Islam',
    level: 'SMA',
    grade: 10,
    phase: 'Fase E',
    totalHoursPerYear: 108,
    jpPerWeek: 3,
    cpSummary: 'Peserta didik mampu membaca Al-Qur’an bertajwid, menganalisis cabang iman (Syu’abul Iman), menjauhi pergaulan bebas, menerapkan fikih muamalah kontemporer (asuransi syariah, bank syariah), dan meneladani sejarah masuknya Islam ke Nusantara.',
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.10.1.1',
        tpName: 'Membaca dan menganalisis QS Al-Hujurat/49: 10 dan 12 tentang kontrol diri (mujahadah an-nafs), prasangka baik (husnuzan), dan persaudaraan (ukhuwah).',
        essentialMaterial: 'Al-Qur’an Hadis: Tajwid Mad/Waqaf, Mujahadah An-Nafs, Husnuzan, Ukhuwah Islamiyah/Wathaniyah',
        elementName: 'Al-Qur’an dan Hadis',
        allocatedHours: 18,
        assessmentStrategy: 'Uji Hafalan & Praktik Tilawah Tajwid serta Tes Pemahaman Tafsir',
        deepLearningMethod: 'Mindful: Menenangkan hati dengan zikir dan menahan amarah emosional.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.10.1.2',
        tpName: 'Menganalisis 77 cabang iman (Syu’abul Iman) dan mengimplementasikannya dalam pembentukan integritas akhlak mulia.',
        essentialMaterial: 'Akidah: Hakikat Syu’abul Iman (Niat Hati, Lisan, dan Perbuatan Anggota Badan)',
        elementName: 'Akidah',
        allocatedHours: 18,
        assessmentStrategy: 'Jurnal Refleksi Amal Harian & Diskusi Kategori Cabang Iman',
        deepLearningMethod: 'Mindful: Muhasabah diri terhadap keselarasan iman dan perbuatan nyata.',
      },
      {
        semester: 1,
        orderNumber: 3,
        tpCode: 'TP.10.1.3',
        tpName: 'Menganalisis bahaya pergaulan bebas dan zina sesuai QS Al-Isra’/17: 32 serta cara menjaga kehormatan diri.',
        essentialMaterial: 'Akhlak: Menghindari Zina, Menjaga Pandangan (Ghadul Bashar), dan Adab Bermedia Sosial',
        elementName: 'Akhlak Mulia',
        allocatedHours: 18,
        assessmentStrategy: 'Asesmen Sumatif Pembuatan Podcast Edukasi Pergaulan Sehat Remaja',
        deepLearningMethod: 'Meaningful: Menjaga kehormatan diri dan keluarga di ruang maya dan nyata.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.10.2.1',
        tpName: 'Menganalisis ketentuan fikih muamalah kontemporer (asuransi syariah, perbankan syariah, dan koperasi syariah).',
        essentialMaterial: 'Fikih: Asuransi Syariah (Takaful), Riba vs Bagi Hasil, Akad Murabahah/Mudharabah, FinTech Syariah',
        elementName: 'Fikih Muamalah',
        allocatedHours: 18,
        assessmentStrategy: 'Simulasi Pembukaan Tabungan Syariah & Analisis Akad Kontrak',
        deepLearningMethod: 'Meaningful: Memahami transaksi ekonomi yang adil, berkah, dan bebas riba.',
      },
      {
        semester: 2,
        orderNumber: 5,
        tpCode: 'TP.10.2.2',
        tpName: 'Menganalisis strategi dakwah dan kearifan lokal para Wali Songo serta ulama penyebar Islam di Nusantara.',
        essentialMaterial: 'Sejarah Peradaban Islam: Teori Masuknya Islam, Akulturasi Budaya Wali Songo, Tokoh Ulama Nusantara',
        elementName: 'Sejarah Peradaban Islam (SPI)',
        allocatedHours: 18,
        assessmentStrategy: 'Pentas Drama Biografi Tokoh Sunan Kalijaga / Ulama Lokal',
        deepLearningMethod: 'Joyful: Menikmati keindahan tembang kearifan lokal bernilai dakwah luhur.',
      },
      {
        semester: 2,
        orderNumber: 6,
        tpCode: 'TP.10.2.3',
        tpName: 'Menerapkan adab berbusana muslim, toleransi antarumat beragama, dan budaya tolong-menolong.',
        essentialMaterial: 'Akhlak Terpuji: Tasamuh (Toleransi), Ta’awun (Gotong Royong), dan Kepedulian Sosial Kemasyarakatan',
        elementName: 'Akhlak & Asesmen Sumatif',
        allocatedHours: 18,
        assessmentStrategy: 'Asesmen Sumatif Akhir Tahun & Aksi Bakti Sosial Tebar Kebaikan',
        deepLearningMethod: 'Meaningful: Berbagi sembako dan menyantuni anak yatim secara tulus.',
      },
    ],
  },

  // ==========================================
  // SMA - SEJARAH (FASE E & F)
  // ==========================================
  {
    subject: 'Sejarah',
    level: 'SMA',
    grade: 10,
    phase: 'Fase E',
    totalHoursPerYear: 72,
    jpPerWeek: 2,
    cpSummary: 'Peserta didik menguasai konsep dasar ilmu sejarah, manusia sebagai subjek sejarah, jalur rempah nusantara, kerajaan Hindu-Buddha-Islam, serta masa kolonialisme dan kebangkitan nasionalisme.',
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.10.1.1',
        tpName: 'Menganalisis konsep berpikir diakronik (kronologis), sinkronik, kausalitas, dan periodisasi dalam peristiwa sejarah.',
        essentialMaterial: 'Pengantar Ilmu Sejarah: Hakikat Sejarah, Manusia Ruang & Waktu, Kritik Sumber Sejarah (Heuristik, Verifikasi)',
        elementName: 'Keterampilan Konsep Sejarah',
        allocatedHours: 18,
        assessmentStrategy: 'Uji Analisis Dokumen Sumber Primer vs Sekunder & Tes Formatif',
        deepLearningMethod: 'Mindful: Meneliti keaslian arsip masa lampau secara kritis dan teliti.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.10.1.2',
        tpName: 'Menganalisis kejayaan peradaban awal nusantara dan Jalur Rempah sebagai poros maritim dunia.',
        essentialMaterial: 'Peradaban Bahari Nusantara: Asal Usul Nenek Moyang, Jalur Rempah Pala/Cengkih, dan Hubungan Antarpulau',
        elementName: 'Pemahaman Sejarah Nusantara',
        allocatedHours: 18,
        assessmentStrategy: 'Asesmen Sumatif Desain Peta Jalur Rempah Maritim Kepulauan Maluku',
        deepLearningMethod: 'Meaningful: Bangga akan kejayaan bahari dan kekayaan rempah kepulauan Maluku.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 3,
        tpCode: 'TP.10.2.1',
        tpName: 'Menganalisis sistem pemerintahan, kebudayaan, dan peninggalan kerajaan Hindu-Buddha dan Kesultanan Islam di Indonesia.',
        essentialMaterial: 'Kerajaan Hindu-Buddha (Sriwijaya, Majapahit) & Kesultanan Islam (Samudera Pasai, Mataram, Ternate-Tidore)',
        elementName: 'Pemahaman Sejarah',
        allocatedHours: 18,
        assessmentStrategy: 'E-Museum Pameran Benda Cagar Budaya dan Prasasti Bersejarah',
        deepLearningMethod: 'Joyful: Tur virtual menjelajahi istana dan benteng bersejarah nusantara.',
      },
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.10.2.2',
        tpName: 'Menganalisis dampak kolonialisme bangsa Barat (VOC/Hindia Belanda) dan lahirnya pergerakan nasional (Budi Utomo, Sumpah Pemuda).',
        essentialMaterial: 'Kolonialisme & Pergerakan Nasional: Monopoli Perdagangan, Tanam Paksa, Politik Etis, Sumpah Pemuda 1928',
        elementName: 'Kesadaran Sejarah & Sumatif',
        allocatedHours: 18,
        assessmentStrategy: 'Asesmen Sumatif Akhir Tahun: Penulisan Esai Reflektif Sumpah Pemuda',
        deepLearningMethod: 'Meaningful: Menjiwai semangat persatuan pemuda lintas suku dan agama.',
      },
    ],
  },

  // ==========================================
  // SMA - BAHASA INGGRIS (FASE E & F)
  // ==========================================
  {
    subject: 'Bahasa Inggris',
    level: 'SMA',
    grade: 10,
    phase: 'Fase E',
    totalHoursPerYear: 72,
    jpPerWeek: 2,
    cpSummary: 'Students are able to listen, speak, read, and write descriptive texts about tourist attractions, recount texts of historical events, narrative folktales, procedure recipes/manuals, and expository opinions on global issues.',
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.10.1.1',
        tpName: 'Identify specific information and produce descriptive spoken/written texts about local tourist attractions and historical buildings.',
        essentialMaterial: 'Descriptive Text: Describing Famous Places, Adjectives, Present Simple Tense, Passive Voice',
        elementName: 'Listening & Speaking, Reading & Viewing',
        allocatedHours: 18,
        assessmentStrategy: 'Travel Vlog / Brochure Presentation of Local Tourism & Formative Test',
        deepLearningMethod: 'Joyful: Promoting scenic islands and traditional heritage in English video vlogs.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.10.1.2',
        tpName: 'Analyze chronological sequence of events and write recount texts regarding inspiring personal experiences or historical milestones.',
        essentialMaterial: 'Recount Text: Historical Events, Past Simple Tense, Time Connectives, Biographical Recount',
        elementName: 'Reading & Writing',
        allocatedHours: 18,
        assessmentStrategy: 'Digital Storybook of Youth Independence Day & Grammar Quiz',
        deepLearningMethod: 'Meaningful: Remembering unforgettable journeys and lessons learned in life.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 3,
        tpCode: 'TP.10.2.1',
        tpName: 'Analyze moral values and character traits in traditional folklore narrative texts and recreate modernized creative stories.',
        essentialMaterial: 'Narrative Text: Folktales, Legends, Complication-Resolution, Direct-Indirect Speech',
        elementName: 'Reading & Writing',
        allocatedHours: 18,
        assessmentStrategy: 'Puppet Storytelling Performance & Narrative Portfolio',
        deepLearningMethod: 'Joyful: Storytelling puppet show sharing wisdom from Nusantara folktales.',
      },
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.10.2.2',
        tpName: 'Deliver analytical expository speeches expressing constructive arguments on environmental protection and digital ethics.',
        essentialMaterial: 'Analytical Exposition: Thesis, Arguments, Reiteration, Persuasive Language Features',
        elementName: 'Speaking & Presenting, Writing & Representing',
        allocatedHours: 18,
        assessmentStrategy: 'Summative Assessment: Speech Contest on Climate Action & Opinion Essay',
        deepLearningMethod: 'Meaningful: Voice out youth solutions for clean oceans and renewable energy.',
      },
    ],
  },

  // ==========================================
  // SMP - ILMU PENGETAHUAN ALAM (IPA)
  // ==========================================
  {
    subject: 'IPA',
    level: 'SMP',
    grade: 7,
    phase: 'Fase D',
    totalHoursPerYear: 144,
    jpPerWeek: 4,
    cpSummary: 'Peserta didik memahami hakikat sains, pengukuran, zat dan perubahannya, suhu kalor, gerak gaya, klasifikasi makhluk hidup, ekologi, serta bumi dan tata surya.',
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.7.1.1',
        tpName: 'Menerapkan langkah-langkah metode ilmiah dan keselamatan kerja di laboratorium IPA.',
        essentialMaterial: 'Hakikat Sains, Metode Ilmiah, Pengukuran Besaran Pokok & Turunan, Keselamatan Kerja Lab',
        elementName: 'Pemahaman IPA & Keterampilan Proses',
        allocatedHours: 24,
        assessmentStrategy: 'Uji Kinerja Penggunaan Jangka Sorong & Mikrometer Sekrup',
        deepLearningMethod: 'Mindful: Kerapian dan kehati-hatian menggunakan instrumen laboratorium.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.7.1.2',
        tpName: 'Menganalisis wujud zat, partikel penyusun zat, perubahan fisika-kimia, dan pemisahan campuran.',
        essentialMaterial: 'Zat dan Perubahannya: Sifat Zat, Perubahan Wujud, Unsur-Senyawa-Campuran, Filtrasi & Distilasi',
        elementName: 'Pemahaman IPA',
        allocatedHours: 24,
        assessmentStrategy: 'Praktikum Penjernihan Air Sederhana & Tes Formatif',
        deepLearningMethod: 'Meaningful: Pemecahan masalah krisis air bersih di lingkungan sekitar.',
      },
      {
        semester: 1,
        orderNumber: 3,
        tpCode: 'TP.7.1.3',
        tpName: 'Menganalisis konsep suhu, kalor, perpindahan kalor (konduksi, konveksi, radiasi), dan pemuaian zat.',
        essentialMaterial: 'Suhu dan Kalor: Skala Termometer, Kalor Jenis, Azas Black, dan Mekanisme Termoregulasi Tubuh',
        elementName: 'Pemahaman IPA',
        allocatedHours: 24,
        assessmentStrategy: 'Asesmen Sumatif Proyek Pembuatan Termos Sederhana',
        deepLearningMethod: 'Joyful: Eksperimen isolator panas dari bahan ramah lingkungan.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.7.2.1',
        tpName: 'Menganalisis konsep gerak lurus, gaya, dan Hukum I, II, III Newton tentang gerak.',
        essentialMaterial: 'Gerak dan Gaya: Kecepatan, Percepatan, Resultan Gaya, dan Aplikasi Hukum Newton Sehari-hari',
        elementName: 'Pemahaman IPA',
        allocatedHours: 24,
        assessmentStrategy: 'Lomba Roket Balon & Uji Teori Hukum Newton',
        deepLearningMethod: 'Joyful: Eksperimen dorongan roket balon luncur.',
      },
      {
        semester: 2,
        orderNumber: 5,
        tpCode: 'TP.7.2.2',
        tpName: 'Mengklasifikasikan makhluk hidup berdasarkan ciri-ciri morfologi, kunci determinasi, dan mikroskop.',
        essentialMaterial: 'Klasifikasi Makhluk Hidup: Kingdom Monera, Protista, Fungi, Plantae, Animalia, Kunci Dikotomi',
        elementName: 'Keterampilan Proses',
        allocatedHours: 24,
        assessmentStrategy: 'Pembuatan Herbarium Mini & Kunci Determinasi Tanaman Obat',
        deepLearningMethod: 'Mindful: Mengamati keanekaragaman flora di kebun sekolah.',
      },
      {
        semester: 2,
        orderNumber: 6,
        tpCode: 'TP.7.2.3',
        tpName: 'Menganalisis interaksi antarkomponen ekosistem dan dampak pencemaran terhadap keanekaragaman hayati.',
        essentialMaterial: 'Ekologi dan Keanekaragaman Hayati Indonesia: Rantai Makanan, Simbiosis, Konservasi Alam',
        elementName: 'Pemahaman & Aksi Nyata',
        allocatedHours: 24,
        assessmentStrategy: 'Asesmen Sumatif Akhir Tahun & Mini Riset Ekosistem Kolam',
        deepLearningMethod: 'Meaningful: Penanaman pohon dan aksi pelestarian lingkungan hidup.',
      },
    ],
  },

  // ==========================================
  // SMP - ILMU PENGETAHUAN SOSIAL (IPS)
  // ==========================================
  {
    subject: 'IPS',
    level: 'SMP',
    grade: 7,
    phase: 'Fase D',
    totalHoursPerYear: 144,
    jpPerWeek: 4,
    cpSummary: 'Peserta didik menganalisis keberadaan diri dan keluarga di tengah lingkungan sosial, potensi ekonomi lingkungan dan pemenuhan kebutuhan manusia, peradaban masa praaksara-kerajaan, serta pemberdayaan masyarakat.',
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.7.1.1',
        tpName: 'Menganalisis silsilah keluarga, letak geografis Indonesia, dan pengaruh angin muson terhadap mata pencaharian.',
        essentialMaterial: 'Keluarga Awal Kehidupan: Silsilah Keluarga, Letak Astronomis/Geografis Indonesia, Cuaca & Iklim Tropis',
        elementName: 'Keruangan & Keberadaan Diri',
        allocatedHours: 24,
        assessmentStrategy: 'Penyusunan Pohon Silsilah Keluarga & Peta Jalur Pelayaran Maritim',
        deepLearningMethod: 'Mindful: Menghormati asal-usul keluarga dan bersyukur atas iklim tropis subur.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.7.1.2',
        tpName: 'Menganalisis interaksi sosial, status peran, sosialisasi nilai norma, dan pencegahan penyimpangan sosial.',
        essentialMaterial: 'Interaksi Sosial: Kontak & Komunikasi, Agen Sosialisasi, Norma Adat, dan Toleransi Bermasyarakat',
        elementName: 'Interaksi Sosial & Budaya',
        allocatedHours: 24,
        assessmentStrategy: 'Observasi Perilaku Sopan Santun Siswa di Sekolah & Tes Formatif',
        deepLearningMethod: 'Meaningful: Mempraktikkan budaya 5S (Senyum, Salam, Sapa, Sopan, Santun).',
      },
      {
        semester: 1,
        orderNumber: 3,
        tpCode: 'TP.7.1.3',
        tpName: 'Menganalisis kelangkaan sumber daya, skala prioritas kebutuhan manusia, dan kegiatan ekonomi produksi-distribusi-konsumsi.',
        essentialMaterial: 'Kebutuhan Manusia & Kelangkaan: Kebutuhan Primer/Sekunder/Tersier, Motif Ekonomi, dan Pelaku Pasar',
        elementName: 'Ekonomi & Kesejahteraan',
        allocatedHours: 24,
        assessmentStrategy: 'Asesmen Sumatif Simulasi Penyusunan Anggaran Belanja Uang Saku Hemat',
        deepLearningMethod: 'Joyful: Belajar mencatat arus kas pribadi dan menyisihkan tabungan.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.7.2.1',
        tpName: 'Menganalisis corak kehidupan manusia purba praaksara dan peninggalan kebudayaan batu (Paleolitikum hingga Megalitikum).',
        essentialMaterial: 'Zaman Praaksara: Fosil Manusia Purba, Food Gathering ke Food Producing, Menhir, Dolmen, Sarkofagus',
        elementName: 'Sejarah & Peradaban',
        allocatedHours: 24,
        assessmentStrategy: 'Pembuatan Diorama Gua Purba & Miniatur Alat Serpih Batu',
        deepLearningMethod: 'Joyful: Eksplorasi kehidupan manusia purba berburu dan meramu.',
      },
      {
        semester: 2,
        orderNumber: 5,
        tpCode: 'TP.7.2.2',
        tpName: 'Menganalisis proses masuknya pengaruh Hindu-Buddha dan Islam serta terbentuknya jaringan perdagangan antarpulau.',
        essentialMaterial: 'Kerajaan Nusantara: Akulturasi Budaya, Jalur Perdagangan Rempah Antar-Kesultanan, dan Tokoh Raja Maritim',
        elementName: 'Sejarah & Keruangan',
        allocatedHours: 24,
        assessmentStrategy: 'Resensi Cerita Kepahlawanan Tokoh Sejarah Maritim Lokal',
        deepLearningMethod: 'Meaningful: Mengenal peran pelabuhan tradisional nusantara sebagai simpul persatuan.',
      },
      {
        semester: 2,
        orderNumber: 6,
        tpCode: 'TP.7.2.3',
        tpName: 'Menganalisis peranan pasar, uang, perbankan, dan pemberdayaan komunitas lokal dalam meningkatkan taraf hidup masyarakat.',
        essentialMaterial: 'Pasar Tradisional & Digital: Penawaran-Permintaan, Harga Keseimbangan, Lembaga Keuangan, UMKM',
        elementName: 'Ekonomi & Sumatif',
        allocatedHours: 24,
        assessmentStrategy: 'Asesmen Sumatif Akhir Tahun: Observasi Wawancara Pedagang Pasar Tradisional',
        deepLearningMethod: 'Meaningful: Menghargai kerja keras para pedagang dan petani pasar lokal.',
      },
    ],
  },

  // ==========================================
  // SD - IPAS (ILMU PENGETAHUAN ALAM DAN SOSIAL)
  // ==========================================
  {
    subject: 'IPAS',
    level: 'SD',
    grade: 4,
    phase: 'Fase B',
    totalHoursPerYear: 144,
    jpPerWeek: 4,
    cpSummary: 'Peserta didik memahami bagian tubuh tumbuhan dan fungsinya, wujud zat dan perubahannya, gaya di sekitar kita, transformasi energi, serta sejarah kearifan lokal daerahnya.',
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.4.1.1',
        tpName: 'Mengidentifikasi bagian tubuh tumbuhan (akar, batang, daun, bunga) dan fungsinya bagi fotosintesis.',
        essentialMaterial: 'Tumbuhan Sumber Kehidupan: Bagian Tumbuhan, Proses Fotosintesis, dan Perkembangbiakan Tanaman',
        elementName: 'Pemahaman IPAS',
        allocatedHours: 24,
        assessmentStrategy: 'Praktikum Menanam Biji Kacang Hijau & Buku Jurnal Pertumbuhan Tanaman',
        deepLearningMethod: 'Mindful: Menyayangi tumbuhan ciptaan Tuhan dan menyiram tanaman secara teratur.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.4.1.2',
        tpName: 'Mengidentifikasi wujud zat (padat, cair, gas) dan mengamati perubahan wujud zat dalam kehidupan.',
        essentialMaterial: 'Wujud Zat dan Perubahannya: Mencair, Membeku, Menguap, Mengembun, Menyublim, Mengkristal',
        elementName: 'Pemahaman IPAS',
        allocatedHours: 24,
        assessmentStrategy: 'Praktikum Pembuatan Es Krim Putar Tanpa Kulkas (Garam & Es Batu)',
        deepLearningMethod: 'Joyful: Ceria membuat es krim lezat bersama teman sekelas.',
      },
      {
        semester: 1,
        orderNumber: 3,
        tpCode: 'TP.4.1.3',
        tpName: 'Mengidentifikasi ragam gaya (otot, gesek, magnet, gravitasi) dan pengaruhnya terhadap gerak benda.',
        essentialMaterial: 'Gaya di Sekitar Kita: Macam-Macam Gaya, Gerak Benda, dan Pemanfaatan Magnet',
        elementName: 'Keterampilan Proses',
        allocatedHours: 24,
        assessmentStrategy: 'Asesmen Sumatif Proyek Mobil Mainan Bertenaga Magnet / Karet',
        deepLearningMethod: 'Joyful: Balapan mobil mainan rakitan dari kardus bekas.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.4.2.1',
        tpName: 'Mengidentifikasi transformasi energi di sekitar kita dan menerapkan perilaku hemat energi.',
        essentialMaterial: 'Mengubah Bentuk Energi: Energi Gerak, Listrik, Panas, Cahaya, Bunyi, dan Panel Surya',
        elementName: 'Pemahaman IPAS',
        allocatedHours: 24,
        assessmentStrategy: 'Pembuatan Kincir Angin Kertas / Kincir Air Plastik Bekas',
        deepLearningMethod: 'Meaningful: Mematikan kran air dan lampu saat tidak digunakan.',
      },
      {
        semester: 2,
        orderNumber: 5,
        tpCode: 'TP.4.2.2',
        tpName: 'Menceritakan sejarah asal usul daerah tempat tinggal dan kearifan lokal yang patut dilestarikan.',
        essentialMaterial: 'Cerita Tentang Daerahku: Tokoh Sejarah Lokal, Peninggalan Kerajaan, dan Nilai Gotong Royong',
        elementName: 'Pemahaman Sosial Budaya',
        allocatedHours: 24,
        assessmentStrategy: 'Pentas Cerita Bergambar Cerita Rakyat Daerah',
        deepLearningMethod: 'Meaningful: Bangga terhadap warisan budaya nenek moyang daerah.',
      },
      {
        semester: 2,
        orderNumber: 6,
        tpCode: 'TP.4.2.3',
        tpName: 'Mengenal ragam bentang alam, kekayaan alam Indonesia, serta interaksi jual beli dalam kegiatan ekonomi.',
        essentialMaterial: 'Indonesiaku Kaya Hayati & Kegiatan Ekonomi Pasar: Kebutuhan Manusia, Barter, dan Uang',
        elementName: 'Pemahaman & Sumatif',
        allocatedHours: 24,
        assessmentStrategy: 'Asesmen Sumatif Akhir Tahun: Simulasi Market Day Jual Beli Jajanan Tradisional',
        deepLearningMethod: 'Joyful: Belajar berwirausaha dan menghargai nilai uang.',
      },
    ],
  },

  // ==========================================
  // SMA - GEOGRAFI (FASE E & F)
  // ==========================================
  {
    subject: 'Geografi',
    level: 'SMA',
    grade: 10,
    phase: 'Fase E',
    totalHoursPerYear: 72,
    jpPerWeek: 2,
    cpSummary: 'Peserta didik memahami konsep dasar ilmu geografi, peta, penginderaan jauh, SIG, dinamika litosfer, atmosfer, hidrosfer, biosfer, serta mitigasi bencana alam berbasis kearifan lokal.',
    elements: [
      {
        name: 'Keterampilan Geografis & Pemetaan',
        description: 'Peserta didik mampu membaca peta analog/digital, menafsirkan citra penginderaan jauh, dan memanfaatkan SIG untuk pemetaan spasial.',
        competencies: ['Menganalisis prinsip dan konsep geografi', 'Mengoperasikan peta dasar dan citra satelit', 'Menyajikan data spasial'],
        essentialMaterials: ['Konsep Geografi', 'Pemetaan & SIG', 'Penginderaan Jauh'],
      },
      {
        name: 'Pemahaman Geografis & Lingkungan',
        description: 'Peserta didik menganalisis fenomena geosfer (litosfer, atmosfer, hidrosfer) dan strategi mitigasi bencana alam di Indonesia.',
        competencies: ['Menganalisis dinamika geosfer', 'Mengevaluasi kerawanan bencana', 'Merancang rencana mitigasi'],
        essentialMaterials: ['Dinamika Litosfer & Pedosfer', 'Atmosfer & Cuaca Iklim', 'Hidrosfer & Konservasi DAS', 'Mitigasi Bencana'],
      },
    ],
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.10.1.1',
        tpName: 'Menganalisis hakikat, objek studi, prinsip, konsep esensial, dan pendekatan geografi dalam mengkaji fenomena geosfer di Indonesia.',
        essentialMaterial: 'Hakikat & Konsep Esensial Geografi: Objek Material/Formal, 10 Konsep Geografi, Prinsip Geografi, Pendekatan Keruangan',
        elementName: 'Keterampilan Geografis',
        allocatedHours: 18,
        assessmentStrategy: 'Tes Formatif & Portofolio Analisis Artikel Bencana / Fenomena Keruangan',
        deepLearningMethod: 'Mindful: Observasi kesadaran spasial lingkungan tempat tinggal dan fenomena alam sekitar.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.10.1.2',
        tpName: 'Menerapkan dasar-dasar pemetaan, proyeksi peta, penginderaan jauh, dan Sistem Informasi Geografis (SIG) dalam pembuatan peta tematik sederhana.',
        essentialMaterial: 'Dasar Pemetaan, Komponen Peta, Interpretasi Citra Penginderaan Jauh, dan Pemanfaatan SIG Google Earth / QGIS',
        elementName: 'Keterampilan Geografis & Pemetaan',
        allocatedHours: 18,
        assessmentStrategy: 'Asesmen Sumatif Proyek Pembuatan Peta Tematik Rawan Bencana Daerah',
        deepLearningMethod: 'Joyful: Praktik eksplorasi citra satelit dan pemetaan wilayah sekolah secara kolaboratif.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 3,
        tpCode: 'TP.10.2.1',
        tpName: 'Menganalisis dinamika litosfer, proses pembentukan batuan, tenaga endogen-eksogen, pembentukan tanah, dan pengaruhnya terhadap kehidupan.',
        essentialMaterial: 'Dinamika Litosfer & Pedosfer: Tektonisme, Vulkanisme, Seisme, Pelapukan, Erosi, dan Profil Tanah',
        elementName: 'Pemahaman Geografis',
        allocatedHours: 18,
        assessmentStrategy: 'Uji Teori Litosfer & Identifikasi Jenis Batuan Alam',
        deepLearningMethod: 'Meaningful: Menyelidiki struktur tanah dan formasi geologi pulau-pulau di Indonesia.',
      },
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.10.2.2',
        tpName: 'Menganalisis dinamika atmosfer dan hidrosfer serta menyusun rencana aksi mitigasi bencana alam (banjir, longsor, gempa, tsunami).',
        essentialMaterial: 'Dinamika Atmosfer (Iklim & Cuaca), Hidrosfer (Siklus Air & DAS), serta Mitigasi Adaptasi Kebencanaan',
        elementName: 'Pemahaman Geografis & Aksi Nyata',
        allocatedHours: 18,
        assessmentStrategy: 'Asesmen Sumatif Akhir Tahun: Simulasi Jalur Evakuasi dan Buku Saku Kesiapsiagaan Bencana',
        deepLearningMethod: 'Meaningful: Edukasi simulasi tanggap darurat bencana gempa bumi dan tsunami pesisir.',
      },
    ],
  },

  // ==========================================
  // SMA - EKONOMI (FASE E & F)
  // ==========================================
  {
    subject: 'Ekonomi',
    level: 'SMA',
    grade: 10,
    phase: 'Fase E',
    totalHoursPerYear: 72,
    jpPerWeek: 2,
    cpSummary: 'Peserta didik memahami konsep kelangkaan, pilihan dan skala prioritas, kegiatan pelaku ekonomi, terbentuknya harga pasar, lembaga keuangan, perbankan, uang digital, dan sistem pembayaran.',
    elements: [
      {
        name: 'Pemahaman Konsep Ekonomi',
        description: 'Peserta didik menguasai konsep kelangkaan, motif dan prinsip ekonomi, perilaku konsumen-produsen, serta mekanisme pasar.',
        competencies: ['Menganalisis kelangkaan sumber daya', 'Menentukan skala prioritas', 'Menghitung elastisitas harga pasar'],
        essentialMaterials: ['Kelangkaan & Kebutuhan', 'Perilaku Konsumen & Produsen', 'Permintaan & Penawaran'],
      },
      {
        name: 'Keterampilan Ekonomi & Literasi Finansial',
        description: 'Peserta didik mampu mengelola keuangan pribadi, memahami produk perbankan, pasar modal, dan transaksi digital aman.',
        competencies: ['Menyusun anggaran keuangan pribadi', 'Menganalisis produk bank & non-bank', 'Mengevaluasi transaksi digital'],
        essentialMaterials: ['Literasi Finansial', 'OJK & BI', 'Pasar Modal & Fintech'],
      },
    ],
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.10.1.1',
        tpName: 'Menganalisis konsep kelangkaan sumber daya, biaya peluang (opportunity cost), dan menyusun skala prioritas kebutuhan hidup secara bijak.',
        essentialMaterial: 'Konsep Dasar Ilmu Ekonomi: Kelangkaan, Biaya Peluang, Skala Prioritas Kebutuhan, dan Masalah Pokok Ekonomi Modern',
        elementName: 'Pemahaman Konsep Ekonomi',
        allocatedHours: 18,
        assessmentStrategy: 'Simulasi Perencanaan Anggaran Belanja Pribadi & Tes Formatif',
        deepLearningMethod: 'Mindful: Kesadaran konsumsi bersahaja dan menahan godaan belanja konsumtif impulsif.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.10.1.2',
        tpName: 'Menganalisis peran pelaku ekonomi (RTK, RTP, RTG, RTLN) dalam diagram arus melingkar (circular flow diagram) dan teori perilaku produsen-konsumen.',
        essentialMaterial: 'Pelaku Ekonomi, Circular Flow Diagram 2-3-4 Sektor, Nilai Guna Kardinal/Ordinal, dan Teori Produksi The Law of Diminishing Returns',
        elementName: 'Pemahaman Konsep Ekonomi',
        allocatedHours: 18,
        assessmentStrategy: 'Desain Infografis Alur Ekonomi & Tes Studi Kasus Bisnis',
        deepLearningMethod: 'Meaningful: Menelaah peran UMKM lokal dalam perekonomian nasional.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 3,
        tpCode: 'TP.10.2.1',
        tpName: 'Menganalisis hukum permintaan, hukum penawaran, elastisitas harga, dan proses terbentuknya harga keseimbangan pasar (ekuilibrium).',
        essentialMaterial: 'Keseimbangan Pasar: Kurva Permintaan-Penawaran, Fungsi Ekuilibrium, Elastisitas Harga, dan Struktur Pasar (Sempurna & Monopoli)',
        elementName: 'Pemahaman Konsep Ekonomi',
        allocatedHours: 18,
        assessmentStrategy: 'Perhitungan Matematis Ekuilibrium & Analisis Fluktuasi Harga Sembako',
        deepLearningMethod: 'Joyful: Game simulasi transaksi lelang pasar tradisional dan digital.',
      },
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.10.2.2',
        tpName: 'Menganalisis peranan Bank Indonesia, Otoritas Jasa Keuangan (OJK), sistem pembayaran nontunai (QRIS/E-Wallet), dan literasi investasi pasar modal.',
        essentialMaterial: 'Bank Sentral, Bank Umum, Lembaga Keuangan Bukan Bank, Pasar Modal, Sistem Pembayaran, dan Keamanan Transaksi Fintech',
        elementName: 'Keterampilan Finansial',
        allocatedHours: 18,
        assessmentStrategy: 'Asesmen Sumatif Akhir Tahun: Proposal Rencana Investasi Reksadana / Tabungan Emas',
        deepLearningMethod: 'Meaningful: Bijak berinvestasi sejak dini dan menghindari pinjaman online ilegal.',
      },
    ],
  },

  // ==========================================
  // SMA - SOSIOLOGI (FASE E & F)
  // ==========================================
  {
    subject: 'Sosiologi',
    level: 'SMA',
    grade: 10,
    phase: 'Fase E',
    totalHoursPerYear: 72,
    jpPerWeek: 2,
    cpSummary: 'Peserta didik memahami sosiologi sebagai ilmu pengkaji masyarakat, identitas diri dalam kelompok, ragam gejala sosial, diferensiasi dan stratifikasi sosial, serta metode penelitian sosial sederhana.',
    elements: [
      {
        name: 'Pemahaman Sosiologis',
        description: 'Peserta didik memahami konsep individu, kelompok, interaksi sosial, institusi sosial, dan dinamika heterogenitas masyarakat.',
        competencies: ['Menganalisis sosiologi sebagai ilmu objektif', 'Menelaah relasi sosial individu-kelompok', 'Mengidentifikasi gejala sosial'],
        essentialMaterials: ['Sosiologi sebagai Ilmu', 'Interaksi & Sosialisasi', 'Lembaga Sosial & Heterogenitas'],
      },
      {
        name: 'Keterampilan Penelitian Sosial',
        description: 'Peserta didik mampu merancang penelitian sosial berbasis observasi, wawancara, survei lapangan, dan menyusun laporan ilmiah.',
        competencies: ['Merumuskan instrumen penelitian', 'Melakukan wawancara sosial', 'Mempublikasikan laporan ilmiah'],
        essentialMaterials: ['Metode Riset Sosial', 'Teknik Wawancara', 'Advokasi Masalah Sosial'],
      },
    ],
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.10.1.1',
        tpName: 'Menganalisis sosiologi sebagai ilmu yang mengkaji hubungan masyarakat, ciri-ciri sosiologi (empiris, teoretis, kumulatif, non-etis), dan fungsinya.',
        essentialMaterial: 'Pengantar Sosiologi: Hakikat Ilmu Sosiologi, Tokoh Perintis (Auguste Comte, Emile Durkheim), Realitas Sosial, dan Fungsi Sosiologi',
        elementName: 'Pemahaman Sosiologis',
        allocatedHours: 18,
        assessmentStrategy: 'Uji Teori Sosiologi & Analisis Kasus Masalah Sosial Daring',
        deepLearningMethod: 'Mindful: Refleksi kritis posisi diri sebagai bagian dari dinamika warga masyarakat.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.10.1.2',
        tpName: 'Menganalisis pembentukan identitas diri, tindakan sosial, interaksi sosial, dan proses sosialisasi nilai serta norma dalam masyarakat multikultural.',
        essentialMaterial: 'Identitas Diri & Hubungan Sosial: Tipe Tindakan Sosial Max Weber, Interaksi Asosiatif-Disosiatif, Agen Sosialisasi, dan Pembentukan Karakter',
        elementName: 'Pemahaman Sosiologis',
        allocatedHours: 18,
        assessmentStrategy: 'Observasi Perilaku Interaksi Remaja di Sekolah & Presentasi Kelompok',
        deepLearningMethod: 'Meaningful: Memupuk empati lintas budaya dan menghormati keberagaman latar belakang.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 3,
        tpCode: 'TP.10.2.1',
        tpName: 'Menganalisis ragam gejala sosial, lembaga sosial (keluarga, agama, pendidikan, ekonomi, politik), dan dinamika tertib sosial.',
        essentialMaterial: 'Ragam Gejala Sosial & Lembaga Sosial: Fungsi Manifes/Laten Lembaga Sosial, Pengendalian Sosial, dan Pencegahan Perilaku Menyimpang',
        elementName: 'Pemahaman Sosiologis',
        allocatedHours: 18,
        assessmentStrategy: 'Studi Kasus Peran Lembaga Adat dalam Penyelesaian Konflik',
        deepLearningMethod: 'Meaningful: Menghidupkan kembali kearifan lokal musyawarah mufakat (Pela Gandong / Rembug Warga).',
      },
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.10.2.2',
        tpName: 'Merancang dan melaksanakan penelitian sosial sederhana mengenai masalah sosial kontekstual dengan metode kualitatif atau kuantitatif.',
        essentialMaterial: 'Metode Penelitian Sosial Sederhana: Perumusan Masalah, Teknik Sampling, Instrumen Kuesioner/Wawancara, dan Publikasi Ilmiah',
        elementName: 'Keterampilan Penelitian Sosial',
        allocatedHours: 18,
        assessmentStrategy: 'Asesmen Sumatif Akhir Tahun: Laporan Mini Riset Sosial & Pameran Poster Ilmiah',
        deepLearningMethod: 'Joyful: Terjun langsung mewawancarai tokoh masyarakat dan warga sekitar sekolah.',
      },
    ],
  },

  // ==========================================
  // SMA - PJOK (PENDIDIKAN JASMANI OLAHRAGA & KESEHATAN)
  // ==========================================
  {
    subject: 'PJOK',
    level: 'SMA',
    grade: 10,
    phase: 'Fase E',
    totalHoursPerYear: 72,
    jpPerWeek: 2,
    cpSummary: 'Peserta didik mempraktikkan dan menganalisis keterampilan gerak spesifik permainan bola besar/kecil, atletik, bela diri, senam, kebugaran jasmani, serta menerapkan pola hidup sehat dan pencegahan NAPZA.',
    elements: [
      {
        name: 'Keterampilan Gerak & Taktik Olahraga',
        description: 'Peserta didik menguasai pola gerak motorik, taktik permainan, dan sportivitas kompetisi dalam berbagai cabang olahraga.',
        competencies: ['Mempraktikkan teknik gerak spesifik', 'Menganalisis strategi permainan tim', 'Menjunjung tinggi fair play'],
        essentialMaterials: ['Bola Besar (Sepakbola/Voli/Basket)', 'Bola Kecil (Bulu Tangkis)', 'Atletik & Bela Diri Pencak Silat'],
      },
      {
        name: 'Kebugaran Jasmani & Pola Hidup Sehat',
        description: 'Peserta didik merancang program latihan kebugaran jasmani mandiri dan menerapkan pencegahan penyakit menular serta pergaulan bebas.',
        competencies: ['Mengukur derajat kebugaran jasmani', 'Menyusun menu gizi seimbang', 'Mencegah bahaya narkoba & rokok'],
        essentialMaterials: ['Tes Kebugaran Jasmani (TKJI)', 'Gizi Seimbang & Aktivitas Fisik', 'Pola Hidup Sehat & Anti NAPZA'],
      },
    ],
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.10.1.1',
        tpName: 'Mempraktikkan dan mengevaluasi keterampilan gerak spesifik serta strategi penyerangan/bertahan dalam permainan bola besar (Sepak Bola / Bola Voli / Bola Basket).',
        essentialMaterial: 'Permainan Bola Besar: Passing, Dribbling, Shooting, Smash, Blocking, dan Pola Taktik Permainan Beregu',
        elementName: 'Keterampilan Gerak',
        allocatedHours: 18,
        assessmentStrategy: 'Tes Praktik Keterampilan Gerak & Turnamen Mini Liga Kelas',
        deepLearningMethod: 'Joyful: Bermain dengan gembira mengedepankan kerjasama tim dan sportivitas.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.10.1.2',
        tpName: 'Menganalisis dan mempraktikkan keterampilan gerak atletik (lari cepat, estafet, lompat jauh) serta bela diri tradisional (Pencak Silat).',
        essentialMaterial: 'Atletik (Sprint, Start Jongkok, Perpindahan Tongkat Estafet, Lompat Jauh Gaya Menggantung) & Jurus Dasar Pencak Silat',
        elementName: 'Keterampilan Gerak & Budaya',
        allocatedHours: 18,
        assessmentStrategy: 'Tes Unjuk Kerja Waktu Lari Sprint & Peragaan Kuda-kuda/Pukulan Pencak Silat',
        deepLearningMethod: 'Mindful: Melatih konsentrasi, pernapasan, dan pengendalian emosi diri.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 3,
        tpCode: 'TP.10.2.1',
        tpName: 'Merancang dan mempraktikkan program latihan kebugaran jasmani pribadi untuk meningkatkan daya tahan jantung-paru, kekuatan otot, dan kelenturan.',
        essentialMaterial: 'Aktivitas Kebugaran Jasmani: Circuit Training, Lari Multitahap (Bleep Test), Push-Up, Sit-Up, Plank, dan Kelentukan Sendi',
        elementName: 'Kebugaran Jasmani',
        allocatedHours: 18,
        assessmentStrategy: 'Tes Kebugaran Jasmani Indonesia (TKJI) & Buku Log Latihan Mandiri',
        deepLearningMethod: 'Meaningful: Menjadikan olahraga rutin sebagai kebutuhan menjaga vitalitas tubuh sepanjang hayat.',
      },
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.10.2.2',
        tpName: 'Menganalisis dampak pergaulan bebas, bahaya NAPZA, HIV/AIDS, serta menyusun rencana aksi pola hidup sehat dan gizi seimbang harian.',
        essentialMaterial: 'Pendidikan Kesehatan: Bahaya Narkoba, Minuman Keras, Pencegahan Penyakit Menular Seksual, Diet Sehat Isi Piringku',
        elementName: 'Pola Hidup Sehat & Edukasi',
        allocatedHours: 18,
        assessmentStrategy: 'Asesmen Sumatif Akhir Tahun: Kampanye Video Pendek Remaja Sehat Tanpa Narkoba',
        deepLearningMethod: 'Meaningful: Menjaga kehormatan diri dan menyelamatkan masa depan generasi bangsa.',
      },
    ],
  },

  // ==========================================
  // SMA - SENI RUPA / SENI BUDAYA (FASE E & F)
  // ==========================================
  {
    subject: 'Seni Rupa',
    level: 'SMA',
    grade: 10,
    phase: 'Fase E',
    totalHoursPerYear: 72,
    jpPerWeek: 2,
    cpSummary: 'Peserta didik mengamati, mengeksplorasi unsur dan prinsip rupa, menciptakan karya seni rupa 2 dimensi dan 3 dimensi berbasis kearifan lokal/modern, merefleksikan nilai estetis, serta mengorganisasi pameran seni.',
    elements: [
      {
        name: 'Mengalami & Menciptakan',
        description: 'Peserta didik mengeksplorasi media rupa, teknik menggambar/melukis/mematung, dan menghasilkan karya kreatif orisinal.',
        competencies: ['Mengeksplorasi garis warna tekstur', 'Menggambar bentuk ekspresif', 'Membuat karya 2D/3D ramah lingkungan'],
        essentialMaterials: ['Unsur & Prinsip Seni Rupa', 'Lukis & Ilustrasi', 'Seni Patung & Kriya Lokal'],
      },
      {
        name: 'Merefleksikan & Berdampak',
        description: 'Peserta didik mengapresiasi karya seni rupa nusantara/mancanegara dan merancang pameran seni sekolah.',
        competencies: ['Mengkritik karya seni secara santun', 'Menyelenggarakan pameran kelas', 'Mempromosikan budaya nusantara'],
        essentialMaterials: ['Apresiasi & Kritik Seni', 'Manajemen Pameran Seni Sekolah'],
      },
    ],
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.10.1.1',
        tpName: 'Mengeksplorasi unsur rupa (garis, bentuk, tekstur, ruang, warna) dan prinsip desain (proporsi, keseimbangan, ritme, harmoni) pada karya seni rupa 2 dimensi.',
        essentialMaterial: 'Dasar Seni Rupa 2D: Unsur Rupa, Teori Lingkaran Warna Brewster, Perspektif 1-2 Titik Hilang, dan Komposisi Estetik',
        elementName: 'Mengalami & Menciptakan',
        allocatedHours: 18,
        assessmentStrategy: 'Portofolio Karya Sketsa & Lukisan Akrilik / Cat Air Kanvas',
        deepLearningMethod: 'Joyful: Bebas berekspresi mencampur warna dan mengeksplorasi imajinasi visual.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.10.1.2',
        tpName: 'Menganalisis nilai estetis dan latar historis karya seni rupa tradisional nusantara serta mentransformasikannya ke dalam desain ilustrasi digital modern.',
        essentialMaterial: 'Seni Rupa Tradisional Nusantara: Ragam Hias Batik, Ukiran Tradisional, Tipografi Huruf Adat, dan Ilustrasi Digital',
        elementName: 'Merefleksikan & Menciptakan',
        allocatedHours: 18,
        assessmentStrategy: 'Penilaian Karya Ilustrasi Ornamen Tradisional Berbantuan Canva/Procreate',
        deepLearningMethod: 'Mindful: Menghayati filosofi adiluhung motif ukir dan tenun tradisional nenek moyang.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 3,
        tpCode: 'TP.10.2.1',
        tpName: 'Menciptakan karya seni rupa 3 dimensi ramah lingkungan dari bahan daur ulang (upcycling art) yang memiliki fungsi pakai atau hias.',
        essentialMaterial: 'Seni Rupa 3 Dimensi & Kriya Daur Ulang: Teknik Pahat, Butsir, Anyam, Konstruksi Plastik/Kardus Bekas Jadi Estetik',
        elementName: 'Menciptakan & Berdampak',
        allocatedHours: 18,
        assessmentStrategy: 'Uji Produk Kriya 3D & Uji Ketahanan/Estetika',
        deepLearningMethod: 'Meaningful: Mengubah limbah anorganik menjadi karya seni bernilai jual tinggi.',
      },
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.10.2.2',
        tpName: 'Merancang, mengelola, dan menyelenggarakan pameran karya seni rupa sekolah serta menyusun ulasan kritik seni yang membangun.',
        essentialMaterial: 'Manajemen Pameran Seni Rupa: Kurasi Karya, Penataan Display Galeri, Buku Katalog Pameran, dan Penulisan Kritik Seni',
        elementName: 'Merefleksikan & Berdampak',
        allocatedHours: 18,
        assessmentStrategy: 'Asesmen Sumatif Akhir Tahun: Gelar Pameran Seni Rupa Sekolah & Buku Katalog',
        deepLearningMethod: 'Joyful: Menjadi kurator galeri seni dan menyambut pengunjung pameran dengan antusias.',
      },
    ],
  },

  // ==========================================
  // SMA - PRAKARYA DAN KEWIRAUSAHAAN (PKWU)
  // ==========================================
  {
    subject: 'Prakarya dan Kewirausahaan',
    level: 'SMA',
    grade: 10,
    phase: 'Fase E',
    totalHoursPerYear: 72,
    jpPerWeek: 2,
    cpSummary: 'Peserta didik mengidentifikasi potensi pasar, merencanakan usaha kerajinan/pengolahan makanan khas daerah, melakukan proses produksi higienis, menghitung BEP, dan memasarkan produk secara digital.',
    elements: [
      {
        name: 'Observasi & Eksplorasi',
        description: 'Peserta didik menggali ide peluang usaha berbasis kearifan lokal dan menganalisis kebutuhan konsumen.',
        competencies: ['Menganalisis SWOT usaha', 'Mengidentifikasi bahan baku lokal', 'Merancang proposal bisnis'],
        essentialMaterials: ['Peluang Usaha PKWU', 'Analisis SWOT & Target Pasar'],
      },
      {
        name: 'Desain, Produksi & Pemasaran',
        description: 'Peserta didik merancang produk, memproduksi karya bernilai ekonomis, menghitung HPP & BEP, serta melakukan promosi media sosial.',
        competencies: ['Membuat produk kerajinan/kuliner', 'Menghitung Break Even Point (BEP)', 'Mendesain kemasan & branding digital'],
        essentialMaterials: ['Teknik Produksi', 'Perhitungan HPP & BEP', 'Digital Marketing & Marketplace'],
      },
    ],
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.10.1.1',
        tpName: 'Menganalisis perencanaan usaha kerajinan berbasis bahan limbah berbentuk bangun datar meliputi ide, peluang usaha, dan analisis SWOT.',
        essentialMaterial: 'Perencanaan Usaha Kerajinan: Analisis Peluang, Sumber Daya 6M (Man, Money, Material, Machine, Method, Market), Analisis SWOT',
        elementName: 'Observasi & Perencanaan',
        allocatedHours: 18,
        assessmentStrategy: 'Proposal Rencana Bisnis Sederhana (Business Model Canvas)',
        deepLearningMethod: 'Mindful: Jeli melihat peluang dari limbah sekitar yang sering diabaikan orang lain.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.10.1.2',
        tpName: 'Memproduksi kerajinan bahan limbah bernilai jual, mendesain kemasan menarik, dan menghitung Break Even Point (BEP).',
        essentialMaterial: 'Produksi Kerajinan, Desain Kemasan Ramah Lingkungan, Perhitungan Harga Pokok Produksi (HPP) dan Titik Impas (BEP)',
        elementName: 'Desain & Produksi',
        allocatedHours: 18,
        assessmentStrategy: 'Penilaian Kualitas Produk Kerajinan & Lembar Perhitungan Keuangan BEP',
        deepLearningMethod: 'Joyful: Berkreasi merancang kemasan estetik yang disukai generasi muda.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 3,
        tpCode: 'TP.10.2.1',
        tpName: 'Menganalisis sistem pengolahan makanan awetan khas daerah berbasis hewani/nabati yang higienis dengan teknik pengawetan alami.',
        essentialMaterial: 'Pengolahan Makanan Khas Daerah: Standar Higienitas Pangan (HACCP), Pengeringan, Pengasinan, Pengasapan, dan Formulasi Rasa',
        elementName: 'Produksi Kuliner',
        allocatedHours: 18,
        assessmentStrategy: 'Uji Organoleptik (Rasa, Aroma, Tekstur) & Sertifikasi Kelayakan Makanan Sekolah',
        deepLearningMethod: 'Meaningful: Melestarikan resep kuliner warisan leluhur daerah agar mendunia.',
      },
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.10.2.2',
        tpName: 'Menerapkan strategi pemasaran digital (digital marketing), promosi media sosial, dan menyelenggarakan bazar kewirausahaan siswa.',
        essentialMaterial: 'Strategi Promosi Digital: Copywriting, Foto Produk Estetik, Pemanfaatan Marketplace, dan Evaluasi Laba Rugi Usaha',
        elementName: 'Pemasaran & Evaluasi',
        allocatedHours: 18,
        assessmentStrategy: 'Asesmen Sumatif Akhir Tahun: Pelaksanaan Expo Bazar Kewirausahaan Siswa & Laporan Laba Bersih',
        deepLearningMethod: 'Joyful: Menjual produk secara nyata di bazar sekolah dan merasakan manisnya hasil wirausaha mandiri.',
      },
    ],
  },

  // ==========================================
  // SMP - MATEMATIKA (FASE D)
  // ==========================================
  {
    subject: 'Matematika SMP',
    level: 'SMP',
    grade: 7,
    phase: 'Fase D',
    totalHoursPerYear: 180,
    jpPerWeek: 5,
    cpSummary: 'Peserta didik memahami bilangan bulat, pecahan, bentuk aljabar, persamaan linier satu variabel, rasio perbandingan, geometri garis dan sudut, kesebangunan bangun datar, serta penyajian data statistika.',
    elements: [
      {
        name: 'Bilangan & Aljabar',
        description: 'Peserta didik mengoperasikan bilangan rasional, memanipulasi bentuk aljabar, dan menyelesaikan persamaan/pertidaksamaan linier.',
        competencies: ['Mengoperasikan bilangan bulat-pecahan', 'Menyederhanakan bentuk aljabar', 'Menyelesaikan PLSV'],
        essentialMaterials: ['Bilangan Rasional', 'Bentuk Aljabar', 'Persamaan Linier Satu Variabel (PLSV)'],
      },
      {
        name: 'Geometri & Analisis Data',
        description: 'Peserta didik menganalisis hubungan antar-sudut, keliling/luas bangun datar, serta menyajikan dan menafsirkan diagram data.',
        competencies: ['Menghitung besar sudut', 'Menghitung luas poligon', 'Membaca diagram batang/lingkaran'],
        essentialMaterials: ['Garis & Sudut', 'Segiempat & Segitiga', 'Statistika Dasar'],
      },
    ],
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.7.1.1',
        tpName: 'Membaca, menulis, membandingkan, dan melakukan operasi hitung aritmetika pada bilangan bulat dan bilangan pecahan dalam masalah kontekstual.',
        essentialMaterial: 'Bilangan Bulat & Pecahan: Sifat Komutatif, Asosiatif, Distributif, Operasi Campuran, dan Aplikasi Keuangan/Suhu',
        elementName: 'Bilangan',
        allocatedHours: 30,
        assessmentStrategy: 'Tes Formatif Berhitung Cepat & Kuis Soal Cerita Kontekstual',
        deepLearningMethod: 'Mindful: Ketelitian meneliti tanda positif/negatif dan urutan operasi hitung.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.7.1.2',
        tpName: 'Mengenal variabel, koefisien, konstanta, suku sejenis, serta melakukan operasi penjumlahan, pengurangan, perkalian, pembagian bentuk aljabar.',
        essentialMaterial: 'Bentuk Aljabar: Unsur-unsur Aljabar, Perkalian Suku Dua, Pemfaktoran Sederhana, dan Pecahan Aljabar',
        elementName: 'Aljabar',
        allocatedHours: 30,
        assessmentStrategy: 'Tes Formatif Pemecahan Soal Aljabar & Teka-Teki Silang Matematika',
        deepLearningMethod: 'Joyful: Game menyusun ubin aljabar (algebra tiles) secara visual.',
      },
      {
        semester: 1,
        orderNumber: 3,
        tpCode: 'TP.7.1.3',
        tpName: 'Menyelesaikan persamaan dan pertidaksamaan linier satu variabel (PLSV & PtLSV) dalam pemecahan masalah kehidupan nyata.',
        essentialMaterial: 'Persamaan & Pertidaksamaan Linier Satu Variabel: Konsep Kesetaraan, Model Matematika, Garis Bilangan Himpunan Penyelesaian',
        elementName: 'Aljabar & Pemecahan Masalah',
        allocatedHours: 30,
        assessmentStrategy: 'Asesmen Sumatif Tengah Semester Proyek Neraca Timbangan Matematika',
        deepLearningMethod: 'Meaningful: Konsep timbangan neraca untuk memahami keadilan dan kesetaraan matematis.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.7.2.1',
        tpName: 'Menganalisis konsep rasio, perbandingan senilai, perbandingan berbalik nilai, dan skala pada peta denah arsitektur.',
        essentialMaterial: 'Rasio dan Perbandingan: Perbandingan Senilai, Perbandingan Berbalik Nilai, Skala, dan Aritmetika Sosial (Untung/Rugi/Diskon)',
        elementName: 'Aljabar & Terapan',
        allocatedHours: 30,
        assessmentStrategy: 'Studi Kasus Menghitung Diskon Belanja Supermarket & Skala Denah Rumah',
        deepLearningMethod: 'Meaningful: Cerdas menghitung harga diskon dan pajak saat berbelanja.',
      },
      {
        semester: 2,
        orderNumber: 5,
        tpCode: 'TP.7.2.2',
        tpName: 'Menganalisis hubungan antar garis (sejajar, berpotongan, berimpit) dan jenis sudut (sehadap, berseberangan, bertolak belakang).',
        essentialMaterial: 'Garis dan Sudut: Kedudukan Garis, Mengukur Sudut dengan Busur Derajat, Sudut Berpelurus, Berpenyiku, dan Pasangan Sudut Garis Sejajar',
        elementName: 'Geometri',
        allocatedHours: 30,
        assessmentStrategy: 'Praktik Mengukur Sudut Kemiringan Atap Bangunan Sekolah dengan Busur Derajat',
        deepLearningMethod: 'Joyful: Eksplorasi sudut-sudut arsitektur bangunan di halaman sekolah.',
      },
      {
        semester: 2,
        orderNumber: 6,
        tpCode: 'TP.7.2.3',
        tpName: 'Mengumpulkan, mengorganisasi, menyajikan data dalam bentuk tabel frekuensi, diagram batang, garis, lingkaran, dan menarik kesimpulan informatif.',
        essentialMaterial: 'Penyajian Data & Statistika Dasar: Tabel Distribusi, Diagram Batang, Diagram Garis, Diagram Lingkaran, Modus, Median, Rata-rata',
        elementName: 'Analisis Data & Peluang',
        allocatedHours: 30,
        assessmentStrategy: 'Asesmen Sumatif Akhir Tahun: Survei Data Hobi/Tinggi Badan Teman Sekelas & Infografis',
        deepLearningMethod: 'Meaningful: Menganalisis fakta data statistik riil lingkungan sekolah.',
      },
    ],
  },

  // ==========================================
  // SMP - BAHASA INDONESIA (FASE D)
  // ==========================================
  {
    subject: 'Bahasa Indonesia SMP',
    level: 'SMP',
    grade: 7,
    phase: 'Fase D',
    totalHoursPerYear: 180,
    jpPerWeek: 5,
    cpSummary: 'Peserta didik menyimak, membaca, berbicara, dan menulis teks deskripsi, puisi rakyat, teks cerita fantasi, teks prosedur, teks berita aktual, serta teks tanggapan resensi buku secara santun dan bernalar kritis.',
    elements: [
      {
        name: 'Menyimak & Membaca',
        description: 'Peserta didik memahami informasi eksplisit dan implisit dalam teks deskripsi, fantasi, prosedur, dan berita.',
        competencies: ['Mengidentifikasi ciri objek deskripsi', 'Menemukan pesan moral cerita fantasi', 'Menganalisis struktur teks prosedur'],
        essentialMaterials: ['Teks Deskripsi', 'Cerita Fantasi', 'Teks Prosedur & Berita'],
      },
      {
        name: 'Berbicara & Menulis',
        description: 'Peserta didik menyajikan deskripsi lisan objek wisata, membacakan pantun/syair, membuat teks prosedur kreatif, dan menulis berita fakta.',
        competencies: ['Mendeskripsikan objek secara lisan', 'Menulis puisi rakyat berirama', 'Menulis panduan teks prosedur'],
        essentialMaterials: ['Puisi Rakyat (Pantun/Gurindam)', 'Menulis Cerita Fantasi', 'Resensi Buku'],
      },
    ],
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.7.1.1',
        tpName: 'Menganalisis isi, struktur, dan kaidah kebahasaan teks deskripsi tentang keindahan alam atau budaya lokal serta mempresentasikannya.',
        essentialMaterial: 'Teks Deskripsi: Ciri Objek, Kalimat Perincian Cerapan Pancaindra, Kata Konkret, Majas Personifikasi, dan Teks Deskripsi Lisan',
        elementName: 'Menyimak, Membaca & Menulis',
        allocatedHours: 30,
        assessmentStrategy: 'Uji Deskripsi Objek Wisata Daerah & Tes Formatif',
        deepLearningMethod: 'Mindful: Menajamkan panca indera saat mengamati keindahan alam nusantara.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.7.1.2',
        tpName: 'Mengevaluasi pesan moral, rima, dan struktur bait pada puisi rakyat (pantun, syair, gurindam) serta menulis pantun nasihat kreatif.',
        essentialMaterial: 'Puisi Rakyat: Ciri Pantun (Sampiran-Isi, Rima a-b-a-b), Gurindam 2 Baris Sebab-Akibat, Syair 4 Baris Berima a-a-a-a, Nilai Budi Pekerti',
        elementName: 'Membaca & Menulis',
        allocatedHours: 30,
        assessmentStrategy: 'Lomba Berbalas Pantun Nasihat Antar-Regu Siswa',
        deepLearningMethod: 'Joyful: Berbalas pantun jenaka dan edukatif bersama kawan sebangku.',
      },
      {
        semester: 1,
        orderNumber: 3,
        tpCode: 'TP.7.1.3',
        tpName: 'Mengidentifikasi unsur intrinsik (tema, alur, tokoh, latar lintas waktu) cerita fantasi dan menulis cerita imajinatif berlatar lokal.',
        essentialMaterial: 'Teks Cerita Fantasi: Cerita Fiksi Imajinasi, Tokoh Berkekuatan Ajaib, Latar Ruang dan Waktu Masa Depan/Lalu, Resolusi Cerita',
        elementName: 'Menulis & Mencipta',
        allocatedHours: 30,
        assessmentStrategy: 'Asesmen Sumatif Proyek Buku Cerita Fantasi Bergambar Karya Siswa',
        deepLearningMethod: 'Joyful: Mengembangkan imajinasi bebas menciptakan tokoh pahlawan super nusantara.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.7.2.1',
        tpName: 'Menganalisis struktur teks prosedur (tujuan, bahan/alat, langkah runut, penutup) dan membuat teks panduan cara membuat/memainkan sesuatu.',
        essentialMaterial: 'Teks Prosedur: Kalimat Perintah (Imperatif), Kata Keterangan Cara/Alat, Konjungsi Urutan Waktu, dan Video Tutorial Panduan',
        elementName: 'Membaca & Menulis',
        allocatedHours: 30,
        assessmentStrategy: 'Produksi Video Tutorial Masakan Tradisional / Kerajinan Kertas Origami',
        deepLearningMethod: 'Joyful: Praktik memasak atau membuat prakarya mengikuti teks prosedur.',
      },
      {
        semester: 2,
        orderNumber: 5,
        tpCode: 'TP.7.2.2',
        tpName: 'Mengevaluasi keakuratan unsur berita 5W+1H (Adiksimba) dari media cetak/daring serta menyajikan teks berita faktual aktual sekolah.',
        essentialMaterial: 'Teks Berita: Unsur Adiksimba (Apa, Di mana, Kapan, Siapa, Mengapa, Bagaimana), Judul Menarik, Kepala-Tubuh-Ekor Berita',
        elementName: 'Menyimak & Berbicara',
        allocatedHours: 30,
        assessmentStrategy: 'Praktik Menjadi Pembaca Berita Televisi / Reporter Lapangan Sekolah',
        deepLearningMethod: 'Meaningful: Menjadi warga yang bijak menangkal hoaks dan menyebarkan fakta positif.',
      },
      {
        semester: 2,
        orderNumber: 6,
        tpCode: 'TP.7.2.3',
        tpName: 'Menganalisis unsur buku fiksi dan nonfiksi serta menyusun teks tanggapan resensi buku favorit dengan argumen logis dan santun.',
        essentialMaterial: 'Meresensi Buku Fiksi & Nonfiksi: Identitas Buku, Sinopsis Cerita, Kelebihan/Kelemahan Buku, Rekomendasi Pembaca',
        elementName: 'Membaca & Merefleksikan',
        allocatedHours: 30,
        assessmentStrategy: 'Asesmen Sumatif Akhir Tahun: Portofolio Resensi Buku Perpustakaan Sekolah',
        deepLearningMethod: 'Mindful: Menghayati pesan moral dari buku-buku bacaan berkualitas.',
      },
    ],
  },

  // ==========================================
  // SD - MATEMATIKA (FASE A - KELAS 1)
  // ==========================================
  {
    subject: 'Matematika SD',
    level: 'SD',
    grade: 1,
    phase: 'Fase A',
    totalHoursPerYear: 144,
    jpPerWeek: 4,
    cpSummary: 'Peserta didik mampu membilang lambang bilangan 1 sampai 20, melakukan penjumlahan dan pengurangan sederhana, mengenal bangun datar dan bangun ruang konkret, membandingkan panjang dan berat benda, serta membaca pola gambar berulang.',
    elements: [
      {
        name: 'Bilangan & Operasi Hitung',
        description: 'Peserta didik mengenal konsep bilangan cacah 1-20 dan menghitung gabungan objek konkret.',
        competencies: ['Membilang angka 1-20', 'Menjumlahkan benda konkret', 'Mengurangkan benda konkret'],
        essentialMaterials: ['Lambang Bilangan 1-20', 'Penjumlahan 1-10 & 11-20', 'Pengurangan Konkret'],
      },
      {
        name: 'Geometri & Pengukuran',
        description: 'Peserta didik mengidentifikasi bentuk segitiga, segiempat, lingkaran, balok, bola, serta membandingkan panjang/berat.',
        competencies: ['Mengenal bentuk benda', 'Membandingkan panjang (panjang-pendek)', 'Membandingkan berat (berat-ringan)'],
        essentialMaterials: ['Bangun Datar & Ruang', 'Panjang & Berat Benda', 'Pola Gambar'],
      },
    ],
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.1.1.1',
        tpName: 'Membilang, membaca, menuliskan lambang bilangan cacah sampai dengan 10 menggunakan benda konkret (kelereng, stik es krim).',
        essentialMaterial: 'Mengenal Bilangan 1 sampai 10: Membilang Banyak Benda, Menulis Angka, dan Pasangan Bilangan (Number Bonds)',
        elementName: 'Bilangan',
        allocatedHours: 24,
        assessmentStrategy: 'Uji Lisan Menghitung Benda Konkret & Lembar Mewarnai Angka',
        deepLearningMethod: 'Joyful: Belajar membilang gembira dengan lagu angka dan stik warna-warni.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.1.1.2',
        tpName: 'Melakukan penjumlahan dan pengurangan bilangan cacah sampai 10 dengan bantuan gambar dan jari tangan.',
        essentialMaterial: 'Penjumlahan & Pengurangan Dasar (Hasil Maksimal 10): Konsep Gabung Benda dan Konsep Ambil Sisa',
        elementName: 'Operasi Bilangan',
        allocatedHours: 24,
        assessmentStrategy: 'Praktik Berhitung Menggunakan Manik-manik / Balok Warna',
        deepLearningMethod: 'Joyful: Permainan tebak kancing di dalam genggaman tangan.',
      },
      {
        semester: 1,
        orderNumber: 3,
        tpCode: 'TP.1.1.3',
        tpName: 'Mengenal dan mengelompokkan bentuk bangun datar (segitiga, segiempat, lingkaran) dari benda-benda di dalam kelas.',
        essentialMaterial: 'Mengenal Bentuk Bangun Datar: Segitiga, Segi Empat (Persegi & Persegi Panjang), dan Lingkaran di Sekitar Kita',
        elementName: 'Geometri',
        allocatedHours: 24,
        assessmentStrategy: 'Asesmen Sumatif Proyek Menempel Kolase Kertas Origami Bentuk Bangun',
        deepLearningMethod: 'Joyful: Mencari benda-benda berbentuk segitiga dan lingkaran di ruang kelas.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.1.2.1',
        tpName: 'Membilang, mengurutkan, dan melakukan penjumlahan-pengurangan bilangan cacah 11 sampai 20 dengan nilai tempat satuan-puluhan.',
        essentialMaterial: 'Bilangan 11 sampai 20: Nilai Tempat Puluhan dan Satuan, Penjumlahan Maju, dan Pengurangan Mundur',
        elementName: 'Bilangan',
        allocatedHours: 24,
        assessmentStrategy: 'Tes Praktik Menggunakan Garis Bilangan Lompat Kodok',
        deepLearningMethod: 'Joyful: Bermain lompat angka di lantai garis bilangan.',
      },
      {
        semester: 2,
        orderNumber: 5,
        tpCode: 'TP.1.2.2',
        tpName: 'Membandingkan dan mengurutkan panjang benda (panjang/pendek, tinggi/rendah) dan berat benda (berat/ringan) secara langsung.',
        essentialMaterial: 'Pengukuran Panjang dan Berat: Istilah Lebih Panjang/Pendek, Lebih Tinggi/Rendah, Lebih Berat/Ringan (Timbangan Sederhana)',
        elementName: 'Pengukuran',
        allocatedHours: 24,
        assessmentStrategy: 'Praktik Menimbang Pensil dan Penghapus Menggunakan Gantungan Baju Hanger',
        deepLearningMethod: 'Joyful: Eksperimen timbangan gantung sederhana dari hanger baju dan kantong plastik.',
      },
      {
        semester: 2,
        orderNumber: 6,
        tpCode: 'TP.1.2.3',
        tpName: 'Mengidentifikasi dan melanjutkan pola gambar atau warna yang berulang secara teratur (AB-AB / ABC-ABC).',
        essentialMaterial: 'Pola Gambar & Bentuk Berulang: Pola Warna, Pola Bangun Datar, dan Melengkapi Pola yang Hilang',
        elementName: 'Aljabar & Pola',
        allocatedHours: 24,
        assessmentStrategy: 'Asesmen Sumatif Akhir Tahun: Meronce Manik-manik Berpola Gelang Cantik',
        deepLearningMethod: 'Joyful: Merangkai kalung manik-manik pola warna untuk hadiah ke ibu.',
      },
    ],
  },

  // ==========================================
  // SD - BAHASA INDONESIA (FASE B - KELAS 4)
  // ==========================================
  {
    subject: 'Bahasa Indonesia SD',
    level: 'SD',
    grade: 4,
    phase: 'Fase B',
    totalHoursPerYear: 180,
    jpPerWeek: 5,
    cpSummary: 'Peserta didik memahami kalimat transitif-intransitif, menyimak cerita rakyat, menulis teks petunjuk arah/prosedur, menemukan ide pokok paragraf informatif, melakukan wawancara narasumber sederhana, dan menulis laporan hasil pengamatan.',
    elements: [
      {
        name: 'Menyimak & Membaca',
        description: 'Peserta didik menemukan gagasan pokok paragraf dan memahami makna kata baru dari kamus/KBBI.',
        competencies: ['Menemukan ide pokok & pendukung', 'Membedakan fakta dan opini', 'Memahami kalimat transitif-intransitif'],
        essentialMaterials: ['Ide Pokok Paragraf', 'Kalimat Transitif-Intransitif', 'Makna Kata Kamus'],
      },
      {
        name: 'Berbicara & Menulis',
        description: 'Peserta didik melakukan wawancara sopan santun dan menulis karangan narasi serta teks petunjuk arah.',
        competencies: ['Melakukan wawancara narasumber', 'Menulis teks petunjuk/prosedur', 'Menulis cerita pengalaman pribadi'],
        essentialMaterials: ['Teknik Wawancara Sopan', 'Teks Petunjuk Arah & Denah', 'Karangan Narasi'],
      },
    ],
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.4.1.1',
        tpName: 'Mengidentifikasi dan menggunakan kalimat transitif (berobjek) dan kalimat intransitif (tanpa objek) dalam teks cerita anak.',
        essentialMaterial: 'Kalimat Transitif & Intransitif: Struktur Subjek-Predikat-Objek-Keterangan (SPOK) dan Kata Kerja Berimbuhan me-',
        elementName: 'Membaca & Menulis',
        allocatedHours: 30,
        assessmentStrategy: 'Tes Formatif Mengidentifikasi Kalimat SPOK & Membaca Nyaring Teks Cerita',
        deepLearningMethod: 'Mindful: Menyimak cerita dongeng tentang empati dan menolong sesama teman.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.4.1.2',
        tpName: 'Menemukan arti kata baru menggunakan Kamus Besar Bahasa Indonesia (KBBI) dan menggunakannya dalam kalimat sendiri.',
        essentialMaterial: 'Mengenal Kosakata Baru & Homonim (Kata Sama Bunyi Beda Arti) Melalui Kamus Bahasa Indonesia',
        elementName: 'Membaca & Memirsa',
        allocatedHours: 30,
        assessmentStrategy: 'Kuis Cerdas Cermat Mencari Kata di Kamus KBBI',
        deepLearningMethod: 'Joyful: Lomba berburu arti kata tercepat di kamus buku atau kamus daring.',
      },
      {
        semester: 1,
        orderNumber: 3,
        tpCode: 'TP.4.1.3',
        tpName: 'Membaca denah petunjuk arah dan menulis teks prosedur petunjuk jalan atau panduan keselamatan lalu lintas.',
        essentialMaterial: 'Membaca Denah Lokasi, Mata Angin (Utara, Selatan, Barat, Timur), dan Teks Petunjuk Jalan Berbahasa Santun',
        elementName: 'Menulis & Mempresentasikan',
        allocatedHours: 30,
        assessmentStrategy: 'Asesmen Sumatif Proyek Menggambar Denah Rumah ke Sekolah & Petunjuk Arah',
        deepLearningMethod: 'Meaningful: Paham rambu-rambu keselamatan jalan raya saat berangkat ke sekolah.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.4.2.1',
        tpName: 'Menemukan ide pokok dan ide pendukung dalam setiap paragraf pada teks bacaan informatif lingkungan.',
        essentialMaterial: 'Ide Pokok dan Kalimat Pengembang: Menemukan Inti Paragraf Deduktif-Induktif dan Merangkum Teks Bacaan',
        elementName: 'Membaca & Menyimak',
        allocatedHours: 30,
        assessmentStrategy: 'Latihan Menandai Ide Pokok dengan Spidol Warna Stabilo',
        deepLearningMethod: 'Mindful: Membaca teks dengan tenang untuk memahami pesan lingkungan hidup.',
      },
      {
        semester: 2,
        orderNumber: 5,
        tpCode: 'TP.4.2.2',
        tpName: 'Menyusun daftar pertanyaan dengan kata tanya 5W+1H dan melakukan wawancara sopan kepada narasumber (guru/penjaga sekolah/petani).',
        essentialMaterial: 'Teknik Wawancara Sederhana: Menyusun Pertanyaan (Apa, Siapa, Kapan, Di mana, Mengapa, Bagaimana), Etika Wawancara',
        elementName: 'Berbicara & Menyimak',
        allocatedHours: 30,
        assessmentStrategy: 'Praktik Wawancara Penjaga Kebun Sekolah / Tokoh Sekitar & Rekaman Audio',
        deepLearningMethod: 'Meaningful: Menghormati profesi orang-orang yang berjasa di lingkungan sekolah.',
      },
      {
        semester: 2,
        orderNumber: 6,
        tpCode: 'TP.4.2.3',
        tpName: 'Menulis teks laporan hasil wawancara dan cerita narasi pengalaman liburan dengan ejaan huruf kapital dan tanda baca tepat.',
        essentialMaterial: 'Menulis Laporan Pengamatan & Cerita Narasi: Penggunaan Huruf Kapital, Tanda Titik, Koma, Tanda Petik Dialog',
        elementName: 'Menulis Kreatif',
        allocatedHours: 30,
        assessmentStrategy: 'Asesmen Sumatif Akhir Tahun: Buku Kumpulan Cerita Pengalamanku (Antologi Mini Kelas)',
        deepLearningMethod: 'Joyful: Pameran buku cerita karangan sendiri di sudut baca kelas.',
      },
    ],
  },

  // ==========================================
  // SD - PENDIDIKAN PANCASILA (FASE B - KELAS 4)
  // ==========================================
  {
    subject: 'Pendidikan Pancasila SD',
    level: 'SD',
    grade: 4,
    phase: 'Fase B',
    totalHoursPerYear: 144,
    jpPerWeek: 4,
    cpSummary: 'Peserta didik memahami makna sila-sila Pancasila dan simbol Garuda Pancasila, menerapkan hak dan kewajiban anak di rumah dan sekolah, menghargai keberagaman suku budaya daerah, serta mempraktikkan gotong royong.',
    elements: [
      {
        name: 'Pancasila & UUD 1945',
        description: 'Peserta didik memahami pengamalan sila 1-5 Pancasila dan aturan norma di lingkungan keluarga/sekolah.',
        competencies: ['Menjelaskan simbol Garuda Pancasila', 'Mempraktikkan sila Pancasila sehari-hari', 'Mematuhi tata tertib sekolah'],
        essentialMaterials: ['Makna Sila Pancasila', 'Hak & Kewajiban Anak', 'Norma dan Aturan'],
      },
      {
        name: 'Bhinneka Tunggal Ika & NKRI',
        description: 'Peserta didik menghargai perbedaan budaya, rumah adat, tarian tradisional, dan bergotong royong di lingkungan sekitar.',
        competencies: ['Mengenal budaya daerah nusantara', 'Menghormati teman beda suku/agama', 'Bekerjasama membersihkan lingkungan'],
        essentialMaterials: ['Keberagaman Suku & Budaya', 'Gotong Royong Lingkungan Tetangga'],
      },
    ],
    materialsSem1: [
      {
        semester: 1,
        orderNumber: 1,
        tpCode: 'TP.4.1.1',
        tpName: 'Menjelaskan makna simbol Garuda Pancasila (Bintang, Rantai, Pohon Beringin, Kepala Banteng, Padi Kapas) dan penerapannya.',
        essentialMaterial: 'Makna Simbol Garuda Pancasila: Sila 1 sampai Sila 5, Nilai Ketuhanan, Kemanusiaan, Persatuan, Musyawarah, dan Keadilan',
        elementName: 'Pancasila',
        allocatedHours: 24,
        assessmentStrategy: 'Pemasangan Puzzle Simbol Pancasila & Lembar Pengamatan Sikap',
        deepLearningMethod: 'Mindful: Menghayati doa sebelum belajar sebagai wujud sila pertama.',
      },
      {
        semester: 1,
        orderNumber: 2,
        tpCode: 'TP.4.1.2',
        tpName: 'Mengidentifikasi hak dan kewajiban anak di rumah, di sekolah, dan di lingkungan masyarakat serta melaksanakannya secara seimbang.',
        essentialMaterial: 'Hak dan Kewajiban: Hak Mendapat Kasih Sayang, Hak Belajar Nyaman, Kewajiban Membantu Orang Tua, Kewajiban Mentaati Tata Tertib',
        elementName: 'Undang-Undang Dasar 1945',
        allocatedHours: 24,
        assessmentStrategy: 'Tabel Ceklis Pelaksanaan Kewajiban Harian di Rumah Bersama Orang Tua',
        deepLearningMethod: 'Meaningful: Membantu merapikan tempat tidur sendiri dan membersihkan meja belajar.',
      },
      {
        semester: 1,
        orderNumber: 3,
        tpCode: 'TP.4.1.3',
        tpName: 'Menjelaskan pentingnya mematuhi norma dan aturan tertulis/tidak tertulis dalam menjaga ketertiban hidup bermasyarakat.',
        essentialMaterial: 'Norma Agama, Kesusilaan, Kesopanan, dan Hukum di Lingkungan Tempat Tinggal',
        elementName: 'Norma & Aturan',
        allocatedHours: 24,
        assessmentStrategy: 'Asesmen Sumatif Tengah Semester Bermain Peran (Roleplay) Menyelesaikan Masalah Antar-Teman',
        deepLearningMethod: 'Joyful: Roleplay saling meminta maaf dan memaafkan dengan tulus.',
      },
    ],
    materialsSem2: [
      {
        semester: 2,
        orderNumber: 4,
        tpCode: 'TP.4.2.1',
        tpName: 'Mengidentifikasi keragaman suku bangsa, bahasa daerah, pakaian adat, tarian tradisional, dan agama di Indonesia.',
        essentialMaterial: 'Indahnya Keberagaman Negeriku: Rumah Adat, Lagu Daerah, Senjata Tradisional, dan Sikap Toleransi Antarumat Beragama',
        elementName: 'Bhinneka Tunggal Ika',
        allocatedHours: 24,
        assessmentStrategy: 'Peragaan Busana / Aksesori Adat Daerah dari Kertas Krep & Karton',
        deepLearningMethod: 'Joyful: Festival pawai budaya mini di dalam kelas dengan pakaian adat daerah.',
      },
      {
        semester: 2,
        orderNumber: 5,
        tpCode: 'TP.4.2.2',
        tpName: 'Menerapkan sikap toleransi, tolong-menolong, dan tidak membeda-bedakan teman dalam pergaulan di sekolah dan masyarakat.',
        essentialMaterial: 'Toleransi dalam Keberagaman: Mencegah Perundungan (Bullying), Menghargai Pendapat Teman, dan Persahabatan Sejati',
        elementName: 'Bhinneka Tunggal Ika',
        allocatedHours: 24,
        assessmentStrategy: 'Pohon Kebaikan Kelas: Menempel Daun Kebaikan yang Telah Dilakukan',
        deepLearningMethod: 'Mindful: Ikrar bersama anti-bullying dan saling menyayangi sesama kawan.',
      },
      {
        semester: 2,
        orderNumber: 6,
        tpCode: 'TP.4.2.3',
        tpName: 'Mempraktikkan kegiatan gotong royong membersihkan lingkungan kelas/sekolah dan memahami manfaat kerjasama.',
        essentialMaterial: 'Gotong Royong Ciri Khas Bangsa: Piket Bersama, Kerja Bakti Lingkungan, dan Saling Berbagi Tugas Adil',
        elementName: 'Negara Kesatuan Republik Indonesia',
        allocatedHours: 24,
        assessmentStrategy: 'Asesmen Sumatif Akhir Tahun: Proyek Kerja Bakti Bersama Menghias Sudut Baca Kelas',
        deepLearningMethod: 'Joyful: Gotong royong ceria sambil bernyanyi bersama teman-teman sekelas.',
      },
    ],
  },
];

/**
 * Intelligent helper to find or generate the best matching CP Preset for any subject, level, and grade.
 */
export function getSubjectPresetByGrade(
  subject: string,
  level: string = 'SMA',
  grade: number = 10,
  phase?: string
): SubjectPreset {
  const normSub = (subject || '').trim().toLowerCase();
  const normLvl = (level || 'SMA').trim().toUpperCase() as SchoolLevel;
  const numGrade = Number(grade) || (normLvl === 'SD' ? 4 : normLvl === 'SMP' ? 7 : 10);

  // 1. Exact match: subject, level, grade
  const exact = SUBJECT_MATERIAL_PRESETS.find(
    (p) =>
      p.subject.toLowerCase() === normSub &&
      p.level === normLvl &&
      Number(p.grade) === numGrade
  );
  if (exact) return exact;

  // 2. Fuzzy match subject + grade (e.g. "Fisika SMA", "IPA SMP")
  const subjectMatchWithGrade = SUBJECT_MATERIAL_PRESETS.find(
    (p) =>
      (normSub.includes(p.subject.toLowerCase()) || p.subject.toLowerCase().includes(normSub)) &&
      Number(p.grade) === numGrade
  );
  if (subjectMatchWithGrade) return subjectMatchWithGrade;

  // 3. Match subject in same level (different grade) -> adapt TP codes to target grade
  const subjectMatchSameLevel = SUBJECT_MATERIAL_PRESETS.find(
    (p) =>
      (normSub.includes(p.subject.toLowerCase()) || p.subject.toLowerCase().includes(normSub)) &&
      p.level === normLvl
  );
  if (subjectMatchSameLevel) {
    const resolvedPhase = phase || (numGrade === 10 ? 'Fase E' : numGrade > 10 ? 'Fase F' : numGrade >= 7 ? 'Fase D' : numGrade >= 4 ? 'Fase B/C' : 'Fase A');
    return {
      ...subjectMatchSameLevel,
      grade: numGrade,
      phase: resolvedPhase,
      materialsSem1: subjectMatchSameLevel.materialsSem1.map((m, idx) => ({
        ...m,
        tpCode: `TP.${numGrade}.1.${idx + 1}`,
      })),
      materialsSem2: subjectMatchSameLevel.materialsSem2.map((m, idx) => ({
        ...m,
        tpCode: `TP.${numGrade}.2.${idx + 1}`,
      })),
    };
  }

  // 4. Dynamic Generation for any custom subject tailored to the selected grade!
  return generateDynamicGradePreset(subject || 'Mata Pelajaran', normLvl, numGrade, phase);
}

/**
 * Dynamically synthesizes high-fidelity Bab/Lingkup Materi for any custom subject tailored to grade
 */
export function generateDynamicGradePreset(
  subject: string,
  level: SchoolLevel,
  grade: number,
  customPhase?: string
): SubjectPreset {
  const numGrade = Number(grade) || (level === 'SD' ? 4 : level === 'SMP' ? 7 : 10);
  const phase = customPhase || (numGrade === 10 ? 'Fase E' : numGrade > 10 ? 'Fase F' : numGrade >= 7 ? 'Fase D' : numGrade >= 4 ? 'Fase B/C' : 'Fase A');
  const cleanSubject = subject.trim() || 'Mata Pelajaran';

  const sem1Topics = [
    {
      title: `Konsep Dasar, Hakikat, dan Landasan Teoretis ${cleanSubject}`,
      element: 'Pemahaman Konsep & Karakteristik Dasar',
      hours: 18,
      assessment: 'Tes Tertulis Formatif Pemahaman Konsep & Diskusi Reflektif',
      dl: `Mindful: Observasi kesadaran penuh terhadap prinsip fundamental ${cleanSubject}.`,
    },
    {
      title: `Prinsip Operasional, Analisis Struktur, dan Prosedur ${cleanSubject}`,
      element: 'Keterampilan Proses & Penalaran Logis',
      hours: 18,
      assessment: 'Penugasan Terstruktur Studi Kasus & Kuis Analitis',
      dl: `Meaningful: Menghubungkan konsep ${cleanSubject} dengan tantangan nyata kehidupan sehari-hari.`,
    },
    {
      title: `Eksplorasi Kontekstual, Pemodelan, dan Pemecahan Masalah ${cleanSubject}`,
      element: 'Penerapan & Rekayasa Solutif',
      hours: 18,
      assessment: 'Asesmen Sumatif Tengah Semester (STS) Proyek Mini Kolaboratif',
      dl: `Joyful: Eksplorasi interaktif dan simulasi pemecahan masalah bersama teman kelompok.`,
    },
  ];

  const sem2Topics = [
    {
      title: `Pengembangan Gagasan Lanjut, Analisis Kritis, dan Sintesis ${cleanSubject}`,
      element: 'Penalaran Kritis & Analisis Lanjut',
      hours: 18,
      assessment: 'Analisis Studi Kasus Komprehensif & Tes Formatif',
      dl: `Mindful: Refleksi mendalam dan evaluasi fakta empiris pada materi ${cleanSubject}.`,
    },
    {
      title: `Inovasi Terapan, Kreasi Karya Nyata, dan Praktik Lintas Bidang ${cleanSubject}`,
      element: 'Kreasi Inovatif & Aksi Nyata',
      hours: 18,
      assessment: 'Penilaian Unjuk Kerja / Pameran Portofolio Karya Nyata',
      dl: `Joyful: Gelar karya dan perayaan produk pembelajaran inovatif peserta didik.`,
    },
    {
      title: `Evaluasi Komprehensif, Refleksi Pembelajaran, dan Solusi Berkelanjutan ${cleanSubject}`,
      element: 'Evaluasi & Asesmen Sumatif',
      hours: 18,
      assessment: 'Asesmen Sumatif Akhir Tahun (SAS) / Ujian Komprehensif',
      dl: `Meaningful: Internalisasi nilai luhur dan komitmen implementasi ${cleanSubject} berkelanjutan.`,
    },
  ];

  return {
    subject: cleanSubject,
    level,
    grade: numGrade,
    phase,
    totalHoursPerYear: 108,
    jpPerWeek: 3,
    cpSummary: `Peserta didik Kelas ${numGrade} (${phase}) menguasai pemahaman esensial, keterampilan proses penyelidikan, dan penalaran kritis materi ${cleanSubject} berbasis kerangka Kurikulum Merdeka & Deep Learning.`,
    materialsSem1: sem1Topics.map((item, idx) => ({
      semester: 1,
      orderNumber: idx + 1,
      tpCode: `TP.${numGrade}.1.${idx + 1}`,
      tpName: `Peserta didik mampu memahami, menganalisis, dan memecahkan permasalahan terkait ${item.title} secara kritis, mandiri, dan bergotong royong.`,
      essentialMaterial: item.title,
      elementName: item.element,
      allocatedHours: item.hours,
      assessmentStrategy: item.assessment,
      deepLearningMethod: item.dl,
    })),
    materialsSem2: sem2Topics.map((item, idx) => ({
      semester: 2,
      orderNumber: idx + 4,
      tpCode: `TP.${numGrade}.2.${idx + 1}`,
      tpName: `Peserta didik mampu mengkreasikan solusi inovatif, mengevaluasi data, dan menyajikan hasil penyelidikan terkait ${item.title} secara kreatif dan beradab.`,
      essentialMaterial: item.title,
      elementName: item.element,
      allocatedHours: item.hours,
      assessmentStrategy: item.assessment,
      deepLearningMethod: item.dl,
    })),
  };
}

/**
 * Synchronizes ALL subjects from the presets into the Master CP database,
 * creating matching CPDistributionPlans and CPReferences.
 */
export function syncAllPresetSubjectsToMasterCP(
  teacherName?: string,
  schoolName?: string,
  academicYear?: string
): { totalSynced: number; subjects: string[] } {
  const profile = StorageService.getSchoolProfile();
  const activeTeacher = teacherName || profile.teacherName || 'Aspian La Ode Madimu, S.Pd. Gr';
  const activeSchool = schoolName || profile.schoolName || 'SMA NEGERI 30 MALUKU TENGAH';
  const activeYear = academicYear || profile.academicYear || '2025/2026';

  const existingPlans = StorageService.getCPDistributions() || [];
  const updatedPlans = [...existingPlans];
  const syncedSubjectsList: string[] = [];

  SUBJECT_MATERIAL_PRESETS.forEach((preset, pIdx) => {
    const sem1 = preset.materialsSem1.map((m, idx) => ({
      ...m,
      id: `m-sem1-${preset.subject.toLowerCase()}-${preset.grade}-${idx + 1}`,
    }));
    const sem2 = preset.materialsSem2.map((m, idx) => ({
      ...m,
      id: `m-sem2-${preset.subject.toLowerCase()}-${preset.grade}-${idx + 1}`,
    }));

    const totSem1 = sem1.reduce((acc, m) => acc + (Number(m.allocatedHours) || 0), 0);
    const totSem2 = sem2.reduce((acc, m) => acc + (Number(m.allocatedHours) || 0), 0);

    const planId = `master-plan-${preset.subject.toLowerCase().replace(/\s+/g, '-')}-${preset.level.toLowerCase()}-${preset.grade}`;

    const distPlan: CPDistributionPlan = {
      id: planId,
      teacherName: activeTeacher,
      teacherNip: profile.teacherNip || '198507122010011005',
      subject: preset.subject,
      schoolName: activeSchool,
      level: preset.level,
      grade: preset.grade,
      phase: preset.phase,
      academicYear: activeYear,
      semesterOption: 'all',
      totalHoursPerYear: preset.totalHoursPerYear || (totSem1 + totSem2),
      totalTPCount: sem1.length + sem2.length,
      jpPerWeek: preset.jpPerWeek || (preset.level === 'SD' ? 4 : 3),
      cpText: preset.cpSummary,
      elements: preset.elements?.map(e => ({ name: e.name, description: e.description })) || [
        { name: 'Pemahaman Konsep', description: `Capaian konsep ${preset.subject}` },
        { name: 'Keterampilan Proses', description: `Aplikasi dan keterampilan ${preset.subject}` },
      ],
      materialsSem1: sem1,
      materialsSem2: sem2,
      totalHoursSem1: totSem1,
      totalHoursSem2: totSem2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existingIdx = updatedPlans.findIndex(
      p => p.subject.toLowerCase() === preset.subject.toLowerCase() && Number(p.grade) === Number(preset.grade) && p.level === preset.level
    );
    if (existingIdx >= 0) {
      updatedPlans[existingIdx] = distPlan;
    } else {
      updatedPlans.push(distPlan);
    }

    // Also register in CP Reference
    const cpRef: CPReference = {
      id: `ref-${planId}`,
      title: `[Master Dokumen] ${preset.subject} (${preset.level} - ${preset.phase} Kelas ${preset.grade})`,
      level: preset.level,
      phase: preset.phase,
      grade: preset.grade,
      subject: preset.subject,
      curriculumVersion: 'Kurikulum Merdeka - Deep Learning 2026/2027',
      uploadedAt: new Date().toISOString().substring(0, 16),
      uploadedBy: activeTeacher,
      fileName: `Dokumen_CP_${preset.subject}_${preset.level}_Kelas_${preset.grade}_Kemendikdasmen.pdf`,
      cpText: preset.cpSummary,
      elements: preset.elements && preset.elements.length > 0
        ? preset.elements.map((el) => ({
            name: el.name,
            description: el.description,
            competencies: el.competencies || ['Menganalisis prinsip inti', 'Mengevaluasi konsep esensial'],
            essentialMaterials: el.essentialMaterials || [`Materi Pokok ${preset.subject}`],
          }))
        : [
            {
              name: 'Pemahaman Konsep',
              description: `Penguasaan konsep dan materi esensial ${preset.subject}`,
              competencies: ['Menganalisis prinsip inti', 'Mengevaluasi konsep esensial'],
              essentialMaterials: [`Materi Pokok ${preset.subject}`],
            },
            {
              name: 'Keterampilan Proses',
              description: `Penerapan metode ilmiah dan penyelesaian masalah ${preset.subject}`,
              competencies: ['Merancang eksperimen/karya', 'Mengomunikasikan hasil'],
              essentialMaterials: [`Proyek Inovasi ${preset.subject}`],
            },
          ],
      rawText: preset.cpSummary,
      aiAnalysisSummary: `Analisis mendalam Capaian Pembelajaran ${preset.subject} (${preset.level} - ${preset.phase}) terintegrasi Deep Learning.`,
    };
    StorageService.saveCPReference(cpRef);

    syncedSubjectsList.push(`${preset.subject} (${preset.level} Kelas ${preset.grade})`);
  });

  StorageService.saveCPDistributions(updatedPlans);

  // Set the first preset (or current subject) as Active Master CP
  const activeMaster = StorageService.getActiveMasterCP();
  const currentSub = activeMaster?.subject || profile.subject || 'Fisika';
  const matchingPreset = SUBJECT_MATERIAL_PRESETS.find(p => p.subject.toLowerCase() === currentSub.toLowerCase()) || SUBJECT_MATERIAL_PRESETS[0];

  const sem1Items = matchingPreset.materialsSem1.map((m, idx) => ({
    ...m,
    id: `m-sem1-${matchingPreset.subject.toLowerCase()}-${matchingPreset.grade}-${idx + 1}`,
  }));
  const sem2Items = matchingPreset.materialsSem2.map((m, idx) => ({
    ...m,
    id: `m-sem2-${matchingPreset.subject.toLowerCase()}-${matchingPreset.grade}-${idx + 1}`,
  }));

  const activeMasterData: ActiveMasterCPData = {
    id: `master-${matchingPreset.subject.toLowerCase()}-${matchingPreset.grade}`,
    fileName: `Dokumen_CP_${matchingPreset.subject}_BSKAP_Kemendikdasmen.pdf`,
    fileType: 'application/pdf',
    fileSize: 1024 * 450,
    uploadedAt: new Date().toISOString(),
    level: matchingPreset.level,
    grade: matchingPreset.grade,
    phase: matchingPreset.phase,
    subject: matchingPreset.subject,
    teacherName: activeTeacher,
    teacherNip: profile.teacherNip,
    schoolName: activeSchool,
    academicYear: activeYear,
    totalHoursPerYear: matchingPreset.totalHoursPerYear,
    jpPerWeek: matchingPreset.jpPerWeek || 3,
    cpText: matchingPreset.cpSummary,
    elements: matchingPreset.elements || [
      {
        name: 'Pemahaman Konsep',
        description: `Penguasaan materi esensial ${matchingPreset.subject}`,
        competencies: ['Menganalisis prinsip inti', 'Mengevaluasi konsep esensial'],
        essentialMaterials: [`Materi Pokok ${matchingPreset.subject}`],
      },
      {
        name: 'Keterampilan Proses',
        description: `Penerapan metode ilmiah dan pemecahan masalah ${matchingPreset.subject}`,
        competencies: ['Merancang eksperimen/karya', 'Mengomunikasikan hasil'],
        essentialMaterials: [`Proyek Inovasi ${matchingPreset.subject}`],
      },
    ],
    materialsSem1: sem1Items,
    materialsSem2: sem2Items,
    executiveSummary: `Analisis resmi komprehensif Capaian Pembelajaran (CP) untuk mata pelajaran ${matchingPreset.subject} Jenjang ${matchingPreset.level} (${matchingPreset.phase} - Kelas ${matchingPreset.grade}). Diperkaya dengan pendekatan Deep Learning (Mindful, Meaningful, Joyful Learning) dan integrasi 6 Karakter Utama.`,
    kktpSummary: 'Interval Ketuntasan: 0-40% (Perlu Bimbingan Khusus), 41-65% (Cukup/Remedial Bagian Tertentu), 66-85% (Baik/Tuntas Capaian), 86-100% (Sangat Baik/Pengayaan Mandiri).',
    syncStatus: 'synced',
    lastSyncedAt: new Date().toISOString(),
  };

  StorageService.setActiveMasterCP(activeMasterData);

  // Trigger storage events
  window.dispatchEvent(new Event('master-cp-updated'));
  window.dispatchEvent(new Event('storage'));

  return {
    totalSynced: SUBJECT_MATERIAL_PRESETS.length,
    subjects: syncedSubjectsList,
  };
}
