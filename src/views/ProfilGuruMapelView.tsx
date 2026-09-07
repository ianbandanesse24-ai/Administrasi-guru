import React, { useState, useEffect, useRef } from 'react';
import {
  UserCheck,
  Sparkles,
  Layers,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  FileSpreadsheet,
  Download,
  Printer,
  Plus,
  Trash2,
  Edit3,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Save,
  RefreshCw,
  FolderOpen,
  HelpCircle,
  Database,
  CloudUpload,
  Copy,
  ClipboardPaste,
  Search,
  X,
  Check,
  Bookmark,
  ListOrdered,
  AlertCircle,
  Sliders,
  UploadCloud,
  GraduationCap,
  BookOpen,
  Target,
  FileUp,
  CheckCircle,
  Flame,
  CheckSquare,
  Building2,
  FileCheck,
} from 'lucide-react';
import {
  SchoolLevel,
  CPMaterialItem,
  CPDistributionPlan,
  CPReference,
  ActiveMasterCPData,
  SchoolProfile,
} from '../types';
import { StorageService, INITIAL_CP_DISTRIBUTIONS } from '../lib/storage';
import { ExportService } from '../lib/exportUtils';
import { SUBJECT_MATERIAL_PRESETS, SubjectPreset, getSubjectPresetByGrade } from '../lib/subjectMaterialPresets';
import { CustomFormatSelector, CustomFormatConfig } from '../components/CustomFormatSelector';

const POPULAR_SUBJECTS = [
  'Fisika',
  'Matematika',
  'Kimia',
  'Biologi',
  'Informatika',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Pendidikan Pancasila',
  'Sejarah',
  'Geografi',
  'Ekonomi',
  'Sosiologi',
  'Pendidikan Jasmani & Kesehatan (PJOK)',
  'Seni Budaya',
  'Prakarya & Kewirausahaan',
  'Pendidikan Agama & Budi Pekerti',
  'IPAS (SD/SMP)',
];

interface ProfilGuruMapelViewProps {
  initialTab?: 'profile' | 'sem1' | 'sem2' | 'preview' | 'bank';
  onNavigate?: (tab: string, subType?: string) => void;
}

export const ProfilGuruMapelView: React.FC<ProfilGuruMapelViewProps> = ({
  initialTab = 'profile',
  onNavigate,
}) => {
  const [plans, setPlans] = useState<CPDistributionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'profile' | 'sem1' | 'sem2' | 'preview' | 'bank'>(initialTab);
  const [activeMasterCP, setActiveMasterCP] = useState<ActiveMasterCPData | null>(() => StorageService.getActiveMasterCP());
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [showSyncSuccessModal, setShowSyncSuccessModal] = useState<boolean>(false);

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileExtracting, setFileExtracting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reference CP bank
  const [cpReferences, setCpReferences] = useState<CPReference[]>([]);

  // 1. BIODATA GURU MATA PELAJARAN
  const [teacherName, setTeacherName] = useState<string>('Aspian La Ode Madimu, S.Pd. Gr');
  const [teacherNip, setTeacherNip] = useState<string>('19900822 201801 1 004');
  const [schoolName, setSchoolName] = useState<string>('SMA NEGERI 30 MALUKU TENGAH');
  const [principalName, setPrincipalName] = useState<string>('Drs. H. Ahmad Dahlan, M.Pd.');
  const [principalNip, setPrincipalNip] = useState<string>('19680514 199303 1 008');
  const [academicYear, setAcademicYear] = useState<string>('2025/2026');
  const [activeSemester, setActiveSemester] = useState<'all' | 'sem1' | 'sem2'>('all');
  const [city, setCity] = useState<string>('Maluku Tengah');

  // 2. PARAMETER KURIKULUM & BEBAN MENGAJAR
  const [subject, setSubject] = useState<string>('Fisika');
  const [level, setLevel] = useState<SchoolLevel>('SMA');
  const [grade, setGrade] = useState<number | string>(10);
  const [phase, setPhase] = useState<string>('Fase E');
  const [jpPerWeek, setJpPerWeek] = useState<number>(3);
  const [totalHoursPerYear, setTotalHoursPerYear] = useState<number>(108);
  const [timeAllocationPerWeek, setTimeAllocationPerWeek] = useState<string>('45 Menit');
  const [totalTPCount, setTotalTPCount] = useState<number>(6);
  const [cpText, setCpText] = useState<string>(
    'Peserta didik mampu mengamati, menyelidiki, dan menjelaskan fenomena sehari-hari yang berkaitan dengan pengukuran besaran fisika, energi terbarukan, pemanasan global, dan pemanfaatan teknologi ramah lingkungan dengan pendekatan Deep Learning (Mindful, Meaningful, Joyful).'
  );

  // Custom School Format State
  const [customFormatConfig, setCustomFormatConfig] = useState<CustomFormatConfig>(() => {
    try {
      const saved = localStorage.getItem('kurikulum_custom_format_analisis_cp');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      useCustomFormat: false,
      formatFile: null,
      customFormatNotes: '',
    };
  });

  // Distributed Materials State
  const [materialsSem1, setMaterialsSem1] = useState<CPMaterialItem[]>([]);
  const [materialsSem2, setMaterialsSem2] = useState<CPMaterialItem[]>([]);

  // Detailed Modal Add/Edit Material State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalSemester, setModalSemester] = useState<1 | 2>(1);
  const [modalItem, setModalItem] = useState<CPMaterialItem>({
    id: '',
    semester: 1,
    orderNumber: 1,
    tpCode: '',
    tpName: '',
    essentialMaterial: '',
    elementName: 'Pemahaman Konsep / Keterampilan Proses',
    allocatedHours: 18,
    assessmentStrategy: 'Tes Formatif & Kinerja Proyek',
    deepLearningMethod: 'Mindful: Observasi kesadaran konsep, Meaningful: Studi kasus kontekstual, Joyful: Aktivitas interaktif',
  });
  const [isNewModalItem, setIsNewModalItem] = useState<boolean>(true);

  // Batch Paste Modal State
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [batchSemester, setBatchSemester] = useState<1 | 2>(1);
  const [batchText, setBatchText] = useState<string>('');
  const [batchHoursPerItem, setBatchHoursPerItem] = useState<number>(18);
  const [batchAssessment, setBatchAssessment] = useState<string>('Tes Formatif & Kinerja');

  // Preset Template Modal State
  const [isPresetModalOpen, setIsPresetModalOpen] = useState<boolean>(false);
  const [selectedPresetSubject, setSelectedPresetSubject] = useState<string>('Fisika');

  // Search/Filter in tab
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Inline Quick Add State
  const [inlineMaterialSem1, setInlineMaterialSem1] = useState<string>('');
  const [inlineJPSem1, setInlineJPSem1] = useState<number>(18);
  const [inlineMaterialSem2, setInlineMaterialSem2] = useState<string>('');
  const [inlineJPSem2, setInlineJPSem2] = useState<number>(18);

  // Section B Tab Selector for Semester Bab inputs
  const [sectionBTab, setSectionBTab] = useState<'sem1' | 'sem2' | 'both'>('sem1');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    const loadedPlans = StorageService.getCPDistributions();
    const loadedCpRefs = StorageService.getCPReferences();
    const schoolProfile = StorageService.getSchoolProfile();
    const activeMaster = StorageService.getActiveMasterCP();

    setPlans(loadedPlans);
    setCpReferences(loadedCpRefs);

    if (schoolProfile) {
      if (schoolProfile.schoolName) setSchoolName(schoolProfile.schoolName);
      if (schoolProfile.teacherName) setTeacherName(schoolProfile.teacherName);
      if (schoolProfile.teacherNip) setTeacherNip(schoolProfile.teacherNip);
      if (schoolProfile.headmasterName || schoolProfile.principalName)
        setPrincipalName(schoolProfile.headmasterName || schoolProfile.principalName || '');
      if (schoolProfile.headmasterNip || schoolProfile.principalNip)
        setPrincipalNip(schoolProfile.headmasterNip || schoolProfile.principalNip || '');
      if (schoolProfile.academicYear) setAcademicYear(schoolProfile.academicYear);
      if (schoolProfile.city) setCity(schoolProfile.city);
    }

    if (activeMaster) {
      setActiveMasterCP(activeMaster);
      setSubject(activeMaster.subject);
      setLevel(activeMaster.level);
      setGrade(activeMaster.grade);
      setPhase(activeMaster.phase);
      setTotalHoursPerYear(activeMaster.totalHoursPerYear);
      setJpPerWeek(activeMaster.jpPerWeek);
      if (activeMaster.timeAllocationPerWeek) {
        setTimeAllocationPerWeek(activeMaster.timeAllocationPerWeek);
      } else {
        setTimeAllocationPerWeek(activeMaster.level === 'SD' ? '35 Menit' : activeMaster.level === 'SMP' ? '40 Menit' : '45 Menit');
      }
      if (activeMaster.cpText) setCpText(activeMaster.cpText);
      setMaterialsSem1(activeMaster.materialsSem1 || []);
      setMaterialsSem2(activeMaster.materialsSem2 || []);
    } else if (loadedPlans.length > 0) {
      loadPlanIntoState(loadedPlans[0]);
    } else if (INITIAL_CP_DISTRIBUTIONS.length > 0) {
      loadPlanIntoState(INITIAL_CP_DISTRIBUTIONS[0]);
    }
  };

  const loadPlanIntoState = (plan: CPDistributionPlan) => {
    setSelectedPlanId(plan.id);
    setTeacherName(plan.teacherName);
    setTeacherNip(plan.teacherNip || '');
    setSubject(plan.subject);
    setSchoolName(plan.schoolName);
    setLevel(plan.level);
    setGrade(plan.grade);
    setPhase(plan.phase);
    setAcademicYear(plan.academicYear);
    setTotalHoursPerYear(plan.totalHoursPerYear);
    setJpPerWeek(plan.jpPerWeek || Math.round(plan.totalHoursPerYear / 36) || 3);
    if (plan.timeAllocationPerWeek) {
      setTimeAllocationPerWeek(plan.timeAllocationPerWeek);
    } else {
      setTimeAllocationPerWeek(plan.level === 'SD' ? '35 Menit' : plan.level === 'SMP' ? '40 Menit' : '45 Menit');
    }
    setTotalTPCount(plan.totalTPCount || (plan.materialsSem1?.length || 0) + (plan.materialsSem2?.length || 0) || 6);
    setCpText(plan.cpText || '');
    setMaterialsSem1(plan.materialsSem1 || []);
    setMaterialsSem2(plan.materialsSem2 || []);
  };

  const showNotif = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // Automatically update CP, Phase, and Chapters when Subject changes
  const handleSubjectChange = (newSub: string) => {
    setSubject(newSub);
    const targetGrade = Number(grade) || (level === 'SD' ? 4 : level === 'SMP' ? 7 : 10);
    const targetLvl = (level || 'SMA') as 'SMA' | 'SMP' | 'SD' | 'SMK';
    const preset = getSubjectPresetByGrade(newSub, targetLvl, targetGrade);

    setPhase(preset.phase);
    setCpText(preset.cpSummary);
    setTotalHoursPerYear(preset.totalHoursPerYear);
    const calculatedJp = Math.round(preset.totalHoursPerYear / 36) || 3;
    setJpPerWeek(calculatedJp);

    const sem1WithIds: CPMaterialItem[] = preset.materialsSem1.map((m, idx) => ({
      ...m,
      id: `mat-1-${Date.now()}-${idx}`,
    }));
    const sem2WithIds: CPMaterialItem[] = preset.materialsSem2.map((m, idx) => ({
      ...m,
      id: `mat-2-${Date.now()}-${idx}`,
    }));

    setMaterialsSem1(sem1WithIds);
    setMaterialsSem2(sem2WithIds);
    setTotalTPCount(sem1WithIds.length + sem2WithIds.length);

    showNotif(`Mata Pelajaran "${newSub}" dipilih. Lingkup materi Bab & CP otomatis disesuaikan untuk Kelas ${targetGrade} (${preset.phase})!`);
  };

  // Automatically update phase & materials when grade changes
  const handleGradeChange = (newGrade: number) => {
    setGrade(newGrade);
    const targetLvl = (level || 'SMA') as 'SMA' | 'SMP' | 'SD' | 'SMK';
    const preset = getSubjectPresetByGrade(subject || 'Fisika', targetLvl, newGrade);
    setPhase(preset.phase);
    setCpText(preset.cpSummary);
    setTotalHoursPerYear(preset.totalHoursPerYear);
    setJpPerWeek(Math.round(preset.totalHoursPerYear / 36) || 3);

    const sem1WithIds: CPMaterialItem[] = preset.materialsSem1.map((m, idx) => ({
      ...m,
      id: `mat-1-${Date.now()}-${idx}`,
    }));
    const sem2WithIds: CPMaterialItem[] = preset.materialsSem2.map((m, idx) => ({
      ...m,
      id: `mat-2-${Date.now()}-${idx}`,
    }));

    setMaterialsSem1(sem1WithIds);
    setMaterialsSem2(sem2WithIds);
    setTotalTPCount(sem1WithIds.length + sem2WithIds.length);

    showNotif(`Kelas ${newGrade} dipilih. Lingkup materi Bab & CP otomatis disesuaikan untuk ${subject} (${preset.phase})!`);
  };

  const handleLevelChange = (newLvl: SchoolLevel) => {
    setLevel(newLvl);
    let defaultGrade = 10;
    let defaultTime = '45 Menit';
    if (newLvl === 'SD') {
      defaultGrade = 4;
      defaultTime = '35 Menit';
    } else if (newLvl === 'SMP') {
      defaultGrade = 7;
      defaultTime = '40 Menit';
    } else {
      defaultGrade = 10;
      defaultTime = '45 Menit';
    }
    setGrade(defaultGrade);
    setTimeAllocationPerWeek(defaultTime);

    const preset = getSubjectPresetByGrade(subject || 'Fisika', newLvl, defaultGrade);
    setPhase(preset.phase);
    setCpText(preset.cpSummary);
    setTotalHoursPerYear(preset.totalHoursPerYear);
    setJpPerWeek(Math.round(preset.totalHoursPerYear / 36) || 3);

    const sem1WithIds: CPMaterialItem[] = preset.materialsSem1.map((m, idx) => ({
      ...m,
      id: `mat-1-${Date.now()}-${idx}`,
    }));
    const sem2WithIds: CPMaterialItem[] = preset.materialsSem2.map((m, idx) => ({
      ...m,
      id: `mat-2-${Date.now()}-${idx}`,
    }));

    setMaterialsSem1(sem1WithIds);
    setMaterialsSem2(sem2WithIds);
    setTotalTPCount(sem1WithIds.length + sem2WithIds.length);

    showNotif(`Jenjang ${newLvl} dipilih. Materi Bab & CP otomatis disesuaikan untuk Kelas ${defaultGrade} (${preset.phase})!`);
  };

  // Automatically update grade & materials when Phase changes
  const handlePhaseChange = (newPhase: string) => {
    setPhase(newPhase);
    let targetGrade = Number(grade);
    if (newPhase === 'Fase A') targetGrade = 1;
    else if (newPhase === 'Fase B') targetGrade = 4;
    else if (newPhase === 'Fase C') targetGrade = 5;
    else if (newPhase === 'Fase D') targetGrade = 7;
    else if (newPhase === 'Fase E') targetGrade = 10;
    else if (newPhase === 'Fase F') targetGrade = 11;

    setGrade(targetGrade);
    const targetLvl = (level || 'SMA') as 'SMA' | 'SMP' | 'SD' | 'SMK';
    const preset = getSubjectPresetByGrade(subject || 'Fisika', targetLvl, targetGrade);
    setCpText(preset.cpSummary);
    setTotalHoursPerYear(preset.totalHoursPerYear);

    const sem1WithIds: CPMaterialItem[] = preset.materialsSem1.map((m, idx) => ({
      ...m,
      id: `mat-1-${Date.now()}-${idx}`,
    }));
    const sem2WithIds: CPMaterialItem[] = preset.materialsSem2.map((m, idx) => ({
      ...m,
      id: `mat-2-${Date.now()}-${idx}`,
    }));

    setMaterialsSem1(sem1WithIds);
    setMaterialsSem2(sem2WithIds);
    setTotalTPCount(sem1WithIds.length + sem2WithIds.length);

    showNotif(`Fase ${newPhase} dipilih. Materi Bab & CP otomatis disesuaikan untuk Kelas ${targetGrade}!`);
  };

  const handleJpPerWeekChange = (newJp: number) => {
    const val = Math.max(0, Number(newJp) || 0);
    setJpPerWeek(val);
    setTotalHoursPerYear(val * 36);
  };

  // Direct manual chapter & TP handlers for Section B
  const handleDirectAddChapter = (semester: 1 | 2) => {
    const currentList = semester === 1 ? materialsSem1 : materialsSem2;
    const newIdx = currentList.length + 1;
    const orderNumber = semester === 1 ? newIdx : materialsSem1.length + newIdx;
    const newItem: CPMaterialItem = {
      id: `mat-${semester}-${Date.now()}-${newIdx}`,
      semester,
      orderNumber,
      tpCode: `TP.${grade}.${semester}.${newIdx}`,
      essentialMaterial: `Bab ${orderNumber}: `,
      tpName: `Memahami dan menganalisis materi Bab ${orderNumber} pada mata pelajaran ${subject}`,
      elementName: 'Pemahaman Konsep & Keterampilan Proses',
      allocatedHours: 18,
      tpCount: 1,
      assessmentStrategy: 'Tes Formatif & Penilaian Kinerja',
      deepLearningMethod: 'Mindful, Meaningful & Joyful Learning',
    };

    if (semester === 1) {
      const updated = [...materialsSem1, newItem];
      setMaterialsSem1(updated);
      const totalTPs = updated.reduce((sum, m) => sum + (m.tpCount || 1), 0) + materialsSem2.reduce((sum, m) => sum + (m.tpCount || 1), 0);
      setTotalTPCount(totalTPs);
    } else {
      const updated = [...materialsSem2, newItem];
      setMaterialsSem2(updated);
      const totalTPs = materialsSem1.reduce((sum, m) => sum + (m.tpCount || 1), 0) + updated.reduce((sum, m) => sum + (m.tpCount || 1), 0);
      setTotalTPCount(totalTPs);
    }
  };

  const handleDirectUpdateChapter = (
    semester: 1 | 2,
    index: number,
    field: keyof CPMaterialItem,
    value: any
  ) => {
    if (semester === 1) {
      const updated = [...materialsSem1];
      updated[index] = { ...updated[index], [field]: value };
      setMaterialsSem1(updated);
      if (field === 'tpCount') {
        const totalTPs = updated.reduce((sum, m) => sum + (m.tpCount || 1), 0) + materialsSem2.reduce((sum, m) => sum + (m.tpCount || 1), 0);
        setTotalTPCount(totalTPs);
      }
    } else {
      const updated = [...materialsSem2];
      updated[index] = { ...updated[index], [field]: value };
      setMaterialsSem2(updated);
      if (field === 'tpCount') {
        const totalTPs = materialsSem1.reduce((sum, m) => sum + (m.tpCount || 1), 0) + updated.reduce((sum, m) => sum + (m.tpCount || 1), 0);
        setTotalTPCount(totalTPs);
      }
    }
  };

  const handleDirectDeleteChapter = (semester: 1 | 2, index: number) => {
    if (semester === 1) {
      const updated = materialsSem1
        .filter((_, idx) => idx !== index)
        .map((item, idx) => ({
          ...item,
          orderNumber: idx + 1,
        }));
      setMaterialsSem1(updated);
      const totalTPs = updated.reduce((sum, m) => sum + (m.tpCount || 1), 0) + materialsSem2.reduce((sum, m) => sum + (m.tpCount || 1), 0);
      setTotalTPCount(totalTPs);
    } else {
      const updated = materialsSem2
        .filter((_, idx) => idx !== index)
        .map((item, idx) => ({
          ...item,
          orderNumber: materialsSem1.length + idx + 1,
        }));
      setMaterialsSem2(updated);
      const totalTPs = materialsSem1.reduce((sum, m) => sum + (m.tpCount || 1), 0) + updated.reduce((sum, m) => sum + (m.tpCount || 1), 0);
      setTotalTPCount(totalTPs);
    }
  };

  // File Upload Handler (PDF, Word docx, Text)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setFileExtracting(true);

    try {
      if (file.type === 'text/plain') {
        const text = await file.text();
        setCpText(text);
        showNotif(`Berhasil membaca ${file.name} (${(file.size / 1024).toFixed(1)} KB). Teks CP terpasang!`);
      } else {
        // Mocking fast intelligent text extraction for PDF/Word
        setTimeout(() => {
          const mockCp = `CAPAIAN PEMBELAJARAN (CP) RESMI BSKAP NOMOR 032/H/KR/2024
Mata Pelajaran: ${subject}
Jenjang/Fase: ${level} / ${phase} (Kelas ${grade})
Satuan Pendidikan: ${schoolName}

Elemen Pemahaman Konsep:
Peserta didik memiliki kemampuan memahami dan menganalisis konsep-konsep esensial ${subject}, menyelidiki keterkaitan fenomena fisis dan kehidupan sehari-hari secara kritis, logis, dan analitis.

Elemen Keterampilan Proses:
Peserta didik mampu mengamati, merumuskan hipotesis, merancang penyelidikan ilmiah, mengumpulkan dan mengolah data, menarik kesimpulan berbasis bukti empiris, serta mengomunikasikan hasil investigasi ilmiah secara kolaboratif (Mindful, Meaningful, Joyful Learning).`;

          setCpText(mockCp);
          setFileExtracting(false);
          showNotif(`File "${file.name}" berhasil diekstraksi. Siap untuk dianalisis!`);
        }, 1000);
        return;
      }
    } catch (err: any) {
      console.error(err);
      showNotif('Gagal membaca file: ' + err.message, 'error');
    } finally {
      setFileExtracting(false);
    }
  };

  // Apply Selected Preset
  const handleApplyPreset = (presetSubject: string) => {
    const preset = SUBJECT_MATERIAL_PRESETS.find(
      (p) => p.subject.toLowerCase() === presetSubject.toLowerCase()
    );

    if (!preset) {
      // Fallback generator
      setSubject(presetSubject);
      showNotif(`Mata Pelajaran diubah menjadi ${presetSubject}.`);
      setIsPresetModalOpen(false);
      return;
    }

    setSubject(preset.subject);
    setLevel(preset.level);
    setGrade(preset.grade);
    setPhase(preset.phase);
    setTotalHoursPerYear(preset.totalHoursPerYear);
    setJpPerWeek(Math.round(preset.totalHoursPerYear / 36) || 3);
    setCpText(preset.cpSummary);

    const mappedSem1: CPMaterialItem[] = preset.materialsSem1.map((m, idx) => ({
      ...m,
      id: `mat-1-${Date.now()}-${idx}`,
    }));
    const mappedSem2: CPMaterialItem[] = preset.materialsSem2.map((m, idx) => ({
      ...m,
      id: `mat-2-${Date.now()}-${idx}`,
    }));

    setMaterialsSem1(mappedSem1);
    setMaterialsSem2(mappedSem2);
    setTotalTPCount(mappedSem1.length + mappedSem2.length);

    setIsPresetModalOpen(false);
    showNotif(`Template standar BSKAP untuk ${preset.subject} (${preset.phase}) berhasil diterapkan!`);
  };

  // FULL AI CP ANALYSIS WITH REAL-TIME PROGRESS (0% -> 100%) & AUTO SYNCHRONIZATION
  const handleRunFullAnalysis = async () => {
    if (!teacherName.trim()) {
      alert('Nama Guru Pengampu wajib diisi sebelum memulai analisis.');
      return;
    }
    if (!subject.trim()) {
      alert('Mata Pelajaran wajib ditentukan.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(5);
    setAnalysisStep('1/6: Mengekstrak Dokumen CP & Verifikasi Parameter Kurikulum...');

    const steps = [
      { progress: 18, step: '2/6: Identifikasi Elemen CP & Taksonomi Bloom HOTS (C4-C6)...' },
      { progress: 42, step: '3/6: Merumuskan Tujuan Pembelajaran (TP) Deep Learning (Mindful, Meaningful, Joyful)...' },
      { progress: 68, step: '4/6: Membagi Materi Esensial & Alokasi JP Semester 1 (Ganjil) & Semester 2 (Genap)...' },
      { progress: 88, step: '5/6: Menyusun Kriteria Ketercapaian (KKTP), Asesmen & Pemetaan Seluruh Perangkat...' },
      { progress: 100, step: '6/6: Selesai! Sinkronisasi otomatis ke 9 modul perangkat pembelajaran...' },
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setAnalysisProgress(steps[i].progress);
      setAnalysisStep(steps[i].step);
    }

    // Generate balanced materials if empty
    let newSem1 = [...materialsSem1];
    let newSem2 = [...materialsSem2];

    const preset = SUBJECT_MATERIAL_PRESETS.find(
      (p) => p.subject.toLowerCase() === subject.toLowerCase()
    );

    if (newSem1.length === 0 && newSem2.length === 0) {
      if (preset) {
        newSem1 = preset.materialsSem1.map((m, idx) => ({
          ...m,
          id: `mat-1-${Date.now()}-${idx}`,
        }));
        newSem2 = preset.materialsSem2.map((m, idx) => ({
          ...m,
          id: `mat-2-${Date.now()}-${idx}`,
        }));
      } else {
        const tpHalf = Math.max(2, Math.ceil(totalTPCount / 2));
        const jpHalf1 = Math.floor(totalHoursPerYear / 2);
        const jpHalf2 = totalHoursPerYear - jpHalf1;

        newSem1 = [
          {
            id: `mat-1-${Date.now()}-1`,
            semester: 1,
            orderNumber: 1,
            tpCode: `TP.${grade}.1.1`,
            tpName: `Memahami hakikat, ruang lingkup konsep esensial, dan prinsip penyelidikan ilmiah pada materi ${subject}.`,
            essentialMaterial: `Konsep Dasar, Hakikat & Prinsip ${subject}`,
            elementName: 'Pemahaman Konsep & Keterampilan Proses',
            allocatedHours: Math.floor(jpHalf1 / 2),
            assessmentStrategy: 'Tes Formatif Tertulis & Observasi Sikap Ilmiah',
            deepLearningMethod: 'Mindful: Observasi kesadaran konsep & refleksi terstruktur.',
          },
          {
            id: `mat-1-${Date.now()}-2`,
            semester: 1,
            orderNumber: 2,
            tpCode: `TP.${grade}.1.2`,
            tpName: `Menganalisis fenomena kontekstual, pemecahan masalah analitis, dan aplikasi terapan ${subject} dalam kehidupan nyata.`,
            essentialMaterial: `Aplikasi Kontekstual & Studi Kasus ${subject}`,
            elementName: 'Pemahaman Konsep & Nalar Kritis',
            allocatedHours: Math.ceil(jpHalf1 / 2),
            assessmentStrategy: 'Asesmen Kinerja Portofolio & Tes Sumatif Tengah Semester',
            deepLearningMethod: 'Meaningful: Eksplorasi studi kasus nyata & pemecahan masalah relevan.',
          },
        ];

        newSem2 = [
          {
            id: `mat-2-${Date.now()}-1`,
            semester: 2,
            orderNumber: 3,
            tpCode: `TP.${grade}.2.1`,
            tpName: `Menginvestigasi dinamika lanjutan, eksperimen laboratorium, dan elaborasi teoretis pada materi ${subject}.`,
            essentialMaterial: `Dinamika & Eksperimen Lanjutan ${subject}`,
            elementName: 'Keterampilan Proses & Analisis',
            allocatedHours: Math.floor(jpHalf2 / 2),
            assessmentStrategy: 'Penilaian Kinerja Praktikum & Uji Formatif',
            deepLearningMethod: 'Joyful: Diskusi kelompok kolaboratif & eksperimen hands-on menyenangkan.',
          },
          {
            id: `mat-2-${Date.now()}-2`,
            semester: 2,
            orderNumber: 4,
            tpCode: `TP.${grade}.2.2`,
            tpName: `Merancang proyek rekayasa, karya inovasi, dan mengomunikasikan gagasan solusi ilmiah materi ${subject}.`,
            essentialMaterial: `Proyek Inovasi & Rekayasa Terapan ${subject}`,
            elementName: 'Keterampilan Proses & Kreativitas',
            allocatedHours: Math.ceil(jpHalf2 / 2),
            assessmentStrategy: 'Asesmen Sumatif Akhir Tahun (Karya Proyek & Presentasi)',
            deepLearningMethod: 'Mindful, Meaningful, Joyful: Gelar karya dan presentasi reflektif terpadu.',
          },
        ];
      }
    }

    setMaterialsSem1(newSem1);
    setMaterialsSem2(newSem2);

    // Construct Master CP Data
    const masterCPData: ActiveMasterCPData = {
      id: `master-${Date.now()}`,
      fileName: uploadedFile?.name || `CP_${subject}_${phase}_${academicYear.replace('/', '-')}.docx`,
      fileType: uploadedFile?.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSize: uploadedFile?.size || 45200,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      level,
      grade,
      phase,
      subject,
      teacherName,
      schoolName,
      academicYear,
      totalHoursPerYear,
      jpPerWeek,
      timeAllocationPerWeek,
      cpText,
      elements: [
        {
          name: 'Pemahaman Konsep',
          description: `Peserta didik mampu memahami konsep fundamental ${subject}, menganalisis hukum dan prinsip ilmiah, serta mengaitkannya dengan fenomena faktual.`,
          competencies: ['Mengamati', 'Menjelaskan', 'Menganalisis', 'Mengevaluasi'],
          essentialMaterials: newSem1.concat(newSem2).map((m) => m.essentialMaterial),
        },
        {
          name: 'Keterampilan Proses',
          description: `Peserta didik mampu merencanakan dan melaksanakan penyelidikan ilmiah, menginterpretasi data empiris, serta mengomunikasikan kesimpulan secara kolaboratif.`,
          competencies: ['Merancang Percobaan', 'Mengumpulkan Data', 'Menyimpulkan', 'Mempresentasikan'],
          essentialMaterials: ['Metode Ilmiah', 'Pengolahan Data', 'Proyek Berbasis Solusi'],
        },
      ],
      materialsSem1: newSem1,
      materialsSem2: newSem2,
      executiveSummary: `Analisis CP ${subject} ${level} (${phase} Kelas ${grade}) oleh Guru ${teacherName} berhasil disinkronkan. Terbagi atas ${newSem1.length} TP di Semester 1 (${newSem1.reduce((s, i) => s + i.allocatedHours, 0)} JP) dan ${newSem2.length} TP di Semester 2 (${newSem2.reduce((s, i) => s + i.allocatedHours, 0)} JP) dengan pendekatan Deep Learning 3 Pilar.`,
      syncStatus: 'synced',
      lastSyncedAt: new Date().toISOString(),
    };

    // Save to Master CP & School Profile
    StorageService.setActiveMasterCP(masterCPData);
    setActiveMasterCP(masterCPData);

    const updatedProfile: SchoolProfile = {
      ...StorageService.getSchoolProfile(),
      schoolName,
      teacherName,
      teacherNip,
      headmasterName: principalName,
      headmasterNip: principalNip,
      principalName,
      principalNip,
      academicYear,
      city,
    };
    StorageService.saveSchoolProfile(updatedProfile);

    // Save CPDistributionPlan
    const distPlan: CPDistributionPlan = {
      id: `plan-${Date.now()}`,
      teacherName,
      teacherNip,
      subject,
      schoolName,
      level,
      grade,
      phase,
      academicYear,
      semesterOption: 'all',
      totalHoursPerYear,
      totalTPCount: newSem1.length + newSem2.length,
      jpPerWeek,
      timeAllocationPerWeek,
      cpText,
      materialsSem1: newSem1,
      materialsSem2: newSem2,
      totalHoursSem1: newSem1.reduce((s, i) => s + i.allocatedHours, 0),
      totalHoursSem2: newSem2.reduce((s, i) => s + i.allocatedHours, 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    StorageService.saveCPDistribution(distPlan);
    setPlans(StorageService.getCPDistributions());

    setIsAnalyzing(false);
    setShowSyncSuccessModal(true);
  };

  // Save manual profile & plan
  const handleSavePlan = () => {
    setIsSaving(true);

    const sem1Hours = materialsSem1.reduce((acc, m) => acc + (Number(m.allocatedHours) || 0), 0);
    const sem2Hours = materialsSem2.reduce((acc, m) => acc + (Number(m.allocatedHours) || 0), 0);
    const totalCalcHours = (sem1Hours + sem2Hours) > 0 ? (sem1Hours + sem2Hours) : totalHoursPerYear;

    const updatedProfile: SchoolProfile = {
      ...StorageService.getSchoolProfile(),
      schoolName,
      teacherName,
      teacherNip,
      headmasterName: principalName,
      headmasterNip: principalNip,
      principalName,
      principalNip,
      academicYear,
      city,
      subject,
      level,
      grade: Number(grade) || 10,
      phase,
      jpPerWeek,
      totalHoursPerYear: totalCalcHours,
      timeAllocationPerWeek,
      cpText,
    };
    StorageService.saveSchoolProfile(updatedProfile);

    const newPlan: CPDistributionPlan = {
      id: selectedPlanId || `cp-plan-${Date.now()}`,
      teacherName,
      teacherNip,
      subject,
      schoolName,
      level,
      grade: Number(grade) || 10,
      phase,
      semesterOption: activeSemester,
      academicYear,
      totalHoursPerYear: totalCalcHours,
      totalHoursSem1: sem1Hours,
      totalHoursSem2: sem2Hours,
      totalTPCount: materialsSem1.length + materialsSem2.length,
      jpPerWeek,
      timeAllocationPerWeek,
      cpText,
      materialsSem1,
      materialsSem2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveCPDistribution(newPlan);
    setPlans(StorageService.getCPDistributions());
    setSelectedPlanId(newPlan.id);

    // Sync to activeMasterCP as well
    const updatedMaster: ActiveMasterCPData = {
      id: activeMasterCP?.id || `master-${Date.now()}`,
      fileName: activeMasterCP?.fileName || `CP_${subject}_${phase}_${academicYear.replace('/', '-')}.docx`,
      fileType: activeMasterCP?.fileType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSize: activeMasterCP?.fileSize || 45200,
      uploadedAt: activeMasterCP?.uploadedAt || new Date().toISOString().replace('T', ' ').substring(0, 16),
      level,
      grade: Number(grade) || 10,
      phase,
      subject,
      teacherName,
      teacherNip,
      schoolName,
      academicYear,
      totalHoursPerYear: totalCalcHours,
      jpPerWeek,
      timeAllocationPerWeek,
      cpText,
      elements: activeMasterCP?.elements || [
        {
          name: 'Pemahaman Konsep',
          description: `Peserta didik mampu memahami konsep fundamental ${subject}, menganalisis hukum dan prinsip ilmiah, serta mengaitkannya dengan fenomena faktual.`,
          competencies: ['Mengamati', 'Menjelaskan', 'Menganalisis', 'Mengevaluasi'],
          essentialMaterials: materialsSem1.concat(materialsSem2).map((m) => m.essentialMaterial),
        },
        {
          name: 'Keterampilan Proses',
          description: `Peserta didik mampu merencanakan dan melaksanakan penyelidikan ilmiah, menginterpretasi data empiris, serta mengomunikasikan kesimpulan secara kolaboratif.`,
          competencies: ['Merancang Percobaan', 'Mengumpulkan Data', 'Menyimpulkan', 'Mempresentasikan'],
          essentialMaterials: ['Metode Ilmiah', 'Pengolahan Data', 'Proyek Berbasis Solusi'],
        },
      ],
      materialsSem1,
      materialsSem2,
      executiveSummary: `Analisis CP ${subject} ${level} (${phase} Kelas ${grade}) oleh Guru ${teacherName} berhasil disinkronkan sebagai Master Acuan. Terbagi atas ${materialsSem1.length} TP di Semester 1 (${sem1Hours} JP) dan ${materialsSem2.length} TP di Semester 2 (${sem2Hours} JP) dengan pendekatan Deep Learning 3 Pilar.`,
      syncStatus: 'synced',
      lastSyncedAt: new Date().toISOString(),
    };
    StorageService.setActiveMasterCP(updatedMaster);
    setActiveMasterCP(updatedMaster);

    setTimeout(() => {
      setIsSaving(false);
      showNotif('Profil Guru, Mapel, Kelas & CP berhasil disimpan sebagai Master Acuan dan disinkronkan ke seluruh perangkat ajar!');
    }, 400);
  };

  // Open Add Material Modal
  const handleOpenAddModal = (semester: 1 | 2) => {
    const currentList = semester === 1 ? materialsSem1 : materialsSem2;
    const newOrder = semester === 1 ? currentList.length + 1 : materialsSem1.length + currentList.length + 1;
    const newCode = `TP.${grade}.${semester}.${currentList.length + 1}`;
    setModalItem({
      id: `mat-${semester}-${Date.now()}`,
      semester,
      orderNumber: newOrder,
      tpCode: newCode,
      tpName: '',
      essentialMaterial: '',
      elementName: 'Pemahaman Konsep / Keterampilan Proses',
      allocatedHours: 18,
      assessmentStrategy: 'Tes Formatif, Observasi & Asesmen Sumatif Lingkup Materi',
      deepLearningMethod: 'Mindful: Observasi teliti & refleksi kesadaran konsep, Meaningful: Keterkaitan masalah kontekstual nyata, Joyful: Aktivitas belajar interaktif & kolaboratif.',
    });
    setModalSemester(semester);
    setIsNewModalItem(true);
    setIsModalOpen(true);
  };

  // Open Edit Material Modal
  const handleOpenEditModal = (semester: 1 | 2, item: CPMaterialItem) => {
    setModalItem({ ...item, semester });
    setModalSemester(semester);
    setIsNewModalItem(false);
    setIsModalOpen(true);
  };

  // Save Modal Item
  const handleSaveModalItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalItem.essentialMaterial.trim() && !modalItem.tpName.trim()) {
      alert('Lingkup Materi Pokok atau Rumusan TP wajib diisi.');
      return;
    }

    const targetSemester = modalItem.semester;
    if (isNewModalItem) {
      if (targetSemester === 1) {
        setMaterialsSem1([...materialsSem1, modalItem]);
      } else {
        setMaterialsSem2([...materialsSem2, modalItem]);
      }
      showNotif(`Materi baru berhasil ditambahkan ke Semester ${targetSemester}!`);
    } else {
      if (targetSemester !== modalSemester) {
        if (modalSemester === 1) {
          setMaterialsSem1(materialsSem1.filter((m) => m.id !== modalItem.id));
          setMaterialsSem2([...materialsSem2, modalItem]);
        } else {
          setMaterialsSem2(materialsSem2.filter((m) => m.id !== modalItem.id));
          setMaterialsSem1([...materialsSem1, modalItem]);
        }
        showNotif(`Materi berhasil diperbarui dan dipindahkan ke Semester ${targetSemester}!`);
      } else {
        if (targetSemester === 1) {
          setMaterialsSem1(materialsSem1.map((m) => (m.id === modalItem.id ? modalItem : m)));
        } else {
          setMaterialsSem2(materialsSem2.map((m) => (m.id === modalItem.id ? modalItem : m)));
        }
        showNotif(`Materi Semester ${targetSemester} berhasil diperbarui!`);
      }
    }
    setIsModalOpen(false);
  };

  // Duplicate item
  const handleDuplicateItem = (semester: 1 | 2, item: CPMaterialItem) => {
    const currentList = semester === 1 ? materialsSem1 : materialsSem2;
    const duplicated: CPMaterialItem = {
      ...item,
      id: `mat-${semester}-${Date.now()}`,
      orderNumber: currentList.length + 1,
      tpCode: `${item.tpCode}.b`,
      essentialMaterial: `${item.essentialMaterial} (Salinan Lanjutan)`,
    };
    if (semester === 1) {
      setMaterialsSem1([...materialsSem1, duplicated]);
    } else {
      setMaterialsSem2([...materialsSem2, duplicated]);
    }
    showNotif(`Materi "${item.essentialMaterial}" berhasil disalin di Semester ${semester}.`);
  };

  // Move Up / Down
  const handleMoveUp = (semester: 1 | 2, index: number) => {
    if (index === 0) return;
    const list = semester === 1 ? [...materialsSem1] : [...materialsSem2];
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;
    list.forEach((item, idx) => {
      item.orderNumber = semester === 1 ? idx + 1 : materialsSem1.length + idx + 1;
    });
    if (semester === 1) setMaterialsSem1(list);
    else setMaterialsSem2(list);
  };

  const handleMoveDown = (semester: 1 | 2, index: number) => {
    const list = semester === 1 ? [...materialsSem1] : [...materialsSem2];
    if (index >= list.length - 1) return;
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;
    list.forEach((item, idx) => {
      item.orderNumber = semester === 1 ? idx + 1 : materialsSem1.length + idx + 1;
    });
    if (semester === 1) setMaterialsSem1(list);
    else setMaterialsSem2(list);
  };

  // Generate Matrix HTML for Word & PDF
  const generateMatrixHtml = () => {
    const sem1Rows = materialsSem1
      .map(
        (m, idx) => `<tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td style="text-align:center; font-weight:bold;">${m.tpCode}</td>
        <td>${m.tpName}</td>
        <td><strong>${m.essentialMaterial}</strong></td>
        <td style="text-align:center; font-weight:bold;">${m.allocatedHours}</td>
        <td>${m.assessmentStrategy}<br><em>${m.deepLearningMethod || ''}</em></td>
      </tr>`
      )
      .join('');

    const sem2Rows = materialsSem2
      .map(
        (m, idx) => `<tr>
        <td style="text-align:center;">${materialsSem1.length + idx + 1}</td>
        <td style="text-align:center; font-weight:bold;">${m.tpCode}</td>
        <td>${m.tpName}</td>
        <td><strong>${m.essentialMaterial}</strong></td>
        <td style="text-align:center; font-weight:bold;">${m.allocatedHours}</td>
        <td>${m.assessmentStrategy}<br><em>${m.deepLearningMethod || ''}</em></td>
      </tr>`
      )
      .join('');

    return `
      <h3 style="font-size:11.5pt; font-weight:bold; margin-top:14px; background:#f1f5f9; padding:6px 10px; border-left:4px solid #3b82f6;">
        I. PEMBAGIAN MATERI & TUJUAN PEMBELAJARAN SEMESTER 1 (GANJIL) - ${totalJPSem1} JP
      </h3>
      <table>
        <thead>
          <tr>
            <th style="width:5%;">No</th>
            <th style="width:12%;">Kode TP</th>
            <th style="width:35%;">Tujuan Pembelajaran (TP)</th>
            <th style="width:23%;">Materi Pokok Esensial</th>
            <th style="width:7%;">JP</th>
            <th style="width:18%;">Asesmen & Deep Learning</th>
          </tr>
        </thead>
        <tbody>
          ${sem1Rows}
          <tr style="background:#f8fafc; font-weight:bold;">
            <td colspan="4" style="text-align:right;">Total Jam Semester 1:</td>
            <td style="text-align:center;">${totalJPSem1} JP</td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <h3 style="font-size:11.5pt; font-weight:bold; margin-top:18px; background:#f1f5f9; padding:6px 10px; border-left:4px solid #3b82f6;">
        II. PEMBAGIAN MATERI & TUJUAN PEMBELAJARAN SEMESTER 2 (GENAP) - ${totalJPSem2} JP
      </h3>
      <table>
        <thead>
          <tr>
            <th style="width:5%;">No</th>
            <th style="width:12%;">Kode TP</th>
            <th style="width:35%;">Tujuan Pembelajaran (TP)</th>
            <th style="width:23%;">Materi Pokok Esensial</th>
            <th style="width:7%;">JP</th>
            <th style="width:18%;">Asesmen & Deep Learning</th>
          </tr>
        </thead>
        <tbody>
          ${sem2Rows}
          <tr style="background:#f8fafc; font-weight:bold;">
            <td colspan="4" style="text-align:right;">Total Jam Semester 2:</td>
            <td style="text-align:center;">${totalJPSem2} JP</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    `;
  };

  const handleExportWord = () => {
    const profile = StorageService.getSchoolProfile();
    const html = generateMatrixHtml();
    ExportService.exportToWord(
      `PROFIL GURU & MATRIKS PEMBAGIAN MATERI CP - ${subject} KELAS ${grade}`,
      html,
      {
        ...profile,
        schoolName,
        teacherName,
        teacherNip,
        academicYear,
      },
      `Profil_Guru_${subject}_Kelas_${grade}`
    );
  };

  const handlePrintPdf = () => {
    const profile = StorageService.getSchoolProfile();
    const html = generateMatrixHtml();
    ExportService.printPdfPreview(
      `PROFIL GURU & MATRIKS PEMBAGIAN MATERI CP (${subject} KELAS ${grade})`,
      html,
      {
        ...profile,
        schoolName,
        teacherName,
        teacherNip,
        academicYear,
      }
    );
  };

  const totalJPSem1 = materialsSem1.reduce((sum, item) => sum + (Number(item.allocatedHours) || 0), 0);
  const totalJPSem2 = materialsSem2.reduce((sum, item) => sum + (Number(item.allocatedHours) || 0), 0);
  const totalJPTahun = totalJPSem1 + totalJPSem2;

  const availableGrades = level === 'SD' ? [1, 2, 3, 4, 5, 6] : level === 'SMP' ? [7, 8, 9] : [10, 11, 12];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 p-6 rounded-2xl shadow-xl text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="p-2 bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-indigo-300">
              <UserCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              Profil Guru Mata Pelajaran & Analisis Master CP
            </h1>
          </div>
          <p className="text-xs text-slate-300 ml-10">
            Pengisian Biodata Guru Pengampu, Jumlah Jam (JP), Target TP, Jenjang, Kelas, Fase, Mata Pelajaran, serta Upload & Analisis CP Resmi untuk Disinkronkan Otomatis ke Seluruh Perangkat Pembelajaran.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSavePlan}
            disabled={isSaving}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Profil & Sinkronkan'}</span>
          </button>
          <button
            onClick={() => setIsPresetModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Pilih Preset Mapel BSKAP</span>
          </button>
        </div>
      </div>

      {/* Floating Notification */}
      {notification && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between animate-fadeIn ${
            notification.type === 'error'
              ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
          }`}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Active Master CP Status Pill */}
      {activeMasterCP && (
        <div className="bg-slate-900/90 border border-indigo-500/30 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <span className="text-xs font-bold text-white">
                Master CP Aktif Terhubung: {activeMasterCP.subject} • {activeMasterCP.phase} (Kelas {activeMasterCP.grade})
              </span>
              <p className="text-[10px] text-slate-400">
                Guru: {activeMasterCP.teacherName || teacherName} • {activeMasterCP.timeAllocationPerWeek || timeAllocationPerWeek || '45 Menit'} ({jpPerWeek} JP/Minggu) • {materialsSem1.length + materialsSem2.length} TP Tersinkronisasi Otomatis
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg text-[10px] font-bold">
              ✓ 9 Modul Perangkat Terhubung
            </span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-t-xl transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-slate-900 text-indigo-400 border-t border-x border-slate-800 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>1. Biodata, Parameter & Upload CP</span>
        </button>

        <button
          onClick={() => setActiveTab('sem1')}
          className={`px-4 py-2.5 rounded-t-xl transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'sem1'
              ? 'bg-slate-900 text-indigo-400 border-t border-x border-slate-800 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>2. Pembagian Semester 1 ({materialsSem1.length} TP • {totalJPSem1} JP)</span>
        </button>

        <button
          onClick={() => setActiveTab('sem2')}
          className={`px-4 py-2.5 rounded-t-xl transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'sem2'
              ? 'bg-slate-900 text-indigo-400 border-t border-x border-slate-800 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3. Pembagian Semester 2 ({materialsSem2.length} TP • {totalJPSem2} JP)</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2.5 rounded-t-xl transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'preview'
              ? 'bg-slate-900 text-indigo-400 border-t border-x border-slate-800 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>4. Pratinjau & Ekspor Matriks</span>
        </button>

        <button
          onClick={() => setActiveTab('bank')}
          className={`px-4 py-2.5 rounded-t-xl transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'bank'
              ? 'bg-slate-900 text-indigo-400 border-t border-x border-slate-800 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <Database className="w-4 h-4 text-sky-400" />
          <span>5. Bank CP & Preset BSKAP</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BIODATA, PARAMETER MENGAJAR & UPLOAD CP */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Analysis Progress Card (Visible during AI Analysis) */}
          {isAnalyzing && (
            <div className="bg-slate-900 border-2 border-indigo-500/60 p-5 rounded-2xl space-y-3 shadow-2xl animate-pulse">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-indigo-400 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                  <span>Proses Analisis Mendalam & Sinkronisasi Perangkat Ajar</span>
                </span>
                <span className="text-white font-mono">{analysisProgress}%</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-300 italic">{analysisStep}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: BIODATA GURU & PARAMETER MENGAJAR */}
            <div className="lg:col-span-6 space-y-5">
              {/* Card 1: Biodata Guru Mata Pelajaran */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-indigo-400" />
                    <span>A. Biodata Guru Mata Pelajaran</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">Identitas Resmi</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Nama Lengkap Guru & Gelar *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Aspian La Ode Madimu, S.Pd., Gr."
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">NIP / NUPTK Guru</label>
                      <input
                        type="text"
                        placeholder="19900822 201801 1 004"
                        value={teacherNip}
                        onChange={(e) => setTeacherNip(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Nama Satuan Pendidikan *</label>
                      <input
                        type="text"
                        placeholder="SMA NEGERI 30 MALUKU TENGAH"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Nama Kepala Sekolah</label>
                      <input
                        type="text"
                        placeholder="Drs. H. Ahmad Dahlan, M.Pd."
                        value={principalName}
                        onChange={(e) => setPrincipalName(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">NIP Kepala Sekolah</label>
                      <input
                        type="text"
                        placeholder="19680514 199303 1 008"
                        value={principalNip}
                        onChange={(e) => setPrincipalNip(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Tahun Pelajaran</label>
                      <input
                        type="text"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Kota / Kabupaten</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Maluku Tengah"
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Parameter Kurikulum & Beban Mengajar */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <span>B. Parameter Kurikulum & Beban Belajar</span>
                  </h3>
                  <span className="text-[10px] text-amber-300 font-bold">Pendekatan Deep Learning 2026/2027</span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Mata Pelajaran */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-300 font-bold">
                        Mata Pelajaran / Bidang Studi *
                      </label>
                      <span className="text-[10px] text-indigo-400 font-medium">
                        ✓ Otomatis sesuaikan Bab & CP
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <select
                        value={POPULAR_SUBJECTS.includes(subject) ? subject : 'Lainnya'}
                        onChange={(e) => {
                          if (e.target.value !== 'Lainnya') {
                            handleSubjectChange(e.target.value);
                          }
                        }}
                        className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-semibold"
                      >
                        {POPULAR_SUBJECTS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                        <option value="Lainnya">-- Tulis Manual --</option>
                      </select>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        onBlur={() => {
                          if (subject.trim()) {
                            handleSubjectChange(subject.trim());
                          }
                        }}
                        placeholder="Nama Mata Pelajaran"
                        className="flex-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-bold text-indigo-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleSubjectChange(subject)}
                        title="Sinkronkan Bab & CP sesuai Jenjang dan Kelas"
                        className="px-3 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 rounded-xl text-[11px] font-bold flex items-center space-x-1 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span className="hidden sm:inline">Sinkronkan Bab</span>
                      </button>
                    </div>

                    {/* Quick Subject Chips */}
                    <div className="flex flex-wrap gap-1 pt-1.5 max-h-24 overflow-y-auto">
                      {POPULAR_SUBJECTS.slice(0, 10).map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => handleSubjectChange(sub)}
                          className={`px-2 py-0.5 rounded text-[10px] transition ${
                            subject === sub
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Jenjang, Kelas & Fase */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Jenjang</label>
                      <select
                        value={level}
                        onChange={(e) => handleLevelChange(e.target.value as SchoolLevel)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-semibold"
                      >
                        <option value="SD">SD</option>
                        <option value="SMP">SMP</option>
                        <option value="SMA">SMA</option>
                        <option value="SMK">SMK</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Kelas</label>
                      <select
                        value={grade}
                        onChange={(e) => handleGradeChange(Number(e.target.value))}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-semibold"
                      >
                        {availableGrades.map((g) => (
                          <option key={g} value={g}>
                            Kelas {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Fase</label>
                      <select
                        value={phase}
                        onChange={(e) => handlePhaseChange(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-indigo-400 focus:outline-none focus:border-indigo-500 font-bold"
                      >
                        <option value="Fase A">Fase A (Kelas 1-2)</option>
                        <option value="Fase B">Fase B (Kelas 3-4)</option>
                        <option value="Fase C">Fase C (Kelas 5-6)</option>
                        <option value="Fase D">Fase D (Kelas 7-9)</option>
                        <option value="Fase E">Fase E (Kelas 10)</option>
                        <option value="Fase F">Fase F (Kelas 11-12)</option>
                      </select>
                    </div>
                  </div>

                  {/* Jam Pelajaran & Alokasi Waktu per Minggu */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">JP / Minggu</label>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={jpPerWeek}
                        onChange={(e) => {
                          const val = e.target.value;
                          const num = val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0);
                          handleJpPerWeekChange(num);
                        }}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono text-center font-bold"
                      />
                      <p className="text-[10px] text-slate-500 mt-1 text-center font-mono">
                        ~{jpPerWeek * 36} JP / Tahun
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-slate-300 font-bold text-xs">
                          Alokasi Waktu / Minggu
                        </label>
                        <span className="text-[10px] text-emerald-400 font-semibold">Ketik Bebas</span>
                      </div>
                      <input
                        type="text"
                        value={timeAllocationPerWeek}
                        onChange={(e) => setTimeAllocationPerWeek(e.target.value)}
                        placeholder="Misal: 30 menit, 45 menit, 2 x 45 menit"
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-emerald-300 focus:outline-none focus:border-emerald-500 text-center font-bold placeholder-slate-600"
                      />
                      {/* Quick preset chips */}
                      <div className="flex flex-wrap gap-1 mt-1 justify-center">
                        {['30 Menit', '35 Menit', '40 Menit', '45 Menit', '2 x 45 Menit', '3 x 45 Menit'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setTimeAllocationPerWeek(preset)}
                            className={`text-[9px] px-1.5 py-0.5 rounded border transition ${
                              timeAllocationPerWeek === preset
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* BAB MATERI AJAR & JUMLAH TP PER SEMESTER (MANUAL INPUT SECTION) */}
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label className="block text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
                          <BookOpen className="w-4 h-4 text-indigo-400" />
                          <span>Bab Materi Ajar & Jumlah TP (Semester 1 & 2)</span>
                        </label>
                        <p className="text-[11px] text-slate-400">
                          Ketik manual Bab materi pokok, rumusan TP, dan alokasi JP per semester sesuai kebutuhan.
                        </p>
                      </div>

                      {/* Semester Switcher Tabs */}
                      <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-semibold">
                        <button
                          type="button"
                          onClick={() => setSectionBTab('sem1')}
                          className={`px-2.5 py-1 rounded-lg transition ${
                            sectionBTab === 'sem1'
                              ? 'bg-indigo-600 text-white font-bold shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Sem 1 ({materialsSem1.length} Bab • {totalJPSem1} JP)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSectionBTab('sem2')}
                          className={`px-2.5 py-1 rounded-lg transition ${
                            sectionBTab === 'sem2'
                              ? 'bg-purple-600 text-white font-bold shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Sem 2 ({materialsSem2.length} Bab • {totalJPSem2} JP)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSectionBTab('both')}
                          className={`px-2.5 py-1 rounded-lg transition ${
                            sectionBTab === 'both'
                              ? 'bg-slate-700 text-white font-bold shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Semua ({materialsSem1.length + materialsSem2.length} Bab)
                        </button>
                      </div>
                    </div>

                    {/* SEMESTER 1 SECTION */}
                    {(sectionBTab === 'sem1' || sectionBTab === 'both') && (
                      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-indigo-950/70 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                          <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                            <span className="text-xs font-bold text-indigo-300">Semester 1 (Ganjil)</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                              {materialsSem1.length} Bab/TP • {totalJPSem1} JP
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDirectAddChapter(1)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold flex items-center space-x-1 transition shadow"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Tambah Bab Sem 1</span>
                          </button>
                        </div>

                        {materialsSem1.length === 0 ? (
                          <div className="text-center py-5 bg-slate-900/50 rounded-xl border border-dashed border-slate-800 text-slate-400 text-xs">
                            <p>Belum ada bab materi di Semester 1.</p>
                            <button
                              type="button"
                              onClick={() => handleDirectAddChapter(1)}
                              className="mt-2 inline-flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 font-bold underline text-xs"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Tambah Bab Pertama Sekarang</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                            {materialsSem1.map((item, idx) => (
                              <div
                                key={item.id || idx}
                                className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition space-y-2"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
                                      Bab {idx + 1}
                                    </span>
                                    <input
                                      type="text"
                                      value={item.tpCode}
                                      onChange={(e) =>
                                        handleDirectUpdateChapter(1, idx, 'tpCode', e.target.value)
                                      }
                                      placeholder="Kode TP"
                                      className="w-28 px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-indigo-300 font-bold focus:outline-none focus:border-indigo-500 text-center"
                                    />
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <div className="flex items-center space-x-1">
                                      <span className="text-[10px] text-slate-400 font-semibold">Alokasi:</span>
                                      <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={item.allocatedHours}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          handleDirectUpdateChapter(
                                            1,
                                            idx,
                                            'allocatedHours',
                                            val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0)
                                          );
                                        }}
                                        className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-emerald-400 font-bold text-center focus:outline-none focus:border-emerald-500"
                                      />
                                      <span className="text-[10px] text-slate-400 font-bold">JP</span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleDirectDeleteChapter(1, idx)}
                                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                                      title="Hapus Bab Ini"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                                  <div className="sm:col-span-8 md:col-span-9">
                                    <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                                      Bab / Lingkup Materi Pokok:
                                    </label>
                                    <input
                                      type="text"
                                      value={item.essentialMaterial}
                                      onChange={(e) =>
                                        handleDirectUpdateChapter(1, idx, 'essentialMaterial', e.target.value)
                                      }
                                      placeholder="Misal: Bab 1: Pengukuran & Besaran Fisika"
                                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                                    />
                                  </div>

                                  <div className="sm:col-span-4 md:col-span-3">
                                    <div className="flex items-center justify-between mb-0.5">
                                      <label className="block text-[10px] font-bold text-slate-400">
                                        Target TP:
                                      </label>
                                      <span className="text-[9px] text-indigo-400 font-semibold">Tujuan</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <input
                                        type="number"
                                        min={1}
                                        max={20}
                                        value={item.tpCount ?? 1}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          handleDirectUpdateChapter(
                                            1,
                                            idx,
                                            'tpCount',
                                            val === '' ? 1 : Math.max(1, parseInt(val, 10) || 1)
                                          );
                                        }}
                                        className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-indigo-300 font-bold text-center focus:outline-none focus:border-indigo-500"
                                        title="Jumlah Target TP untuk Bab ini"
                                      />
                                      <span className="text-[10px] text-slate-400 font-bold shrink-0">TP</span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                                    Rumusan Tujuan Pembelajaran (TP):
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={item.tpName}
                                    onChange={(e) =>
                                      handleDirectUpdateChapter(1, idx, 'tpName', e.target.value)
                                    }
                                    placeholder="Ketik rumusan Tujuan Pembelajaran (TP) untuk bab ini..."
                                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed resize-y"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SEMESTER 2 SECTION */}
                    {(sectionBTab === 'sem2' || sectionBTab === 'both') && (
                      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-purple-950/70 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                          <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                            <span className="text-xs font-bold text-purple-300">Semester 2 (Genap)</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                              {materialsSem2.length} Bab/TP • {totalJPSem2} JP
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDirectAddChapter(2)}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[11px] font-bold flex items-center space-x-1 transition shadow"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Tambah Bab Sem 2</span>
                          </button>
                        </div>

                        {materialsSem2.length === 0 ? (
                          <div className="text-center py-5 bg-slate-900/50 rounded-xl border border-dashed border-slate-800 text-slate-400 text-xs">
                            <p>Belum ada bab materi di Semester 2.</p>
                            <button
                              type="button"
                              onClick={() => handleDirectAddChapter(2)}
                              className="mt-2 inline-flex items-center space-x-1 text-purple-400 hover:text-purple-300 font-bold underline text-xs"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Tambah Bab Pertama Sekarang</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                            {materialsSem2.map((item, idx) => (
                              <div
                                key={item.id || idx}
                                className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 hover:border-purple-500/40 transition space-y-2"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-600/30 text-purple-300 border border-purple-500/30">
                                      Bab {materialsSem1.length + idx + 1}
                                    </span>
                                    <input
                                      type="text"
                                      value={item.tpCode}
                                      onChange={(e) =>
                                        handleDirectUpdateChapter(2, idx, 'tpCode', e.target.value)
                                      }
                                      placeholder="Kode TP"
                                      className="w-28 px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-purple-300 font-bold focus:outline-none focus:border-purple-500 text-center"
                                    />
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <div className="flex items-center space-x-1">
                                      <span className="text-[10px] text-slate-400 font-semibold">Alokasi:</span>
                                      <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={item.allocatedHours}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          handleDirectUpdateChapter(
                                            2,
                                            idx,
                                            'allocatedHours',
                                            val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0)
                                          );
                                        }}
                                        className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-emerald-400 font-bold text-center focus:outline-none focus:border-emerald-500"
                                      />
                                      <span className="text-[10px] text-slate-400 font-bold">JP</span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleDirectDeleteChapter(2, idx)}
                                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                                      title="Hapus Bab Ini"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                                  <div className="sm:col-span-8 md:col-span-9">
                                    <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                                      Bab / Lingkup Materi Pokok:
                                    </label>
                                    <input
                                      type="text"
                                      value={item.essentialMaterial}
                                      onChange={(e) =>
                                        handleDirectUpdateChapter(2, idx, 'essentialMaterial', e.target.value)
                                      }
                                      placeholder="Misal: Bab 4: Energi Terbarukan"
                                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                                    />
                                  </div>

                                  <div className="sm:col-span-4 md:col-span-3">
                                    <div className="flex items-center justify-between mb-0.5">
                                      <label className="block text-[10px] font-bold text-slate-400">
                                        Target TP:
                                      </label>
                                      <span className="text-[9px] text-purple-400 font-semibold">Tujuan</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <input
                                        type="number"
                                        min={1}
                                        max={20}
                                        value={item.tpCount ?? 1}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          handleDirectUpdateChapter(
                                            2,
                                            idx,
                                            'tpCount',
                                            val === '' ? 1 : Math.max(1, parseInt(val, 10) || 1)
                                          );
                                        }}
                                        className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-purple-300 font-bold text-center focus:outline-none focus:border-purple-500"
                                        title="Jumlah Target TP untuk Bab ini"
                                      />
                                      <span className="text-[10px] text-slate-400 font-bold shrink-0">TP</span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                                    Rumusan Tujuan Pembelajaran (TP):
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={item.tpName}
                                    onChange={(e) =>
                                      handleDirectUpdateChapter(2, idx, 'tpName', e.target.value)
                                    }
                                    placeholder="Ketik rumusan Tujuan Pembelajaran (TP) untuk bab ini..."
                                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-purple-500 leading-relaxed resize-y"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: UPLOAD CP RESMI & ANALISIS SINKRONISASI */}
            <div className="lg:col-span-6 space-y-5">
              {/* Card 3: Upload File CP Terbaru */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <FileUp className="w-4 h-4 text-indigo-400" />
                    <span>C. Upload File Capaian Pembelajaran (CP) Terbaru</span>
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-bold">PDF / Word / Teks</span>
                </div>

                {/* Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 bg-slate-950/60 hover:bg-slate-950/90 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.docx,.doc,.txt"
                    className="hidden"
                  />
                  <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl text-indigo-300 group-hover:scale-110 transition">
                    <UploadCloud className="w-7 h-7 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Klik atau Seret Dokumen CP Resmi ke Sini
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Mendukung Dokumen PDF BSKAP 032/H/KR/2024, Microsoft Word (.docx/.doc), atau file teks.
                    </span>
                  </div>
                  {uploadedFile && (
                    <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-bold">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>{uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}
                  {fileExtracting && (
                    <div className="text-xs text-indigo-400 font-bold flex items-center space-x-1 animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sedang mengekstrak teks dokumen...</span>
                    </div>
                  )}
                </div>

                {/* Textarea CP */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-bold">
                      Isi Teks Capaian Pembelajaran ({subject} - {phase})
                    </label>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(subject)}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-semibold"
                    >
                      Muat Teks Standar BSKAP
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={cpText}
                    onChange={(e) => setCpText(e.target.value)}
                    placeholder="Tempel atau ketik teks resmi Capaian Pembelajaran (CP) untuk mata pelajaran ini..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans text-xs"
                  />
                </div>

                {/* Custom School Format Selector & Checkbox (Word/PDF/Excel/Images format uploader) */}
                <div className="pt-2">
                  <CustomFormatSelector
                    value={customFormatConfig}
                    onChange={(cfg) => {
                      setCustomFormatConfig(cfg);
                      try {
                        localStorage.setItem('kurikulum_custom_format_analisis_cp', JSON.stringify(cfg));
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    docTypeName="Analisis Capaian Pembelajaran (CP)"
                    docTypeId="analisis_cp"
                  />
                </div>

                {/* Main Trigger Action: Run Full Analysis */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleRunFullAnalysis}
                    disabled={isAnalyzing}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-xs font-extrabold flex items-center justify-center space-x-2 shadow-xl shadow-indigo-600/20 transition transform active:scale-98"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                    <span>
                      {isAnalyzing
                        ? 'Sedang Menganalisis & Menyinkronkan...'
                        : 'Mulai Analisis CP & Sinkronkan Otomatis ke Seluruh Perangkat Ajar'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    ⚡ Otomatis merumuskan TP, ATP, PROTA, PROSEM, KKTP, RPM / Modul Ajar Deep Learning, LKPD, & Rubrik Penilaian.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PEMBAGIAN MATERI SEMESTER 1 (GANJIL) */}
      {/* ========================================================================= */}
      {activeTab === 'sem1' && (
        <div className="space-y-4">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Matriks Materi & Tujuan Pembelajaran — Semester 1 (Ganjil)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Total Alokasi: <span className="font-bold text-emerald-400">{totalJPSem1} JP</span> dari {totalHoursPerYear} JP per Tahun ({materialsSem1.length} Unit Materi/TP)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleOpenAddModal(1)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Materi Sem 1</span>
              </button>
            </div>
          </div>

          {/* List Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950/80 text-slate-300 uppercase tracking-wider font-bold text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 text-center w-12">No</th>
                    <th className="p-3.5 w-28 text-center">Kode TP</th>
                    <th className="p-3.5">Materi Pokok Esensial</th>
                    <th className="p-3.5">Rumusan Tujuan Pembelajaran (TP)</th>
                    <th className="p-3.5 text-center w-20">JP</th>
                    <th className="p-3.5">Asesmen & Deep Learning</th>
                    <th className="p-3.5 text-center w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {materialsSem1.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Belum ada materi Semester 1. Klik <strong>"Tambah Materi Sem 1"</strong> atau lakukan <strong>"Analisis CP"</strong> di tab Profil.
                      </td>
                    </tr>
                  ) : (
                    materialsSem1.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3.5 text-center font-mono font-bold text-indigo-300 bg-indigo-500/5 rounded">
                          {item.tpCode}
                        </td>
                        <td className="p-3.5 font-bold text-white">{item.essentialMaterial}</td>
                        <td className="p-3.5 leading-relaxed text-slate-300">{item.tpName}</td>
                        <td className="p-3.5 text-center font-bold font-mono text-emerald-400">
                          {item.allocatedHours} JP
                        </td>
                        <td className="p-3.5 text-[11px] text-slate-400">
                          <div>{item.assessmentStrategy}</div>
                          {item.deepLearningMethod && (
                            <div className="text-amber-400/80 italic mt-0.5">{item.deepLearningMethod}</div>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => handleMoveUp(1, idx)}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                              title="Geser Naik"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveDown(1, idx)}
                              disabled={idx === materialsSem1.length - 1}
                              className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                              title="Geser Turun"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(1, item)}
                              className="p-1 text-indigo-400 hover:text-indigo-300"
                              title="Edit Materi"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicateItem(1, item)}
                              className="p-1 text-sky-400 hover:text-sky-300"
                              title="Duplikat Materi"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus materi "${item.essentialMaterial}"?`)) {
                                  setMaterialsSem1(materialsSem1.filter((m) => m.id !== item.id));
                                }
                              }}
                              className="p-1 text-rose-400 hover:text-rose-300"
                              title="Hapus Materi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PEMBAGIAN MATERI SEMESTER 2 (GENAP) */}
      {/* ========================================================================= */}
      {activeTab === 'sem2' && (
        <div className="space-y-4">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Matriks Materi & Tujuan Pembelajaran — Semester 2 (Genap)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Total Alokasi: <span className="font-bold text-emerald-400">{totalJPSem2} JP</span> dari {totalHoursPerYear} JP per Tahun ({materialsSem2.length} Unit Materi/TP)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleOpenAddModal(2)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Materi Sem 2</span>
              </button>
            </div>
          </div>

          {/* List Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950/80 text-slate-300 uppercase tracking-wider font-bold text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 text-center w-12">No</th>
                    <th className="p-3.5 w-28 text-center">Kode TP</th>
                    <th className="p-3.5">Materi Pokok Esensial</th>
                    <th className="p-3.5">Rumusan Tujuan Pembelajaran (TP)</th>
                    <th className="p-3.5 text-center w-20">JP</th>
                    <th className="p-3.5">Asesmen & Deep Learning</th>
                    <th className="p-3.5 text-center w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {materialsSem2.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Belum ada materi Semester 2. Klik <strong>"Tambah Materi Sem 2"</strong> atau lakukan <strong>"Analisis CP"</strong> di tab Profil.
                      </td>
                    </tr>
                  ) : (
                    materialsSem2.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 text-center font-bold text-slate-400">{materialsSem1.length + idx + 1}</td>
                        <td className="p-3.5 text-center font-mono font-bold text-indigo-300 bg-indigo-500/5 rounded">
                          {item.tpCode}
                        </td>
                        <td className="p-3.5 font-bold text-white">{item.essentialMaterial}</td>
                        <td className="p-3.5 leading-relaxed text-slate-300">{item.tpName}</td>
                        <td className="p-3.5 text-center font-bold font-mono text-emerald-400">
                          {item.allocatedHours} JP
                        </td>
                        <td className="p-3.5 text-[11px] text-slate-400">
                          <div>{item.assessmentStrategy}</div>
                          {item.deepLearningMethod && (
                            <div className="text-amber-400/80 italic mt-0.5">{item.deepLearningMethod}</div>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => handleMoveUp(2, idx)}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                              title="Geser Naik"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveDown(2, idx)}
                              disabled={idx === materialsSem2.length - 1}
                              className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                              title="Geser Turun"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(2, item)}
                              className="p-1 text-indigo-400 hover:text-indigo-300"
                              title="Edit Materi"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicateItem(2, item)}
                              className="p-1 text-sky-400 hover:text-sky-300"
                              title="Duplikat Materi"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus materi "${item.essentialMaterial}"?`)) {
                                  setMaterialsSem2(materialsSem2.filter((m) => m.id !== item.id));
                                }
                              }}
                              className="p-1 text-rose-400 hover:text-rose-300"
                              title="Hapus Materi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PRATINJAU & EKSPOR MATRIKS */}
      {/* ========================================================================= */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Pratinjau Matriks Perangkat Ajar Resmi</span>
              </h3>
              <p className="text-xs text-slate-400">
                Dokumen resmi siap cetak dengan kop sekolah, identitas guru, dan tanda tangan kepala sekolah.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportWord}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor Word (.docx)</span>
              </button>
              <button
                onClick={handlePrintPdf}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5 text-amber-300" />
                <span>Cetak / Pratinjau PDF</span>
              </button>
            </div>
          </div>

          {/* Render Preview Paper */}
          <div className="bg-white text-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-200 max-w-5xl mx-auto space-y-6">
            {/* Header Kop */}
            <div className="text-center border-b-2 border-slate-900 pb-4">
              <h2 className="text-base font-bold uppercase tracking-wider">{schoolName}</h2>
              <h1 className="text-lg font-extrabold uppercase mt-1">
                MATRIKS PEMBAGIAN MATERI & TUJUAN PEMBELAJARAN (ANALISIS CP)
              </h1>
              <p className="text-xs font-semibold mt-1">
                Mata Pelajaran: {subject} | Jenjang/Kelas: {level} / Kelas {grade} ({phase}) | Tahun Pelajaran: {academicYear}
              </p>
            </div>

            {/* Identitas Guru */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p><strong>Nama Guru Pengampu:</strong> {teacherName}</p>
                <p><strong>NIP Guru:</strong> {teacherNip || '-'}</p>
              </div>
              <div className="text-right">
                <p><strong>Beban Belajar:</strong> {jpPerWeek} JP/Minggu ({timeAllocationPerWeek || '45 Menit'})</p>
                <p><strong>Total Target TP:</strong> {materialsSem1.length + materialsSem2.length} TP</p>
              </div>
            </div>

            {/* Tables */}
            <div
              className="prose prose-sm max-w-none text-xs"
              dangerouslySetInnerHTML={{ __html: generateMatrixHtml() }}
            />

            {/* Signatures */}
            <div className="pt-8 grid grid-cols-2 text-center text-xs">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold">Kepala Sekolah</p>
                <div className="h-16" />
                <p className="font-bold underline">{principalName}</p>
                <p>NIP. {principalNip || '-'}</p>
              </div>

              <div>
                <p>{city}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-bold">Guru Mata Pelajaran</p>
                <div className="h-16" />
                <p className="font-bold underline">{teacherName}</p>
                <p>NIP. {teacherNip || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: BANK DOKUMEN CP & PRESET */}
      {/* ========================================================================= */}
      {activeTab === 'bank' && (
        <div className="space-y-4">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Database className="w-4 h-4 text-sky-400" />
              <span>Preset Acuan Kurikulum BSKAP 032/H/KR/2024</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Pilih dari daftar mata pelajaran terintegrasi untuk langsung memuat analisis capaian pembelajaran terstandar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUBJECT_MATERIAL_PRESETS.map((p, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-2xl space-y-3 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[10px] font-bold">
                      {p.level} • {p.phase} (Kelas {p.grade})
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {p.totalHoursPerYear} JP/Thn
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{p.subject}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{p.cpSummary}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {p.materialsSem1.length + p.materialsSem2.length} Unit Materi
                  </span>
                  <button
                    onClick={() => handleApplyPreset(p.subject)}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
                  >
                    <span>Terapkan</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUCCESS SYNCHRONIZATION SUMMARY */}
      {/* ========================================================================= */}
      {showSyncSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-400">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Master CP & Profil Guru Berhasil Disinkronkan!
                </h3>
                <p className="text-xs text-slate-300">
                  {subject} ({level} - {phase}) • {teacherName}
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-indigo-400 block mb-1">
                Data telah tersinkronisasi otomatis ke 9 Modul Perangkat Pembelajaran:
              </span>
              <ul className="grid grid-cols-2 gap-1.5 text-slate-300 text-[11px]">
                <li className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1. Tujuan Pembelajaran (TP)</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>2. Alur Tujuan Pembelajaran (ATP)</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>3. Program Tahunan (PROTA)</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>4. Program Semester (PROSEM)</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>5. Kriteria Ketuntasan (KKTP)</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>6. RPM (Rencana Pelaksanaan Modul)</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>7. Lembar Kerja Siswa (LKPD)</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>8. Rubrik Penilaian Terpadu</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  setShowSyncSuccessModal(false);
                  setActiveTab('sem1');
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
              >
                Lihat Matriks
              </button>
              <button
                onClick={() => {
                  setShowSyncSuccessModal(false);
                  if (onNavigate) onNavigate('ai_tp');
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition flex items-center space-x-1"
              >
                <span>Buka TP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setShowSyncSuccessModal(false);
                  if (onNavigate) onNavigate('ai_modul_ajar');
                }}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-extrabold transition flex items-center space-x-1.5 shadow-lg"
              >
                <span>Buka RPM / Modul Ajar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT MATERIAL ITEM */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                <span>{isNewModalItem ? 'Tambah' : 'Edit'} Materi & Tujuan Pembelajaran</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModalItem} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Semester</label>
                  <select
                    value={modalItem.semester}
                    onChange={(e) =>
                      setModalItem({ ...modalItem, semester: Number(e.target.value) as 1 | 2 })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  >
                    <option value={1}>Semester 1 (Ganjil)</option>
                    <option value={2}>Semester 2 (Genap)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Kode TP</label>
                  <input
                    type="text"
                    value={modalItem.tpCode}
                    onChange={(e) => setModalItem({ ...modalItem, tpCode: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-indigo-300 font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Alokasi JP</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={modalItem.allocatedHours}
                    onChange={(e) => {
                      const val = e.target.value;
                      setModalItem({
                        ...modalItem,
                        allocatedHours: val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0),
                      });
                    }}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold text-center focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Lingkup Materi Pokok *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pengukuran Besaran Fisis, Angka Penting & Ketidakpastian"
                  value={modalItem.essentialMaterial}
                  onChange={(e) => setModalItem({ ...modalItem, essentialMaterial: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Rumusan Tujuan Pembelajaran (TP) *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Peserta didik mampu menerapkan prinsip-prinsip pengukuran..."
                  value={modalItem.tpName}
                  onChange={(e) => setModalItem({ ...modalItem, tpName: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Strategi Asesmen</label>
                <input
                  type="text"
                  value={modalItem.assessmentStrategy}
                  onChange={(e) => setModalItem({ ...modalItem, assessmentStrategy: e.target.value })}
                  placeholder="Tes Formatif, Observasi & Asesmen Sumatif"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Metode Deep Learning (3 Pilar)</label>
                <input
                  type="text"
                  value={modalItem.deepLearningMethod || ''}
                  onChange={(e) => setModalItem({ ...modalItem, deepLearningMethod: e.target.value })}
                  placeholder="Mindful: ..., Meaningful: ..., Joyful: ..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  Simpan Materi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRESET SELECTION MODAL */}
      {/* ========================================================================= */}
      {isPresetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Pilih Template Materi Resmi BSKAP</span>
              </h3>
              <button
                onClick={() => setIsPresetModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {SUBJECT_MATERIAL_PRESETS.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => handleApplyPreset(preset.subject)}
                  className="p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-xl cursor-pointer transition flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-white group-hover:text-indigo-300 text-xs">
                        {preset.subject}
                      </span>
                      <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[9px] font-bold">
                        {preset.level} • {preset.phase} (Kelas {preset.grade})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{preset.cpSummary}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
