import React, { useState, useRef } from 'react';
import {
  FileUp,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckSquare,
  Square,
  Trash2,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  AlertCircle,
  Eye,
  Layers,
  Upload,
} from 'lucide-react';
import { UniversalFileParser, FileCategory } from '../lib/universalFileParser';

export interface CustomFormatFile {
  name: string;
  size: number;
  type: FileCategory | string;
  mimeType: string;
  base64?: string;
  extractedText?: string;
  tableMarkdown?: string;
  previewUrl?: string;
  sheetNames?: string[];
  summaryText?: string;
}

export interface CustomFormatConfig {
  useCustomFormat: boolean;
  formatFile: CustomFormatFile | null;
  customFormatNotes: string;
}

interface CustomFormatSelectorProps {
  value: CustomFormatConfig;
  onChange: (config: CustomFormatConfig) => void;
  docTypeName?: string;
  docTypeId?: string;
  compact?: boolean;
}

export const DOCUMENT_PRESETS: Record<string, { id: string; label: string; notes: string }[]> = {
  analisis_cp: [
    {
      id: 'analisis_cp_tabel',
      label: 'Format Tabel Analisis CP & Elemen Sekolah',
      notes: `1. IDENTITAS PERANGKAT (Satuan Pendidikan, Mapel, Fase/Kelas, Semester, Tahun Pelajaran)
2. CAPAIAN PEMBELAJARAN (CP) RESMI
3. DEKOMPOSISI ELEMEN & ANALISIS KOMPETENSI ESENSIAL (Tabel: No, Elemen CP, Kalimat CP, Kompetensi HOTS, Materi Esensial)
4. INTEGRASI 3 PILAR DEEP LEARNING (Mindful, Meaningful, Joyful Learning)
5. PEMETAAN DIMENSI PROFIL PELAJAR PANCASILA
6. STRATEGI PEMBELAJARAN BERDIFERENSIASI (Konten, Proses, Produk)`,
    },
    {
      id: 'analisis_cp_mgmp',
      label: 'Format Analisis CP Standar MGMP / MKKS',
      notes: `A. RASIONAL & CAPAIAN PEMBELAJARAN FASE
B. PEMETAAN ELEMEN CAPAIAN & KOMPETENSI KUNCI
C. ANALISIS MATERI POKOK ESENSIAL & ALOKASI WAKTU
D. INDIKATOR CAPAIAN PEMBELAJARAN
E. RENCANA PENILAIAN & ASESMEN AUTENTIK`,
    },
  ],
  tp: [
    {
      id: 'tp_abcd',
      label: 'Format TP Komponen ABCD & Taksonomi Bloom',
      notes: `1. IDENTITAS SATUAN PENDIDIKAN & MATA PELAJARAN
2. CAPAIAN PEMBELAJARAN FASE / KELAS
3. TABEL RUMUSAN TUJUAN PEMBELAJARAN (TP):
   - Kode TP
   - Rumusan TP (Komponen: Audience, Behavior, Condition, Degree)
   - Kata Kerja Operasional (KKO Bloom HOTS)
   - Dimensi Profil Pelajar Pancasila
   - Pemahaman Bermakna (Deep Meaning)`,
    },
    {
      id: 'tp_elemen',
      label: 'Format TP Matriks Elemen & Kompetensi',
      notes: `A. TUJUAN PEMBELAJARAN ELEMEN PEMAHAMAN KONSEPTUAL
B. TUJUAN PEMBELAJARAN ELEMEN KETERAMPILAN PROSES
C. TUJUAN PEMBELAJARAN SIKAP & PROFIL PANCASILA
D. INDIKATOR KETERCAPAIAN TUJUAN PEMBELAJARAN (IKTP)`,
    },
  ],
  atp: [
    {
      id: 'atp_matriks',
      label: 'Format Matriks ATP & Alokasi JP Sekolah',
      notes: `1. IDENTITAS ATP (Fase, Kelas, Mapel, Alokasi Total Jam Pertahun)
2. CAPAIAN PEMBELAJARAN PER ELEMEN
3. TABEL ALUR TUJUAN PEMBELAJARAN (ATP):
   - No Urut / Tahap
   - Kode & Rumusan TP
   - Lingkup Materi Esensial
   - Alokasi Waktu (JP)
   - Pendekatan Deep Learning & Model Pembelajaran
   - Profil Pelajar Pancasila
   - Glosarium & Kata Kunci`,
    },
    {
      id: 'atp_kronologis',
      label: 'Format Bagan Alur Tahapan Kronologis',
      notes: `A. TAHAP 1: PENGUASAAN KONSEP DASAR (SEMESTER 1)
B. TAHAP 2: APLIKASI & ANALISIS MASALAH KONTEKSTUAL (SEMESTER 1)
C. TAHAP 3: INVESTIGASI & EKSPERIMEN MENDALAM (SEMESTER 2)
D. TAHAP 4: KREASI SOLUSI, PROYEK & REFLEKSI AKHIR (SEMESTER 2)`,
    },
  ],
  prota: [
    {
      id: 'prota_standar',
      label: 'Format PROTA Tabel Distribusi JP Sekolah',
      notes: `1. KOP RESMI SEKOLAH & IDENTITAS PROGRAM TAHUNAN
2. PERHITUNGAN ALOKASI WAKTU EFEKTIF PER TAHUN
3. TABEL DISTRIBUSI ALOKASI PROTA:
   - Semester (Ganjil & Genap)
   - Nomor Bab / Lingkup Materi
   - Alur Tujuan Pembelajaran (ATP / TP)
   - Alokasi Jam Pelajaran (JP)
   - Keterangan Waktu Asesmen & Cadangan
4. REKAPITULASI TOTAL JP & PENGESAHAN KEPALA SEKOLAH`,
    },
  ],
  prosem: [
    {
      id: 'prosem_matriks',
      label: 'Format PROSEM Matriks Pekan Efektif Bulanan Berwarna',
      notes: `1. IDENTITAS PROGRAM SEMESTER (Semester Ganjil / Genap, Mapel, Kelas/Fase, Alokasi Total JP & JP/Pekan, Guru Pengampu)
2. TABEL MATRIKS PROSEM BERWARNA SINKRON KALPEN:
   - Kolom: No | ATP | LINGKUP MATERI | JP | BULAN (Januari/Juli dst: Minggu 1, 2, 3, 4)
   - Sinkronisasi Agenda Kaldik Berwarna:
     * 🔴 [LIBUR] Pekan Libur Resmi (Full Kolom Merah)
     * 🟢 [KBM ...] Tatap Muka KBM Efektif (Hijau)
     * 🟠 [MPLS] Masa Pengenalan Lingkungan Sekolah (Oranye)
     * 🟡 [ASTS] Asesmen Sumatif Tengah Semester (Kuning)
     * 🔵 [P5] Pekan Projek Kokurikuler P5 (Biru)
     * 🟣 [ASAS] Asesmen Sumatif Akhir Semester/Tahun (Ungu)
     * ⚪ [RAPOR] Pengolahan Nilai & Pembagian Rapor (Abu-abu)
3. LEGENDA KODE WARNA MATRIKS PROSEM
4. TANDA TANGAN PENYUSUN & KEPALA SEKOLAH`,
    },
  ],
  modul_ajar: [
    {
      id: 'rpm_deep_learning_fase_f',
      label: 'Format Master RPM Berbasis Deep Learning (8 Bagian A-H Rinci)',
      notes: `A. IDENTITAS MODUL (Nama Guru, Sekolah, Tahun Ajaran, Mata Pelajaran, Kelas/Semester, Topik/Materi, Sub Topik, Alokasi Waktu, Jumlah Peserta Didik)
B. KOMPETENSI AWAL & IDENTIFIKASI PESERTA DIDIK:
   1. Kompetensi Awal (Prasyarat pengetahuan & keterampilan)
   2. Profil & Identifikasi Peserta Didik (Tabel Profil Belajar Visual/Auditori/Kinestetik, Tingkat Kemampuan, Pengetahuan Awal, Motivasi, Hambatan, Kebutuhan Khusus)
C. DESAIN PEMBELAJARAN:
   1. Capaian Pembelajaran (CP)
   2. Tujuan Pembelajaran (C1-C5)
   3. Indikator Pencapaian Kompetensi (IPK) (Tabel Ranah Bloom, Indikator, Level LOTS/MOTS/HOTS)
   4. Materi Pembelajaran (Materi Inti, Materi Pengayaan, Materi Remedial)
   5. Pendekatan, Model, Metode, Strategi Diferensiasi, Karakter 6C
D. LANGKAH-LANGKAH PEMBELAJARAN (Tabel 4 Kolom: Tahap, Kegiatan Guru, Kegiatan Siswa, Waktu):
   - Pendahuluan (Orientasi, Apersepsi Kontekstual Lokal, Motivasi & Tujuan)
   - Kegiatan Inti 4 Fase:
     * Fase 1: Stimulasi & Tanya Jawab (Mindful Learning)
     * Fase 2: Eksplorasi Konsep (Meaningful Learning)
     * Fase 3: Diskusi Kelompok (Collaborative Inquiry)
     * Fase 4: Presentasi & Konfirmasi (Deep Reflection)
   - Penutup (Simpulan, Refleksi 3-2-1, Tugas Mandiri, Doa)
E. ASESMEN PEMBELAJARAN:
   1. Tabel Jenis, Teknik, dan Instrumen Asesmen (Diagnostik, Formatif Proses, Formatif Hasil, Formatif Mandiri, Sumatif, Refleksi)
   2. Instrumen Asesmen Formatif (Contoh Soal Kontekstual & HOTS)
   3. Rubrik Penilaian LKPD (Skor 1-4, Predikat, Tindak Lanjut)
   4. Lembar Observasi Diskusi Kelompok (Keaktifan, Kerja Sama, Komunikasi, Kritis/Kreatif)
F. MEDIA DAN SUMBER BELAJAR:
   1. Media Pembelajaran | 2. Sumber Belajar | 3. Tabel Alat dan Bahan (No, Alat/Bahan, Jumlah, Keterangan)
G. PROGRAM REMEDIAL DAN PENGAYAAN:
   1. Tabel Program Remedial (IPK, Bentuk Kegiatan, Strategi Scaffolding, Media, Tutor Sebaya, Asesmen Ulang)
   2. Tabel Program Pengayaan (Topik, Bentuk Kegiatan, Proyek Infografis/Video, Soal Tantangan HOTS, Eksplorasi Digital)
H. REFLEKSI GURU (Tabel 7 Pertanyaan Refleksi Guru & Catatan Evaluasi Keterlaksanaan KBM)`,
    },
    {
      id: 'rpm_sistematika_standar',
      label: 'Format RPM Lengkap (Sistematika Standar 9 Komponen)',
      notes: `1. IDENTITAS MODUL: Nama Penyusun, Satuan Pendidikan, Mata Pelajaran, Kelas/Semester, Alokasi Waktu
2. KOMPETENSI AWAL & PROFIL PELAJAR PANCASILA (Prasyarat & Dimensi Profil)
3. SARANA, PRASARANA, DAN TARGET PESERTA DIDIK (Reguler, Kesulitan Belajar, Cepat)
4. TUJUAN PEMBELAJARAN (KKO Terukur & HOTS)
5. PEMAHAMAN BERMAKNA & PERTANYAAN PEMANTIK (Kontekstual Dunia Nyata)
6. KEGIATAN PEMBELAJARAN (Tabel Skenario: Fase, Alokasi Waktu, Kegiatan Guru, Kegiatan Siswa)
   - Pendahuluan (Apersepsi, Orientasi, Tujuan)
   - Kegiatan Inti (Sintaks Model: Deep Learning / PBL Berdiferensiasi)
   - Penutup (Refleksi 3-2-1, Rangkuman, Doa, Tindak Lanjut)
7. ASESMEN / PENILAIAN (Diagnostik, Formatif, Sumatif)
8. PENGAYAAN & REMEDIAL
9. LAMPIRAN (LKPD Singkat & Rubrik Penilaian)`,
    },
    {
      id: 'rpm_deep_learning_master',
      label: 'Format Master RPM Deep Learning (Sintaks 6 Fase)',
      notes: `A. IDENTITAS MODUL (Mata Pelajaran, Kelas/Semester, Materi Pokok, Sub Materi, Alokasi Waktu, Model, Pendekatan, Metode)
B. KOMPETENSI YANG DICAPAI:
   - Capaian Pembelajaran (CP) Komprehensif
   - Tujuan Pembelajaran (5 Poin Terukur & HOTS)
C. SINTAKS (Desain Pembelajaran DEEP LEARNING):
   - Matriks 6 Fase (Fase 1 Orientasi & Motivasi s/d Fase 6 Transfer & Koneksi)
   - Tabel Skenario Pembelajaran per Pertemuan:
     | FASE | WAKTU | KEGIATAN GURU | KEGIATAN PESERTA DIDIK |
     * Pertemuan 1: Fase 1 s/d Fase 4, Fase 5 & 6 Refleksi & Penutup (Refleksi 3-2-1)
     * Pertemuan 2: Fase 1 s/d Fase 4, Fase 5 & 6 Refleksi & Transfer (Pojok Ilmuwan, Mini Poster)
D. ASESMEN PEMBELAJARAN (Tabel: Asesmen Diagnostik, Formatif, Sumatif)
E. MEDIA, ALAT, DAN SUMBER BELAJAR (Media, Alat & Bahan, Sumber Belajar)
F. DIFERENSIASI PEMBELAJARAN (Reguler, Kesulitan Belajar, Berprestasi/Cepat)
CATATAN / REFLEKSI GURU & LEMBAR PENGESAHAN TANDA TANGAN`,
    },
    {
      id: 'modul_sekolah',
      label: 'Format Modul Sekolah (3 Komponen Utama)',
      notes: `BAGIAN I: IDENTITAS DAN INFORMASI UMUM
- Nama Sekolah, Mata Pelajaran, Kelas/Semester, Alokasi Waktu, Nama Guru
- Kompetensi Awal, Profil Pelajar Pancasila, Sarana & Prasarana, Target Siswa, Model Pembelajaran

BAGIAN II: KOMPONEN INTI
- Tujuan Pembelajaran (TP)
- Pemahaman Bermakna & Pertanyaan Pemantik
- Kegiatan Pembelajaran (Pendahuluan, Inti Berdiferensiasi [Mindful, Meaningful, Joyful], Penutup)
- Asesmen (Diagnostik, Formatif, Sumatif) & Rubrik
- Remedial dan Pengayaan

BAGIAN III: LAMPIRAN
- Bahan Bacaan Guru & Siswa, Lembar Kerja (LKPD), Glosarium, Daftar Pustaka`,
    },
    {
      id: 'rpp_1_lembar',
      label: 'Format RPP Efektif 1 Lembar',
      notes: `A. IDENTITAS PROGRAM:
- Sekolah, Mata Pelajaran, Kelas/Fase, Alokasi Waktu, Materi Pokok

B. TUJUAN PEMBELAJARAN (Komponen ABCD & Deep Learning)

C. LANGKAH-LANGKAH KEGIATAN PEMBELAJARAN:
1. Pendahuluan (Apersepsi, Mindful Breathing, Motivasi)
2. Kegiatan Inti (Eksplorasi Konsep, Kolaborasi Kelompok, Studi Kasus Nyata)
3. Penutup (Refleksi Bersama, Tindak Lanjut, Doa)

D. PENILAIAN / ASESMEN (Sikap, Pengetahuan, Keterampilan)`,
    },
  ],
  lkpd: [
    {
      id: 'lkpd_eksploratif',
      label: 'Format LKPD Eksploratif 4 Langkah',
      notes: `1. KOP LKPD SEKOLAH, IDENTITAS SISWA / KELOMPOK, KELAS & MAPEL
2. TUJUAN PEMBELAJARAN & PETUNJUK PENGERJAAN
3. STIMULUS / STUDI KASUS KONTEKSTUAL (Cerita Nyata, Grafik, atau Fenomena)
4. LANGKAH-LANGKAH AKTIVITAS SISWA (Hands-on / Eksplorasi Berdiferensiasi)
5. PERTANYAAN ANALISIS BERPIKIR TINGKAT TINGGI (HOTS)
6. KESIMPULAN & LEMBAR REFLEKSI DIRI SISWA`,
    },
    {
      id: 'lkpd_bertingkat',
      label: 'Format LKPD Bertingkat (Tiered Assignment)',
      notes: `A. TINGKAT DASAR (Mengenal konsep & pengamatan langsung)
B. TINGKAT MENENGAH (Menganalisis data & memecahkan masalah kelompok)
C. TINGKAT MAHIR / PENGAYAAN (Merancang inovasi solusi & studi kasus terbuka)`,
    },
  ],
  kktp: [
    {
      id: 'kktp_rubrik',
      label: 'Format KKTP Rubrik Deskripsi Kualitatif 4 Kriteria',
      notes: `1. IDENTITAS KKTP (Mapel, Kelas, Fase, Semester, TP Pokok)
2. TABEL RUBRIK KRITERIA KETUNTASAN:
   - Aspek / Indikator Penilaian
   - Kategori 1: Perlu Bimbingan (0 - 65) -> Intervensi Khusus
   - Kategori 2: Cukup (66 - 75) -> Bimbingan Bagian Tertentu
   - Kategori 3: Baik (76 - 88) -> Tuntas Sesuai Harapan
   - Kategori 4: Sangat Baik / Mahir (89 - 100) -> Pengayaan / Akselerasi
3. TINDAK LANJUT HASIL KKTP (Remedial & Pengayaan)`,
    },
    {
      id: 'kktp_interval',
      label: 'Format KKTP Skala Interval Nilai & Deskripsi',
      notes: `A. TARGET CAPAIAN PEMBELAJARAN & INDIKATOR
B. TABEL INTERVAL PERSENTASE KETERCAPAIAN (0-40%, 41-65%, 66-85%, 86-100%)
C. KRITERIA KELULUSAN & REKOMENDASI GURU`,
    },
  ],
  asesmen: [
    {
      id: 'asesmen_3_jenis',
      label: 'Format Asesmen Komprehensif (Diagnostik, Formatif, Sumatif)',
      notes: `BAGIAN 1: ASESMEN DIAGNOSTIK NON-KOGNITIF & KOGNITIF AWAL
BAGIAN 2: ASESMEN FORMATIF (Lembar Observasi Sikap, Ceklis Diskusi, & Kuis Pemahaman Cepat)
BAGIAN 3: ASESMEN SUMATIF LINGKUP MATERI:
- Kisi-Kisi Penulisan Soal HOTS
- Naskah Soal Pilihan Ganda & Uraian Kontekstual
- Kunci Jawaban & Rubrik Pedoman Penskoran
BAGIAN 4: LEMBAR REFLEKSI GURU & SISWA`,
    },
    {
      id: 'asesmen_kisi_soal',
      label: 'Format Kisi-Kisi & Kartu Soal HOTS Standar Sekolah',
      notes: `1. KOP ASESMEN & PETUNJUK UMUM
2. TABEL KISI-KISI ASESMEN (CP, TP, Materi, Indikator Soal, Bentuk Soal, Level Kognitif L1/L2/L3, No Soal)
3. NASKAH BUTIR SOAL HOTS
4. RUBRIK PENILAIAN KINERJA & TUGAS PROYEK`,
    },
  ],
};

export const TEMPLATE_PRESETS = [
  {
    id: 'rpm_deep_learning_master',
    label: 'Format Master RPM Deep Learning (Sintaks 6 Fase)',
    notes: `1. IDENTITAS MODUL (Mata Pelajaran, Kelas/Semester, Materi Pokok, Sub Materi, Alokasi Waktu, Model, Pendekatan, Metode)
2. KOMPETENSI YANG DICAPAI:
   - Capaian Pembelajaran (CP) Komprehensif
   - Tujuan Pembelajaran (5 Poin Terukur & HOTS)
3. SINTAKS DEEP LEARNING (Tabel 6 Fase: Fase 1 Orientasi & Motivasi s/d Fase 6 Transfer & Koneksi)
4. TABEL SKENARIO PEMBELAJARAN PER PERTEMUAN:
   - Kolom: | FASE | WAKTU | KEGIATAN GURU | KEGIATAN PESERTA DIDIK |
   - Pertemuan 1 & Pertemuan 2 (Fase 1 s/d Fase 6 Lengkap dengan Waktu, Pertanyaan Pemantik, LKPD Inkuiri, Refleksi 3-2-1, dan Doa)
5. ASESMEN PEMBELAJARAN (Tabel: Asesmen Diagnostik, Formatif, Sumatif)
6. MEDIA, ALAT, DAN SUMBER BELAJAR
7. TABEL DIFERENSIASI PEMBELAJARAN (Reguler, Kesulitan Belajar, Berprestasi/Cepat)
8. CATATAN / REFLEKSI GURU & LEMBAR PENGESAHAN TANDA TANGAN`,
  },
  {
    id: 'modul_sekolah',
    label: 'Format Modul Sekolah (3 Bagian)',
    notes: `BAGIAN I: IDENTITAS DAN INFORMASI UMUM
- Nama Sekolah, Mata Pelajaran, Kelas/Semester, Alokasi Waktu, Nama Guru Pengampu
- Kompetensi Awal, Profil Pelajar Pancasila, Sarana & Prasarana, Target Siswa, Model Pembelajaran

BAGIAN II: KOMPONEN INTI
- Tujuan Pembelajaran (TP)
- Pemahaman Bermakna & Pertanyaan Pemantik
- Kegiatan Pembelajaran (Pendahuluan, Inti Berdiferensiasi [Mindful, Meaningful, Joyful], Penutup)
- Asesmen (Diagnostik, Formatif, Sumatif) & Rubrik
- Remedial dan Pengayaan

BAGIAN III: LAMPIRAN
- Bahan Bacaan Guru & Siswa, Lembar Kerja (LKPD), Glosarium, Daftar Pustaka`,
  },
  {
    id: 'rpp_1_lembar',
    label: 'Format RPP Efektif 1 Lembar',
    notes: `A. IDENTITAS PROGRAM:
- Sekolah, Mata Pelajaran, Kelas/Fase, Alokasi Waktu, Materi Pokok

B. TUJUAN PEMBELAJARAN (Komponen ABCD & Deep Learning)

C. LANGKAH-LANGKAH KEGIATAN PEMBELAJARAN:
1. Pendahuluan (Apersepsi, Mindful Breathing, Motivasi)
2. Kegiatan Inti (Eksplorasi Konsep, Kolaborasi Kelompok, Studi Kasus Nyata)
3. Penutup (Refleksi Bersama, Tindak Lanjut, Doa)

D. PENILAIAN / ASESMEN (Sikap, Pengetahuan, Keterampilan)`,
  },
  {
    id: 'mgmp_mkks',
    label: 'Format Standar MGMP / MKKS',
    notes: `1. KOP RESMI PERANGKAT AJAR SEKOLAH
2. CAPAIAN PEMBELAJARAN & ELEMEN
3. TUJUAN PEMBELAJARAN & INDIKATOR KETERCAPAIAN
4. MATERI ESENSIAL & SUMBER BELAJAR
5. SKENARIO PEMBELAJARAN BERDIFERENSIASI
6. INSTRUMEN ASESMEN & SOAL HOTS
7. LEMBAR REFLEKSI GURU DAN PESERTA DIDIK`,
  },
];

export const CustomFormatSelector: React.FC<CustomFormatSelectorProps> = ({
  value,
  onChange,
  docTypeName = 'Perangkat Ajar',
  docTypeId,
  compact = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Pick presets tailored specifically to the active document type (1 to 9)
  const activePresets =
    docTypeId && DOCUMENT_PRESETS[docTypeId]
      ? DOCUMENT_PRESETS[docTypeId]
      : TEMPLATE_PRESETS;

  const handleToggle = () => {
    const nextState = !value.useCustomFormat;
    const defaultNotes = activePresets.length > 0 ? activePresets[0].notes : TEMPLATE_PRESETS[0].notes;
    onChange({
      ...value,
      useCustomFormat: nextState,
      customFormatNotes:
        nextState && !value.customFormatNotes
          ? defaultNotes
          : value.customFormatNotes,
    });
  };

  const processFile = async (file: File) => {
    setIsReadingFile(true);
    try {
      const parsed = await UniversalFileParser.parseFile(file);
      const newFile: CustomFormatFile = {
        name: parsed.fileName,
        size: parsed.fileSize,
        type: parsed.category,
        mimeType: parsed.mimeType,
        base64: parsed.base64,
        extractedText: parsed.extractedText,
        tableMarkdown: parsed.tableMarkdown,
        sheetNames: parsed.sheetNames,
        summaryText: parsed.summaryText,
        previewUrl: parsed.previewUrl,
      };

      onChange({
        ...value,
        useCustomFormat: true,
        formatFile: newFile,
        customFormatNotes:
          value.customFormatNotes ||
          parsed.summaryText ||
          `Format Acuan Dokumen: Mengikuti struktur bab, tata letak, dan komponen yang ada pada file lampiran "${parsed.fileName}".`,
      });
    } catch (err) {
      console.error('Failed to read format file:', err);
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    onChange({
      ...value,
      formatFile: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyPreset = (presetNotes: string) => {
    onChange({
      ...value,
      customFormatNotes: presetNotes,
    });
  };

  return (
    <div
      className={`rounded-2xl border transition-all ${
        value.useCustomFormat
          ? 'bg-slate-900/95 border-indigo-500/60 shadow-lg shadow-indigo-950/40'
          : 'bg-slate-950/80 border-slate-800 text-slate-400'
      } p-4 space-y-3.5`}
    >
      {/* Checkbox Header */}
      <div className="flex items-start justify-between gap-3">
        <label
          htmlFor="checkbox-custom-format"
          onClick={handleToggle}
          className="flex items-start space-x-2.5 cursor-pointer select-none group flex-1"
        >
          <div className="mt-0.5 shrink-0">
            {value.useCustomFormat ? (
              <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/50">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-md border border-slate-600 group-hover:border-indigo-400 bg-slate-900 transition flex items-center justify-center" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 flex items-center gap-1.5">
              <span>Buat Perangkat Sesuai Format / Template Sekolah Sendiri</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PDF • Word • JPG
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Centang untuk mengunggah atau menyesuaikan format/sistematika khusus yang digunakan di sekolah Anda agar AI menyusun {docTypeName} persis seperti acuan sekolah.
            </p>
          </div>
        </label>
      </div>

      {/* Expanded Controls when Checked */}
      {value.useCustomFormat && (
        <div className="space-y-3.5 pt-2 border-t border-slate-800/80 animate-in fade-in duration-200">
          {/* File Upload Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-300 flex items-center space-x-1.5">
                <FileUp className="w-3.5 h-3.5 text-indigo-400" />
                <span>Upload File Format Perangkat Ajar Sekolah (PDF / Word / JPG / PNG):</span>
              </label>
              {value.formatFile && (
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  File format siap dipakai AI
                </span>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              id="input-format-file"
              accept=".pdf,.docx,.doc,.dotx,.xlsx,.xls,.csv,.tsv,.ods,.pptx,.ppt,.txt,.md,.rtf,.html,.xml,.json,.jpg,.jpeg,.png,.webp,.bmp"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {!value.formatFile ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-xl border-2 border-dashed transition cursor-pointer flex flex-col items-center justify-center text-center space-y-2 ${
                  dragActive
                    ? 'border-indigo-400 bg-indigo-950/40 text-indigo-200 scale-[0.99]'
                    : 'border-slate-700 hover:border-indigo-500/60 bg-slate-950/70 hover:bg-slate-900/90 text-slate-400'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  {isReadingFile ? (
                    <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    Klik untuk memilih file format sekolah atau Tarik (Drag & Drop) ke sini
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex flex-wrap items-center justify-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-blue-950 border border-blue-500/30 text-blue-300 font-semibold">Word (.docx/.doc)</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300 font-semibold">Excel (.xlsx/.xls/.csv)</span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-950 border border-rose-500/30 text-rose-300 font-semibold">PDF (.pdf)</span>
                    <span className="px-1.5 py-0.5 rounded bg-purple-950 border border-purple-500/30 text-purple-300 font-semibold">Gambar / Scan</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-semibold">Teks / PPT</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Attached File Card */
              <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/40 flex items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    {value.formatFile.type === 'pdf' ? (
                      <span className="text-[10px] font-black text-rose-400">PDF</span>
                    ) : value.formatFile.type === 'word' ? (
                      <span className="text-[10px] font-black text-blue-400">DOCX</span>
                    ) : value.formatFile.type === 'excel' ? (
                      <span className="text-[10px] font-black text-emerald-400">XLSX</span>
                    ) : value.formatFile.type === 'powerpoint' ? (
                      <span className="text-[10px] font-black text-amber-400">PPT</span>
                    ) : value.formatFile.type === 'image' ? (
                      <ImageIcon className="w-4 h-4 text-purple-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-indigo-400" />
                    )}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      <span className="truncate">{value.formatFile.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-900/60 text-indigo-300 font-mono">
                        {(value.formatFile.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {value.formatFile.summaryText ||
                        `Format terdeteksi: ${String(value.formatFile.type).toUpperCase()} • AI akan meniru format ini`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  {value.formatFile.previewUrl && (
                    <button
                      type="button"
                      onClick={() => setShowPreviewModal(true)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Lihat Pratinjau Gambar Format"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                    title="Hapus / Ganti File Format"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Format Presets */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
              <span>Pilihan Sistematika Cepat ({docTypeName}):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activePresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.notes)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800/80 hover:bg-indigo-600 hover:text-white text-slate-300 border border-slate-700 transition active:scale-95"
                >
                  + {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Format Structure Textarea */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center justify-between">
              <span>Sistematika / Komponen Format Perangkat Ajar Sekolah:</span>
              <span className="text-[10px] text-slate-500 font-normal">Bisa disesuaikan manual</span>
            </label>
            <textarea
              rows={compact ? 3 : 4}
              value={value.customFormatNotes}
              onChange={(e) =>
                onChange({
                  ...value,
                  customFormatNotes: e.target.value,
                })
              }
              placeholder="Tuliskan urutan bab, judul komponen, tabel, atau petunjuk format sekolah..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs font-mono leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showPreviewModal && value.formatFile?.previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                <span>Pratinjau Format: {value.formatFile.name}</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800"
              >
                ✕ Tutup
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-xl bg-slate-950 p-2 flex justify-center">
              <img
                src={value.formatFile.previewUrl}
                alt="Pratinjau Format Sekolah"
                className="max-h-full object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
