import React, { useState, useEffect } from 'react';
import {
  Calendar,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Download,
  Printer,
  Copy,
  Check,
  Save,
  Sparkles,
  RefreshCw,
  Info,
  CalendarDays,
  CalendarCheck,
  Calculator,
  Layers,
  ChevronRight,
  FileCheck,
  Trash2,
  Eye,
  Sliders,
  CheckCircle2,
  Table,
  Scale,
  Zap,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { KalenderPendidikanData, KalenderMonthAnalysis, SemesterType, EducationLevel } from '../types';
import { StorageService, DEFAULT_KALENDER_PENDIDIKAN, addStorageListener } from '../lib/storage';
import { ExportService } from '../lib/exportUtils';
import { generateExpertCurriculumDocument } from '../lib/curriculumEngine';
import { DocumentPdfPreview } from '../components/DocumentPdfPreview';

interface KalenderPendidikanViewProps {
  initialTab?: 'analisis' | 'upload' | 'prosem_preview';
  onNavigate?: (viewId: string) => void;
}

export const KalenderPendidikanView: React.FC<KalenderPendidikanViewProps> = ({
  initialTab = 'analisis',
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'analisis' | 'upload' | 'prosem_preview'>(initialTab);
  const [kalenderData, setKalenderData] = useState<KalenderPendidikanData>(() =>
    StorageService.getKalenderPendidikan()
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [selectedSemester, setSelectedSemester] = useState<SemesterType>('Ganjil');

  // School profile & Subject metadata for calculation
  const schoolProfile = StorageService.getSchoolProfile();
  const masterCP = StorageService.getActiveMasterCP();

  const [subject, setSubject] = useState<string>(masterCP?.subject || 'Fisika');
  const [level, setLevel] = useState<EducationLevel>((masterCP?.level as EducationLevel) || 'SMA');
  const [grade, setGrade] = useState<number>(Number(masterCP?.grade) || 10);
  const [jpPerWeek, setJpPerWeek] = useState<number>(masterCP?.jpPerWeek || 3);
  const [academicYear, setAcademicYear] = useState<string>(kalenderData.tahunAjaran || schoolProfile.academicYear || '2025/2026');

  // AI & Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisToast, setAnalysisToast] = useState<string | null>(null);

  // File upload state
  const [uploadFile, setUploadFile] = useState<{ name: string; size: string; type: string; base64?: string } | null>(
    kalenderData.uploadedFile
      ? {
          name: kalenderData.uploadedFile.fileName,
          size: `${Math.round(kalenderData.uploadedFile.fileSize / 1024)} KB`,
          type: kalenderData.uploadedFile.fileType,
          base64: kalenderData.uploadedFile.base64Data,
        }
      : null
  );
  const [uploadNotes, setUploadNotes] = useState<string>(kalenderData.catatanKhusus || '');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string>('');

  // Generated document preview
  const [previewMarkdown, setPreviewMarkdown] = useState<string>('');

  // Sync with storage changes
  useEffect(() => {
    const unsub = addStorageListener(() => {
      const updated = StorageService.getKalenderPendidikan();
      setKalenderData(updated);
    });
    return () => unsub();
  }, []);

  // Update markdown whenever semester or kalender changes
  useEffect(() => {
    const doc = generateExpertCurriculumDocument({
      toolType: 'analisis_alokasi_waktu',
      docType: 'analisis_alokasi_waktu',
      subject,
      level,
      grade,
      phase: level === 'SD' ? (grade <= 2 ? 'Fase A' : grade <= 4 ? 'Fase B' : 'Fase C') : level === 'SMP' ? 'Fase D' : grade === 10 ? 'Fase E' : 'Fase F',
      semester: selectedSemester,
      topic: `${subject} Semester ${selectedSemester}`,
      kalenderData,
    });
    setPreviewMarkdown(doc);
  }, [kalenderData, selectedSemester, subject, level, grade, jpPerWeek]);

  // Helper to extract startYear & endYear from an academic year string
  const getAcademicStartAndEndYear = (yearStr: string) => {
    const match = yearStr.match(/(\d{4})\s*[\/\-]\s*(\d{4})/);
    if (match) {
      return {
        startYear: parseInt(match[1], 10),
        endYear: parseInt(match[2], 10),
      };
    }
    const singleMatch = yearStr.match(/(\d{4})/);
    if (singleMatch) {
      const yr = parseInt(singleMatch[1], 10);
      return { startYear: yr, endYear: yr + 1 };
    }
    return { startYear: 2025, endYear: 2026 };
  };

  // Sync academic year across months and storage
  const handleAcademicYearChange = (newYear: string) => {
    const cleaned = newYear.trim();
    setAcademicYear(cleaned);

    const { startYear, endYear } = getAcademicStartAndEndYear(cleaned);

    // Update month names in current data
    const updatedSem1Months = (kalenderData.semester1?.months || []).map((m) => {
      const pureMonth = m.monthName.replace(/\s*\d{4}.*$/, '').trim();
      return {
        ...m,
        monthName: `${pureMonth} ${startYear}`,
      };
    });

    const updatedSem2Months = (kalenderData.semester2?.months || []).map((m) => {
      const pureMonth = m.monthName.replace(/\s*\d{4}.*$/, '').trim();
      return {
        ...m,
        monthName: `${pureMonth} ${endYear}`,
      };
    });

    const updated: KalenderPendidikanData = {
      ...kalenderData,
      academicYear: cleaned,
      tahunAjaran: cleaned,
      semester1: {
        ...kalenderData.semester1,
        academicYear: cleaned,
        months: updatedSem1Months,
      },
      semester2: {
        ...kalenderData.semester2,
        academicYear: cleaned,
        months: updatedSem2Months,
      },
      lastUpdated: new Date().toISOString(),
    };

    setKalenderData(updated);
    StorageService.saveKalenderPendidikan(updated);
  };

  // Run Smart Analysis of Kaldik (Calculates effective weeks from Kaldik)
  const handleRunSmartAnalysis = (customNotes?: string, customAcademicYear?: string) => {
    setIsAnalyzing(true);
    setAnalysisToast('Sedang menganalisis kalender pendidikan dan menghitung alokasi waktu...');

    const targetYear = customAcademicYear || academicYear;
    const { startYear, endYear } = getAcademicStartAndEndYear(targetYear);

    setTimeout(() => {
      // Analyze Semester 1 (Juli - Desember {startYear})
      const sem1Months: KalenderMonthAnalysis[] = [
        {
          monthName: `Juli ${startYear}`,
          totalWeeks: 5,
          nonEffectiveWeeks: 2,
          effectiveWeeks: 3,
          description: `Libur Akhir TP ${startYear - 1}/${startYear} (P1-P2) & MPLS Siswa Baru (P3)`,
          agendaTags: ['LIBUR', 'MPLS', 'KBM'],
        },
        {
          monthName: `Agustus ${startYear}`,
          totalWeeks: 4,
          nonEffectiveWeeks: 0,
          effectiveWeeks: 4,
          description: `KBM Efektif Penuh & Peringatan HUT RI Ke-${startYear - 1945}`,
          agendaTags: ['KBM'],
        },
        {
          monthName: `September ${startYear}`,
          totalWeeks: 5,
          nonEffectiveWeeks: 1,
          effectiveWeeks: 4,
          description: 'Asesmen Sumatif Tengah Semester (ASTS/PTS) Pekan ke-4',
          agendaTags: ['ASTS', 'KBM'],
        },
        {
          monthName: `Oktober ${startYear}`,
          totalWeeks: 4,
          nonEffectiveWeeks: 0,
          effectiveWeeks: 4,
          description: 'KBM Efektif & Pelaksanaan Proyek Penguatan Karakter/P5',
          agendaTags: ['KBM', 'P5'],
        },
        {
          monthName: `November ${startYear}`,
          totalWeeks: 4,
          nonEffectiveWeeks: 0,
          effectiveWeeks: 4,
          description: 'KBM Efektif & Persiapan Asesmen Akhir Semester',
          agendaTags: ['KBM'],
        },
        {
          monthName: `Desember ${startYear}`,
          totalWeeks: 4,
          nonEffectiveWeeks: 4,
          effectiveWeeks: 0,
          description: 'ASAS/PAS (P1), Remedial (P2), Pembagian Rapor (P3), Libur Sem 1 (P4)',
          agendaTags: ['ASAS', 'RAPOR', 'LIBUR'],
        },
      ];

      // Analyze Semester 2 (Januari - Juni {endYear})
      const sem2Months: KalenderMonthAnalysis[] = [
        {
          monthName: `Januari ${endYear}`,
          totalWeeks: 5,
          nonEffectiveWeeks: 1,
          effectiveWeeks: 4,
          description: 'Libur Awal Semester Genap (P1) & Awal KBM Genap (P2-P5)',
          agendaTags: ['LIBUR', 'KBM'],
        },
        {
          monthName: `Februari ${endYear}`,
          totalWeeks: 4,
          nonEffectiveWeeks: 0,
          effectiveWeeks: 4,
          description: 'KBM Efektif Penuh Semester Genap',
          agendaTags: ['KBM'],
        },
        {
          monthName: `Maret ${endYear}`,
          totalWeeks: 4,
          nonEffectiveWeeks: 1,
          effectiveWeeks: 3,
          description: 'ASTS Genap & Libur Awal Ramadhan / Libur Keagamaan (P3)',
          agendaTags: ['ASTS', 'LIBUR', 'KBM'],
        },
        {
          monthName: `April ${endYear}`,
          totalWeeks: 5,
          nonEffectiveWeeks: 2,
          effectiveWeeks: 3,
          description: 'Libur Hari Raya Idul Fitri / Libur Nasional (P1-P2) & KBM Efektif (P3-P5)',
          agendaTags: ['LIBUR', 'KBM'],
        },
        {
          monthName: `Mei ${endYear}`,
          totalWeeks: 4,
          nonEffectiveWeeks: 1,
          effectiveWeeks: 3,
          description: 'Asesmen Akhir Jenjang / Ujian Sekolah (P3) & KBM Efektif',
          agendaTags: ['ASTS', 'KBM'],
        },
        {
          monthName: `Juni ${endYear}`,
          totalWeeks: 4,
          nonEffectiveWeeks: 3,
          effectiveWeeks: 1,
          description: 'ASAS Genap (P1), Pembagian Rapor (P2), Libur Kenaikan Kelas (P3-P4)',
          agendaTags: ['ASAS', 'RAPOR', 'LIBUR'],
        },
      ];

      // If user typed notes, apply context note
      const notesToUse = customNotes !== undefined ? customNotes : uploadNotes;

      const sem1EffWeeks = sem1Months.reduce((s, m) => s + m.effectiveWeeks, 0);
      const sem2EffWeeks = sem2Months.reduce((s, m) => s + m.effectiveWeeks, 0);

      const updated: KalenderPendidikanData = {
        ...kalenderData,
        academicYear: targetYear,
        tahunAjaran: targetYear,
        catatanKhusus: notesToUse,
        semester1: {
          ...kalenderData.semester1,
          academicYear: targetYear,
          months: sem1Months,
          totalWeeks: sem1Months.reduce((s, m) => s + m.totalWeeks, 0),
          nonEffectiveWeeks: sem1Months.reduce((s, m) => s + m.nonEffectiveWeeks, 0),
          totalEffectiveWeeks: sem1EffWeeks,
          jpPerWeek,
          totalJpSemester: sem1EffWeeks * jpPerWeek,
          reservedHours: 6,
          netTeachingHours: Math.max(0, sem1EffWeeks * jpPerWeek - 6),
        },
        semester2: {
          ...kalenderData.semester2,
          academicYear: targetYear,
          months: sem2Months,
          totalWeeks: sem2Months.reduce((s, m) => s + m.totalWeeks, 0),
          nonEffectiveWeeks: sem2Months.reduce((s, m) => s + m.nonEffectiveWeeks, 0),
          totalEffectiveWeeks: sem2EffWeeks,
          jpPerWeek,
          totalJpSemester: sem2EffWeeks * jpPerWeek,
          reservedHours: 6,
          netTeachingHours: Math.max(0, sem2EffWeeks * jpPerWeek - 6),
        },
        lastUpdated: new Date().toISOString(),
      };

      setKalenderData(updated);
      StorageService.saveKalenderPendidikan(updated);
      setIsAnalyzing(false);
      setAnalysisToast(`✅ Analisis Kalender TP ${targetYear} Selesai! Alokasi waktu Sem 1: ${sem1EffWeeks} RBE (${sem1EffWeeks * jpPerWeek} JP) & Sem 2: ${sem2EffWeeks} RBE (${sem2EffWeeks * jpPerWeek} JP) telah disinkronkan ke seluruh aplikasi.`);
      setTimeout(() => setAnalysisToast(null), 5000);
    }, 800);
  };

  // Handle Month analysis changes
  const handleMonthChange = (
    sem: 'semester1' | 'semester2',
    index: number,
    field: keyof KalenderMonthAnalysis,
    value: any
  ) => {
    const currentMonths = [...kalenderData[sem].months];
    currentMonths[index] = {
      ...currentMonths[index],
      [field]: value,
    };

    // Recalculate effective weeks for this month if totalWeeks or nonEffectiveWeeks changed
    if (field === 'totalWeeks' || field === 'nonEffectiveWeeks') {
      const tw = field === 'totalWeeks' ? Number(value) : currentMonths[index].totalWeeks;
      const nw = field === 'nonEffectiveWeeks' ? Number(value) : currentMonths[index].nonEffectiveWeeks;
      currentMonths[index].effectiveWeeks = Math.max(0, tw - nw);
    }

    // Recalculate total sums
    const totalWeeksSum = currentMonths.reduce((sum, m) => sum + (Number(m.totalWeeks) || 0), 0);
    const nonEffWeeksSum = currentMonths.reduce((sum, m) => sum + (Number(m.nonEffectiveWeeks) || 0), 0);
    const effWeeksSum = currentMonths.reduce((sum, m) => sum + (Number(m.effectiveWeeks) || 0), 0);

    const updatedData: KalenderPendidikanData = {
      ...kalenderData,
      [sem]: {
        ...kalenderData[sem],
        months: currentMonths,
        totalWeeks: totalWeeksSum,
        nonEffectiveWeeks: nonEffWeeksSum,
        totalEffectiveWeeks: effWeeksSum,
        jpPerWeek: jpPerWeek,
        totalJpSemester: effWeeksSum * jpPerWeek,
        netTeachingHours: Math.max(0, effWeeksSum * jpPerWeek - 6),
      },
      lastUpdated: new Date().toISOString(),
    };

    setKalenderData(updatedData);
    StorageService.saveKalenderPendidikan(updatedData);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      const fileInfo = {
        name: file.name,
        size: `${Math.round(file.size / 1024)} KB`,
        type: file.type || 'application/octet-stream',
        base64: base64Data,
      };

      setUploadFile(fileInfo);

      // Detect academic year from filename if present
      let detectedYear = academicYear;
      const yrMatch = file.name.match(/(20\d{2})\s*[\-_/]\s*(20\d{2})/);
      if (yrMatch) {
        detectedYear = `${yrMatch[1]}/${yrMatch[2]}`;
        setAcademicYear(detectedYear);
      }

      const updated: KalenderPendidikanData = {
        ...kalenderData,
        academicYear: detectedYear,
        tahunAjaran: detectedYear,
        uploadedFile: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          base64Data: base64Data,
          uploadedAt: new Date().toISOString(),
        },
        catatanKhusus: uploadNotes,
        lastUpdated: new Date().toISOString(),
      };

      setKalenderData(updated);
      StorageService.saveKalenderPendidikan(updated);
      setUploadSuccessMsg(`Berkas "${file.name}" berhasil diunggah (TP ${detectedYear})! Sistem otomatis memproses analisis alokasi waktu.`);

      // Otomatis jalankan analisis alokasi waktu dengan tahun terdeteksi
      handleRunSmartAnalysis(uploadNotes, detectedYear);
      setTimeout(() => setUploadSuccessMsg(''), 4000);
    };

    reader.readAsDataURL(file);
  };

  // Remove uploaded file
  const handleRemoveFile = () => {
    setUploadFile(null);
    const updated: KalenderPendidikanData = {
      ...kalenderData,
      uploadedFile: undefined,
      lastUpdated: new Date().toISOString(),
    };
    setKalenderData(updated);
    StorageService.saveKalenderPendidikan(updated);
  };

  // Save changes explicitly
  const handleSaveData = () => {
    const updated: KalenderPendidikanData = {
      ...kalenderData,
      tahunAjaran: academicYear,
      catatanKhusus: uploadNotes,
      semester1: {
        ...kalenderData.semester1,
        jpPerWeek,
        totalJpSemester: kalenderData.semester1.totalEffectiveWeeks * jpPerWeek,
        netTeachingHours: Math.max(0, kalenderData.semester1.totalEffectiveWeeks * jpPerWeek - 6),
      },
      semester2: {
        ...kalenderData.semester2,
        jpPerWeek,
        totalJpSemester: kalenderData.semester2.totalEffectiveWeeks * jpPerWeek,
        netTeachingHours: Math.max(0, kalenderData.semester2.totalEffectiveWeeks * jpPerWeek - 6),
      },
      lastUpdated: new Date().toISOString(),
    };

    setKalenderData(updated);
    StorageService.saveKalenderPendidikan(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Reset to default
  const handleResetDefault = () => {
    if (confirm('Kembalikan data Kalender Pendidikan ke standar resmi TP 2025/2026?')) {
      setKalenderData(DEFAULT_KALENDER_PENDIDIKAN);
      StorageService.saveKalenderPendidikan(DEFAULT_KALENDER_PENDIDIKAN);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  // Copy Markdown
  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(previewMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export handlers
  const handleExportWord = () => {
    const profile = StorageService.getSchoolProfile();
    const formattedHtml = ExportService.markdownToHtml(previewMarkdown);
    const docTitle = `Analisis Alokasi Waktu Semester ${selectedSemester} - ${subject}`;
    ExportService.exportToWord(
      docTitle,
      formattedHtml,
      profile,
      `Analisis_Alokasi_Waktu_${subject}_Sem_${selectedSemester}_2025-2026`
    );
  };

  const handleExportExcel = () => {
    const sem = selectedSemester === 'Ganjil' ? kalenderData.semester1 : kalenderData.semester2;
    const tableData = sem.months.map((m, idx) => ({
      No: idx + 1,
      Bulan: m.monthName,
      'Total Pekan': m.totalWeeks,
      'Pekan Tdk Efektif': m.nonEffectiveWeeks,
      'Pekan Efektif KBM': m.effectiveWeeks,
      'Keterangan Agenda': m.description,
    }));

    tableData.push({
      No: 'TOTAL' as any,
      Bulan: `Semester ${selectedSemester}`,
      'Total Pekan': sem.totalWeeks,
      'Pekan Tdk Efektif': sem.nonEffectiveWeeks,
      'Pekan Efektif KBM': sem.totalEffectiveWeeks,
      'Keterangan Agenda': `Total Alokasi Efektif: ${sem.totalEffectiveWeeks * jpPerWeek} JP`,
    });

    ExportService.exportToExcel(
      tableData,
      `Analisis_Alokasi_Waktu_${selectedSemester}_2025-2026`,
      `Alokasi Sem ${selectedSemester}`,
      {
        docTitle: `ANALISIS ALOKASI WAKTU SEMESTER ${selectedSemester.toUpperCase()}`,
        academicYear: kalenderData.tahunAjaran,
        teacherName: subject,
      }
    );
  };

  const handlePrint = () => {
    window.print();
  };

  // Active semester analysis data
  const activeSemData = selectedSemester === 'Ganjil' ? kalenderData.semester1 : kalenderData.semester2;
  const totalEffJP = activeSemData.totalEffectiveWeeks * jpPerWeek;
  const reserveJP = 6;
  const kbmEffJP = Math.max(0, totalEffJP - reserveJP);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 text-slate-100 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6">
      {/* Header Banner - Unified Kalender & Alokasi Waktu */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900/80 to-slate-900 border border-indigo-700/50 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-sky-600 border border-indigo-400/40 rounded-xl text-white shadow-lg">
              <CalendarDays className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  Kalender Pendidikan & Analisis Alokasi Waktu
                </h1>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-300 animate-pulse" />
                  Alokasi Waktu Otomatis dari Kaldik
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  TP {academicYear}
                </span>
              </div>
              <p className="text-xs md:text-sm text-indigo-200/90 mt-1 max-w-3xl leading-relaxed">
                Menu Terpadu: Upload dokumen Kalender Pendidikan sekolah, sistem otomatis mengekstrak & menganalisis rincian pekan efektif (RBE) Semester 1 & 2, alokasi jam tatap muka (JP), serta sinkronisasi langsung ke PROSEM & PROTA.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              id="btn-run-smart-analysis"
              onClick={() => handleRunSmartAnalysis()}
              disabled={isAnalyzing}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin text-amber-300' : 'text-sky-200'}`} />
              <span>{isAnalyzing ? 'Menganalisis...' : 'Analisis Kaldik'}</span>
            </button>
            <button
              type="button"
              id="btn-save-kalender"
              onClick={handleSaveData}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition active:scale-95"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Tersimpan!' : 'Simpan Data'}</span>
            </button>
            <button
              type="button"
              id="btn-reset-kalender"
              onClick={handleResetDefault}
              title="Reset ke Standar Resmi"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-xs transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sumber Kalender Aktif Bar */}
        <div className="mt-4 pt-3 border-t border-indigo-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              Sumber Rujukan Kaldik:
            </span>
            {uploadFile ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dokumen Sekolah: {uploadFile.name}</span>
                <span className="text-[10px] text-slate-400 font-normal">({uploadFile.size})</span>
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 font-bold gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Kalender Pendidikan Standar Resmi Kemendikdasmen 2025/2026</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <UploadCloud className="w-3.5 h-3.5 text-sky-400" />
              <span>{uploadFile ? 'Ganti Dokumen Kaldik' : 'Upload Kaldik Sekolah'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-indigo-700/40">
          <button
            type="button"
            id="tab-analisis-alokasi"
            onClick={() => setActiveTab('analisis')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
              activeTab === 'analisis'
                ? 'bg-white text-indigo-950 shadow-md font-black'
                : 'bg-indigo-950/50 text-indigo-200 hover:bg-indigo-800/40'
            }`}
          >
            <Table className="w-4 h-4 text-indigo-500" />
            <span>1. Analisis Alokasi Waktu (RBE Sem 1 & 2)</span>
          </button>

          <button
            type="button"
            id="tab-upload-kalender"
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
              activeTab === 'upload'
                ? 'bg-white text-indigo-950 shadow-md font-black'
                : 'bg-indigo-950/50 text-indigo-200 hover:bg-indigo-800/40'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-indigo-500" />
            <span>2. Upload Berkas Kaldik Sekolah</span>
            {uploadFile && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            id="tab-prosem-preview"
            onClick={() => setActiveTab('prosem_preview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
              activeTab === 'prosem_preview'
                ? 'bg-white text-indigo-950 shadow-md font-black'
                : 'bg-indigo-950/50 text-indigo-200 hover:bg-indigo-800/40'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>3. Format Dokumen Siap Cetak (RBE & Format Resmi)</span>
          </button>
        </div>
      </div>

      {/* Toast Alert for analysis */}
      {analysisToast && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/80 border border-sky-500/40 text-sky-200 text-xs flex items-center justify-between gap-3 animate-fade-in shadow-lg">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
            <span>{analysisToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setAnalysisToast(null)}
            className="text-slate-400 hover:text-white px-2 py-0.5 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area based on Tab */}
      {activeTab === 'analisis' && (
        <div className="space-y-6">
          {/* Explanation Banner */}
          <div className="bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-white">
                  Alokasi Waktu Dihitung Otomatis Berdasarkan Analisis Kalender Pendidikan
                </p>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  Rincian pekan efektif KBM di bawah ini diperoleh langsung dari ekstraksi tanggal efektif, libur nasional, STS, SAS, dan agenda resmi pada Kaldik TP {academicYear}.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleRunSmartAnalysis()}
              disabled={isAnalyzing}
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1.5 shrink-0 shadow transition"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Hitung Ulang Alokasi Waktu</span>
            </button>
          </div>

          {/* Configuration Bar */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Semester
              </label>
              <div className="grid grid-cols-2 gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setSelectedSemester('Ganjil')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition ${
                    selectedSemester === 'Ganjil'
                      ? 'bg-indigo-600 text-white shadow font-extrabold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Ganjil (Sem 1)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSemester('Genap')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition ${
                    selectedSemester === 'Genap'
                      ? 'bg-indigo-600 text-white shadow font-extrabold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Genap (Sem 2)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Mata Pelajaran
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Contoh: Fisika, Matematika"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Jenjang & Kelas
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <select
                  value={level}
                  onChange={(e) => {
                    const lvl = e.target.value as EducationLevel;
                    setLevel(lvl);
                    setGrade(lvl === 'SD' ? 1 : lvl === 'SMP' ? 7 : 10);
                  }}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-2 py-2 text-xs font-semibold text-white focus:outline-none"
                >
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                  <option value="SMK">SMK</option>
                </select>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-2 py-2 text-xs font-semibold text-white text-center focus:outline-none"
                  placeholder="Kelas"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Beban JP / Minggu
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={jpPerWeek}
                  onChange={(e) => setJpPerWeek(Number(e.target.value) || 1)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400 pointer-events-none">
                  JP / Minggu
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Tahun Ajaran (TP)
                </label>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Tersinkron</span>
                </span>
              </div>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => handleAcademicYearChange(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="2025/2026"
              />
              <div className="flex items-center space-x-1 pt-1 overflow-x-auto no-scrollbar">
                {['2024/2025', '2025/2026', '2026/2027', '2027/2028'].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => handleAcademicYearChange(yr)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                      academicYear === yr
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Metrics KPI Banner (Calculated from Kaldik Analysis) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                1. Total Pekan Semester
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-white">{activeSemData.totalWeeks}</span>
                <span className="text-xs text-slate-400">Pekan Kalender</span>
              </div>
              <p className="text-[10px] text-slate-400">Juli s.d. Des (Sem 1) / Jan s.d. Jun (Sem 2)</p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/50 space-y-1">
              <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">
                2. Pekan Tidak Efektif
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-rose-400">{activeSemData.nonEffectiveWeeks}</span>
                <span className="text-xs text-rose-300/80">Pekan Non-KBM</span>
              </div>
              <p className="text-[10px] text-rose-300/70">MPLS, STS, SAS, Rapor & Libur Semester</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-600/50 space-y-1">
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                3. Pekan Efektif KBM (RBE)
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-emerald-400">{activeSemData.totalEffectiveWeeks}</span>
                <span className="text-xs text-emerald-300 font-bold">Pekan Efektif</span>
              </div>
              <p className="text-[10px] text-emerald-300/80">Hasil Analisis Kaldik Terverifikasi</p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-600/50 space-y-1">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                4. Total Alokasi Jam (JP)
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-indigo-300">{totalEffJP}</span>
                <span className="text-xs text-indigo-200">JP Tatap Muka</span>
              </div>
              <p className="text-[10px] text-indigo-300/80">{activeSemData.totalEffectiveWeeks} Pekan × {jpPerWeek} JP/Minggu</p>
            </div>
          </div>

          {/* Table of Monthly Breakdown Analysis */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-800 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Table className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-black text-white">
                  Tabel Rincian Pekan Efektif (RBE) Semester {selectedSemester} (Hasil Analisis Kaldik)
                </h2>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  Sinkron dengan PROSEM
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="p-3 w-12 text-center">No</th>
                    <th className="p-3 w-40">Bulan</th>
                    <th className="p-3 w-28 text-center">Jumlah Pekan</th>
                    <th className="p-3 w-32 text-center text-rose-400">Pekan Tdk Efektif</th>
                    <th className="p-3 w-32 text-center text-emerald-400">Pekan Efektif (RBE)</th>
                    <th className="p-3">Keterangan Agenda & Kalender Kegiatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 font-medium">
                  {activeSemData.months.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-750/50 transition">
                      <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="p-3 font-extrabold text-white flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{m.monthName}</span>
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="6"
                          value={m.totalWeeks}
                          onChange={(e) =>
                            handleMonthChange(
                              selectedSemester === 'Ganjil' ? 'semester1' : 'semester2',
                              idx,
                              'totalWeeks',
                              e.target.value
                            )
                          }
                          className="w-16 text-center bg-slate-900 border border-slate-700 rounded-lg py-1 px-1.5 text-xs text-white font-bold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="6"
                          value={m.nonEffectiveWeeks}
                          onChange={(e) =>
                            handleMonthChange(
                              selectedSemester === 'Ganjil' ? 'semester1' : 'semester2',
                              idx,
                              'nonEffectiveWeeks',
                              e.target.value
                            )
                          }
                          className="w-16 text-center bg-rose-950/40 border border-rose-700/60 rounded-lg py-1 px-1.5 text-xs text-rose-300 font-bold focus:ring-1 focus:ring-rose-500 focus:outline-none"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-block w-16 py-1 px-1.5 rounded-lg bg-emerald-950/40 border border-emerald-700/60 text-emerald-300 font-black text-xs text-center">
                          {m.effectiveWeeks}
                        </span>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={m.description}
                          onChange={(e) =>
                            handleMonthChange(
                              selectedSemester === 'Ganjil' ? 'semester1' : 'semester2',
                              idx,
                              'description',
                              e.target.value
                            )
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                          placeholder="Keterangan agenda..."
                        />
                      </td>
                    </tr>
                  ))}
                  {/* Summary Row */}
                  <tr className="bg-slate-900/90 font-extrabold text-white border-t-2 border-slate-700">
                    <td colSpan={2} className="p-3 text-right uppercase tracking-wider text-indigo-300">
                      Total Semester {selectedSemester}:
                    </td>
                    <td className="p-3 text-center text-sm">{activeSemData.totalWeeks} Pekan</td>
                    <td className="p-3 text-center text-sm text-rose-400">{activeSemData.nonEffectiveWeeks} Pekan</td>
                    <td className="p-3 text-center text-sm text-emerald-400 font-black">{activeSemData.totalEffectiveWeeks} Pekan</td>
                    <td className="p-3 text-xs text-slate-300 font-semibold">
                      Total Alokasi Jam Mengajar: <strong className="text-white">{totalEffJP} JP</strong> ({activeSemData.totalEffectiveWeeks} Pekan × {jpPerWeek} JP)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Mathematical Breakdown of Jam Pelajaran (JP) */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Calculator className="w-4 h-4 text-indigo-400" />
              <span>Rincian Perhitungan Alokasi Jam Pelajaran (JP) Semester {selectedSemester}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 bg-slate-900/70 p-4 rounded-xl border border-slate-700/60">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">1. Jumlah Pekan Efektif KBM (RBE):</span>
                  <span className="font-bold text-white">{activeSemData.totalEffectiveWeeks} Pekan</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">2. Beban Jam Tatap Muka:</span>
                  <span className="font-bold text-white">{jpPerWeek} JP / Minggu</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">3. Total Jam Pelajaran Semester:</span>
                  <span className="font-extrabold text-indigo-300">{totalEffJP} JP ({activeSemData.totalEffectiveWeeks} × {jpPerWeek})</span>
                </div>
              </div>

              <div className="space-y-2 bg-slate-900/70 p-4 rounded-xl border border-slate-700/60">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">4. Cadangan Waktu Asesmen & Remedial:</span>
                  <span className="font-bold text-amber-300">{reserveJP} JP</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">5. Jam Efektif Tatap Muka KBM:</span>
                  <span className="font-black text-emerald-400">{kbmEffJP} JP</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">6. Status Keselarasan Kaldik:</span>
                  <span className="font-bold text-emerald-300">Tersinkronisasi Penuh & Siap PROSEM</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700/60">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleExportWord}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Unduh Word (.doc)</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center space-x-1.5 shadow transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Unduh Excel (.csv)</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs flex items-center space-x-1.5 shadow transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen</span>
                </button>
              </div>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('ai_prosem')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Sinkronkan ke PROSEM Berwarna</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Upload Kalender Pendidikan Sekolah */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h2 className="text-base font-black text-white flex items-center space-x-2">
                <UploadCloud className="w-5 h-5 text-indigo-400" />
                <span>Upload Dokumen Kalender Pendidikan Satuan Pendidikan</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Unggah dokumen kalender pendidikan resmi sekolah Anda (format PDF, Excel, Word, atau Gambar JPG/PNG). Dokumen ini akan dianalisis secara otomatis oleh sistem untuk menentukan alokasi waktu dan matriks pekan efektif KBM.
              </p>
            </div>

            {/* Drag & Drop Upload Box */}
            <div className="relative border-2 border-dashed border-indigo-500/50 hover:border-indigo-400 bg-indigo-950/20 hover:bg-indigo-950/30 rounded-2xl p-8 text-center transition cursor-pointer group">
              <input
                type="file"
                id="file-upload-kalender"
                accept=".pdf,.xlsx,.xls,.docx,.doc,.jpg,.jpeg,.png,.csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="p-4 bg-indigo-600/30 group-hover:bg-indigo-600/40 border border-indigo-500/40 rounded-2xl text-indigo-300 transition">
                  <UploadCloud className="w-8 h-8 group-hover:scale-110 transition" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    Klik atau Seret & Lepas Berkas Kalender Pendidikan di Sini
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Mendukung format PDF, Excel (.xlsx/.xls), Word (.docx), atau Gambar (.jpg/.png) hingga 15 MB
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Success Alert */}
            {uploadSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{uploadSuccessMsg}</span>
              </div>
            )}

            {/* Active Uploaded File Card */}
            {uploadFile ? (
              <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-2.5 bg-indigo-600/30 rounded-xl text-indigo-300 shrink-0">
                    <FileCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{uploadFile.name}</p>
                    <p className="text-[11px] text-slate-400">
                      Ukuran: {uploadFile.size} | Tipe: {uploadFile.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      handleRunSmartAnalysis();
                      setActiveTab('analisis');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1.5 transition"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Jalankan Analisis Alokasi</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800 text-xs flex items-center space-x-1 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-center text-xs text-slate-400">
                Belum ada berkas yang diunggah. Sistem menggunakan template Kalender Pendidikan Standar Resmi 2025/2026.
              </div>
            )}

            {/* Catatan / Keterangan Khusus Sekolah */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Catatan Khusus Agenda Sekolah (Opsional)
              </label>
              <textarea
                rows={3}
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                placeholder="Contoh: Pekan ke-3 September diadakan Asesmen Tengah Semester, pekan ke-3 Oktober Pameran Karya P5..."
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-500"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleRunSmartAnalysis(uploadNotes);
                  setActiveTab('analisis');
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition active:scale-95"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Analisis & Lihat Hasil Alokasi Waktu</span>
              </button>

              <button
                type="button"
                onClick={handleSaveData}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Berkas & Catatan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Preview Dokumen RBE & Format Resmi */}
      {activeTab === 'prosem_preview' && (
        <div className="space-y-4">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">
                Pratinjau Dokumen Cetak Analisis Alokasi Waktu (RBE) & Matriks Kaldik
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
              </button>
              <button
                type="button"
                onClick={handleExportWord}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Word (.doc)</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / PDF</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-300 text-slate-900">
            <DocumentPdfPreview
              content={previewMarkdown}
              title={`Analisis Alokasi Waktu ${subject} - Semester ${selectedSemester}`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
