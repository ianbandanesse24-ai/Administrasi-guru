export type UserRole = 'admin' | 'client' | 'guru';

export type UserStatus = 'approved' | 'pending' | 'rejected';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  password?: string;
  school?: string;
  subject?: string;
  phone?: string;
  requestDate: string;
  approvalDate?: string;
  approvedBy?: string;
  authCode?: string;
  lastLogin?: string;
  avatar?: string;

  // Monthly AI Quota & Limits (35 Generate / 500.000 Token per Bulan)
  monthlyAIClicks?: number;
  monthlyAILimit?: number; // Default: 35 kali generate/bulan
  monthlyTokensUsed?: number; // Tracked token usage (up to 500,000)
  monthlyTokensLimit?: number; // Default: 500,000 tokens/bulan
  billingCycleDay?: number; // Tanggal reset bulanan (sesuai tanggal persetujuan admin, 1-31)
  lastMonthlyResetDate?: string; // YYYY-MM-DD cycle start
  nextMonthlyResetDate?: string; // YYYY-MM-DD next cycle

  // 1-Year Subscription & Access Expiration
  subscriptionStartDate?: string;
  subscriptionExpiryDate?: string; // Jatuh tempo 1 tahun dari tanggal disetujui
  subscriptionStatus?: 'active' | 'expiring_soon' | 'expired';
  paymentStatus?: 'paid' | 'free_trial' | 'pending' | 'renewed';
  subscriptionDurationYears?: number;
  subscriptionNotes?: string;

  // Extra Bonus & Legacy Daily fields for backwards-compatibility
  dailyAIClicks?: number;
  dailyAILimit?: number;
  extraTokens?: number;
  lastTokenResetDate?: string;
  totalAIClicksEver?: number;
  tokenVouchersRedeemed?: string[];
}

export interface AdminSystemSettings {
  defaultMonthlyQuota: number; // e.g. 35 clicks/month
  defaultMonthlyTokenLimit: number; // e.g. 500,000 tokens
  defaultSubscriptionDurationYears: number; // e.g. 1 year
  autoApproveNewUsers: boolean; // auto-approve registered teachers
  preferredModel: string; // e.g. 'gemini-3.8-flash'
  fallbackModel: string; // e.g. 'gemini-2.5-flash'
  deepLearningFrameworkVersion: string;
  autoSaveEnabled: boolean;
  autoSaveIntervalSeconds: number;
  rpmDefaultFormat: 'rpm_deep_learning_master' | 'modul_sekolah' | 'lengkap';
  enableActivityLogging: boolean;
  enableCloudSync: boolean;
  notificationSoundEnabled: boolean;
  systemBroadcastMessage?: string;
  lastUpdated: string;
  updatedBy: string;
}

export interface TokenVoucher {
  id: string;
  code: string;
  extraClicks: number;
  isRedeemed: boolean;
  createdAt: string;
  createdBy: string;
  redeemedBy?: string;
  redeemedByName?: string;
  redeemedByEmail?: string;
  redeemedAt?: string;
  description?: string;
}

export interface TokenQuotaStatus {
  // Monthly Quota Status (35 Generate / 500.000 Token)
  monthlyUsed: number;
  monthlyLimit: number;
  monthlyTokensUsed: number;
  monthlyTokensLimit: number;
  monthlyRemaining: number;
  monthlyTokensRemaining: number;
  monthlyResetDate: string;
  billingCycleDay: number;

  // Backwards compatibility / Daily compatibility
  used: number;
  limit: number;
  extra: number;
  totalAllowed: number;
  remaining: number;
  isExhausted: boolean;
  resetDate: string;
  isAdmin: boolean;

  // 1-Year Subscription Expiration Status
  subscriptionStartDate?: string;
  subscriptionExpiryDate?: string;
  daysUntilExpiry: number;
  isExpiringSoon: boolean; // <= 7 hari sebelum jatuh tempo
  isExpired: boolean; // < 0 hari
  subscriptionStatusText: string;
  isSubscriptionActive: boolean;
}

export interface AccessLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  ipAddress?: string;
  device?: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'access_request' | 'access_approved' | 'user_login' | 'sync' | 'ai_generate' | 'system' | 'saran';
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export type UserNotification = NotificationItem;

export type SchoolLevel = 'SD' | 'SMP' | 'SMA' | 'SMK';
export type EducationLevel = SchoolLevel;
export type SemesterType = 'Ganjil' | 'Genap';

export interface SchoolProfile {
  schoolName: string;
  npsn: string;
  address: string;
  headmasterName: string;
  headmasterNip: string;
  principalName?: string;
  principalNip?: string;
  teacherName: string;
  teacherNip: string;
  city: string;
  semester: SemesterType;
  academicYear: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  subject?: string;
  level?: SchoolLevel;
  grade?: number | string;
  phase?: string;
  jpPerWeek?: number;
  totalHoursPerYear?: number;
  timeAllocationPerWeek?: string;
  cpText?: string;
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  classId: string;
  className: string;
  parentName?: string;
  parentPhone?: string;
  address?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  level: SchoolLevel;
  grade: number; // 1-12
  academicYear: string;
  homeroomTeacher?: string;
}

export type AttendanceStatus = 'H' | 'S' | 'I' | 'A'; // Hadir, Sakit, Izin, Alpa

export interface AttendanceRecord {
  id: string;
  date: string;
  classId: string;
  className: string;
  subject: string;
  meetingNumber: number;
  semester: SemesterType;
  academicYear: string;
  records: {
    studentId: string;
    studentName: string;
    status: AttendanceStatus;
    notes?: string;
  }[];
  summary: {
    hadir: number;
    sakit: number;
    izin: number;
    alpa: number;
    total: number;
    presentPercentage: number;
  };
}

export interface ScheduleItem {
  id: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  period: string;
  startTime: string;
  endTime: string;
  className: string;
  subject: string;
  room: string;
  notes?: string;
}

export interface AgendaItem {
  id: string;
  date: string;
  time: string;
  className: string;
  subject: string;
  meetingNumber: number;
  topic: string;
  activities: string;
  studentAttendanceSummary: string;
  reflection: string;
  followUp: string;
  status: 'Selesai' | 'Tertunda' | 'Dibatalkan';
}

export interface JournalItem {
  id: string;
  date: string;
  className: string;
  subject: string;
  material?: string; // Materi yang diajarkan / Pokok Bahasan
  materi?: string;   // Alias materi
  tpCovered: string;
  learningProgress: string;
  obstacles: string;
  solution: string;
  teacherNotes: string;
  signatureVerified: boolean;
  supervisorNotes?: string;
  // Data Kehadiran & Rekap Absensi Siswa
  hadir?: number;       // Jumlah siswa hadir
  sakit?: number;       // Jumlah siswa sakit (S)
  izin?: number;        // Jumlah siswa izin (I)
  alpa?: number;        // Jumlah siswa alpa / tanpa keterangan (A)
  bolos?: number;       // Jumlah siswa bolos / keluar kelas (B)
  absentNames?: string; // Catatan rincian nama siswa tidak hadir / keterangan bolos
}

export interface HomeroomStudent {
  id: string;
  studentId: string;
  studentName: string;
  nis: string;
  className: string;
  attendanceRate: number;
  characterNotes: {
    date: string;
    category: 'Prestasi' | 'Pelanggaran' | 'Bimbingan' | 'Catatan Khusus';
    description: string;
    followUp: string;
  }[];
  parentContacts: {
    fatherName: string;
    motherName: string;
    phone: string;
    homeVisitHistory?: string[];
  };
  overallStatus: 'Sangat Baik' | 'Baik' | 'Perlu Perhatian' | 'Kritis';
}

export interface GradeEntry {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  subject: string;
  task1?: number;
  task2?: number;
  uh1?: number;
  uh2?: number;
  performance?: number;
  dailyAverage: number;
  ptsScore: number;
  pasScore: number;
  finalScore: number;
  predicate: 'A' | 'B' | 'C' | 'D';
  remedial?: number;
}

export interface DailyGrade {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  subject: string;
  semester: SemesterType;
  academicYear: string;
  tasks: number[];
  uh: number[];
  averageTask: number;
  averageUH: number;
  finalDaily: number;
}

export interface PTSGrade {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  subject: string;
  semester: SemesterType;
  theoryScore: number;
  practicalScore: number;
  finalPTS: number;
}

export interface PASGrade {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  subject: string;
  semester: SemesterType;
  pasScore: number;
  projectScore: number;
  finalPAS: number;
}

export interface AutomaticRecapGrade {
  id: string;
  studentId: string;
  studentName: string;
  nisn: string;
  className: string;
  subject: string;
  semester: SemesterType;
  academicYear: string;
  dailyScore: number;
  ptsScore: number;
  pasScore: number;
  finalGrade: number;
  predicate: 'A' | 'B' | 'C' | 'D';
  competencyDescription: string;
  needsImprovementDescription: string;
}

export type AIToolType =
  | 'analisis_cp'
  | 'tp'
  | 'atp'
  | 'analisis_alokasi_waktu'
  | 'prota'
  | 'prosem'
  | 'modul_ajar'
  | 'rpm'
  | 'lkpd'
  | 'kktp'
  | 'asesmen'
  | 'kalender_pendidikan';

export interface KalenderMonthAnalysis {
  monthName: string;
  monthIndex?: number;
  totalWeeks: number;
  nonEffectiveWeeks: number;
  effectiveWeeks: number;
  nonEffectiveNotes?: string;
  description?: string;
  agendaTags?: ('KBM' | 'MPLS' | 'ASTS' | 'ASAS' | 'LIBUR' | 'P5' | 'RAPOR')[];
}

export interface KalenderSemesterPlan {
  semester?: SemesterType;
  semesterName?: SemesterType;
  academicYear?: string;
  months: KalenderMonthAnalysis[];
  totalWeeks?: number;
  totalCalendarWeeks?: number;
  nonEffectiveWeeks?: number;
  totalNonEffectiveWeeks?: number;
  totalEffectiveWeeks: number;
  jpPerWeek: number;
  totalEffectiveHours?: number;
  totalJpSemester?: number;
  reservedHours?: number;
  netTeachingHours?: number;
}

export interface KalenderPendidikanData {
  id?: string;
  academicYear?: string;
  tahunAjaran?: string;
  schoolName?: string;
  province?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  fileData?: string;
  uploadedAt?: string;
  uploadedFile?: {
    fileName: string;
    fileSize: number;
    fileType: string;
    base64Data?: string;
    uploadedAt: string;
  };
  semester1: KalenderSemesterPlan;
  semester2: KalenderSemesterPlan;
  notes?: string;
  catatanKhusus?: string;
  lastUpdated?: string;
}

export interface AIDocument {
  id: string;
  type?: AIToolType;
  toolType?: AIToolType;
  title: string;
  level: SchoolLevel;
  grade: string | number;
  subject: string;
  semester: SemesterType;
  phase?: string;
  modelOption?: 'lengkap' | 'rpp_1lembar' | 'deep_learning_lengkap' | 'rpp_1_lembar';
  meetingCount?: number;
  tpCount?: number;
  hoursPerMeeting?: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
  authorEmail?: string;
  tags?: string[];
}

export interface CPReference {
  id: string;
  title: string;
  level: SchoolLevel;
  phase: string;
  grade?: number;
  subject: string;
  curriculumVersion: string;
  uploadedAt: string;
  uploadedBy: string;
  fileName?: string;
  topic?: string;
  cpText?: string;
  elements: {
    name: string;
    description: string;
    competencies: string[];
    essentialMaterials: string[];
  }[];
  rawText?: string;
  aiAnalysisSummary?: string;
}

export interface UserFeedback {
  id: string;
  date: string;
  userEmail: string;
  userName: string;
  category: 'Fitur Baru' | 'Perbaikan Bug' | 'Kurikulum & Konten' | 'Desain & UI' | 'Lainnya';
  title: string;
  message: string;
  status: 'Menunggu Review' | 'Diproses' | 'Selesai' | 'Ditolak';
  adminReply?: string;
}

export interface SupabaseConfig {
  url: string;
  apiKey: string;
  autoSync: boolean;
  lastSyncedAt?: string;
  syncStatus?: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
}

export interface CPMaterialItem {
  id: string;
  semester: 1 | 2;
  orderNumber: number;
  tpCode: string;
  tpName: string;
  essentialMaterial: string;
  elementName?: string;
  allocatedHours: number; // Jumlah Jam Pelajaran (JP)
  meetingCount?: number; // Jumlah Pertemuan
  tpCount?: number; // Jumlah TP / Sub-TP yang dicakup
  assessmentStrategy: string;
  deepLearningMethod?: string;
  notes?: string;
}

export interface CPDistributionPlan {
  id: string;
  teacherName: string;
  teacherNip?: string;
  subject: string;
  schoolName: string;
  level: SchoolLevel;
  grade: number | string;
  phase: string;
  academicYear: string;
  semesterOption: 'all' | 'sem1' | 'sem2';
  totalHoursPerYear: number;
  totalTPCount: number;
  jpPerWeek?: number;
  timeAllocationPerWeek?: string;
  timeAllocationPerMeeting?: string;
  cpText?: string;
  elements?: {
    name: string;
    description: string;
  }[];
  materialsSem1: CPMaterialItem[];
  materialsSem2: CPMaterialItem[];
  totalHoursSem1: number;
  totalHoursSem2: number;
  createdAt: string;
  updatedAt: string;
  authorEmail?: string;
}

export interface ActiveMasterCPData {
  id: string;
  fileName: string;
  fileType?: string;
  fileSize?: number;
  uploadedAt: string;
  level: SchoolLevel;
  grade: number | string;
  phase: string;
  subject: string;
  teacherName?: string;
  teacherNip?: string;
  schoolName?: string;
  principalName?: string;
  principalNip?: string;
  headmasterName?: string;
  headmasterNip?: string;
  city?: string;
  academicYear?: string;
  totalHoursPerYear: number;
  jpPerWeek: number;
  timeAllocationPerWeek?: string;
  timeAllocationPerMeeting?: string;
  cpText: string;
  elements: {
    name: string;
    description: string;
    competencies?: string[];
    essentialMaterials?: string[];
  }[];
  materialsSem1: CPMaterialItem[];
  materialsSem2: CPMaterialItem[];
  executiveSummary?: string;
  fullMarkdownReport?: string;
  kktpSummary?: string;
  deepLearningNotes?: string;
  syncStatus?: 'synced' | 'draft';
  lastSyncedAt?: string;
}

export type AppTheme = 'dark' | 'light' | 'slate' | 'emerald';


