import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  FileSearch,
  Target,
  GitMerge,
  CalendarRange,
  CalendarCheck,
  Calendar,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  CheckSquare,
  HelpCircle,
  Copy,
  Check,
  Download,
  Printer,
  RefreshCw,
  BookOpen,
  Send,
  Save,
  GraduationCap,
  Clock,
  Gift,
  Zap,
  ListOrdered,
  CheckCircle2,
  AlertCircle,
  PenTool,
  Info,
  Calculator,
  Image as ImageIcon,
  Table as TableIcon,
  FlaskConical,
  Sigma,
  Maximize2,
  Minimize2,
  Columns,
  LayoutGrid,
} from 'lucide-react';
import { AIDocument, EducationLevel, SemesterType, UserAccount, TokenQuotaStatus, ActiveMasterCPData, CPDistributionPlan } from '../types';
import { StorageService, addStorageListener } from '../lib/storage';
import { ExportService } from '../lib/exportUtils';
import { CP_REFERENCES } from '../lib/curriculumData';
import { generateExpertCurriculumDocument, generateFullCurriculumBundle } from '../lib/curriculumEngine';
import { DocumentPdfPreview } from '../components/DocumentPdfPreview';
import { CustomFormatSelector, CustomFormatConfig } from '../components/CustomFormatSelector';
import { TokenQuotaModal } from '../components/TokenQuotaModal';

interface AIAssistantViewProps {
  initialDocType?: string;
  onNavigate?: (viewId: string) => void;
}

const POPULAR_SUBJECTS = [
  'Fisika',
  'Matematika',
  'Biologi',
  'Kimia',
  'Informatika',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Pendidikan Pancasila',
  'Sejarah',
  'Geografi',
  'Ekonomi',
  'Sosiologi',
  'Pendidikan Agama Islam',
  'PJOK',
  'Seni Budaya',
  'Prakarya',
];

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ initialDocType = 'analisis_cp', onNavigate }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => StorageService.getCurrentUser());
  const [quotaStatus, setQuotaStatus] = useState<TokenQuotaStatus>(() => StorageService.getTokenQuotaStatus(currentUser));
  const [showTokenModal, setShowTokenModal] = useState<boolean>(false);
  const [activeMasterCP, setActiveMasterCP] = useState<ActiveMasterCPData | null>(() => StorageService.getActiveMasterCP());
  const [schoolProfile, setSchoolProfile] = useState(() => StorageService.getSchoolProfile());

  const initialProf = StorageService.getSchoolProfile();
  const initialMaster = StorageService.getActiveMasterCP();

  const [docType, setDocType] = useState<string>(initialDocType);
  const [level, setLevel] = useState<EducationLevel>(() => (initialProf.level || initialMaster?.level || 'SMA') as EducationLevel);
  const [grade, setGrade] = useState<number>(() => Number(initialProf.grade || initialMaster?.grade || 10));
  const [semester, setSemester] = useState<SemesterType>(() => (initialProf.semester || 'Ganjil') as SemesterType);
  const [subject, setSubject] = useState<string>(() => initialProf.subject || initialMaster?.subject || 'Fisika');
  const [hasManuallyModified, setHasManuallyModified] = useState<boolean>(false);
  const [topic, setTopic] = useState<string>('Kinematika & Dinamika Gerak Lurus');
  const [modulOption, setModulOption] = useState<'lengkap' | 'rpp_1lembar'>('lengkap');
  const [meetingCount, setMeetingCount] = useState<number>(2);
  const [hoursPerMeeting, setHoursPerMeeting] = useState<number>(3);
  const [minutesPerJP, setMinutesPerJP] = useState<number>(45);
  const [useManualTP, setUseManualTP] = useState<boolean>(false);
  const [manualTPText, setManualTPText] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // Custom School Format State (PDF, Word, JPG, custom notes, checkbox)
  const [customFormatConfig, setCustomFormatConfig] = useState<CustomFormatConfig>({
    useCustomFormat: false,
    formatFile: null,
    customFormatNotes: '',
  });

  // Generated content state
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string>('');
  const [viewLayout, setViewLayout] = useState<'split' | 'fullscreen'>('split');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [resetFeedback, setResetFeedback] = useState<string>('');
  const [activePaletteTab, setActivePaletteTab] = useState<'yunani' | 'matematika' | 'kimia' | 'rumus' | 'diagram' | 'lencana'>('yunani');
  const [showPalette, setShowPalette] = useState<boolean>(false);

  // Sync docType when initialDocType changes from sidebar
  useEffect(() => {
    let targetDoc = initialDocType.startsWith('ai_') ? initialDocType.replace('ai_', '') : initialDocType;
    if (targetDoc === 'asesmen') {
      targetDoc = 'rubrik_penilaian';
    }
    setDocType(targetDoc);
  }, [initialDocType]);

  // Sync token quota, school profile & master CP listener
  const [syncedContext, setSyncedContext] = useState(() => StorageService.getSyncedCurriculumContext(subject, grade, level));
  const [allPlans, setAllPlans] = useState<CPDistributionPlan[]>(() => StorageService.getCPDistributions());

  useEffect(() => {
    const updateUserData = () => {
      const user = StorageService.getCurrentUser();
      setCurrentUser(user);
      setQuotaStatus(StorageService.getTokenQuotaStatus(user));
      const master = StorageService.getActiveMasterCP();
      setActiveMasterCP(master);
      const plans = StorageService.getCPDistributions();
      setAllPlans(plans);
      const prof = StorageService.getSchoolProfile();
      setSchoolProfile(prof);

      // If user hasn't diverged/modified manually, keep in sync with teacher profile
      if (!hasManuallyModified) {
        if (prof.subject && prof.subject !== subject) setSubject(prof.subject);
        if (prof.level && prof.level !== level) setLevel(prof.level as EducationLevel);
        if (prof.grade && Number(prof.grade) !== grade) setGrade(Number(prof.grade));
      }

      setSyncedContext(StorageService.getSyncedCurriculumContext(subject, grade, level));
    };

    updateUserData();

    const unsubscribe = addStorageListener(() => {
      updateUserData();
    });

    return () => {
      unsubscribe();
    };
  }, [subject, grade, level, hasManuallyModified]);

  // Helper Phase
  const getPhaseName = (g: number, lvl: EducationLevel) => {
    if (lvl === 'SD') {
      if (g <= 2) return 'Fase A';
      if (g <= 4) return 'Fase B';
      return 'Fase C';
    }
    if (lvl === 'SMP') return 'Fase D';
    if (g === 10) return 'Fase E';
    return 'Fase F';
  };

  const currentPhase = getPhaseName(grade, level);

  // Check if current configuration matches Teacher Profile
  const isFollowingProfile =
    subject.trim().toLowerCase() === (schoolProfile.subject || initialProf.subject || 'Fisika').trim().toLowerCase() &&
    level === (schoolProfile.level || initialProf.level || 'SMA') &&
    Number(grade) === Number(schoolProfile.grade || initialProf.grade || 10);

  // Reset to Teacher Profile
  const handleResetToTeacherProfile = () => {
    const prof = StorageService.getSchoolProfile();
    const master = StorageService.getActiveMasterCP();
    const targetSub = prof.subject || master?.subject || 'Fisika';
    const targetLvl = (prof.level || master?.level || 'SMA') as EducationLevel;
    const targetGrade = Number(prof.grade || master?.grade || 10);
    const targetSem = (prof.semester || 'Ganjil') as SemesterType;

    setSubject(targetSub);
    setLevel(targetLvl);
    setGrade(targetGrade);
    setSemester(targetSem);
    setHasManuallyModified(false);

    // Pick topic from active master or synced context
    const materials = targetSem === 'Ganjil'
      ? (master?.materialsSem1 || [])
      : (master?.materialsSem2 || []);
    if (materials.length > 0) {
      setTopic(materials[0].essentialMaterial || materials[0].tpName);
      if (materials[0].allocatedHours) {
        setHoursPerMeeting(Math.min(4, Math.max(2, Math.round(materials[0].allocatedHours / 2))));
      }
    }

    setResetFeedback('Acuan dikembalikan ke Profil Guru');
    setTimeout(() => setResetFeedback(''), 2500);
  };

  // When subject changes, see if a matching distribution plan exists
  const handleSubjectChange = (newSub: string) => {
    setSubject(newSub);
    setHasManuallyModified(true);
    const match = allPlans.find((p) => p.subject.toLowerCase() === newSub.toLowerCase());
    if (match) {
      setLevel(match.level as EducationLevel);
      setGrade(Number(match.grade));
      const mats = semester === 'Ganjil' ? match.materialsSem1 : match.materialsSem2;
      if (mats && mats.length > 0) {
        setTopic(mats[0].essentialMaterial || mats[0].tpName);
        if (mats[0].allocatedHours) {
          setHoursPerMeeting(Math.min(4, Math.max(2, Math.round(mats[0].allocatedHours / 2))));
        }
      }
    }
  };

  // Apply Master CP to current form
  const handleApplyMasterCP = () => {
    if (!activeMasterCP) return;
    setSubject(activeMasterCP.subject);
    setLevel(activeMasterCP.level as EducationLevel);
    setGrade(Number(activeMasterCP.grade));
    setHasManuallyModified(true);
    const activeMaterials = semester === 'Ganjil' ? activeMasterCP.materialsSem1 : activeMasterCP.materialsSem2;
    if (activeMaterials && activeMaterials.length > 0) {
      setTopic(activeMaterials[0].essentialMaterial || activeMaterials[0].tpName);
      if (activeMaterials[0].allocatedHours) {
        setHoursPerMeeting(Math.min(4, Math.max(2, Math.round(activeMaterials[0].allocatedHours / 2))));
      }
    }
  };

  // Compute Grade List according to Level
  const availableGrades = level === 'SD' ? [1, 2, 3, 4, 5, 6] : level === 'SMP' ? [7, 8, 9] : [10, 11, 12];

  // Get matching CP from reference if available
  const currentCP = CP_REFERENCES.find(
    (c) => c.level === level && c.grade === grade && c.subject.toLowerCase() === subject.toLowerCase()
  );

  const docTypesList = [
    { id: 'analisis_alokasi_waktu', label: '0. Analisis Alokasi Waktu (Sem 1 & 2)', icon: Calendar, desc: 'Perhitungan RBE Berbasis Kalender Pendidikan', badge: 'Kaldik' },
    { id: 'analisis_cp', label: '1. Analisis CP Terbaru', icon: FileSearch, desc: 'Pemetaan Elemen & Dimensi Deep Learning' },
    { id: 'tp', label: '2. Tujuan Pembelajaran (TP)', icon: Target, desc: 'Rumusan Kompetensi & Materi KKO' },
    { id: 'atp', label: '3. Alur Tujuan Pembelajaran (ATP)', icon: GitMerge, desc: 'Urutan Logis Tahapan & Alokasi Jam (JP)' },
    { id: 'prota', label: '4. Program Tahunan (PROTA)', icon: CalendarRange, desc: 'Distribusi Alokasi Waktu Semester 1 & 2' },
    { id: 'prosem', label: '5. Program Semester (PROSEM)', icon: CalendarCheck, desc: 'Matriks Pekan Efektif & Jadwal Bulanan Berwarna', badge: 'Berwarna' },
    { id: 'kktp', label: '6. Kriteria Ketuntasan (KKTP)', icon: CheckSquare, desc: 'Interval Nilai, Rubrik & Deskripsi Kriteria Mutu', badge: 'Standar Mutu' },
    { id: 'modul_ajar', label: '7. RPM (Rencana Pelaksanaan Modul)', icon: FileText, desc: 'Sintaks Deep Learning Terpadu (Mindful, Meaningful, Joyful)', badge: 'RPM' },
    { id: 'lkpd', label: '8. LKPD Deep Learning (Sinkron RPM)', icon: FileSpreadsheet, desc: 'Tersusun Rapi Sesuai Pertemuan RPM + Ilustrasi & Kanvas Siswa', badge: 'Sinkron RPM' },
    { id: 'rubrik_penilaian', label: '9. Rubrik Penilaian (Sinkron RPM)', icon: HelpCircle, desc: 'Rubrik Sikap 6C, Kinerja LKPD & Asesmen Sumatif HOTS' },
  ];

  const handleGenerate = async (customTypeArg?: string | unknown) => {
    const customType = typeof customTypeArg === 'string' ? customTypeArg : undefined;
    const activeDocType = String(customType || docType || 'analisis_cp');
    if (customType) {
      setDocType(customType);
    }

    // 1. Quota & Token Limit Verification (Maksimal 20 klik/hari)
    const user = StorageService.getCurrentUser();
    const currentQuota = StorageService.getTokenQuotaStatus(user);

    if (currentQuota.isExhausted && !currentQuota.isAdmin) {
      setShowTokenModal(true);
      return;
    }

    // 2. Consume 1 AI Token
    const consumeRes = StorageService.consumeAIToken(user, activeDocType);
    if (!consumeRes.success) {
      setShowTokenModal(true);
      return;
    }

    // Refresh quota status immediately
    setQuotaStatus(StorageService.getTokenQuotaStatus(user));

    setLoading(true);
    setGeneratedMarkdown('');

    const resolvedTopic = topic.trim() || currentCP?.topic || `${subject} - Materi Pokok Semester ${semester}`;
    const totalJP = meetingCount * hoursPerMeeting;
    const activeDistribution = activeMasterCP || StorageService.getCPDistributions().find(p => p.subject.toLowerCase() === subject.toLowerCase());
    const finalManualTP = useManualTP && manualTPText.trim() ? manualTPText.trim() : undefined;

    const payload = {
      docType: activeDocType,
      toolType: activeDocType,
      level,
      grade,
      phase: currentPhase,
      semester,
      subject,
      topic: resolvedTopic,
      meetingCount,
      hoursPerMeeting,
      minutesPerJP,
      totalJP,
      cpText: activeMasterCP?.cpText || currentCP?.cpText || 'Memahami dan menganalisis gagasan serta pesan dalam konteks pembelajaran mendalam.',
      distributionData: activeDistribution,
      kalenderData: StorageService.getKalenderPendidikan(),
      modulOption: activeDocType === 'modul_ajar' ? modulOption : undefined,
      manualTP: finalManualTP,
      useManualTP: !!finalManualTP,
      customPrompt,
      useCustomFormat: customFormatConfig.useCustomFormat,
      customFormatNotes: customFormatConfig.customFormatNotes,
      customFormatFile: customFormatConfig.formatFile,
    };

    let content = '';

    try {
      const response = await fetch('/api/ai/generate-curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.content && data.content.trim().length > 50) {
          content = data.content;
        }
      }
    } catch (err: any) {
      console.warn('Network request failed, generating via client-side expert engine:', err);
    }

    // Fallback if network or server did not return content
    if (!content) {
      if (activeDocType === 'bundle' || activeDocType === 'bundel_lengkap' || activeDocType === 'perangkat_ajar_lengkap') {
        content = generateFullCurriculumBundle({
          toolType: activeDocType,
          docType: activeDocType,
          subject,
          level,
          grade,
          phase: currentPhase,
          semester,
          topic: resolvedTopic,
          meetingCount,
          hoursPerMeeting,
          minutesPerJP,
          totalJP,
          modulOption,
          manualTP: finalManualTP,
          useManualTP: !!finalManualTP,
          customPrompt,
          cpText: activeMasterCP?.cpText || currentCP?.cpText,
          distributionData: activeDistribution,
          kalenderData: StorageService.getKalenderPendidikan(),
          useCustomFormat: customFormatConfig.useCustomFormat,
          customFormatNotes: customFormatConfig.customFormatNotes,
          customFormatFile: customFormatConfig.formatFile,
        });
      } else {
        content = generateExpertCurriculumDocument({
          toolType: activeDocType,
          docType: activeDocType,
          subject,
          level,
          grade,
          phase: currentPhase,
          semester,
          topic: resolvedTopic,
          meetingCount,
          hoursPerMeeting,
          minutesPerJP,
          totalJP,
          modulOption,
          manualTP: finalManualTP,
          useManualTP: !!finalManualTP,
          customPrompt,
          cpText: activeMasterCP?.cpText || currentCP?.cpText,
          distributionData: activeDistribution,
          kalenderData: StorageService.getKalenderPendidikan(),
          useCustomFormat: customFormatConfig.useCustomFormat,
          customFormatNotes: customFormatConfig.customFormatNotes,
          customFormatFile: customFormatConfig.formatFile,
        });
      }
    }

    setGeneratedMarkdown(content);
    // Switch to full width layout so user can review the complete document comfortably
    setViewLayout('fullscreen');

    // Save to AI Docs History
    const foundDoc = docTypesList.find((d) => d.id === activeDocType);
    const docLabel = foundDoc ? foundDoc.label : (typeof activeDocType === 'string' ? activeDocType.toUpperCase() : 'DOKUMEN');
    const newDoc: AIDocument = {
      id: `ai-doc-${Date.now()}`,
      type: activeDocType as any,
      title: `${docLabel} - ${subject} Kelas ${grade} (${semester})`,
      level,
      grade,
      subject,
      semester,
      content,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    StorageService.saveAIDocument(newDoc);

    // Add audit log
    const docTypeUpper = typeof activeDocType === 'string' ? activeDocType.toUpperCase() : 'DOKUMEN';
    StorageService.addAccessLog({
      userId: user?.id || 'guest',
      userEmail: user?.email || 'guru@belajar.id',
      userName: user?.name || 'Guru Pengampu',
      userRole: user?.role || 'guru',
      action: `Generate AI Perangkat Ajar (${docTypeUpper})`,
      details: `Menghasilkan dokumen ${newDoc.title} dengan Kurikulum Deep Learning (Sisa kuota AI: ${consumeRes.status.remaining} klik).`,
      status: 'success',
    });

    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Exports
  const handleExportExcel = () => {
    const schoolProfile = StorageService.getSchoolProfile();
    const effectiveTeacher = schoolProfile.teacherName;
    const fileName = `Perangkat_Ajar_${docType}_${subject}_Kls${grade}`;
    const exportOptions = {
      ...schoolProfile,
      teacherName: effectiveTeacher,
      semester: semester as any,
      subject,
      grade,
      level: level as any,
      docType,
    };
    const matchedLabel = docTypesList.find((d) => d.id === docType)?.label || (typeof docType === 'string' ? docType : 'DOKUMEN');
    const docTitle = `${matchedLabel.toUpperCase()} - ${subject}`;
    ExportService.exportCurriculumToExcel(generatedMarkdown, docTitle, exportOptions, fileName);
  };

  const handleExportWord = () => {
    const schoolProfile = StorageService.getSchoolProfile();
    const effectiveTeacher = schoolProfile.teacherName;
    const fileName = `Perangkat_Ajar_${docType}_${subject}_Kls${grade}`;
    const exportOptions = {
      ...schoolProfile,
      teacherName: effectiveTeacher,
      semester: semester as any,
      subject,
      grade,
      level: level as any,
      docType,
    };
    const matchedLabel = docTypesList.find((d) => d.id === docType)?.label || (typeof docType === 'string' ? docType : 'DOKUMEN');
    const docTitle = `${matchedLabel.toUpperCase()} - ${subject}`;
    ExportService.exportToWord(docTitle, generatedMarkdown, exportOptions, fileName);
  };

  const handlePrintPdf = () => {
    const schoolProfile = StorageService.getSchoolProfile();
    const effectiveTeacher = schoolProfile.teacherName;
    const exportOptions = {
      ...schoolProfile,
      teacherName: effectiveTeacher,
      semester: semester as any,
      subject,
      grade,
      level: level as any,
      docType,
    };
    const matchedLabel = docTypesList.find((d) => d.id === docType)?.label || (typeof docType === 'string' ? docType : 'Dokumen');
    const docTitle = `${matchedLabel} (${subject})`;
    ExportService.printPdfPreview(docTitle, generatedMarkdown, exportOptions);
  };

  const currentDocInfo = docTypesList.find((d) => d.id === docType) || docTypesList[0];
  const ActiveDocIcon = currentDocInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 p-6 rounded-2xl border border-indigo-800/40 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 shadow-inner">
              <Sparkles className="w-6 h-6 animate-pulse text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black text-white tracking-tight">
                  B. Asisten AI Kurikulum Deep Learning
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  SD - SMA (CP Terbaru)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Generator otomatis Perangkat Ajar Kurikulum Deep Learning & Kalender Pendidikan Berwarna.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Layout Switcher: 2 Kolom vs Tampilan Penuh */}
            <div className="flex items-center p-1 bg-slate-900/90 rounded-xl border border-indigo-500/40 shadow-inner">
              <button
                type="button"
                onClick={() => setViewLayout('split')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                  viewLayout === 'split'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilan 2 Kolom (Formulir & Dokumen Berdampingan)"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>2 Kolom</span>
              </button>
              <button
                type="button"
                onClick={() => setViewLayout('fullscreen')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                  viewLayout === 'fullscreen'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilan Penuh (Dokumen Lebar Maksimal)"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Tampilan Penuh</span>
              </button>
            </div>

            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('kalender_pendidikan')}
                className="px-3.5 py-2 rounded-xl bg-indigo-900/60 hover:bg-indigo-800/80 border border-indigo-500/40 text-indigo-200 font-bold text-xs flex items-center space-x-2 transition shadow-sm"
              >
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Upload / Atur Kalender</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Parameter Formulation Left & AI Document Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Fullscreen Quick Controls Banner */}
        {viewLayout === 'fullscreen' && (
          <div className="lg:col-span-12 bg-slate-900/95 border border-indigo-500/40 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md backdrop-blur-sm">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/25 border border-indigo-500/40 text-indigo-300 font-black text-xs flex items-center justify-center shrink-0">
                {grade}
              </div>
              <div className="truncate">
                <div className="text-xs font-extrabold text-white flex items-center gap-2 truncate">
                  <span>{subject} • Kelas {grade} ({level}) • Semester {semester}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-900/80 text-indigo-300 font-mono font-semibold">
                    {docTypesList.find((d) => d.id === docType)?.label || docType}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Topik: <span className="text-slate-200 font-medium">{topic}</span> • {meetingCount} Pertemuan
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setViewLayout('split')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center space-x-1.5 transition"
              >
                <Columns className="w-3.5 h-3.5 text-indigo-400" />
                <span>Ubah Parameter (2 Kolom)</span>
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Regenerate Dokumen</span>
              </button>
            </div>
          </div>
        )}

        {/* Left Column: Parameter Formulation */}
        {viewLayout === 'split' && (
          <div className="lg:col-span-5 space-y-4">
          {/* Active Master CP Status Banner */}
          {activeMasterCP ? (
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-3.5 rounded-2xl border border-indigo-500/40 space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wide">
                    Master CP Terhubung
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 font-mono">
                  {activeMasterCP.subject} • {activeMasterCP.phase}
                </span>
              </div>
              <div className="text-xs text-white font-bold truncate">
                📄 {activeMasterCP.fileName}
              </div>
              <div className="flex items-center space-x-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={handleApplyMasterCP}
                  className="flex-1 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 rounded-lg text-[10px] font-bold transition flex items-center justify-center space-x-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Terapkan Parameter CP Master</span>
                </button>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('upload_cp')}
                    className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold transition flex items-center space-x-1"
                    title="Upload / Analisis File CP Baru"
                  >
                    <UploadCloud className="w-3 h-3 text-amber-300" />
                    <span>Upload Baru</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <FileSearch className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Ingin sinkronisasi dari file PDF/Word CP resmi?</span>
              </div>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('upload_cp')}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold transition shrink-0 ml-2"
                >
                  Upload CP
                </button>
              )}
            </div>
          )}

          {/* Parameter Formulation Card */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3.5 text-xs shadow-lg">
            {/* Status Acuan Profil Guru vs Mode Kustom Terpisah */}
            <div className={`p-3 rounded-xl border transition-all ${
              isFollowingProfile
                ? 'bg-gradient-to-r from-indigo-950/60 via-slate-950 to-slate-900 border-indigo-500/40 shadow-sm'
                : 'bg-gradient-to-r from-amber-950/50 via-slate-950 to-slate-900 border-amber-500/40 shadow-sm'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isFollowingProfile ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Acuan: Profil Guru Mata Pelajaran
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        Mode Kustom Terpisah
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-white">
                      {subject} • {level} K{grade} ({currentPhase})
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    {isFollowingProfile ? (
                      <>
                        Otomatis mengikuti konfigurasi <strong>Profil Guru</strong> ({schoolProfile.teacherName || 'Guru'}). Anda bebas mengubah pengaturan di bawah jika ingin membuat perangkat ajar mapel/kelas lain secara terpisah.
                      </>
                    ) : (
                      <>
                        Perangkat ajar ini dibuat terpisah dari Profil Utama ({schoolProfile.subject || 'Fisika'} {schoolProfile.level || 'SMA'} Kelas {schoolProfile.grade || 10}).
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                  {!isFollowingProfile && (
                    <button
                      type="button"
                      onClick={handleResetToTeacherProfile}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold transition flex items-center gap-1 shadow-md"
                      title="Kembalikan Mata Pelajaran, Jenjang, Kelas & Fase ke Profil Guru"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Ikuti Profil Guru</span>
                    </button>
                  )}
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate('profil_guru_mapel')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] font-medium transition"
                      title="Buka menu Profil Guru untuk mengedit acuan sekolah & pengajaran"
                    >
                      Menu Profil Guru
                    </button>
                  )}
                </div>
              </div>

              {resetFeedback && (
                <div className="mt-2 p-1.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold rounded-lg border border-emerald-500/40 flex items-center gap-1 animate-fadeIn">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>{resetFeedback}</span>
                </div>
              )}
            </div>

            {/* Document Type Selector */}
            <div className="space-y-1.5 pb-3 border-b border-slate-800">
              <label className="block text-slate-300 font-bold text-xs flex items-center justify-between">
                <span>Pilih Dokumen yang Ingin Dibuat:</span>
                {currentDocInfo.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/60">
                    {currentDocInfo.badge}
                  </span>
                )}
              </label>
              <div className="relative">
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-indigo-600/50 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-indigo-400 appearance-none shadow-sm cursor-pointer pr-8"
                >
                  {docTypesList.map((d) => (
                    <option key={d.id} value={d.id} className="bg-slate-900 text-white font-medium py-1">
                      {d.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400 text-xs">
                  ▼
                </div>
              </div>
              <div className="text-[11px] text-slate-400 leading-tight pt-0.5">
                {currentDocInfo.desc}
              </div>
            </div>

            {/* Special Callout if Bundle is selected */}
            {docType === 'bundle' && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-950/80 via-blue-950/60 to-purple-950/80 border border-indigo-500/50 space-y-1.5 shadow-md animate-fadeIn">
                <div className="flex items-center space-x-1.5 text-amber-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Mode 1 Perangkat Ajar Lengkap (All-in-One)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Menyinkronkan dan menggabungkan seluruh komponen dari <strong>Cover</strong>, <strong>Lembar Pengesahan</strong>, <strong>Daftar Isi</strong>, <strong>RBE</strong>, <strong>Analisis CP</strong>, <strong>TP</strong>, <strong>ATP</strong>, <strong>PROTA</strong>, <strong>PROSEM</strong>, <strong>KKTP</strong>, <strong>Modul Ajar Deep Learning</strong>, <strong>LKPD</strong>, hingga <strong>Rubrik Penilaian</strong> menjadi <strong>1 berkas utuh siap cetak atau dijilid</strong>.
                </p>
              </div>
            )}

            {/* Mata Pelajaran & Quick Preset Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
                  <span>Mata Pelajaran / Bidang Studi *</span>
                  {isFollowingProfile ? (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                      Sesuai Profil Guru
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-700/50">
                      Kustom Terpisah
                    </span>
                  )}
                </label>
                {allPlans.length > 0 && (
                  <div className="flex items-center space-x-1 text-[10px] text-indigo-400">
                    <span>Tersedia {allPlans.length} Perangkat Mapel</span>
                  </div>
                )}
              </div>
              <input
                type="text"
                list="subjects-list"
                value={subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                placeholder="Contoh: Fisika, Matematika, Bahasa Indonesia..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-indigo-500"
              />
              <datalist id="subjects-list">
                {POPULAR_SUBJECTS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>

              {/* Quick Select Popular Subjects */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {POPULAR_SUBJECTS.slice(0, 7).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSubjectChange(s)}
                    className={`text-[9px] px-2 py-0.5 rounded-lg border transition ${
                      subject.toLowerCase() === s.toLowerCase()
                        ? 'bg-indigo-600 text-white border-indigo-400 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Jenjang, Kelas & Fase */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Jenjang Pendidikan</label>
                <select
                  value={level}
                  onChange={(e) => {
                    const newLvl = e.target.value as EducationLevel;
                    setLevel(newLvl);
                    setHasManuallyModified(true);
                    if (newLvl === 'SD') setGrade(4);
                    else if (newLvl === 'SMP') setGrade(7);
                    else setGrade(10);
                  }}
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="SD">SD (Sekolah Dasar)</option>
                  <option value="SMP">SMP (Menengah Pertama)</option>
                  <option value="SMA">SMA (Menengah Atas)</option>
                  <option value="SMK">SMK (Kejuruan)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-400 font-semibold">Kelas & Fase</label>
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-800/40">
                    {currentPhase}
                  </span>
                </div>
                <select
                  value={grade}
                  onChange={(e) => {
                    setGrade(Number(e.target.value));
                    setHasManuallyModified(true);
                  }}
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-indigo-500"
                >
                  {availableGrades.map((g) => (
                    <option key={g} value={g}>
                      Kelas {g} ({getPhaseName(g, level)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Semester Selection */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Semester</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSemester('Ganjil');
                    setHasManuallyModified(true);
                  }}
                  className={`py-2 px-3 rounded-xl font-bold text-xs transition border ${
                    semester === 'Ganjil'
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white border-slate-800'
                  }`}
                >
                  Semester 1 (Ganjil)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSemester('Genap');
                    setHasManuallyModified(true);
                  }}
                  className={`py-2 px-3 rounded-xl font-bold text-xs transition border ${
                    semester === 'Genap'
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white border-slate-800'
                  }`}
                >
                  Semester 2 (Genap)
                </button>
              </div>
            </div>

            {/* Topik / Materi Pokok Pembelajaran (Ditiadakan pada PROSEM karena merangkum seluruh ATP & Lingkup Materi semester) */}
            {docType !== 'prosem' ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold">
                    Topik / Materi Pokok Pembelajaran *
                  </label>
                  {(activeMasterCP || (syncedContext.sem1Materials.length > 0 || syncedContext.sem2Materials.length > 0)) && (
                    <span className="text-[10px] text-indigo-400 font-medium">
                      Tersinkronisasi dari Master CP
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Kinematika & Dinamika Gerak Lurus"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium text-xs focus:outline-none focus:border-indigo-500"
                />
                {/* Quick TP Suggestions from Active Master CP / Synced Context */}
                {((semester === 'Ganjil' ? (activeMasterCP?.materialsSem1 || syncedContext.sem1Materials) : (activeMasterCP?.materialsSem2 || syncedContext.sem2Materials))?.length > 0) && (
                  <div className="mt-2 space-y-1">
                    <div className="text-[10px] text-slate-400 font-medium flex items-center justify-between">
                      <span>Pilih Cepat TP Semester {semester}:</span>
                      <span className="text-[9px] text-indigo-400">Klik untuk memuat alokasi JP</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto custom-scrollbar p-1.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      {(semester === 'Ganjil' ? (activeMasterCP?.materialsSem1 || syncedContext.sem1Materials) : (activeMasterCP?.materialsSem2 || syncedContext.sem2Materials))?.map((item, idx) => (
                        <button
                          key={item.id || idx}
                          type="button"
                          onClick={() => {
                            setTopic(item.essentialMaterial || item.tpName);
                            if (item.allocatedHours) {
                              setHoursPerMeeting(Math.min(4, Math.max(2, Math.round(item.allocatedHours / 2))));
                            }
                          }}
                          className={`text-[10px] px-2 py-1 rounded-lg border text-left transition truncate max-w-full ${
                            topic === (item.essentialMaterial || item.tpName)
                              ? 'bg-indigo-600 text-white border-indigo-400 font-bold shadow-sm'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-indigo-500 hover:text-white'
                          }`}
                          title={`${item.tpCode}: ${item.tpName} (${item.allocatedHours} JP)`}
                        >
                          <span className="font-mono text-indigo-400 mr-1">{item.tpCode}</span>
                          <span>{item.essentialMaterial || item.tpName}</span>
                          {item.allocatedHours && (
                            <span className="ml-1 px-1 py-0.2 bg-slate-800 text-slate-400 rounded text-[8px]">
                              {item.allocatedHours} JP
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-slate-950 border border-indigo-700/60 space-y-2 shadow-lg">
                <div className="flex items-center space-x-2 text-indigo-300 font-bold text-xs">
                  <CalendarCheck className="w-4 h-4 text-cyan-400" />
                  <span>Struktur Program Semester (PROSEM) Otomatis</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Tabel PROSEM akan menyusun kolom: <strong>No</strong>, <strong>ATP</strong>, <strong>LINGKUP MATERI</strong>, <strong>JP</strong>, dan <strong>BULAN</strong> (Pekan 1, 2, 3, 4) yang <strong>tersinkronisasi langsung dengan Kalender Pendidikan</strong> dan alokasi waktu efektif berwarna (KBM 🟢, Libur 🔴, MPLS 🟠, ASTS 🟡, P5 🔵, ASAS 🟣, Rapor ⚪).
                </p>
              </div>
            )}

            {/* Meeting and JP configuration for RPM (Rencana Pelaksanaan Modul) */}
            {docType === 'modul_ajar' && (
              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 space-y-3 shadow-inner">
                {/* Number of Meetings and Hours per Meeting Configuration */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-amber-300 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Jumlah Pertemuan & Alokasi Jam (JP) RPM</span>
                    </label>
                    <span className="text-[10px] font-mono font-black text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                      Total: {meetingCount * hoursPerMeeting} JP ({meetingCount * hoursPerMeeting * minutesPerJP} Menit)
                    </span>
                  </div>

                  {/* Dual Grid: Jumlah Pertemuan & JP per Pertemuan */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Jumlah Pertemuan */}
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                        <span>Jml Pertemuan:</span>
                        <span className="text-indigo-400 font-extrabold">{meetingCount} Pertemuan</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="number"
                          min={0}
                          max={30}
                          value={meetingCount}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMeetingCount(val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0));
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold text-xs text-center focus:outline-none focus:border-indigo-500"
                        />
                        <span className="text-[10px] text-slate-400 shrink-0">Kali</span>
                      </div>
                      {/* Quick Chips */}
                      <div className="flex items-center space-x-1 pt-1">
                        {[1, 2, 3, 4].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setMeetingCount(num)}
                            className={`flex-1 py-1 rounded text-[10px] font-bold transition border ${
                              meetingCount === num
                                ? 'bg-indigo-600 text-white border-indigo-400'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            {num}P
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Jam per Pertemuan (JP) */}
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                        <span>Jam/Pertemuan:</span>
                        <span className="text-emerald-400 font-extrabold">{hoursPerMeeting} JP</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={hoursPerMeeting}
                          onChange={(e) => {
                            const val = e.target.value;
                            setHoursPerMeeting(val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0));
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold text-xs text-center focus:outline-none focus:border-emerald-500"
                        />
                        <span className="text-[10px] text-slate-400 shrink-0">JP</span>
                      </div>
                      {/* Quick Chips */}
                      <div className="flex items-center space-x-1 pt-1">
                        {[2, 3, 4].map((jp) => (
                          <button
                            key={jp}
                            type="button"
                            onClick={() => setHoursPerMeeting(jp)}
                            className={`flex-1 py-1 rounded text-[10px] font-bold transition border ${
                              hoursPerMeeting === jp
                                ? 'bg-emerald-600 text-white border-emerald-400'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            {jp}JP
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Menit per JP & Hint Deep Learning Info */}
                  <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <span>Standar Durasi:</span>
                      <select
                        value={minutesPerJP}
                        onChange={(e) => setMinutesPerJP(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-slate-200 font-semibold focus:outline-none"
                      >
                        <option value={45}>45 Menit / JP (SMA / SMK)</option>
                        <option value={40}>40 Menit / JP (SMP)</option>
                        <option value={35}>35 Menit / JP (SD)</option>
                      </select>
                    </div>
                    <span className="text-indigo-300 font-bold">
                      {hoursPerMeeting * minutesPerJP} Menit / Pertemuan
                    </span>
                  </div>
                </div>

                {/* Manual TP (Tujuan Pembelajaran) Configuration */}
                <div className="pt-2 border-t border-indigo-900/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-indigo-200 flex items-center space-x-1.5">
                      <Target className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Rumusan Tujuan Pembelajaran (TP):</span>
                    </label>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border transition ${
                        useManualTP
                          ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                          : 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60'
                      }`}
                    >
                      {useManualTP ? '✏️ TP Mandiri (Custom)' : '✨ Otomatis AI (ABCD & HOTS)'}
                    </span>
                  </div>

                  {/* Toggle Mode: Otomatis AI vs Input TP Manual */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUseManualTP(false)}
                      className={`p-2 rounded-xl text-left font-bold transition border text-xs flex items-start space-x-2 ${
                        !useManualTP
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <div>
                        <div className="leading-tight">Rumusan Otomatis AI</div>
                        <div className="text-[9px] font-normal opacity-80 mt-0.5">
                          Standar CP & Taksonomi ABCD HOTS Deep Learning
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUseManualTP(true);
                        if (!manualTPText.trim()) {
                          setManualTPText(
                            `1. Mengidentifikasi konsep esensial dan pola keteraturan dalam ${topic || subject} secara kritis dan mandiri.\n2. Menganalisis hubungan antar-variabel dan memecahkan persoalan kontekstual melalui penyelidikan terbimbing.\n3. Merancang dan mempresentasikan karya rekayasa solusi inovatif ${topic || subject} secara kolaboratif.`
                          );
                        }
                      }}
                      className={`p-2 rounded-xl text-left font-bold transition border text-xs flex items-start space-x-2 ${
                        useManualTP
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-300" />
                      <div>
                        <div className="leading-tight">Input TP Manual (Guru)</div>
                        <div className="text-[9px] font-normal opacity-80 mt-0.5">
                          Buat Modul Ajar dengan TP rumusan sendiri
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Manual TP Input Card */}
                  {useManualTP && (
                    <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-500/40 space-y-2.5 animate-fadeIn">
                      {/* Rule Requirement Banner */}
                      <div className="bg-amber-950/40 border border-amber-700/50 rounded-lg p-2 text-[11px] text-amber-200 flex items-start space-x-2">
                        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="font-bold text-amber-300">
                            Syarat Penginputan TP Manual Guru:
                          </p>
                          <p className="text-[10px] text-amber-200/90 leading-relaxed">
                            Penginputan TP <strong>harus dimulai dengan angka</strong> urut. Contoh format:
                            <br />
                            <span className="font-mono text-amber-300 font-bold">1. ......</span>
                            <br />
                            <span className="font-mono text-amber-300 font-bold">2. ......</span>
                            <br />
                            <span>dst jika menginput banyak TP.</span>
                          </p>
                        </div>
                      </div>

                      {/* Header & Quick Action Buttons */}
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-[11px] font-bold text-slate-300 flex items-center space-x-1">
                          <ListOrdered className="w-3.5 h-3.5 text-amber-400" />
                          <span>Daftar TP Manual:</span>
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setManualTPText(
                                `1. Mengidentifikasi konsep esensial dan pola keteraturan dalam ${topic || subject} secara kritis dan mandiri.\n2. Menganalisis hubungan antar-variabel dan memecahkan persoalan kontekstual melalui penyelidikan terbimbing.\n3. Merancang dan mempresentasikan karya rekayasa solusi inovatif ${topic || subject} secara kolaboratif.`
                              );
                            }}
                            className="px-2 py-1 rounded bg-indigo-950/80 text-indigo-300 hover:bg-indigo-900 border border-indigo-700/60 text-[10px] font-bold transition flex items-center space-x-1"
                            title="Sisipkan contoh draft TP 1, 2, 3"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                            <span>Contoh TP 1, 2, 3</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (!manualTPText.trim()) return;
                              const lines = manualTPText.split('\n');
                              let num = 1;
                              const formatted = lines
                                .map((l) => l.trim())
                                .filter(Boolean)
                                .map((l) => {
                                  const clean = l.replace(/^(\d+[\.\)\-:]|\-|\*|\•)\s*/, '').trim();
                                  const res = `${num}. ${clean}`;
                                  num++;
                                  return res;
                                });
                              setManualTPText(formatted.join('\n'));
                            }}
                            className="px-2 py-1 rounded bg-amber-950/80 text-amber-300 hover:bg-amber-900 border border-amber-700/60 text-[10px] font-bold transition flex items-center space-x-1"
                            title="Rapikan penomoran angka urut (1., 2., 3., dst)"
                          >
                            <ListOrdered className="w-2.5 h-2.5 text-amber-400" />
                            <span>Rapikan Penomoran (1, 2, dst)</span>
                          </button>
                        </div>
                      </div>

                      {/* Textarea */}
                      <textarea
                        rows={4}
                        value={manualTPText}
                        onChange={(e) => setManualTPText(e.target.value)}
                        placeholder={`1. Mengidentifikasi prinsip dasar materi kontekstual secara teliti dan mandiri.\n2. Menganalisis data penyelidikan dan menyelesaikan studi kasus persoalan nyata.\n3. Merancang purwarupa produk solusi dan mempresentasikannya secara kolaboratif.`}
                        className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 leading-relaxed"
                      />

                      {/* Format Validation Helper */}
                      {(() => {
                        const lines = manualTPText
                          .split('\n')
                          .map((l) => l.trim())
                          .filter(Boolean);
                        const allNumbered =
                          lines.length > 0 && lines.every((l) => /^\d+[\.\)\-\s]/.test(l));

                        return (
                          <div className="flex items-center justify-between text-[10px]">
                            {lines.length > 0 ? (
                              allNumbered ? (
                                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span>
                                    Format penomoran angka valid ({lines.length} butir TP terdeteksi: 1 s.d. {lines.length})
                                  </span>
                                </span>
                              ) : (
                                <span className="text-amber-400 font-medium flex items-center space-x-1">
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  <span>
                                    Ada baris tanpa angka. Klik tombol "Rapikan Penomoran" agar otomatis bernomor 1., 2., dst.
                                  </span>
                                </span>
                              )
                            ) : (
                              <span className="text-slate-400 italic">
                                Ketik rumusan TP Anda di atas dengan awalan angka 1. ..., 2. ..., dst.
                              </span>
                            )}

                            {manualTPText.trim() && (
                              <button
                                type="button"
                                onClick={() => setManualTPText('')}
                                className="text-[10px] text-slate-400 hover:text-rose-400 transition underline ml-2 shrink-0"
                              >
                                Bersihkan
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Special Synchronization & Meetings Configuration for LKPD (Lembar Kerja Peserta Didik) */}
            {docType === 'lkpd' && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-700/60 space-y-3 shadow-inner">
                {/* Banner Sinkronisasi RPM Deep Learning */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-black text-emerald-300">
                      Tersinkronisasi Otomatis dengan RPM (Rencana Pelaksanaan Modul)
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/50">
                    4 Sintaks Deep Learning
                  </span>
                </div>

                <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/70 p-2.5 rounded-xl border border-emerald-800/40 space-y-1.5">
                  <div className="flex items-start space-x-1.5 text-emerald-200 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>Fitur Unggulan LKPD Deep Learning Berilustrasi:</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] text-slate-300 pt-1">
                    <li className="flex items-center space-x-1.5 bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                      <span>📊</span>
                      <span><strong>Diagram & Bagan Visual:</strong> Memetakan konsep secara menarik</span>
                    </li>
                    <li className="flex items-center space-x-1.5 bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                      <span>🎨</span>
                      <span><strong>Kanvas Sketsa Siswa:</strong> Wadah gambar ide & prototipe solusi</span>
                    </li>
                    <li className="flex items-center space-x-1.5 bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                      <span>🌟</span>
                      <span><strong>Joyful Gallery Walk:</strong> Umpan balik Two Stars & a Wish</span>
                    </li>
                    <li className="flex items-center space-x-1.5 bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                      <span>🧠</span>
                      <span><strong>Kartu Refleksi 3-2-1:</strong> Evaluasi kesadaran & metakognisi</span>
                    </li>
                  </ul>
                </div>

                {/* Number of Meetings and Hours per Meeting Configuration for LKPD */}
                <div className="pt-2 border-t border-emerald-900/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-amber-300 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Jumlah Pertemuan LKPD (Tersinkron RPM):</span>
                    </label>
                    <span className="text-[10px] font-mono font-black text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                      Total: {meetingCount} Pertemuan LKPD ({meetingCount * hoursPerMeeting} JP)
                    </span>
                  </div>

                  {/* Dual Grid: Jumlah Pertemuan & JP per Pertemuan */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Jumlah Pertemuan */}
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                        <span>Jml LKPD Pertemuan:</span>
                        <span className="text-emerald-400 font-extrabold">{meetingCount} Pertemuan</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={meetingCount}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMeetingCount(val === '' ? 1 : Math.max(1, parseInt(val, 10) || 1));
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold text-xs text-center focus:outline-none focus:border-emerald-500"
                        />
                        <span className="text-[10px] text-slate-400 shrink-0">Kali</span>
                      </div>
                      {/* Quick Chips */}
                      <div className="flex items-center space-x-1 pt-1">
                        {[1, 2, 3, 4].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setMeetingCount(num)}
                            className={`flex-1 py-1 rounded text-[10px] font-bold transition border ${
                              meetingCount === num
                                ? 'bg-emerald-600 text-white border-emerald-400'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            {num}P
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Jam per Pertemuan (JP) */}
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                        <span>Alokasi Jam/Pertemuan:</span>
                        <span className="text-emerald-400 font-extrabold">{hoursPerMeeting} JP</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={hoursPerMeeting}
                          onChange={(e) => {
                            const val = e.target.value;
                            setHoursPerMeeting(val === '' ? 1 : Math.max(1, parseInt(val, 10) || 1));
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold text-xs text-center focus:outline-none focus:border-emerald-500"
                        />
                        <span className="text-[10px] text-slate-400 shrink-0">JP</span>
                      </div>
                      {/* Quick Chips */}
                      <div className="flex items-center space-x-1 pt-1">
                        {[2, 3, 4].map((jp) => (
                          <button
                            key={jp}
                            type="button"
                            onClick={() => setHoursPerMeeting(jp)}
                            className={`flex-1 py-1 rounded text-[10px] font-bold transition border ${
                              hoursPerMeeting === jp
                                ? 'bg-emerald-600 text-white border-emerald-400'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            {jp}JP
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Instruction Prompt & Rich Content Toolbar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-slate-300 font-semibold text-xs flex items-center space-x-1.5">
                  <span>Instruksi Khusus Tambahan (Opsional)</span>
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-indigo-400 font-medium hidden sm:inline">
                    Mendukung Gambar, Rumus ($/$$), Tabel, Simbol & Bagan
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPalette(!showPalette)}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/60 font-semibold flex items-center space-x-1 transition"
                  >
                    <Sigma className="w-3 h-3" />
                    <span>{showPalette ? 'Tutup Palet Simbol' : 'Buka Palet Simbol & Rumus'}</span>
                  </button>
                </div>
              </div>
              <textarea
                rows={2}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Contoh: Wajib cantumkan rumus $F=m \cdot a$, bagan alur konsep, dan tabel variabel pengamatan..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
              />

              {/* Quick Helper Action Chips */}
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mr-1">
                  Sisip Cepat:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCustomPrompt((prev) =>
                      prev
                        ? `${prev} + Wajib cantumkan rumus/formula ilmiah menggunakan LaTeX ($...$) dan contoh perhitungannya.`
                        : 'Wajib cantumkan rumus/formula ilmiah menggunakan LaTeX ($...$) dan contoh perhitungannya.'
                    )
                  }
                  className="text-[9px] px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-900/60 transition flex items-center space-x-1"
                >
                  <Calculator className="w-2.5 h-2.5" />
                  <span>+ Rumus LaTeX ($)</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCustomPrompt((prev) =>
                      prev
                        ? `${prev} + Sajikan instrumen data dalam bentuk tabel matriks terperinci.`
                        : 'Sajikan instrumen data dalam bentuk tabel matriks terperinci.'
                    )
                  }
                  className="text-[9px] px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-900/60 transition flex items-center space-x-1"
                >
                  <TableIcon className="w-2.5 h-2.5" />
                  <span>+ Tabel Matriks</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCustomPrompt((prev) =>
                      prev
                        ? `${prev} + Tampilkan diagram alur visual / bagan skematis fenomena (ASCII flowchart).`
                        : 'Tampilkan diagram alur visual / bagan skematis fenomena (ASCII flowchart).'
                    )
                  }
                  className="text-[9px] px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-900/60 transition flex items-center space-x-1"
                >
                  <ImageIcon className="w-2.5 h-2.5" />
                  <span>+ Skema Diagram</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCustomPrompt((prev) =>
                      prev
                        ? `${prev} + Lengkapi dengan petunjuk eksperimen laboratorium/lapangan dan identifikasi variabel (Bebas, Terikat, Kontrol).`
                        : 'Lengkapi dengan petunjuk eksperimen laboratorium/lapangan dan identifikasi variabel (Bebas, Terikat, Kontrol).'
                    )
                  }
                  className="text-[9px] px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-900/60 transition flex items-center space-x-1"
                >
                  <FlaskConical className="w-2.5 h-2.5" />
                  <span>+ Eksperimen & Variabel</span>
                </button>
              </div>

              {/* Expandable Comprehensive Palette Box */}
              {showPalette && (
                <div className="mt-2 p-2.5 bg-slate-950/90 border border-indigo-900/50 rounded-xl space-y-2 text-xs">
                  {/* Category Tabs */}
                  <div className="flex flex-wrap gap-1 border-b border-slate-800/80 pb-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setActivePaletteTab('yunani')}
                      className={`px-2 py-1 rounded-md font-semibold transition ${
                        activePaletteTab === 'yunani'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      🔣 Yunani
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePaletteTab('matematika')}
                      className={`px-2 py-1 rounded-md font-semibold transition ${
                        activePaletteTab === 'matematika'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      📐 Matematika & Operator
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePaletteTab('kimia')}
                      className={`px-2 py-1 rounded-md font-semibold transition ${
                        activePaletteTab === 'kimia'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      🧪 Kimia & Panah
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePaletteTab('rumus')}
                      className={`px-2 py-1 rounded-md font-semibold transition ${
                        activePaletteTab === 'rumus'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      📐 Template LaTeX
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePaletteTab('diagram')}
                      className={`px-2 py-1 rounded-md font-semibold transition ${
                        activePaletteTab === 'diagram'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      📊 Diagram & Tabel
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePaletteTab('lencana')}
                      className={`px-2 py-1 rounded-md font-semibold transition ${
                        activePaletteTab === 'lencana'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      💡 Lencana Deep Learning
                    </button>
                  </div>

                  {/* Tab Contents */}
                  <div className="pt-1">
                    {activePaletteTab === 'yunani' && (
                      <div className="flex flex-wrap gap-1">
                        {['α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ', 'μ', 'π', 'ρ', 'σ', 'τ', 'φ', 'ω', 'Δ', 'Σ', 'Ω', 'Ψ'].map((sym) => (
                          <button
                            key={sym}
                            type="button"
                            onClick={() => setCustomPrompt((prev) => `${prev} ${sym}`)}
                            className="text-xs font-mono px-2 py-1 rounded bg-slate-900 hover:bg-indigo-900/60 text-slate-200 hover:text-white border border-slate-800 transition"
                            title={`Sisipkan simbol ${sym}`}
                          >
                            {sym}
                          </button>
                        ))}
                      </div>
                    )}

                    {activePaletteTab === 'matematika' && (
                      <div className="flex flex-wrap gap-1">
                        {['±', '×', '÷', '·', '≤', '≥', '≠', '≈', '≡', '∞', '∝', '√', '∛', '∫', '∬', '∮', '∑', '∏', '∂', '∇', '°', '‰', '∈', '∉', '⊂', '⊆', '∪', '∩', '∅', '∀', '∃', '∴', '∵'].map((sym) => (
                          <button
                            key={sym}
                            type="button"
                            onClick={() => setCustomPrompt((prev) => `${prev} ${sym}`)}
                            className="text-xs font-mono px-2 py-1 rounded bg-slate-900 hover:bg-indigo-900/60 text-slate-200 hover:text-white border border-slate-800 transition"
                            title={`Sisipkan operator ${sym}`}
                          >
                            {sym}
                          </button>
                        ))}
                      </div>
                    )}

                    {activePaletteTab === 'kimia' && (
                      <div className="flex flex-wrap gap-1">
                        {['→', '⇌', '⇒', '⇔', '↑', '↓', '⇄', 'H₂O', 'CO₂', 'CH₄', 'O₂', 'NaCl', 'SO₄²⁻', 'NH₃', 'H⁺', 'OH⁻', 'ΔH', 'Ka', 'Kb'].map((sym) => (
                          <button
                            key={sym}
                            type="button"
                            onClick={() => setCustomPrompt((prev) => `${prev} ${sym}`)}
                            className="text-xs font-mono px-2 py-1 rounded bg-slate-900 hover:bg-indigo-900/60 text-slate-200 hover:text-white border border-slate-800 transition"
                            title={`Sisipkan ${sym}`}
                          >
                            {sym}
                          </button>
                        ))}
                      </div>
                    )}

                    {activePaletteTab === 'rumus' && (
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: 'Pecahan $\\frac{a}{b}$', val: '$\\frac{a}{b}$' },
                          { label: 'Pangkat $x^2$', val: '$x^{2}$' },
                          { label: 'Akar $\\sqrt{x}$', val: '$\\sqrt{x}$' },
                          { label: 'Hukum II Newton $$F = m \\cdot a$$', val: '$$F = m \\cdot a$$' },
                          { label: 'Kecepatan $$v = \\frac{s}{t}$$', val: '$$v = \\frac{s}{t}$$' },
                          { label: 'Derajat Asam $$\\text{pH} = -\\log[\\text{H}^+]$$', val: '$$\\text{pH} = -\\log[\\text{H}^+]$$' },
                          { label: 'Rumus ABC $$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$', val: '$$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$' },
                          { label: 'Integral $$\\int_{a}^{b} f(x) dx$$', val: '$$\\int_{a}^{b} f(x) dx$$' },
                        ].map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => setCustomPrompt((prev) => `${prev} ${item.val}`)}
                            className="text-[10px] font-mono px-2 py-1 rounded bg-slate-900 hover:bg-indigo-900/60 text-indigo-300 hover:text-white border border-indigo-950 transition"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {activePaletteTab === 'diagram' && (
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: '📊 Tabel 3 Variabel (Bebas, Terikat, Kontrol)', val: '+ Lengkapi tabel penyelidikan 3 variabel (Bebas, Terikat, Kontrol).' },
                          { label: '📋 Tabel Rubrik 4 Kategori KKTP', val: '+ Sajikan rubrik asesmen dalam tabel 4 level pencapaian KKTP (Perlu Bimbingan, Cukup, Baik, Sangat Baik).' },
                          { label: '🎨 Kotak Kanvas Sketsa Siswa', val: '+ Berikan ruang kotak [KANVAS SKETSA VISUAL SISWA] untuk gambar kreasi murid.' },
                          { label: '🖼️ Skema Alur Konsep (ASCII Diagram)', val: '+ Sertakan bagan alur proses skematis menggunakan diagram visual ASCII.' },
                        ].map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => setCustomPrompt((prev) => `${prev} ${item.val}`)}
                            className="text-[10px] px-2 py-1 rounded bg-slate-900 hover:bg-indigo-900/60 text-teal-300 hover:text-white border border-teal-950 transition"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {activePaletteTab === 'lencana' && (
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: '🧠 [Mindful Learning]', val: '[Mindful Learning]' },
                          { label: '💡 [Meaningful Learning]', val: '[Meaningful Learning]' },
                          { label: '🎉 [Joyful Learning]', val: '[Joyful Learning]' },
                          { label: '✨ [Deep Learning]', val: '[Deep Learning]' },
                          { label: '🔥 [HOTS]', val: '[HOTS]' },
                          { label: '🎯 [Diferensiasi]', val: '[Diferensiasi]' },
                          { label: '📝 [Asesmen Formatif]', val: '[Asesmen Formatif]' },
                          { label: '📊 [Asesmen Sumatif]', val: '[Asesmen Sumatif]' },
                        ].map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => setCustomPrompt((prev) => `${prev} ${item.val}`)}
                            className="text-[10px] px-2 py-1 rounded bg-slate-900 hover:bg-indigo-900/60 text-purple-300 hover:text-white border border-purple-950 transition"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Custom School Format Selector & Checkbox (PDF/Word/JPG format uploader for all AI 1 to 9) */}
            <CustomFormatSelector
              value={customFormatConfig}
              onChange={setCustomFormatConfig}
              docTypeName={docTypesList.find((d) => d.id === docType)?.label || 'Perangkat Ajar'}
              docTypeId={docType}
            />

            {/* Token Quota Meter & Status Badge */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    quotaStatus.isAdmin
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : quotaStatus.isExpired || quotaStatus.isExhausted
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : quotaStatus.monthlyRemaining > 5
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <span>Kuota AI Bulan Ini:</span>
                    {quotaStatus.isAdmin ? (
                      <span className="text-purple-400 font-extrabold">Unlimited (Admin)</span>
                    ) : quotaStatus.isExpired ? (
                      <span className="text-rose-400 font-bold">Masa Aktif Berakhir</span>
                    ) : (
                      <span
                        className={`font-mono font-black ${
                          quotaStatus.monthlyRemaining > 5
                            ? 'text-emerald-400'
                            : quotaStatus.monthlyRemaining > 0
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {quotaStatus.monthlyRemaining} / {quotaStatus.totalAllowed} Generate
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {quotaStatus.isAdmin
                      ? 'Akses penuh tanpa batas (Admin)'
                      : quotaStatus.isExpired
                      ? `Jatuh tempo: ${quotaStatus.subscriptionExpiryDate}`
                      : quotaStatus.isExpiringSoon
                      ? `Jatuh tempo ${quotaStatus.daysUntilExpiry} hari lagi (${quotaStatus.subscriptionExpiryDate})`
                      : `35x (500k token/bln) • Reset tiap tgl ${quotaStatus.billingCycleDay || 1}${quotaStatus.extra > 0 ? ` • +${quotaStatus.extra} Bonus` : ''}`}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTokenModal(true)}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold shrink-0 flex items-center space-x-1 transition"
              >
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                <span>Info & Voucher</span>
              </button>
            </div>

            {/* Generate Trigger Button */}
            <button
              id="btn-generate-ai"
              type="button"
              disabled={loading}
              onClick={() => handleGenerate()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-extrabold text-xs tracking-wide shadow-xl shadow-indigo-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI Menyusun Dokumen Kurikulum...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Generate Dokumen dengan AI (Deep Learning)</span>
                </>
              )}
            </button>
            </div>
          </div>
        )}

        {/* Right Column: AI Output Viewer & PDF Document View */}
        <div className={`${viewLayout === 'fullscreen' ? 'lg:col-span-12' : 'lg:col-span-7'} flex flex-col space-y-4 transition-all duration-200`}>
          {loading ? (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[500px]">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 animate-spin">
                <RefreshCw className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Menyusun Dokumen Perangkat Ajar...</h4>
                <p className="text-xs text-slate-400 max-w-md mt-1.5 leading-relaxed">
                  Menerapkan sintaks Kurikulum Deep Learning (Mindful, Meaningful, & Joyful), pemetaan CP ke TP, materi esensial, asesmen autentik, dan format administrasi resmi.
                </p>
              </div>
            </div>
          ) : generatedMarkdown ? (
            <div className="min-h-[550px]">
              <DocumentPdfPreview
                title={`${docTypesList.find((d) => d.id === docType)?.label || (typeof docType === 'string' ? docType.toUpperCase() : 'DOKUMEN')} - ${subject}`}
                markdownContent={generatedMarkdown}
                subject={subject}
                grade={grade}
                level={level}
                semester={semester}
                docType={docType}
                teacherName={currentUser?.name}
                fileNamePrefix={`Perangkat_Ajar_${docType}_${subject}_Kls${grade}`}
              />
            </div>
          ) : (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[500px] text-slate-500">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <Sparkles className="w-10 h-10 text-indigo-400/50" />
              </div>
              <div className="max-w-md">
                <h4 className="text-sm font-bold text-slate-300">Dokumen Belum Dibuat</h4>
                <p className="text-xs font-medium text-slate-400 mt-1.5 leading-relaxed">
                  Pilih jenis perangkat ajar dan parameter di sebelah kiri, lalu klik <strong>"Generate Dokumen dengan AI"</strong>. Setelah selesai, dokumen bisa <strong>langsung didownload dalam format Word (.doc), PDF, dan Excel (.xlsx)</strong> secara instan dengan 1-klik.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User-facing Token Quota & Voucher Redemption Modal */}
      <TokenQuotaModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        currentUser={currentUser}
        onTokenUpdated={() => {
          const u = StorageService.getCurrentUser();
          setCurrentUser(u);
          setQuotaStatus(StorageService.getTokenQuotaStatus(u));
        }}
      />
    </div>
  );
};
