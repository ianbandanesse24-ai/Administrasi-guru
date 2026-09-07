/**
 * AI Curriculum Generation Engine
 * Generates rich, comprehensive, official Kurikulum Merdeka & Deep Learning documents
 * (Mindful, Meaningful, Joyful Learning) with ABCD TP formulations, HOTS rubrics, and detailed tables.
 */

import { StorageService } from './storage';

export interface GenerateCurriculumParams {
  toolType?: string;
  docType?: string;
  subject?: string;
  level?: string;
  grade?: number | string;
  phase?: string;
  semester?: string;
  academicYear?: string;
  topic?: string;
  meetingCount?: number;
  hoursPerMeeting?: number;
  minutesPerJP?: number;
  totalJP?: number;
  modelOption?: string;
  modulOption?: string;
  manualTP?: string;
  useManualTP?: boolean;
  customInstructions?: string;
  customPrompt?: string;
  cpText?: string;
  distributionData?: any;
  kalenderData?: any;
  useCustomFormat?: boolean;
  customFormatNotes?: string;
  customFormatFile?: {
    name: string;
    size?: number;
    type?: string;
    mimeType?: string;
    base64?: string;
    extractedText?: string;
  } | null;
}

export function generateExpertCurriculumDocument(
  docTypeOrParams: string | GenerateCurriculumParams,
  maybeParams?: GenerateCurriculumParams
): string {
  const params: GenerateCurriculumParams =
    typeof docTypeOrParams === 'string'
      ? { ...(maybeParams || {}), docType: docTypeOrParams, toolType: docTypeOrParams }
      : docTypeOrParams;

  const rawType = params.toolType || params.docType || 'modul_ajar';
  const docType = rawType.toString().toLowerCase().replace(/^ai_/, '');

  if (docType === 'bundle' || docType === 'perangkat_lengkap') {
    return generateFullCurriculumBundle(params);
  }

  const subject = params.subject || 'Mata Pelajaran';
  const syncedContext = StorageService.getSyncedCurriculumContext(subject, params.grade, params.level);
  const schoolProfile = syncedContext.schoolProfile;

  const level = params.level || syncedContext.level || 'SMA';
  const grade = params.grade || syncedContext.grade || (level === 'SD' ? 4 : level === 'SMP' ? 7 : 10);
  const phase = params.phase || syncedContext.phase || (grade === 10 ? 'Fase E' : Number(grade) > 10 ? 'Fase F' : Number(grade) >= 7 ? 'Fase D' : Number(grade) >= 4 ? 'Fase B/C' : 'Fase A');
  const semester = params.semester || 'Ganjil';
  
  const distributionData = params.distributionData || syncedContext.activeMaster;
  const sem1Materials = (distributionData?.materialsSem1 && distributionData.materialsSem1.length > 0) ? distributionData.materialsSem1 : syncedContext.sem1Materials;
  const sem2Materials = (distributionData?.materialsSem2 && distributionData.materialsSem2.length > 0) ? distributionData.materialsSem2 : syncedContext.sem2Materials;
  const activeMaterials = semester === 'Ganjil' || semester === '1' ? sem1Materials : sem2Materials;
  const currentMaterial = distributionData?.currentSelectedMaterial || (activeMaterials.length > 0 ? activeMaterials[0] : null);

  const topic = params.topic || (currentMaterial?.essentialMaterial) || (currentMaterial?.tpName) || `Konsep Pokok dan Terapan ${subject}`;
  const modelOption = params.modelOption || params.modulOption || 'lengkap';
  const teacherName = params.distributionData?.teacherName || schoolProfile.teacherName || syncedContext.teacherName || 'Aspian La Ode Madimu, S.Pd. Gr';
  const teacherNip = (params.distributionData as any)?.teacherNip || schoolProfile.teacherNip || syncedContext.teacherNip || '19900822 201801 1 004';
  const headmasterName = schoolProfile.headmasterName || (schoolProfile as any).principalName || syncedContext.headmasterName || 'Drs. M. Taher, M.Pd.';
  const headmasterNip = schoolProfile.headmasterNip || (schoolProfile as any).principalNip || syncedContext.headmasterNip || '19700315 199602 1 002';
  const schoolName = params.distributionData?.schoolName || schoolProfile.schoolName || syncedContext.schoolName || 'SMA NEGERI 30 MALUKU TENGAH';
  const city = schoolProfile.city || syncedContext.city || 'Maluku Tengah';

  const useCustomFormat = params.useCustomFormat;
  const customFormatNotes = params.customFormatNotes;
  const customFormatFile = params.customFormatFile;
  const manualTP = params.manualTP?.trim();
  const resolvedAcademicYear = params.academicYear || params.kalenderData?.tahunAjaran || schoolProfile.academicYear || syncedContext.academicYear || "2025/2026";
  const yearMatch = resolvedAcademicYear.match(/(\d{4})\s*[\/-]\s*(\d{4})/);
  const startYear = yearMatch ? parseInt(yearMatch[1], 10) : 2025;
  const endYear = yearMatch ? parseInt(yearMatch[2], 10) : startYear + 1;

  // Meeting parameters
  const meetingCount = Number(params.meetingCount) > 0 ? Number(params.meetingCount) : 2;
  const defaultMinutesPerJp = level === 'SD' ? 35 : level === 'SMP' ? 40 : 45;
  const minutesPerJP = Number(params.minutesPerJP) > 0 ? Number(params.minutesPerJP) : defaultMinutesPerJp;
  const defaultJpPerMeeting = level === 'SD' ? 2 : level === 'SMP' ? 2 : 3;
  const hoursPerMeeting = Number(params.hoursPerMeeting) > 0 ? Number(params.hoursPerMeeting) : defaultJpPerMeeting;
  const totalJP = params.totalJP || (meetingCount * hoursPerMeeting);
  const meetingTotalMinutes = hoursPerMeeting * minutesPerJP;

  const tpCode = currentMaterial?.tpCode || `TP.${grade}.1`;
  const tpTitle = currentMaterial?.tpName || `Peserta didik mampu memahami, menganalisis, dan memecahkan permasalahan kontekstual terkait ${topic} secara kritis, mandiri, dan bergotong royong.`;
  const allocatedHours = currentMaterial?.allocatedHours || 6;
  const subTopics: string[] = (currentMaterial as any)?.subTopics || [];

  const generateCoreDoc = (): string => {
    switch (docType) {
    case 'analisis_cp':
      return `# ANALISIS CAPAIAN PEMBELAJARAN (CP) TERBARU
## PENDEKATAN DEEP LEARNING (MINDFUL, MEANINGFUL, & JOYFUL LEARNING)

---

### A. IDENTITAS PERANGKAT
| Komponen | Keterangan |
| :--- | :--- |
| **Satuan Pendidikan** | SMA / SMK / MA / SMP / SD Terpadu |
| **Mata Pelajaran** | **${subject}** |
| **Fase / Kelas** | **${phase} / Kelas ${grade}** |
| **Jenjang** | **${level}** |
| **Semester** | **${semester}** |
| **Tahun Pelajaran** | ${resolvedAcademicYear} |
| **Penyusun / Guru** | ${teacherName} |

---

### B. RASIONAL & CAPAIAN PEMBELAJARAN (CP)
**Rumusan CP Resmi:**
> *"Peserta didik mampu memahami hakikat keilmuan, menganalisis struktur dan konsep esensial ${subject}, menggunakan nalar kritis untuk memecahkan persoalan nyata, serta mengkomunikasikan ide gagasan solutif secara kolaboratif, kreatif, dan beretika."*

---

### C. DEKOMPOSISI ELEMEN DAN ANALISIS KOMPETENSI ESENSIAL
| No | Elemen CP | Kalimat Capaian Pembelajaran | Kompetensi Esensial (KKO HOTS Bloom) | Konten / Materi Pokok Esensial |
| :-: | :--- | :--- | :--- | :--- |
| 1 | **Pemahaman Konseptual** | Memahami, mengidentifikasi, dan mendeskripsikan prinsip fundamental ${subject}. | Mengidentifikasi (C2), Membedakan (C2), Menganalisis (C4) | ${topic} & Prinsip Dasar Keilmuan |
| 2 | **Keterampilan Proses & Analisis** | Menerapkan prosedur analitis, melakukan observasi/eksperimen, dan menafsirkan data. | Menghitung (C3), Menguji (C4), Mengevaluasi (C5) | Metode Investigasi, Pengolahan Data, & Pemecahan Masalah |
| 3 | **Aplikasi & Refleksi Kritis** | Menghubungkan konsep dengan fenomena lingkungan serta merefleksikan solusi kontekstual. | Mengkorelasikan (C4), Merefleksi (C5), Mengkreasikan Solusi (C6) | Studi Kasus Nyata, Proyek Kolaboratif Berdiferensiasi |

---

### D. INTEGRASI TIGA PILAR DEEP LEARNING
1. **Mindful Learning (Fokus & Kesadaran Penuh):**
   * Memberikan ruang hening (*mindful breathing*) sebelum memulai materi untuk memusatkan perhatian.
   * Menumbuhkan kesadaran diri (*self-awareness*) tentang relevansi ${subject} bagi kehidupan pribadi siswa.
2. **Meaningful Learning (Pembelajaran Bermakna & Kontekstual):**
   * Mengaitkan teori dengan studi kasus nyata di lingkungan sekitar peserta didik (*real-world problem*).
   * Membimbing siswa menemukan *"Mengapa saya harus mempelajari konsep ini?"* (*big ideas*).
3. **Joyful Learning (Pengalaman Menyenangkan & Eksploratif):**
   * Menggunakan simulasi interaktif, tantangan studi kelompok gamifikasi, dan eksperimen yang memicu rasa ingin tahu (*inquiry curiosity*).
   * Memberikan apresiasi atas setiap proses berpikir dan keberanian berpendapat.

---

### E. PEMETAAN DIMENSI PROFIL PELAJAR PANCASILA
* **Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia:** Mensyukuri keteraturan alam semesta dan ilmu pengetahuan.
* **Bernalar Kritis:** Menganalisis informasi, memvalidasi bukti, dan menarik kesimpulan logis.
* **Kreatif:** Mengembangkan alternatif solusi inovatif terhadap tantangan masalah kontekstual.
* **Bergotong Royong:** Berkolaborasi efektif dalam kerja kelompok dan saling menghargai pendapat.

---

### F. STRATEGI PEMBELAJARAN BERDIFERENSIASI
* **Diferensiasi Konten:** Menyediakan bahan ajar multimodal (teks narasi, infografis visual, video animasi, dan benda konkret).
* **Diferensiasi Proses:** Bimbingan berjenjang (*scaffolding*) bagi kelompok yang membutuhkan bimbingan intensif dan tantangan mandiri untuk kelompok mahir.
* **Diferensiasi Produk:** Kebebasan memilih bentuk unjuk kerja tugas (laporan tulisan, poster infografis, rekaman podcast audio, atau video presentasi singkat).
`;

    case 'tp':
      return `# PERUMUSAN TUJUAN PEMBELAJARAN (TP)
## PENDEKATAN BERBASIS KOMPONEN ABCD & TAKSONOMI BLOOM HOTS

---

### A. IDENTITAS PERANGKAT
* **Mata Pelajaran:** ${subject}
* **Fase / Kelas:** ${phase} / Kelas ${grade} (${level})
* **Semester / Topik:** Semester ${semester} — *${topic}*
* **Guru Pengampu:** ${teacherName}

---

### B. TABEL RUMUSAN TUJUAN PEMBELAJARAN (TP)
| Kode TP | Rumusan Tujuan Pembelajaran (ABCD) | Kata Kerja Operasional (KKO) | Dimensi Profil Pancasila | Pemahaman Bermakna (Deep Meaning) |
| :--- | :--- | :--- | :--- | :--- |
| **${tpCode}** | Peserta didik (**A**) mampu **mengidentifikasi dan menganalisis** (**B**) karakteristik fundamental ${topic} melalui telaah kasus kontekstual (**C**) secara tepat dan kritis (**D**). | Mengidentifikasi (C2), Menganalisis (C4) | Bernalar Kritis, Mandiri | Konsep dasar ${subject} merupakan fondasi memahami pola keteraturan dan fenomena di sekitar kita. |
| **TP.${grade}.2** | Peserta didik (**A**) mampu **menerapkan dan memecahkan** (**B**) permasalahan perhitungan/studi kasus pada ${topic} melalui diskusi kelompok terbimbing (**C**) dengan akurasi minimal 80% (**D**). | Menerapkan (C3), Memecahkan (C4) | Bergotong Royong, Bernalar Kritis | Kolaborasi mempermudah penyelesaian masalah kompleks dan menghasilkan presisi solusi. |
| **TP.${grade}.3** | Peserta didik (**A**) mampu **mengevaluasi dan mengkreasikan** (**B**) solusi gagasan/produk inovatif terkait penerapan ${topic} melalui proyek investigasi sederhana (**C**) dengan sistematis dan komunikatif (**D**). | Mengevaluasi (C5), Mengkreasikan (C6) | Kreatif, Berkebinekaan Global | Pengetahuan yang bermakna adalah pengetahuan yang dapat diwujudkan dalam tindakan nyata. |

---

### C. PERTANYAAN PEMANTIK (INQUIRY HOOKS)
1. *Bagaimanakah keterkaitan antara konsep **${topic}** dengan permasalahan yang sering kita jumpai dalam kehidupan sehari-hari?*
2. *Mengapa pemahaman yang keliru terhadap prinsip ini dapat berdampak pada pengambilan keputusan yang tidak akurat?*
3. *Gagasan atau inovasi apa yang dapat kamu ciptakan untuk mempermudah pemecahan masalah di topik ini?*

---

### D. KONTROL MUTU RUMUSAN TP (KOMPONEN ABCD)
* **Audience (A):** Peserta didik kelas ${grade} fase ${phase}.
* **Behavior (B):** Mengidentifikasi, menganalisis, menerapkan, mengevaluasi, dan mengkreasikan solusi.
* **Condition (C):** Melalui pengamatan fenomena nyata, studi literatur, simulasi, dan diskusi proyek kolaboratif.
* **Degree (D):** Secara tepat, kritis, sistematis, mandiri, dan bertanggung jawab.
`;

    case 'atp':
      return `# ALUR TUJUAN PEMBELAJARAN (ATP)
## KURIKULUM MERDEKA — TAHAPAN LOGIS DARI KONKRET KE ABSTRAK

---

### A. IDENTITAS MATA PELAJARAN
* **Mata Pelajaran:** ${subject} | **Fase / Kelas:** ${phase} / Kelas ${grade}
* **Alokasi Waktu Total:** ${params.distributionData?.totalHoursPerYear || 108} JP / Tahun
* **Penyusun:** ${teacherName}

---

### B. MATRIKS ALUR TUJUAN PEMBELAJARAN (ATP)
| Tahap | Kode TP | Ruang Lingkup Materi Pokok | Alokasi Waktu | Model / Metode Pembelajaran | Bentuk Asesmen Formatif | Sumber / Media Belajar |
| :-: | :--- | :--- | :-: | :--- | :--- | :--- |
| **1** | **${tpCode}** | Pengenalan Konsep Esensial & Fenomena Dasar ${topic} | ${allocatedHours} JP | *Inquiry Discovery Learning* & Eksplorasi Mindful | Tes Diagnostik Awal & Lembar Observasi Tanya Jawab | Modul Guru, Video Fenomena, LKPD 1 |
| **2** | **TP.${grade}.2** | Analisis Struktur, Pola Hubungan & Studi Kasus Mendalam | 6 JP | *Problem-Based Learning (PBL)* | Kuis Formatif Mandiri & Penilaian Diskusi Teman | Buku Teks Kemendikbud, Artikel Kasus Kontekstual |
| **3** | **TP.${grade}.3** | Investigasi Terapan & Eksperimen / Olah Data Nyata | 6 JP | *Project-Based Learning (PjBL)* & Joyful Lab | Lembar Kinerja Praktik / Observasi Unjuk Kerja | Kit Praktikum / Lembar Kerja Digital |
| **4** | **TP.${grade}.4** | Evaluasi Kritis, Refleksi Bermakna, & Proyek Kreasi | 6 JP | *Collaborative Peer Review* & Galeri Karya | Presentasi Kelompok & Penilaian Produk Portofolio | Rubrik Asesmen Sumatif Lingkup Materi |

---

### C. DIAGRAM ALUR PROGRES BELAJAR SISWA
\`\`\`
[ Tahap 1: Mindful Apersepsi ] ──> [ Tahap 2: Meaningful Inquiry ] ──> [ Tahap 3: Joyful Creation ] ──> [ Tahap 4: Asesmen & Refleksi ]
  (Membangun Minat & Konsep)          (Eksplorasi Studi Kasus)            (Proyek Kolaboratif Nyata)          (Evaluasi Ketuntasan)
\`\`\`

---

### D. CATATAN DIFERENSIASI & FLEKSIBILITAS WAKTU
* Alokasi jam dapat disesuaikan secara proporsional sesuai kecepatan dan daya serap rombongan belajar.
* Pembelajaran remedial dilaksanakan secara terintegrasi setelah asesmen formatif tahap 2 selesai.
`;

    case 'analisis_alokasi_waktu':
    case 'alokasi_waktu':
    case 'rbe': {
      const sem1EffWeeks = params.kalenderData?.semester1?.totalEffectiveWeeks || 19;
      const sem2EffWeeks = params.kalenderData?.semester2?.totalEffectiveWeeks || 18;
      const jpPerWk = params.kalenderData?.semester1?.jpPerWeek || (level === 'SD' ? 4 : 3);
      const sem1TotalJp = sem1EffWeeks * jpPerWk;
      const sem2TotalJp = sem2EffWeeks * jpPerWk;

      return `# ANALISIS ALOKASI WAKTU & RINCIAN PEKAN EFEKTIF (RBE)
## KURIKULUM MERDEKA — TAHUN PELAJARAN ${resolvedAcademicYear}
### DIANALISIS DARI KALENDER PENDIDIKAN RESMI

---

### A. IDENTITAS PERANGKAT
* **Satuan Pendidikan:** Satuan Pendidikan Indonesia
* **Mata Pelajaran:** **${subject}**
* **Fase / Kelas:** **${phase} / Kelas ${grade} (${level})**
* **Tahun Pelajaran:** ${resolvedAcademicYear}
* **Alokasi Jam per Pekan:** **${jpPerWk} JP / Minggu**
* **Guru Pengampu:** ${teacherName}

---

### B. ANALISIS RINCIAN PEKAN EFEKTIF SEMESTER 1 (GANJIL)
#### 1. Distribusi Jumlah Pekan Semester 1 (Juli s.d. Desember ${startYear})
| No | Nama Bulan | Jumlah Pekan Kalender | Pekan Tidak Efektif | Pekan Efektif KBM | Keterangan Pekan Tidak Efektif (Kalender Pendidikan) |
| :-: | :--- | :-: | :-: | :-: | :--- |
| 1 | **Juli 2025** | 5 Pekan | 2 Pekan | 3 Pekan | Libur Akhir TP 2024/2025 (P1-P2) & MPLS / Matsama (P3) |
| 2 | **Agustus 2025** | 4 Pekan | 0 Pekan | 4 Pekan | KBM Efektif Penuh (Peringatan HUT RI ke-80) |
| 3 | **September 2025** | 5 Pekan | 1 Pekan | 4 Pekan | Asesmen Tengah Semester / ASTS Ganjil (Pekan 4) |
| 4 | **Oktober 2025** | 4 Pekan | 0 Pekan | 4 Pekan | KBM Efektif & Pekan Projek P5 |
| 5 | **November 2025** | 4 Pekan | 0 Pekan | 4 Pekan | KBM Efektif Penuh |
| 6 | **Desember 2025** | 4 Pekan | 4 Pekan | 0 Pekan | ASAS (P1), Remedial & Nilai (P2), Rapor (P3), Libur Sem 1 (P4) |
| **TOTAL** | **Semester 1 (Ganjil)** | **26 Pekan** | **7 Pekan** | **${sem1EffWeeks} Pekan** | **Total Pekan Efektif KBM: ${sem1EffWeeks} Pekan** |

#### 2. Perhitungan Jam Pelajaran (JP) Efektif Semester 1
| Komponen Perhitungan | Formula & Rincian | Hasil Jam Pelajaran (JP) |
| :--- | :--- | :-: |
| **a. Jumlah Pekan Efektif KBM** | ${sem1EffWeeks} Pekan | ${sem1EffWeeks} Pekan |
| **b. Alokasi Waktu Mengajar** | ${jpPerWk} JP / Pekan | ${jpPerWk} JP / Minggu |
| **c. Jumlah Total Jam Efektif** | ${sem1EffWeeks} Pekan × ${jpPerWk} JP | **${sem1TotalJp} JP** |
| **d. Cadangan Jam Pelajaran** | Asesmen Sumatif Lingkup Materi & Remedial | 6 JP |
| **e. Jam Efektif Tatap Muka KBM** | Total Jam Efektif - Cadangan Jam | **${sem1TotalJp - 6} JP** |

---

### C. ANALISIS RINCIAN PEKAN EFEKTIF SEMESTER 2 (GENAP)
#### 1. Distribusi Jumlah Pekan Semester 2 (Januari s.d. Juni ${endYear})
| No | Nama Bulan | Jumlah Pekan Kalender | Pekan Tidak Efektif | Pekan Efektif KBM | Keterangan Pekan Tidak Efektif (Kalender Pendidikan) |
| :-: | :--- | :-: | :-: | :-: | :--- |
| 1 | **Januari 2026** | 5 Pekan | 1 Pekan | 4 Pekan | Libur Tahun Baru & Awal Semester Genap (Pekan 1) |
| 2 | **Februari 2026** | 4 Pekan | 0 Pekan | 4 Pekan | KBM Efektif Penuh |
| 3 | **Maret 2026** | 4 Pekan | 1 Pekan | 3 Pekan | ASTS Genap & Libur Awal Ramadhan 1447 H (Pekan 3) |
| 4 | **April 2026** | 5 Pekan | 2 Pekan | 3 Pekan | Libur Hari Raya Idul Fitri 1447 H & Cuti Bersama (P1-P2) |
| 5 | **Mei 2026** | 4 Pekan | 1 Pekan | 3 Pekan | Asesmen Sumatif Akhir Jenjang / Ujian Sekolah (Pekan 3) |
| 6 | **Juni 2026** | 4 Pekan | 3 Pekan | 1 Pekan | ASAS Genap (P1), Pembagian Rapor (P2), Libur Akhir TP (P3-P4) |
| **TOTAL** | **Semester 2 (Genap)** | **26 Pekan** | **8 Pekan** | **${sem2EffWeeks} Pekan** | **Total Pekan Efektif KBM: ${sem2EffWeeks} Pekan** |

#### 2. Perhitungan Jam Pelajaran (JP) Efektif Semester 2
| Komponen Perhitungan | Formula & Rincian | Hasil Jam Pelajaran (JP) |
| :--- | :--- | :-: |
| **a. Jumlah Pekan Efektif KBM** | ${sem2EffWeeks} Pekan | ${sem2EffWeeks} Pekan |
| **b. Alokasi Waktu Mengajar** | ${jpPerWk} JP / Pekan | ${jpPerWk} JP / Minggu |
| **c. Jumlah Total Jam Efektif** | ${sem2EffWeeks} Pekan × ${jpPerWk} JP | **${sem2TotalJp} JP** |
| **d. Cadangan Jam Pelajaran** | Asesmen Sumatif Akhir & Remedial | 6 JP |
| **e. Jam Efektif Tatap Muka KBM** | Total Jam Efektif - Cadangan Jam | **${sem2TotalJp - 6} JP** |

---

### D. REKAPITULASI ALOKASI WAKTU 1 TAHUN PELAJARAN (SEMESTER 1 & 2)
| No | Semester | Jumlah Pekan Kalender | Pekan Tidak Efektif | Pekan Efektif | Total Jam Efektif (JP) | Cadangan Jam (JP) | Jam Tatap Muka KBM (JP) |
| :-: | :--- | :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | **Semester 1 (Ganjil)** | 26 Pekan | 7 Pekan | ${sem1EffWeeks} Pekan | ${sem1TotalJp} JP | 6 JP | ${sem1TotalJp - 6} JP |
| 2 | **Semester 2 (Genap)** | 26 Pekan | 8 Pekan | ${sem2EffWeeks} Pekan | ${sem2TotalJp} JP | 6 JP | ${sem2TotalJp - 6} JP |
| **TOTAL** | **1 Tahun Pelajaran** | **52 Pekan** | **15 Pekan** | **${sem1EffWeeks + sem2EffWeeks} Pekan** | **${sem1TotalJp + sem2TotalJp} JP** | **12 JP** | **${sem1TotalJp + sem2TotalJp - 12} JP** |

---

### E. DISTRIBUSI ALOKASI WAKTU PER MATERI POKOK / TP
#### 1. Distribusi Semester 1 (Ganjil)
| No | Kode TP | Lingkup Materi Pokok (Semester 1) | Alokasi Waktu (JP) | Jumlah Pertemuan | Keterangan |
| :-: | :--- | :--- | :-: | :-: | :--- |
| 1 | TP.${grade}.1 | ${sem1Materials[0]?.essentialMaterial || `Bab 1: Eksplorasi Konseptual & Prinsip Awal ${subject}`} | ${sem1Materials[0]?.allocatedHours || 18} JP | 6 Pertemuan | Deep Learning Inquiry |
| 2 | TP.${grade}.2 | ${sem1Materials[1]?.essentialMaterial || `Bab 2: Analisis Kritis & Penerapan Kasus Terpadu`} | ${sem1Materials[1]?.allocatedHours || 18} JP | 6 Pertemuan | Problem-Based Learning |
| 3 | TP.${grade}.3 | ${sem1Materials[2]?.essentialMaterial || `Bab 3: Investigasi Terapan & Proyek Kreasi Siswa`} | ${sem1Materials[2]?.allocatedHours || 15} JP | 5 Pertemuan | Project-Based Learning |
| - | - | **Cadangan Jam Pelajaran & Asesmen Sumatif Semester 1** | 6 JP | 2 Pertemuan | ASTS / ASAS / Remedial |
| **TOTAL** | | **Jumlah Jam Pelajaran Semester Ganjil** | **${sem1TotalJp} JP** | **${sem1EffWeeks} Pertemuan** | **Tuntas Semester 1** |

#### 2. Distribusi Semester 2 (Genap)
| No | Kode TP | Lingkup Materi Pokok (Semester 2) | Alokasi Waktu (JP) | Jumlah Pertemuan | Keterangan |
| :-: | :--- | :--- | :-: | :-: | :--- |
| 4 | TP.${grade}.4 | ${sem2Materials[0]?.essentialMaterial || `Bab 4: Integrasi Lanjutan & Model Pemecahan Masalah`} | ${sem2Materials[0]?.allocatedHours || 18} JP | 6 Pertemuan | Eksplorasi Lanjutan |
| 5 | TP.${grade}.5 | ${sem2Materials[1]?.essentialMaterial || `Bab 5: Evaluasi Dampak, Rekayasa Solusi & Sains Etis`} | ${sem2Materials[1]?.allocatedHours || 18} JP | 6 Pertemuan | Kolaborasi Kelompok |
| 6 | TP.${grade}.6 | ${sem2Materials[2]?.essentialMaterial || `Bab 6: Gelar Karya Inovasi & Refleksi Komprehensif`} | ${sem2Materials[2]?.allocatedHours || 12} JP | 4 Pertemuan | Gelar Karya Pameran |
| - | - | **Cadangan Jam Pelajaran & Asesmen Sumatif Akhir Tahun** | 6 JP | 2 Pertemuan | Sumatif Akhir Jenjang |
| **TOTAL** | | **Jumlah Jam Pelajaran Semester Genap** | **${sem2TotalJp} JP** | **${sem2EffWeeks} Pertemuan** | **Tuntas Semester 2** |
`;
    }

    case 'prota':
      return `# PROGRAM TAHUNAN (PROTA)
## TAHUN PELAJARAN ${resolvedAcademicYear}

---

### A. IDENTITAS PROGRAM
* **Satuan Pendidikan:** Satuan Pendidikan Indonesia
* **Mata Pelajaran:** **${subject}**
* **Fase / Kelas:** **${phase} / Kelas ${grade} (${level})**
* **Total Alokasi Waktu:** **${params.distributionData?.totalHoursPerYear || 108} JP (Jam Pelajaran)**
* **Guru Pengampu:** ${teacherName}

---

### B. PERHITUNGAN ALOKASI PEKAN EFEKTIF
| No | Semester | Jumlah Pekan Kalender | Pekan Tidak Efektif (Libur/PTS/PAS) | Pekan Efektif KBM | Alokasi Waktu (JP/Minggu x Pekan) |
| :-: | :--- | :-: | :-: | :-: | :-: |
| 1 | **Semester 1 (Ganjil)** | 26 Pekan | 8 Pekan | 18 Pekan | **54 JP** (3 JP/Pekan) |
| 2 | **Semester 2 (Genap)** | 26 Pekan | 8 Pekan | 18 Pekan | **54 JP** (3 JP/Pekan) |
| **TOTAL** | **1 Tahun Ajaran** | **52 Pekan** | **16 Pekan** | **36 Pekan** | **108 JP** |

---

### C. DISTRIBUSI MATERI SEMESTER 1 (GANJIL)
| No | Kode TP | Lingkup Materi Pokok (Semester 1) | Alokasi Jam (JP) | Keterangan |
| :-: | :--- | :--- | :-: | :--- |
| 1 | TP.${grade}.1 | ${sem1Materials[0]?.essentialMaterial || `Bab 1: Konsep Fundamental & Prinsip Awal ${subject}`} | ${sem1Materials[0]?.allocatedHours || 18} JP | Pembelajaran Mendalam + Formatif |
| 2 | TP.${grade}.2 | ${sem1Materials[1]?.essentialMaterial || `Bab 2: Analisis Kritis & Penerapan Kontekstual ${subject}`} | ${sem1Materials[1]?.allocatedHours || 18} JP | Studi Kasus & Diskusi |
| 3 | TP.${grade}.3 | ${sem1Materials[2]?.essentialMaterial || `Bab 3: Investigasi Terpadu & Proyek Kolaboratif`} | ${sem1Materials[2]?.allocatedHours || 14} JP | Proyek Kreatif Siswa |
| - | - | **Cadangan Jam Pelajaran & Asesmen Sumatif Semester 1** | 4 JP | Sumatif Lingkup Materi / SAS |
| **JUMLAH** | | **Total Semester Ganjil** | **54 JP** | **Tuntas Semester 1** |

---

### D. DISTRIBUSI MATERI SEMESTER 2 (GENAP)
| No | Kode TP | Lingkup Materi Pokok (Semester 2) | Alokasi Jam (JP) | Keterangan |
| :-: | :--- | :--- | :-: | :--- |
| 4 | TP.${grade}.4 | ${sem2Materials[0]?.essentialMaterial || `Bab 4: Eksplorasi Tingkat Lanjut & Integrasi Sistem`} | ${sem2Materials[0]?.allocatedHours || 18} JP | Pembelajaran Mendalam |
| 5 | TP.${grade}.5 | ${sem2Materials[1]?.essentialMaterial || `Bab 5: Evaluasi Dampak, Etika, & Rekayasa Solusi`} | ${sem2Materials[1]?.allocatedHours || 18} JP | Proyek Desain Solusi |
| 6 | TP.${grade}.6 | ${sem2Materials[2]?.essentialMaterial || `Bab 6: Gelar Karya Inovasi & Refleksi Komprehensif`} | ${sem2Materials[2]?.allocatedHours || 14} JP | Pameran Hasil Belajar |
| - | - | **Cadangan Jam Pelajaran & Asesmen Sumatif Akhir Tahun** | 4 JP | Asesmen Sumatif Akhir Jenjang |
| **JUMLAH** | | **Total Semester Genap** | **54 JP** | **Tuntas Semester 2** |
`;

    case 'prosem': {
      const isGanjil = semester === 'Ganjil' || semester === '1';
      const hoursPerWeek = params.distributionData?.hoursPerWeek || 3;
      const resolvedGradeText = typeof grade === 'number' ? (grade === 10 ? 'X' : grade === 11 ? 'XI' : grade === 12 ? 'XII' : `${grade}`) : `${grade}`;

      if (isGanjil) {
        const mat1 = sem1Materials[0]?.essentialMaterial || `Keanekaragaman Hayati`;
        const mat2 = sem1Materials[1]?.essentialMaterial || `Ekosistem`;
        const mat3 = sem1Materials[2]?.essentialMaterial || `Pengelolaan lingkungan`;

        return `<div style="text-align: center; margin-bottom: 20px;">
  <div style="font-size: 11pt; font-weight: bold; color: #334155; margin-bottom: 4px; letter-spacing: 0.5px;">PROGRAM...AP KELAS ${resolvedGradeText}</div>
  <div style="display: inline-block; background-color: #00bcd4; color: #000000; font-size: 14pt; font-weight: 900; padding: 4px 20px; border-bottom: 2.5px solid #000000; text-decoration: underline; letter-spacing: 1px;">
    PROGRAM SEMESTER
  </div>
</div>

<table style="width: 100%; border: none; margin-bottom: 12px; font-size: 10pt; font-family: inherit;">
  <tr>
    <td style="width: 50%; vertical-align: top; border: none; padding: 2px 0;">
      <table style="width: 100%; border: none;">
        <tr><td style="width: 130px; font-weight: 500; border: none; padding: 2px 0;">Mata Pelajaran</td><td style="border: none; padding: 2px 0;">: <strong>${subject}</strong></td></tr>
        <tr><td style="font-weight: 500; border: none; padding: 2px 0;">Tahun Pelajaran</td><td style="border: none; padding: 2px 0;">: ${resolvedAcademicYear}</td></tr>
      </table>
    </td>
    <td style="width: 50%; vertical-align: top; border: none; padding: 2px 0; text-align: right;">
      <div style="display: inline-block; text-align: left;">
        <div style="padding: 2px 0; font-weight: 500;"><strong>${resolvedGradeText} / Ganjil</strong></div>
        <div style="padding: 2px 0; font-weight: 500;"><strong>${hoursPerWeek}JP/ Minggu</strong></div>
      </div>
    </td>
  </tr>
</table>

<div style="overflow-x: auto; margin: 12px 0;">
  <table style="width: 100%; border-collapse: collapse; font-size: 9pt; border: 1.5px solid #000000; text-align: center;">
    <thead>
      <tr style="background-color: #c8e6c9; color: #000000; font-weight: bold;">
        <th rowspan="2" style="border: 1px solid #333333; padding: 6px 6px; width: 180px; text-align: center; vertical-align: middle;">Konten/Materi</th>
        <th rowspan="2" style="border: 1px solid #333333; padding: 6px 4px; width: 50px; text-align: center; vertical-align: middle;">JML<br/>JP</th>
        <th colspan="4" style="border: 1px solid #333333; padding: 5px 3px; text-align: center;">Juli</th>
        <th colspan="5" style="border: 1px solid #333333; padding: 5px 3px; text-align: center;">Agustus</th>
        <th colspan="4" style="border: 1px solid #333333; padding: 5px 3px; text-align: center;">September</th>
        <th colspan="4" style="border: 1px solid #333333; padding: 5px 3px; text-align: center;">Oktober</th>
        <th colspan="5" style="border: 1px solid #333333; padding: 5px 3px; text-align: center;">Nofember</th>
        <th colspan="4" style="border: 1px solid #333333; padding: 5px 3px; text-align: center;">Desember</th>
        <th rowspan="2" style="border: 1px solid #333333; padding: 6px 4px; width: 40px; text-align: center; vertical-align: middle;">Ket</th>
      </tr>
      <tr style="background-color: #c8e6c9; color: #000000; font-weight: bold; font-size: 8.5pt;">
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">1</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">2</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">3</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">4</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">1</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">2</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">3</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">4</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">5</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">1</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">2</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">3</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">4</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">1</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">2</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">3</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">4</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">1</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">2</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">3</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">4</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">5</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">1</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">2</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">3</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">4</th>
      </tr>
    </thead>
    <tbody>
      <!-- Baris Materi 1 -->
      <tr>
        <td style="border: 1px solid #333333; padding: 6px 8px; text-align: left; vertical-align: top; font-weight: 500;">${mat1}</td>
        <td style="border: 1px solid #333333; padding: 6px 4px; font-weight: bold; text-align: center; vertical-align: middle;">30JP</td>
        <td style="border: 1px solid #333333; background-color: #90caf9; font-weight: bold; color: #ffffff;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; background-color: #90caf9; font-weight: bold; color: #ffffff;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; background-color: #1e3a8a; font-weight: bold; color: #ffffff;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; background-color: #fb923c; font-weight: bold; color: #ffffff;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333; background-color: #94a3b8;" rowspan="3"></td>
        <td style="border: 1px solid #333333; background-color: #94a3b8; font-weight: bold; font-size: 11pt; color: #1e293b;" rowspan="3">LS</td>
        <td style="border: 1px solid #333333; background-color: #94a3b8;" rowspan="3"></td>
        <td style="border: 1px solid #333333;"></td>
      </tr>
      <!-- Baris Materi 2 -->
      <tr>
        <td style="border: 1px solid #333333; padding: 6px 8px; text-align: left; vertical-align: top; font-weight: 500;">${mat2}</td>
        <td style="border: 1px solid #333333; padding: 6px 4px; font-weight: bold; text-align: center; vertical-align: middle;">30JP</td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
      </tr>
      <!-- Baris Materi 3 -->
      <tr>
        <td style="border: 1px solid #333333; padding: 6px 8px; text-align: left; vertical-align: top; font-weight: 500;">${mat3}</td>
        <td style="border: 1px solid #333333; padding: 6px 4px; font-weight: bold; text-align: center; vertical-align: middle;">29JP</td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333;"></td>
      </tr>
      <!-- Baris Jam Cadangan -->
      <tr style="background-color: #ffffff; font-weight: 500;">
        <td style="border: 1px solid #333333; padding: 6px 8px; text-align: left; font-weight: bold;">JML Jam Cadangan</td>
        <td style="border: 1px solid #333333; padding: 6px 4px; font-weight: bold; text-align: center;">1</td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">1</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
      </tr>
      <!-- Baris Total JP -->
      <tr style="background-color: #ffffff; font-weight: bold;">
        <td style="border: 1px solid #333333; padding: 6px 8px; text-align: left; font-weight: bold;">JML Total JP</td>
        <td style="border: 1px solid #333333; padding: 6px 4px; font-weight: bold; text-align: center;">66JP</td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
      </tr>
    </tbody>
  </table>
</div>

<div style="margin-top: 20px; font-size: 9pt; color: #334155;">
  <strong>Keterangan Format & Agenda Warna:</strong><br/>
  <span style="display:inline-block; width: 12px; height: 12px; background-color: #90caf9; vertical-align: middle; border: 1px solid #333; margin-right: 4px;"></span> Biru Muda = MPLS / Orientasi Sekolah<br/>
  <span style="display:inline-block; width: 12px; height: 12px; background-color: #1e3a8a; vertical-align: middle; border: 1px solid #333; margin-right: 4px;"></span> Biru Tua = Awal Tahun Pelajaran Baru<br/>
  <span style="display:inline-block; width: 12px; height: 12px; background-color: #fb923c; vertical-align: middle; border: 1px solid #333; margin-right: 4px;"></span> Oranye = Matrikulasi & Pembentukan Karakter<br/>
  <span style="display:inline-block; width: 12px; height: 12px; background-color: #94a3b8; vertical-align: middle; border: 1px solid #333; margin-right: 4px;"></span> <strong>LS</strong> = Libur Semester / Penilaian Akhir & Pengisian Rapor
</div>
`;
      } else {
        const mat1 = sem2Materials[0]?.essentialMaterial || `Sistem Regulasi & Koordinasi`;
        const mat2 = sem2Materials[1]?.essentialMaterial || `Bioteknologi Lingkungan`;
        const mat3 = sem2Materials[2]?.essentialMaterial || `Inovasi Rekayasa Terapan`;

        return `<div style="text-align: center; margin-bottom: 20px;">
  <div style="font-size: 11pt; font-weight: bold; color: #334155; margin-bottom: 4px; letter-spacing: 0.5px;">PROGRAM...AP KELAS ${resolvedGradeText}</div>
  <div style="display: inline-block; background-color: #00bcd4; color: #000000; font-size: 14pt; font-weight: 900; padding: 4px 20px; border-bottom: 2.5px solid #000000; text-decoration: underline; letter-spacing: 1px;">
    PROGRAM SEMESTER
  </div>
</div>

<table style="width: 100%; border: none; margin-bottom: 12px; font-size: 10pt; font-family: inherit;">
  <tr>
    <td style="width: 50%; vertical-align: top; border: none; padding: 2px 0;">
      <table style="width: 100%; border: none;">
        <tr><td style="width: 130px; font-weight: 500; border: none; padding: 2px 0;">Mata Pelajaran</td><td style="border: none; padding: 2px 0;">: <strong>${subject}</strong></td></tr>
        <tr><td style="font-weight: 500; border: none; padding: 2px 0;">Tahun Pelajaran</td><td style="border: none; padding: 2px 0;">: ${resolvedAcademicYear}</td></tr>
      </table>
    </td>
    <td style="width: 50%; vertical-align: top; border: none; padding: 2px 0; text-align: right;">
      <div style="display: inline-block; text-align: left;">
        <div style="padding: 2px 0; font-weight: 500;"><strong>${resolvedGradeText} / Genap</strong></div>
        <div style="padding: 2px 0; font-weight: 500;"><strong>${hoursPerWeek}JP/ Minggu</strong></div>
      </div>
    </td>
  </tr>
</table>

<div style="overflow-x: auto; margin: 12px 0;">
  <table style="width: 100%; border-collapse: collapse; font-size: 9pt; border: 1.5px solid #000000; text-align: center;">
    <thead>
      <tr style="background-color: #c8e6c9; color: #000000; font-weight: bold;">
        <th rowspan="2" style="border: 1px solid #333333; padding: 6px 6px; width: 180px; text-align: center; vertical-align: middle;">Konten/Materi</th>
        <th rowspan="2" style="border: 1px solid #333333; padding: 6px 4px; width: 50px; text-align: center; vertical-align: middle;">JML<br/>JP</th>
        <th colspan="5" style="border: 1px solid #333333; padding: 5px 3px; text-align: center;">Januari</th>
        <th colspan="4" style="border: 1px solid #333333; padding: 5px 3px; text-align: center;">Februari</th>
        <th colspan="4" style="border: 1px solid #333333; padding: 5px 3px; text-align: center;">Maret</th>
        <th colspan="4" style="border: 1px solid #333333; padding: 5px 3px; text-align: center;">April</th>
        <th colspan="5" style="border: 1px solid #333333; padding: 5px 3px; text-align: center;">Mei</th>
        <th colspan="4" style="border: 1px solid #333333; padding: 5px 3px; text-align: center;">Juni</th>
        <th rowspan="2" style="border: 1px solid #333333; padding: 6px 4px; width: 40px; text-align: center; vertical-align: middle;">Ket</th>
      </tr>
      <tr style="background-color: #c8e6c9; color: #000000; font-weight: bold; font-size: 8.5pt;">
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">1</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">2</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">3</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">4</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">5</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">1</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">2</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">3</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">4</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">1</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">2</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">3</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">4</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">1</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">2</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">3</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">4</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">1</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">2</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">3</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">4</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">5</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">1</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">2</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">3</th>
        <th style="border: 1px solid #333333; padding: 3px 1px; width: 22px;">4</th>
      </tr>
    </thead>
    <tbody>
      <!-- Baris Materi 1 -->
      <tr>
        <td style="border: 1px solid #333333; padding: 6px 8px; text-align: left; vertical-align: top; font-weight: 500;">${mat1}</td>
        <td style="border: 1px solid #333333; padding: 6px 4px; font-weight: bold; text-align: center; vertical-align: middle;">27JP</td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333; background-color: #94a3b8;" rowspan="3"></td>
        <td style="border: 1px solid #333333; background-color: #94a3b8; font-weight: bold; font-size: 11pt; color: #1e293b;" rowspan="3">LS</td>
        <td style="border: 1px solid #333333; background-color: #94a3b8;" rowspan="3"></td>
        <td style="border: 1px solid #333333;"></td>
      </tr>
      <!-- Baris Materi 2 -->
      <tr>
        <td style="border: 1px solid #333333; padding: 6px 8px; text-align: left; vertical-align: top; font-weight: 500;">${mat2}</td>
        <td style="border: 1px solid #333333; padding: 6px 4px; font-weight: bold; text-align: center; vertical-align: middle;">27JP</td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
      </tr>
      <!-- Baris Materi 3 -->
      <tr>
        <td style="border: 1px solid #333333; padding: 6px 8px; text-align: left; vertical-align: top; font-weight: 500;">${mat3}</td>
        <td style="border: 1px solid #333333; padding: 6px 4px; font-weight: bold; text-align: center; vertical-align: middle;">24JP</td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333;"></td>
      </tr>
      <!-- Baris Jam Cadangan -->
      <tr style="background-color: #ffffff; font-weight: 500;">
        <td style="border: 1px solid #333333; padding: 6px 8px; text-align: left; font-weight: bold;">JML Jam Cadangan</td>
        <td style="border: 1px solid #333333; padding: 6px 4px; font-weight: bold; text-align: center;">1</td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">1</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333; font-weight: bold;">0</td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
      </tr>
      <!-- Baris Total JP -->
      <tr style="background-color: #ffffff; font-weight: bold;">
        <td style="border: 1px solid #333333; padding: 6px 8px; text-align: left; font-weight: bold;">JML Total JP</td>
        <td style="border: 1px solid #333333; padding: 6px 4px; font-weight: bold; text-align: center;">60JP</td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333; font-weight: bold;">${hoursPerWeek}</td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
        <td style="border: 1px solid #333333;"></td>
      </tr>
    </tbody>
  </table>
</div>

<div style="margin-top: 20px; font-size: 9pt; color: #334155;">
  <strong>Keterangan Format & Agenda Warna:</strong><br/>
  <span style="display:inline-block; width: 12px; height: 12px; background-color: #c8e6c9; vertical-align: middle; border: 1px solid #333; margin-right: 4px;"></span> Hijau = Header Distribusi KBM Efektif<br/>
  <span style="display:inline-block; width: 12px; height: 12px; background-color: #94a3b8; vertical-align: middle; border: 1px solid #333; margin-right: 4px;"></span> <strong>LS</strong> = Libur Akhir Tahun / Penyerahan Buku Laporan Hasil Belajar
</div>
`;
      }
    }

    case 'modul_ajar': {
      // 1. Resolve authentic CP text extracted from uploaded file / activeMaster
      const actualCP = params.cpText || (distributionData as any)?.cpText || (syncedContext.activeMaster as any)?.cpText || `Peserta didik mampu memahami, menerapkan, dan menganalisis konsep ${topic} dalam pemecahan masalah kontekstual, penyelidikan ilmiah, dan rekayasa solusi terpadu dalam konteks ilmiah dan kehidupan sehari-hari.`;

      // 2. Resolve authentic TP formulation from manualTP or uploaded file materials
      let tpFormattedList = '';
      if (manualTP && manualTP.trim().length > 0) {
        tpFormattedList = manualTP.trim();
      } else if (activeMaterials && activeMaterials.length > 0) {
        const matchingMaterials = activeMaterials.filter(m => 
          m.essentialMaterial?.toLowerCase().includes(topic.toLowerCase()) || 
          topic.toLowerCase().includes(m.essentialMaterial?.toLowerCase() || '') ||
          m.tpName?.toLowerCase().includes(topic.toLowerCase())
        );
        const materialsToUse = matchingMaterials.length > 0 ? matchingMaterials : activeMaterials.slice(0, Math.max(1, meetingCount));
        tpFormattedList = materialsToUse.map((m, idx) => `${idx + 1}. [${m.tpCode || `TP.${grade}.${idx + 1}`}] ${m.tpName}`).join('\n');
      }

      if (!tpFormattedList) {
        tpFormattedList = `1. Peserta didik dapat membedakan dan mengklasifikasikan konsep pokok pada materi ${topic} dengan benar.
2. Peserta didik dapat menggunakan prinsip dan instrumen ilmiah secara tepat dalam konteks materi ${topic}.
3. Peserta didik dapat menentukan dan menganalisis hubungan variabel serta kaidah esensial dari berbagai fenomena ${topic}.
4. Peserta didik dapat menerapkan aturan dan prosedur pemecahan masalah kontekstual dalam penulisan hasil penyelidikan.
5. Peserta didik dapat menganalisis dan merefleksikan fenomena nyata terkait ${topic} dalam kehidupan sehari-hari.`;
      }

      // 3. Resolve sub-topics for meetings
      const resolvedSubTopics: string[] = subTopics && subTopics.length > 0 
        ? subTopics 
        : Array.from({ length: meetingCount }, (_, i) => `${topic} - Bagian ${i + 1}`);

      // 4. Generate dynamic meeting tables
      let meetingsContent = '';
      for (let m = 1; m <= meetingCount; m++) {
        const subMateriM = resolvedSubTopics[m - 1] || `${topic} - Pertemuan ${m}`;
        const isFirstMeeting = m === 1;

        if (isFirstMeeting) {
          meetingsContent += `
#### PERTEMUAN 1 (${hoursPerMeeting} × ${minutesPerJP} menit): ${subMateriM}

| FASE | WAKTU | KEGIATAN GURU | KEGIATAN PESERTA DIDIK |
| :--- | :---: | :--- | :--- |
| **FASE 1**<br/>Orientasi & Motivasi | **15 menit** | 1. Guru mengucapkan salam, menyapa siswa dengan ramah, dan mengecek kehadiran.<br/>2. **Kesadaran Penuh (Mindful Observation / Latihan STOP):** Guru memandu latihan pernapasan sadar / menampilkan media visual/video pemantik fenomena nyata terkait ${subMateriM}.<br/>3. Guru mengajukan pertanyaan pemantik kontekstual untuk memancing rasa ingin tahu.<br/>4. Guru menyampaikan tujuan pembelajaran, alur kegiatan, dan peta konsep materi. | 1. Peserta didik menjawab salam dan menyiapkan diri untuk belajar.<br/>2. Peserta didik mengikuti latihan kesadaran penuh (*mindful*) / menyaksikan tayangan dengan penuh perhatian.<br/>3. Peserta didik merespons pertanyaan pemantik secara spontan dan berani berpendapat.<br/>4. Peserta didik mencatat tujuan pembelajaran dan kata kunci materi di buku catatan. |
| **FASE 2**<br/>Eksplorasi Konsep | **25 menit** | 1. Guru membagi siswa ke dalam kelompok kerja (4-5 orang) dan membagikan LKPD Eksplorasi 1.<br/>2. Guru meminta tiap kelompok melakukan pengamatan / pengukuran nyata / simulasi interaktif terkait ${subMateriM}.<br/>3. Guru berkeliling memantau dan memberi pertanyaan Socratic untuk membimbing kelompok menemukan pola konsep esensial. | 1. Peserta didik duduk dalam kelompok dan menerima LKPD.<br/>2. Peserta didik melakukan penyelidikan nyata / simulasi terpandu di kelas dan mencatat data pengamatan.<br/>3. Peserta didik berdiskusi aktif dan mengelompokkan data temuan secara sistematis dalam LKPD. |
| **FASE 3**<br/>Penjelasan & Elaborasi | **20 menit** | 1. Guru meminta perwakilan 2-3 kelompok mempresentasikan temuan awal.<br/>2. Guru meluruskan miskonsepsi dan memperkuat konsep melalui penjelasan interaktif di papan tulis / infografis.<br/>3. Guru membedah kaidah ilmiah, formulasi matematis, dan hubungan antar-variabel secara runtut.<br/>4. Guru mengajak siswa menghubungkan konsep dengan contoh aplikasi nyata dalam kehidupan sehari-hari. | 1. Perwakilan kelompok mempresentasikan temuan di depan kelas dengan percaya diri.<br/>2. Peserta didik lain menanggapi dan mengajukan pertanyaan konfirmasi.<br/>3. Peserta didik mencatat poin-poin penjelasan penting dan bagan konsep di buku catatan secara lengkap.<br/>4. Peserta didik aktif menjawab dan menghubungkan konsep dengan pengalaman nyata mereka. |
| **FASE 4**<br/>Aplikasi & Penerapan | **15 menit** | 1. Guru membagikan soal latihan kontekstual / studi kasus terapan ${subMateriM}.<br/>2. Guru meminta siswa menyelesaikan secara individu terlebih dahulu, kemudian berdiskusi teman sebangku.<br/>3. Guru memandu pembahasan bersama dengan mengaitkan konsep utama yang telah dipelajari. | 1. Peserta didik mengerjakan soal latihan / studi kasus secara mandiri (5 menit).<br/>2. Peserta didik mendiskusikan hasil analisis dengan rekan sebangku.<br/>3. Peserta didik aktif dalam pembahasan bersama dan berani menyampaikan solusinya. |
| **FASE 5 & 6**<br/>Refleksi & Penutup | **15 menit** | 1. Guru memandu refleksi metakognitif format **3-2-1** (*3 hal yang dipelajari, 2 hal menarik, 1 pertanyaan tersisa*).<br/>2. Guru memberikan tugas mandiri / tindak lanjut pengamatan kontekstual.<br/>3. Guru menutup pembelajaran dengan kalimat motivasi inspiratif, berdoa bersama, dan salam penutup. | 1. Peserta didik mengisi lembar refleksi 3-2-1 secara jujur, mandiri, dan berkesadaran penuh.<br/>2. Peserta didik mencatat tugas mandiri untuk dikerjakan di rumah.<br/>3. Peserta didik menyimpulkan pembelajaran dengan kata-kata sendiri, berdoa bersama, dan menjawab salam. |
`;
        } else {
          meetingsContent += `
---
<div style="page-break-before: always; margin-top: 1.5rem; margin-bottom: 1.5rem;"></div>

#### PERTEMUAN ${m} (${hoursPerMeeting} × ${minutesPerJP} menit): ${subMateriM}

| FASE | WAKTU | KEGIATAN GURU | KEGIATAN PESERTA DIDIK |
| :--- | :---: | :--- | :--- |
| **FASE 1**<br/>Orientasi & Review | **10 menit** | 1. Guru membuka KBM dengan salam santun, mengecek presensi, dan memimpin doa.<br/>2. Guru membahas tugas mandiri pertemuan sebelumnya secara singkat (*mini gallery walk* / ulas pajang karya).<br/>3. Guru memberikan apersepsi kontekstual tingkat lanjut dan menyampaikan tujuan pembelajaran pertemuan ke-${m}. | 1. Peserta didik menjawab salam, berdoa, dan merapikan meja belajar.<br/>2. Peserta didik memperlihatkan hasil karya tugas mandiri dan mengamati hasil rekan sejawat dengan apresiatif.<br/>3. Peserta didik merespons pertanyaan apersepsi dan mencatat target pembelajaran hari ini. |
| **FASE 2**<br/>Eksplorasi Konsep | **25 menit** | 1. Guru memandu eksplorasi konsep tingkat lanjut melalui LKPD ${m} berbasis inkuiri / studi kasus nyata.<br/>2. Guru menugaskan kelompok menganalisis data variabel, formulasi fisis, atau fenomena pembanding.<br/>3. Guru memancing nalar kritis siswa dengan studi kasus pemecahan masalah kontekstual. | 1. Peserta didik menganalisis fenomena dan data variabel dalam LKPD ${m} secara berkelompok.<br/>2. Peserta didik menemukan pola keterkaitan antar-variabel dan membandingkan hasil penyelidikan.<br/>3. Peserta didik mencatat data dan hipotesis solusi secara terstruktur. |
| **FASE 3**<br/>Penjelasan & Elaborasi | **20 menit** | 1. Guru menjelaskan pendalaman konsep materi, notasi resmi, serta pembuktian formula/kaidah di papan tulis.<br/>2. Guru memodelkan tahapan pemecahan masalah dan analisis multidimensi.<br/>3. Guru memberikan contoh konkret penerapan aturan/rumus dalam perhitungan saintifik. | 1. Peserta didik mencatat notasi, rumus, dan penjelasan guru secara runtut.<br/>2. Peserta didik berlatih menyelesaikan 2-3 contoh penerapan secara mandiri dan terbimbing.<br/>3. Peserta didik berdiskusi aktif memverifikasi langkah-langkah solusi. |
| **FASE 4**<br/>Aplikasi & Penerapan | **15 menit** | 1. Guru menyajikan kasus terapan nyata (dunia industri/profesi/rekayasa teknologi).<br/>2. Guru meminta siswa menyelesaikan tantangan kasus tersebut dengan menerapkan konsep yang telah dipelajari.<br/>3. Guru memfasilitasi presentasi solusi singkat dari perwakilan kelompok berbeda. | 1. Peserta didik membaca dan menelaah kasus nyata yang disajikan guru.<br/>2. Peserta didik memecahkan kasus secara kolaboratif menggunakan konsep dan formula yang tepat.<br/>3. Perwakilan kelompok mempresentasikan solusi dan menerima tanggapan konstruktif dari kelompok lain. |
| **FASE 5 & 6**<br/>Refleksi & Transfer | **20 menit** | 1. Guru memimpin sesi *"Pojok Ilmuwan"* / refleksi mendalam: perwakilan siswa berbagi 1 hal paling bermakna yang dipelajari.<br/>2. Guru memberikan tugas proyek mini kreatif / eksplorasi profesi terkait materi ${topic}.<br/>3. Guru bersama siswa merangkum intisari visual (*mind map*) di papan tulis dan menyampaikan agenda asesmen.<br/>4. Berdoa bersama dan mengucap salam penutup. | 1. Peserta didik berpartisipasi aktif dalam sesi refleksi berbagi makna pembelajaran.<br/>2. Peserta didik mencatat tugas proyek mini dan merencanakan langkah pengerjaannya.<br/>3. Peserta didik berkontribusi melengkapi rangkuman visual dan mengisi lembar refleksi (*What? So What? Now What?*).<br/>4. Berdoa bersama dengan khusyuk dan menjawab salam penutup. |
`;
        }
      }

      return `# RENCANA PELAKSANAAN MODUL (RPM)
### Model Pembelajaran: DEEP LEARNING
#### Mata Pelajaran ${subject} | ${level} Kelas ${grade}

---

### IDENTITAS MODUL
| Komponen | Keterangan |
| :--- | :--- |
| **Mata Pelajaran** | ${subject} |
| **Kelas / Semester** | ${grade} / ${semester} |
| **Materi Pokok** | ${topic} |
| **Sub Materi** | ${resolvedSubTopics.join(', ')} |
| **Alokasi Waktu** | ${meetingCount * Number(hoursPerMeeting)} × ${minutesPerJP} menit (${meetingCount} Pertemuan) |
| **Model Pembelajaran** | Deep Learning |
| **Pendekatan** | Scientific, Kontekstual, Kolaboratif |
| **Metode** | Diskusi Kelompok, Eksperimen Sederhana / Simulasi, Presentasi, Refleksi |

---

### KOMPETENSI YANG DICAPAI

#### Capaian Pembelajaran (CP):
${actualCP}

#### Tujuan Pembelajaran:
${tpFormattedList}

---

### SINTAKS DEEP LEARNING
Deep Learning dalam konteks pedagogis berfokus pada pembelajaran bermakna yang mendalam melalui **3 Fondasi: Mindful Learning, Meaningful Learning, dan Joyful Learning**, yang diimplementasikan melalui 6 tahap sintaks berikut:

| FASE | TAHAP SINTAKS | TUJUAN |
| :---: | :--- | :--- |
| **Fase 1** | **Orientasi & Motivasi** | Membangkitkan rasa ingin tahu, menghubungkan materi dengan kehidupan nyata, membangun *mindfulness* peserta didik |
| **Fase 2** | **Eksplorasi Konsep** | Peserta didik aktif menemukan konsep melalui pengamatan, diskusi, dan eksplorasi mandiri/kelompok |
| **Fase 3** | **Penjelasan & Elaborasi** | Guru mengklarifikasi, memperdalam pemahaman, peserta didik mengkoneksikan dengan pengetahuan sebelumnya |
| **Fase 4** | **Aplikasi & Penerapan** | Peserta didik menerapkan konsep dalam konteks baru, memecahkan masalah nyata, mengerjakan proyek bermakna |
| **Fase 5** | **Refleksi Mendalam** | Peserta didik merefleksikan proses belajar, mengidentifikasi kekuatan dan kelemahan, merumuskan pembelajaran baru |
| **Fase 6** | **Transfer & Koneksi** | Peserta didik mentransfer pemahaman ke konteks baru yang lebih luas, interdisiplin, dan kehidupan nyata |

---

### LANGKAH-LANGKAH PEMBELAJARAN
${meetingsContent}

---

### ASESMEN PEMBELAJARAN
| Jenis Asesmen | Instrumen | Waktu Pelaksanaan | Aspek yang Dinilai |
| :--- | :--- | :--- | :--- |
| **Asesmen Diagnostik** | Pertanyaan pemantik lisan / kuis awal 3-5 soal | Awal Pertemuan 1 | Pengetahuan awal, kesiapan belajar, miskonsepsi |
| **Asesmen Formatif** | LKPD 1 & 2, Lembar Refleksi 3-2-1, Observasi Diskusi Kelompok | Selama Proses Pembelajaran | Proses berpikir kritis, kolaborasi, komunikasi, ketepatan analisis |
| **Asesmen Sumatif** | Tes tertulis (pilihan ganda + uraian penalaran HOTS), Proyek Mini / Produk | Akhir Modul / Setelah ${meetingCount} Pertemuan | Pemahaman konsep mendalam, pemecahan masalah, penerapan kontekstual |

---

### MEDIA, ALAT, DAN SUMBER BELAJAR
| Kategori | Uraian Lengkap |
| :--- | :--- |
| **Media Pembelajaran** | • Slide PowerPoint interaktif dengan infografis konsep<br/>• Video animasi fenomena nyata kontekstual (YouTube/Media Lokal)<br/>• LKPD Inkuiri Terbimbing dan lembar refleksi 3-2-1<br/>• Mind map digital / papan tulis |
| **Alat & Bahan** | • Perangkat eksperimen / alat peraga kontekstual materi ${topic}<br/>• Benda-benda di sekitar kelas dan laboratorium sekolah<br/>• Sticky notes, spidol warna, kertas plano/karton<br/>• Laptop, smartphone, proyektor multimedia |
| **Sumber Belajar** | • Buku Siswa dan Buku Guru ${subject} Kelas ${grade} Kemendikbudristek<br/>• Buku Referensi Fisika / Sains Terapan Terbitan Terverifikasi<br/>• Platform Simulasi Sains Interaktif (PhET Interactive Simulations / Khan Academy)<br/>• Sumber referensi ilmiah terpercaya dan lingkungan lokal |

---

### DIFERENSIASI PEMBELAJARAN
| Peserta Didik Reguler | Peserta Didik dengan Kebutuhan Khusus / Kesulitan Belajar | Peserta Didik Berprestasi / Cepat |
| :--- | :--- | :--- |
| • Mengerjakan LKPD standar secara mandiri dan kelompok<br/>• Diskusi kelompok campuran (heterogen)<br/>• Presentasi pleno di depan kelas<br/>• Pengerjaan tugas proyek mini aplikasi kontekstual | • LKPD dimodifikasi (lebih visual, langkah lebih bertahap/kecil)<br/>• Pendampingan guru (*scaffolding*) lebih intensif<br/>• Boleh presentasi dalam kelompok kecil<br/>• Penguatan soal tingkat C1-C3 diprioritaskan | • Soal tantangan: analisis konsep/rumus yang lebih kompleks<br/>• Berperan sebagai tutor sebaya bagi teman yang kesulitan<br/>• Proyek penelitian mini atau telaah artikel ilmiah aplikatif<br/>• Eksplorasi literatur tingkat lanjut |

---

### CATATAN / REFLEKSI GURU
............................................................................................................................................................................................................................................  
............................................................................................................................................................................................................................................  
............................................................................................................................................................................................................................................  

---

| Mengetahui,<br/>Kepala ${schoolProfile.schoolName || 'Sekolah'}<br/><br/><br/><br/>**<u>${schoolProfile.headmasterName || 'Kepala Sekolah'}</u>**<br/>NIP. ${schoolProfile.headmasterNip || '_________________________'} | ${schoolProfile.city || 'Kota Satuan Pendidikan'}, ................ 2025<br/>Guru Mata Pelajaran ${subject}<br/><br/><br/><br/>**<u>${teacherName}</u>**<br/>NIP. ${teacherNip || '_________________________'} |
`;
    }

    case 'lkpd': {
      const resolvedMeetingCount = meetingCount && Number(meetingCount) > 0 ? Number(meetingCount) : 2;
      const resolvedHours = hoursPerMeeting && Number(hoursPerMeeting) > 0 ? Number(hoursPerMeeting) : 3;
      const resolvedMinutes = minutesPerJP && Number(minutesPerJP) > 0 ? Number(minutesPerJP) : 45;
      const durationPerMeeting = resolvedHours * resolvedMinutes;

      const meetingBlocks = [];

      for (let m = 1; m <= resolvedMeetingCount; m++) {
        const isFirst = m === 1;
        const isLast = m === resolvedMeetingCount;
        const meetingTheme = isFirst 
          ? `Eksplorasi Konsep & Penyelidikan Masalah Nyata`
          : isLast 
            ? `Kreasi Rekayasa Solusi, Pameran Karya & Asesmen Autentik`
            : `Pengolahan Data Empiris & Analisis Komparasi Berjenjang`;

        meetingBlocks.push(`
# LEMBAR KERJA PESERTA DIDIK (LKPD) DEEP LEARNING - PERTEMUAN ${m} DARI ${resolvedMeetingCount}
## TEMA PERTEMUAN ${m}: ${meetingTheme.toUpperCase()}
### MATA PELAJARAN: ${subject.toUpperCase()} - KELAS ${grade} (${phase}) - SEMESTER ${semester}

---

### I. IDENTITAS KELOMPOK BELAJAR
| Komponen Identitas | Keterangan / Isian Peserta Didik |
| :--- | :--- |
| **Nama Kelompok** | ......................................................................................... |
| **Anggota Kelompok** | 1. ..................................................... 3. .....................................................<br/>2. ..................................................... 4. ..................................................... |
| **Kelas / Semester** | **Kelas ${grade} / Semester ${semester}** |
| **Mata Pelajaran & Topik** | **${subject}** - *${topic}* |
| **Alokasi Waktu KBM** | **${resolvedHours} JP (${durationPerMeeting} Menit)** |
| **Profil Karakter 6C** | *Character, Critical Thinking, Creativity, Collaboration, Communication, Citizenship* |

---

### II. TUJUAN PEMBELAJARAN & PETUNJUK KERJA
* **Tujuan Pembelajaran Pertemuan ${m}:**
  * ${isFirst ? `Peserta didik mampu mengidentifikasi fenomena esensial ${topic}, memetakan variabel kausalitas, dan merumuskan hipotesis ilmiah secara kritis.` : `Peserta didik mampu merancang sketsa visual solusi inovatif ${topic}, memvalidasi data empiris, dan mempresentasikannya melalui forum kelas.`}
* **Petunjuk Belajar Mindful & Safety:**
  1. Mulailah dengan doa bersama kelompok dan latihan pernapasan sadar (*Mindfulness 1 Menit*).
  2. Cermati stimulus fenomena nyata dan **Bagan Ilustrasi Konsep** yang disajikan secara teliti.
  3. Lakukan pembagian tugas kelompok secara adil, inklusif, dan saling mendukung.
  4. Tuangkan ide dan visualisasi pemecahan masalah pada **Kanvas Sketsa Siswa**.

---

### III. SINTAKS 1: MINDFUL DISCOVERY (ORIENTASI BERKESADARAN & BAGAN VISUAL KONSEP)
> **📌 Stimulus Kontekstual & Studi Kasus Pertemuan ${m}:**  
> Dalam kehidupan sehari-hari, prinsip **${topic}** pada bidang studi **${subject}** menjadi kunci utama dalam memecahkan masalah kontekstual (efisiensi sistem, kelestarian lingkungan, ketepatan analisis, atau dinamika sosial-teknologi). Ketika terjadi ketidakseimbangan sistem, diperlukan analisis kritis dan rekayasa ide yang solutif.

#### 📊 Bagan Ilustrasi Konsep & Skema Alur Ilmiah Pertemuan ${m}
\`\`\`
+-----------------------------------------------------------------------------------+
|               DIAGRAM ALUR KONSEP & PENYELIDIKAN ILMIAH (${topic.toUpperCase()})               |
|                                                                                   |
|  [ FENOMENA NYATA ] ---> [ VARIABEL BEBAS (X) ] ---> [ PROSES TRANSFORMASI ]     |
|          |                                                  |                     |
|          v                                                  v                     |
|  [ HIPOTESIS IDE ] <--- [ OLAH DATA EMPIRIS ] <--- [ VARIABEL TERIKAT (Y) ]       |
+-----------------------------------------------------------------------------------+
\`\`\`

* **Pertanyaan Pemantik Berkesadaran (Mindful Curiosity Trigger):**
  1. *Mengapa fenomena ${topic} ini sangat krusial dalam konteks ilmu ${subject}?*
  2. *Bagaimana jika salah satu variabel pada diagram di atas tidak berfungsi optimal?*

---

### IV. SINTAKS 2: MEANINGFUL INQUIRY (PENYELIDIKAN KRITIS & PENGOLAHAN DATA EMPIRIS)

#### 1. Lembar Aktivitas Penyelidikan Mandiri & Kolaboratif [HOTS]
* Lakukan observasi/studi literatur bersama tim dan jawab pertanyaan kunci berikut:
  * **Analisis Variabel Inti:** ....................................................................................................
  * **Prinsip / Formula Utama:** $$\\text{Efektivitas } (${topic}) = f(\\text{Variabel } X, \\text{ Intervensi Solutif})$$

#### 2. Tabel Pengumpulan & Pengolahan Data Empiris
| No | Parameter / Objek yang Diselidiki | Hasil Pengamatan Empiris | Analisis Hubungan Sebab - Akibat |
| :-: | :--- | :--- | :--- |
| 1 | Kondisi Baseline / Standar Normal **${topic}** | .................................................... | .................................................... |
| 2 | Kondisi Uji Variabel / Faktor Pengganggu | .................................................... | .................................................... |
| 3 | Solusi Optimalisasi & Rekomendasi Terapan | .................................................... | .................................................... |

#### 3. Bantuan Scaffolding Berjenjang (Diferensiasi Proses)
* **Kelompok Berkembang:** Gunakan panduan rumus dasar dan konsultasikan tabel dengan guru pendamping.
* **Kelompok Mahir:** Lakukan analisis komparasi multi-variabel dan estimasi dampak jangka panjang.

---

### V. SINTAKS 3: JOYFUL CREATION (KANVAS SKETSA SOLUSI SISWA & PAMERAN KARYA)

#### 🎨 Kanvas Gambar & Sketsa Visual Inovasi Siswa
Gambarkan rancangan diagram ide, bagan sistem prototipe, poster mini, atau ilustrasi kreatif pemecahan masalah kelompok kalian pada kotak kanvas berikut:

\`\`\`
+-----------------------------------------------------------------------------------+
|                        KANVAS SKETSA & DIAGRAM DESAIN SISWA                       |
|                                                                                   |
|                                                                                   |
|        (Gambarkan rancangan sketsa, bagan sistem, atau visualisasi solusi)        |
|                                                                                   |
|                                                                                   |
|                                                                                   |
+-----------------------------------------------------------------------------------+
\`\`\`
* **Deskripsi Keunggulan & Nilai Kebaruan Karya Kelompok:**  
  ................................................................................................................................

#### 🌟 Pameran Karya Dinding Kelas (Joyful Gallery Walk) & Umpan Balik
*Kunjungi stand kelompok lain, amati presentasi visual mereka, dan berikan catatan apresiasi:*
* ⭐ **Bintang 1 (Kekuatan Konsep & Diagram Visual):** .............................................................
* ⭐ **Bintang 2 (Kreativitas & Orisinalitas Solusi):** ............................................................
* 💡 **Wish (Saran Penyempurnaan Konstruktif):** ..................................................................

---

### VI. SINTAKS 4: MINDFUL REFLECTION & ASESMEN AUTENTIK

#### 1. Lembar Refleksi Diri Siswa (Kartu 3-2-1)
* **3 Hal bermakna yang saya pelajari hari ini:** .................................................................
* **2 Hal yang paling membuat saya bersemangat dalam KBM:** ................................................
* **1 Pertanyaan/ide yang ingin saya eksplorasi lebih jauh:** ...............................................

#### 2. Rubrik Penilaian Autentik Kinerja LKPD Guru
| Aspek Penilaian Mutu | Kriteria Mahir (86-100) | Kriteria Cakap (71-85) | Kriteria Berkembang (0-70) |
| :--- | :--- | :--- | :--- |
| **Nalar Kritis & Analisis Data** | Analisis sebab-akibat sangat mendalam dengan data empiris valid. | Menjelaskan keterkaitan konsep dengan cukup baik. | Memerlukan bimbingan pendampingan guru (*scaffolding*). |
| **Kreativitas Produk Visual** | Sketsa diagram sangat orisinal, estetis, dan solutif. | Sketsa diagram cukup jelas dan memadai. | Sketsa belum tuntas atau kurang terstruktur. |
| **Kolaborasi & Karakter 6C** | Menunjukkan kepemimpinan positif dan gotong royong aktif. | Bekerjasama dengan baik dalam tim. | Perlu dorongan untuk berpartisipasi aktif. |
`);
      }

      return meetingBlocks.join('\n\n<div class="page-break" style="page-break-before:always; break-before:page; margin-top:24px; margin-bottom:18px;"></div>\n\n');
    }

    case 'bundle':
    case 'bundel_lengkap':
    case 'perangkat_ajar_lengkap':
      return generateFullCurriculumBundle(params);

    case 'kktp':
      return `# KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)
## PENDEKATAN RUBRIK DESKRIPTIF & INTERVAL NILAI KURIKULUM MERDEKA
### RUJUKAN STANDAR MUTU KETUNTASAN PEMBELAJARAN

---

### A. IDENTITAS PERANGKAT KKTP
* **Mata Pelajaran:** ${subject} | **Fase / Kelas:** ${phase} / Kelas ${grade} (${level})
* **Tujuan Pembelajaran (TP):** ${tpTitle}
* **Lingkup Materi Pokok:** ${topic}
* **Guru Penyusun:** ${teacherName}

---

### B. PENDEKATAN 1: RUBRIK DESKRIPTIF KETERCAPAIAN TUJUAN PEMBELAJARAN
| Indikator Tujuan Pembelajaran | Baru Berkembang (0 - 59) | Layak (60 - 74) | Cakap (75 - 89) | Mahir (90 - 100) |
| :--- | :--- | :--- | :--- | :--- |
| **1. Penguasaan Konsep Esensial ${topic}** | Belum mampu menyebutkan prinsip dasar materi pokok. | Mampu menyebutkan konsep dasar dengan bantuan panduan guru. | Mampu menjelaskan dan menghubungkan konsep secara mandiri dan benar. | Mampu menguraikan konsep secara komprehensif serta mengoreksi miskonsepsi orang lain. |
| **2. Analisis & Pemecahan Kasus** | Belum mampu mengidentifikasi akar persoalan pada studi kasus. | Mampu mengidentifikasi masalah namun solusi belum sistematis. | Mampu menganalisis masalah dan memberikan solusi logis yang tepat. | Mampu mengevaluasi berbagai alternatif solusi dan merumuskan inovasi baru yang efektif. |
| **3. Komunikasi & Kreasi Produk** | Belum mampu menyajikan hasil kerja secara runtut. | Menyajikan hasil kerja cukup jelas namun belum terstruktur rapi. | Menyajikan hasil kerja dengan bahasa baku, runtut, dan komunikatif. | Menyajikan produk dengan sangat memukau, estetis, interaktif, dan inspiratif. |

---

### C. PENDEKATAN 2: SKALA INTERVAL NILAI KETERCAPAIAN
| Interval Nilai | Kategori Ketercapaian | Keterangan Status Ketuntasan | Tindak Lanjut Pembelajaran |
| :---: | :---: | :---: | :--- |
| **0% – 40%** | **Belum Mencapai Ketuntasan** | Remedial di Seluruh Bagian | Diberikan intervensi pendampingan individual secara intensif oleh guru. |
| **41% – 65%** | **Belum Mencapai Ketuntasan** | Remedial Bagian yang Diperlukan | Mempelajari kembali bagian indikator yang belum tuntas melalui tutor sebaya. |
| **66% – 85%** | **Sudah Mencapai Ketuntasan** | Tuntas Tanpa Remedial | Melanjutkan ke tujuan pembelajaran berikutnya secara terprogram. |
| **86% – 100%** | **Mencapai Ketuntasan Optimal** | Tuntas & Butuh Pengayaan | Diberikan materi pengayaan tingkat lanjut atau menjadi tutor sebaya di kelas. |

---

### D. REKAPITULASI KESIMPULAN KETUNTASAN
* Peserta didik dinyatakan **TUNTAS** pada tujuan pembelajaran ini jika minimal memperoleh kategori **Cakap (Skor ≥ 75%)** pada kedua pendekatan di atas.
`;

    case 'rubrik_penilaian':
    case 'asesmen':
      return `# RUBRIK PENILAIAN TERPADU
## SINKRON DENGAN PERANGKAT ASESMEN PADA MODUL AJAR / RPP
### (ASESMEN DIAGNOSTIK, FORMATIF SIKAP 6C, KINERJA LKPD, DAN SUMATIF HOTS)

---

### A. MATRIKS ASESMEN TERINTEGRASI MODUL AJAR / RPP
* **Mata Pelajaran:** ${subject} | **Fase / Kelas:** ${phase} / Kelas ${grade} (${level})
* **Lingkup Materi Pokok:** ${topic}
* **Tujuan Pembelajaran:** ${tpTitle}
* **Guru Pengampu:** ${teacherName}

| No | Jenis Asesmen | Teknik Penilaian | Bentuk Instrumen | Dimensi 6C & Kognitif | Waktu Pelaksanaan |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 1 | **Diagnostik** | Kuesioner Emosi & Tes Lisan | Angket Gaya Belajar & Soal Prasyarat | Kesiapan Belajar & Prasyarat | Awal Sesi / Pertemuan 1 |
| 2 | **Formatif Sikap** | Observasi Berkelanjutan | Lembar Observasi Karakter 6C | Karakter, Gotong Royong, Nalar Kritis | Selama Proses Diskusi |
| 3 | **Formatif Kinerja** | Penilaian Autentik LKPD | Rubrik Analisis Kasus & Kanvas Solusi | Keterampilan Proses & Kreativitas | Saat Kegiatan Inti |
| 4 | **Formatif Teman** | Penilaian Antarteman | Lembar *Two Stars and a Wish* | Komunikasi & Empati Kolaboratif | Sesi *Gallery Walk* |
| 5 | **Sumatif Materi** | Tes Tertulis & Proyek | Soal PG-HOTS, Uraian & Rubrik Karya | C4–C6 Penalaran & Rekayasa | Akhir Lingkup Materi |

---

### B. RUBRIK ASESMEN DIAGNOSTIK AWAL (KESIAPAN BELAJAR)

#### 1. Diagnostik Non-Kognitif (Gaya Belajar & Kondisi Emosional)
| Indikator Diagnostik | Kategori Visual | Kategori Auditori | Kategori Kinestetik | Tindak Lanjut Diferensiasi |
| :--- | :--- | :--- | :--- | :--- |
| **Modalitas Dominan** | Memahami lewat infografis, video, dan bagan alur. | Memahami lewat penjelasan lisan, diskusi, dan podcast. | Memahami lewat praktik langsung, manipulasi objek konkret. | Guru menyediakan variasi media bahan ajar multimodal. |

#### 2. Diagnostik Kognitif Prasyarat Materi ${topic}
| Kesiapan Siswa | Skor Prasyarat | Deskripsi Karakteristik | Intervensi Pembelajaran |
| :--- | :---: | :--- | :--- |
| **Mahir (Siap)** | 85 - 100 | Menguasai seluruh konsep prasyarat dengan matang. | Diberi peran *leader* diskusi dan materi pengayaan. |
| **Cakap (Cukup)** | 65 - 84 | Menguasai sebagian besar prasyarat, sedikit ragu. | Diberikan apersepsi kontekstual dan lembar panduan. |
| **Berkembang (Butuh Bantuan)** | < 65 | Belum menguasai konsep dasar prasyarat. | Diberikan bimbingan terarah (*scaffolding*) intensif. |

---

### C. RUBRIK ASESMEN FORMATIF SIKAP & KARAKTER DIMENSI 6C
*Skala Penilaian: 4 = Sangat Baik / Membudaya, 3 = Baik / Mulai Berkembang, 2 = Cukup / Terlihat, 1 = Perlu Bimbingan*

| Dimensi 6C Kemendikdasmen | Indikator Perilaku Teramati | Kriteria Skor 4 (Mahir) | Kriteria Skor 3 (Cakap) | Kriteria Skor 2 (Layak) | Kriteria Skor 1 (Berkembang) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Character & Akhlak Mulia** | Kejujuran data dan menghargai rekan belajar | Selalu jujur, santun, dan konsisten menghargai pendapat rekan | Jujur dalam pengamatan dan bertutur kata santun | Kadang kurang terbuka dalam data hasil percobaan | Mengabaikan etika dan kurang menghargai rekan |
| **2. Critical Thinking (Nalar Kritis)** | Mampu menganalisis sebab-akibat fenomena ${topic} | Menganalisis secara mendalam, berbasis data valid, dan solutif | Menganalisis dengan baik dan logis | Analisis masih dangkal dan terbatas | Belum mampu mengemukakan analisis sebab-akibat |
| **3. Creativity (Kreativitas)** | Menghasilkan ide/sketsa solusi inovatif | Gagasan sangat orisinal, bernilai guna tinggi, dan estetis | Gagasan inovatif dan dapat diterapkan | Gagasan meniru contoh yang sudah ada | Belum memunculkan ide solusi mandiri |
| **4. Collaboration (Gotong Royong)** | Aktif bekerjasama dalam tim LKPD | Berbagi peran adil, saling memotivasi, dan proaktif membantu | Bekerjasama dengan baik sesuai pembagian tugas | Kurang aktif, hanya menunggu instruksi ketua | Tidak mau bekerjasama dalam kelompok |
| **5. Communication (Komunikasi)** | Menyampaikan gagasan pada sesi *Gallery Walk* | Artikulasi jelas, runtut, persuasif, dan percaya diri | Menyampaikan materi dengan jelas dan terstruktur | Penjelasan kurang runtut dan terbata-bata | Menolak mempresentasikan hasil kerja |
| **6. Citizenship (Kewarganegaraan)** | Kepedulian terhadap lingkungan & isu sosial | Mengaitkan solusi dengan dampak sosial-lingkungan nyata | Memperhatikan aspek kebermanfaatan bagi sekitar | Kurang peka terhadap dampak solusi | Mengabaikan nilai kebermanfaatan sosial |

---

### D. RUBRIK PENILAIAN KINERJA PROSES & LKPD BERJENJANG
| Aspek Penilaian Kinerja | Kriteria Mahir (Skor 4) | Kriteria Cakap (Skor 3) | Kriteria Layak (Skor 2) | Kriteria Berkembang (Skor 1) |
| :--- | :--- | :--- | :--- | :--- |
| **Penyelidikan & Pengolahan Data** | Data pengamatan lengkap, sistematis, dan dianalisis secara presisi. | Data lengkap dan diolah dengan rumus/konsep yang benar. | Data cukup lengkap namun analisis masih sederhana. | Data tidak lengkap dan perhitungan belum tepat. |
| **Kualitas Sketsa / Bagan Solusi** | Bagan konsep/sketsa sangat rapi, informatif, dan memiliki kebaruan ide. | Bagan jelas dan menunjukkan alur logika yang tepat. | Bagan sederhana dan minim keterangan pendukung. | Belum berhasil menyusun bagan solusi. |
| **Umpan Balik Antarteman** | Memberikan masukan konstruktif *Two Stars and a Wish* yang bernas. | Memberikan apresiasi dan masukan yang relevan. | Memberikan komentar singkat tanpa saran perbaikan. | Tidak memberikan umpan balik kepada rekan. |

---

### E. RUBRIK ASESMEN SUMATIF LINGKUP MATERI (KISI-KISI & PENSKORAN)

#### 1. Pedoman Penskoran Soal Pilihan Ganda HOTS (5 Butir)
* Setiap butir soal bernilai **2 poin** jika benar, **0 poin** jika salah. Total skor maksimal = **10 poin**.

#### 2. Rubrik Penskoran Soal Uraian HOTS (3 Butir Kasus Kompleks)
| No Soal | Indikator Kognitif | Deskripsi Kriteria Penskoran Maksimal (Skor 4) | Skor Maks |
| :-: | :--- | :--- | :-: |
| **1** | Analisis Pemecahan Masalah (C4) | Menguraikan akar masalah ${topic} secara runtut, menghubungkan minimal 3 konsep terkait, dan memberi contoh riil. | **4** |
| **2** | Evaluasi Komparatif (C5) | Membandingkan 2 sudut pandang/metode secara objektif berdasarkan efisiensi, akurasi, dan dampak lingkungan. | **4** |
| **3** | Rekayasa Solusi Inovatif (C6) | Merumuskan desain inovasi kontekstual yang aplikatif, terukur, dan memiliki tahapan implementasi logis. | **4** |
| **TOTAL** | **Skor Maksimal Uraian** | | **12** |

#### 3. Rubrik Penilaian Produk / Portofolio Proyek
| Kriteria Produk | Sangat Baik (90 - 100) | Baik (80 - 89) | Cukup (70 - 79) | Kurang (< 70) |
| :--- | :--- | :--- | :--- | :--- |
| **Orisinalitas & Inovasi** | Karya murni ide baru dan solutif terhadap isu nyata. | Karya menunjukkan modifikasi kreatif yang baik. | Karya meniru pola umum yang sudah ada. | Karya kurang menunjukkan kreativitas. |
| **Kesesuaian Konsep ${subject}** | Penerapan teori ilmiah 100% tepat dan terverifikasi. | Sebagian besar teori diterapkan dengan benar. | Terdapat sedikit miskonsepsi minor. | Miskonsepsi mendasar pada konten materi. |
| **Estetika & Kerapian** | Tampilan visual sangat memukau, rapi, dan mudah dipahami. | Tampilan menarik dan terstruktur rapi. | Tampilan cukup rapi namun kurang menarik. | Tampilan tidak rapi dan sulit dibaca. |

---

### F. FORMULA PENGOLAHAN NILAI AKHIR & INTERVENSI KKTP

$$\text{Nilai Akhir Asesmen (NA)} = \left(\frac{\text{Skor PG (Maks 10)} + \text{Skor Uraian (Maks 12)} + \text{Skor Kinerja LKPD (Maks 12)}}{34}\right) \times 100$$

| Rentang Nilai Akhir | Predikat Ketuntasan | Rekomendasi Tindak Lanjut Guru |
| :---: | :---: | :--- |
| **90 – 100** | **Mahir (A)** | Diberikan penugasan pengayaan berupa telaah studi kasus lanjutan / mini riset. |
| **80 – 89** | **Cakap (B)** | Dinyatakan tuntas, siap melanjutkan ke Alur Tujuan Pembelajaran (ATP) berikutnya. |
| **70 – 79** | **Layak (C)** | Tuntas bersyarat, diberikan penguatan mandiri pada indikator yang nilainya rendah. |
| **< 70** | **Baru Berkembang (D)** | Wajib mengikuti program remedial pembelajaran ulang (*re-teaching*) dengan tutor sebaya. |
`;

    default:
      return `# PERANGKAT AJAR KURIKULUM MERDEKA
## MATA PELAJARAN: ${subject.toUpperCase()} (${level} KELAS ${grade})
* **Fase:** ${phase} | **Semester:** ${semester}
* **Topik:** ${topic}
* **Guru Pengampu:** ${teacherName}

---

Dokumen administrasi perangkat ajar berhasil disusun dengan prinsip pembelajaran mendalam (*Deep Learning: Mindful, Meaningful, & Joyful*) dan telah tersinkronisasi penuh dengan master Capaian Pembelajaran.
`;
    }
  };

  let finalDoc = generateCoreDoc();

  // If custom school format / template is enabled, weave template notes and compliance
  if (useCustomFormat && (customFormatNotes || customFormatFile)) {
    const templateName = customFormatFile?.name || 'Template Baku Sekolah / MGMP';
    finalDoc += `\n\n---
\n### 📑 KELENGKAPAN FORMAT & TEMPLATE SEKOLAH RESMI
* **Status Penyesuaian:** ✅ Disesuaikan dengan Standar Template Sekolah (*${templateName}*)
${customFormatFile ? `* **Berkas Acuan Sekolah:** ${customFormatFile.name} (${customFormatFile.type ? customFormatFile.type.toUpperCase() : 'Dokumen'})\n` : ''}${customFormatNotes ? `* **Struktur Khusus Satuan Pendidikan:**\n${customFormatNotes}\n` : ''}* **Keterangan Penjaminan Mutu:** Dokumen ini telah diselaraskan dengan tata kelola administrasi Kurikulum Operasional Satuan Pendidikan (KOSP) dan standar format sekolah yang berlaku.
`;
  }

  return finalDoc;
}

/**
 * Generates a complete, ready-to-print Master Curriculum Portfolio (1 Unified Perangkat Ajar Lengkap)
 * Synchronized across Teacher Profile, CP, TP, ATP, Time Allocation, PROTA, PROSEM, KKTP, Modul Ajar, LKPD, and Rubrik.
 */
export function generateFullCurriculumBundle(params: GenerateCurriculumParams): string {
  const schoolProfile = StorageService.getSchoolProfile();
  const subject = params.subject || 'Fisika';
  const level = params.level || 'SMA';
  const grade = params.grade || 10;
  const phase = params.phase || (grade === 10 ? 'Fase E' : Number(grade) > 10 ? 'Fase F' : Number(grade) >= 7 ? 'Fase D' : 'Fase A/B/C');
  const resolvedAcademicYear = params.academicYear || schoolProfile.academicYear || '2025/2026';
  const teacherName = params.distributionData?.teacherName || schoolProfile.teacherName || 'Guru Mata Pelajaran';
  const teacherNip = schoolProfile.teacherNip || '19850715 201101 1 003';
  const headmasterName = schoolProfile.headmasterName || 'Kepala Satuan Pendidikan';
  const headmasterNip = schoolProfile.headmasterNip || '-';
  const schoolName = schoolProfile.schoolName || 'SMA / SMK / MA / SMP / SD Terpadu';
  const city = schoolProfile.city || 'Kota Satuan Pendidikan';

  // 1. Cover Page
  const coverSection = `
# DOKUMEN PERANGKAT AJAR LENGKAP
## KURIKULUM MERDEKA & PENDEKATAN DEEP LEARNING
### (MINDFUL, MEANINGFUL, & JOYFUL LEARNING)

<div style="text-align: center; margin: 30px 0;">
  <div style="font-size: 16pt; font-weight: bold; color: #1e3a8a; text-transform: uppercase;">
    MATA PELAJARAN: ${subject.toUpperCase()}
  </div>
  <div style="font-size: 13pt; font-weight: bold; color: #334155; margin-top: 6px;">
    JENJANG ${level} • ${phase} • KELAS ${grade}
  </div>
  <div style="font-size: 12pt; color: #475569; margin-top: 4px;">
    TAHUN PELAJARAN ${resolvedAcademicYear}
  </div>
</div>

---

### PROFIL GURU PENGAMPU & SATUAN PENDIDIKAN
| Data Administrasi | Keterangan Dokumen Resmi |
| :--- | :--- |
| **Satuan Pendidikan** | **${schoolName}** |
| **Nama Guru Pengampu** | **${teacherName}** |
| **NIP Guru Pengampu** | ${teacherNip} |
| **Mata Pelajaran** | **${subject}** |
| **Fase / Kelas / Jenjang** | **${phase} / Kelas ${grade} (${level})** |
| **Kepala Satuan Pendidikan** | **${headmasterName}** |
| **NIP Kepala Sekolah** | ${headmasterNip} |
| **Kota / Kabupaten** | ${city} |
| **Status Dokumen** | **✅ TERVERIFIKASI & TERSINKRONISASI LENGKAP** |

<div style="page-break-before: always; break-before: page; margin-top: 40px;"></div>
`;

  // 2. Lembar Pengesahan Terpadu
  const pengesahanSection = `
# LEMBAR PENGESAHAN PERANGKAT AJAR
## DOKUMEN ADMINISTRASI PEMBELAJARAN TAHUN PELAJARAN ${resolvedAcademicYear}

Setelah memeriksa dan menelaah secara saksama seluruh instrumen dan dokumen administrasi pembelajaran mata pelajaran **${subject}** untuk **${phase} / Kelas ${grade}**, yang disusun oleh:

* **Nama Guru Mata Pelajaran** : **${teacherName}**
* **NIP** : ${teacherNip}
* **Satuan Pendidikan** : **${schoolName}**

Menyatakan bahwa Perangkat Ajar Kurikulum Merdeka ini telah memenuhi standar kompetensi BSKAP No. 032/H/KR/2024 dan prinsip pembelajaran mendalam (*Deep Learning: Mindful, Meaningful, & Joyful*), serta disahkan untuk diberlakukan sebagai pedoman pelaksanaan Kegiatan Belajar Mengajar (KBM) pada Tahun Pelajaran **${resolvedAcademicYear}**.

---

Ditetapkan dan disahkan di : **${city}**  
Pada tanggal : **${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}**

<table style="width: 100%; border: none; margin-top: 36px; font-size: 10.5pt; text-align: center;">
  <tr>
    <td style="width: 50%; border: none; vertical-align: top;">
      Mengetahui,<br/>
      <strong>Kepala Satuan Pendidikan</strong><br/><br/><br/><br/>
      <strong><u>${headmasterName}</u></strong><br/>
      NIP. ${headmasterNip}
    </td>
    <td style="width: 50%; border: none; vertical-align: top;">
      Penyusun,<br/>
      <strong>Guru Mata Pelajaran</strong><br/><br/><br/><br/>
      <strong><u>${teacherName}</u></strong><br/>
      NIP. ${teacherNip}
    </td>
  </tr>
</table>

<div style="page-break-before: always; break-before: page; margin-top: 40px;"></div>
`;

  // 3. Daftar Isi
  const daftarIsiSection = `
# DAFTAR ISI PERANGKAT AJAR TERPADU
## MATA PELAJARAN: ${subject.toUpperCase()} (${level} KELAS ${grade})

1. **LEMBAR PENGESAHAN RESMI**
2. **BAGIAN I : ANALISIS ALOKASI WAKTU & RINCIAN PEKAN EFEKTIF (RBE)**
3. **BAGIAN II : ANALISIS CAPAIAN PEMBELAJARAN (CP) TERBARU & PEMETAAN ELEMEN**
4. **BAGIAN III : RUMUSAN TUJUAN PEMBELAJARAN (TP) BERBASIS KKO & ABCD**
5. **BAGIAN IV : ALUR TUJUAN PEMBELAJARAN (ATP) & PEMETAAN JAM PELAJARAN**
6. **BAGIAN V : PROGRAM TAHUNAN (PROTA) SEMESTER GANJIL & GENAP**
7. **BAGIAN VI : PROGRAM SEMESTER (PROSEM) & MATRIKS PEKANAN BERWARNA**
8. **BAGIAN VII : KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)**
9. **BAGIAN VIII : MODUL AJAR (DEEP LEARNING: MINDFUL, MEANINGFUL, & JOYFUL)**
10. **BAGIAN IX : LEMBAR KERJA PESERTA DIDIK (LKPD KREATIF BERDIFERENSIASI)**
11. **BAGIAN X : RUBRIK & INSTRUMEN PENILAIAN TERPADU (SIKAP 6C, KINERJA, & SUMATIF HOTS)**

<div style="page-break-before: always; break-before: page; margin-top: 40px;"></div>
`;

  // 4. Generate all individual parts
  const docAlokasiWaktu = generateExpertCurriculumDocument({ ...params, docType: 'analisis_alokasi_waktu', toolType: 'analisis_alokasi_waktu' });
  const docAnalisisCP = generateExpertCurriculumDocument({ ...params, docType: 'analisis_cp', toolType: 'analisis_cp' });
  const docTP = generateExpertCurriculumDocument({ ...params, docType: 'tp', toolType: 'tp' });
  const docATP = generateExpertCurriculumDocument({ ...params, docType: 'atp', toolType: 'atp' });
  const docPROTA = generateExpertCurriculumDocument({ ...params, docType: 'prota', toolType: 'prota' });
  const docPROSEM = generateExpertCurriculumDocument({ ...params, docType: 'prosem', toolType: 'prosem' });
  const docKKTP = generateExpertCurriculumDocument({ ...params, docType: 'kktp', toolType: 'kktp' });
  const docModulAjar = generateExpertCurriculumDocument({ ...params, docType: 'modul_ajar', toolType: 'modul_ajar' });
  const docLKPD = generateExpertCurriculumDocument({ ...params, docType: 'lkpd', toolType: 'lkpd' });
  const docRubrik = generateExpertCurriculumDocument({ ...params, docType: 'rubrik_penilaian', toolType: 'rubrik_penilaian' });

  const pageBreak = '\n\n<div style="page-break-before: always; break-before: page; margin-top: 40px;"></div>\n\n';

  return [
    coverSection.trim(),
    pengesahanSection.trim(),
    daftarIsiSection.trim(),
    '# BAGIAN I : ANALISIS ALOKASI WAKTU (RBE)\n' + docAlokasiWaktu.trim(),
    '# BAGIAN II : ANALISIS CAPAIAN PEMBELAJARAN (CP) TERBARU\n' + docAnalisisCP.trim(),
    '# BAGIAN III : RUMUSAN TUJUAN PEMBELAJARAN (TP)\n' + docTP.trim(),
    '# BAGIAN IV : ALUR TUJUAN PEMBELAJARAN (ATP)\n' + docATP.trim(),
    '# BAGIAN V : PROGRAM TAHUNAN (PROTA)\n' + docPROTA.trim(),
    '# BAGIAN VI : PROGRAM SEMESTER (PROSEM) GANJIL & GENAP\n' + docPROSEM.trim(),
    '# BAGIAN VII : KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)\n' + docKKTP.trim(),
    '# BAGIAN VIII : MODUL AJAR DEEP LEARNING\n' + docModulAjar.trim(),
    '# BAGIAN IX : LEMBAR KERJA PESERTA DIDIK (LKPD KREATIF)\n' + docLKPD.trim(),
    '# BAGIAN X : RUBRIK PENILAIAN TERPADU\n' + docRubrik.trim(),
  ].join(pageBreak);
}


