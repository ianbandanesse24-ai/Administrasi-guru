import {
  UserAccount,
  AccessLog,
  NotificationItem,
  UserNotification,
  ClassRoom,
  Student,
  AttendanceRecord,
  ScheduleItem,
  AgendaItem,
  JournalItem,
  HomeroomStudent,
  DailyGrade,
  PTSGrade,
  PASGrade,
  AutomaticRecapGrade,
  GradeEntry,
  AIDocument,
  CPReference,
  UserFeedback,
  SupabaseConfig,
  SchoolProfile,
  CPMaterialItem,
  CPDistributionPlan,
  AppTheme,
  TokenVoucher,
  TokenQuotaStatus,
  KalenderPendidikanData,
  KalenderSemesterPlan,
  KalenderMonthAnalysis,
  ActiveMasterCPData,
  AdminSystemSettings,
} from '../types';
import { INITIAL_CLASSES, INITIAL_STUDENTS, INITIAL_CP_REFERENCES } from './curriculumData';
import { getSubjectPresetByGrade } from './subjectMaterialPresets';

export type { SchoolProfile, TokenVoucher, TokenQuotaStatus, AdminSystemSettings };

// Storage Keys
const KEYS = {
  CURRENT_USER: 'agk_current_user',
  USERS: 'agk_users',
  ACCESS_LOGS: 'agk_access_logs',
  NOTIFICATIONS: 'agk_notifications',
  CLASSES: 'agk_classes',
  STUDENTS: 'agk_students',
  ATTENDANCE: 'agk_attendance',
  SCHEDULE: 'agk_schedule',
  AGENDA: 'agk_agenda',
  JOURNAL: 'agk_journal',
  HOMEROOM: 'agk_homeroom',
  DAILY_GRADES: 'agk_daily_grades',
  PTS_GRADES: 'agk_pts_grades',
  PAS_GRADES: 'agk_pas_grades',
  RECAP_GRADES: 'agk_recap_grades',
  GRADES_UNIFIED: 'agk_grades_unified',
  AI_DOCS: 'agk_ai_docs',
  CP_REFS: 'agk_cp_references',
  CP_DISTRIBUTIONS: 'agk_cp_distributions',
  FEEDBACKS: 'agk_feedbacks',
  SUPABASE_CONFIG: 'agk_supabase_config',
  SCHOOL_PROFILE: 'agk_school_profile',
  TOKEN_VOUCHERS: 'agk_token_vouchers',
  KALENDER_PENDIDIKAN: 'agk_kalender_pendidikan',
  ACTIVE_MASTER_CP: 'agk_active_master_cp',
  ADMIN_SETTINGS: 'agk_admin_settings',
};

export const DEFAULT_ADMIN_SETTINGS: AdminSystemSettings = {
  defaultMonthlyQuota: 35,
  defaultMonthlyTokenLimit: 500000,
  defaultSubscriptionDurationYears: 1,
  autoApproveNewUsers: false,
  preferredModel: 'gemini-3.8-flash',
  fallbackModel: 'gemini-2.5-flash',
  deepLearningFrameworkVersion: 'Deep Learning (Mindful, Meaningful, Joyful)',
  autoSaveEnabled: true,
  autoSaveIntervalSeconds: 2,
  rpmDefaultFormat: 'rpm_deep_learning_master',
  enableActivityLogging: true,
  enableCloudSync: true,
  notificationSoundEnabled: true,
  systemBroadcastMessage: '',
  lastUpdated: new Date().toISOString(),
  updatedBy: 'Sistem Master Admin',
};

export const DEFAULT_KALENDER_PENDIDIKAN: KalenderPendidikanData = {
  id: 'kaldik-standar-2025-2026',
  academicYear: '2025/2026',
  tahunAjaran: '2025/2026',
  province: 'Nasional / Maluku',
  notes: 'Kalender Pendidikan Standar Kurikulum Merdeka TP 2025/2026 (Semester Ganjil & Genap)',
  catatanKhusus: 'Pekan efektif disesuaikan dengan agenda kalender pendidikan dinas setempat.',
  uploadedAt: '2025-07-01 08:00',
  semester1: {
    semester: 'Ganjil',
    semesterName: 'Ganjil',
    academicYear: '2025/2026',
    jpPerWeek: 3,
    totalWeeks: 26,
    totalCalendarWeeks: 26,
    nonEffectiveWeeks: 7,
    totalNonEffectiveWeeks: 7,
    totalEffectiveWeeks: 19,
    totalEffectiveHours: 57,
    totalJpSemester: 57,
    reservedHours: 6,
    netTeachingHours: 51,
    months: [
      { monthName: 'Juli 2025', totalWeeks: 5, nonEffectiveWeeks: 2, effectiveWeeks: 3, description: 'Libur Akhir Tahun Ajaran (P1-P2) & MPLS (P3)', nonEffectiveNotes: 'Libur Akhir Tahun Ajaran (P1-P2) & MPLS (P3)' },
      { monthName: 'Agustus 2025', totalWeeks: 4, nonEffectiveWeeks: 0, effectiveWeeks: 4, description: 'KBM Efektif (Peringatan HUT RI)', nonEffectiveNotes: 'KBM Efektif (Peringatan HUT RI)' },
      { monthName: 'September 2025', totalWeeks: 5, nonEffectiveWeeks: 1, effectiveWeeks: 4, description: 'Asesmen Tengah Semester / ASTS (P4)', nonEffectiveNotes: 'Asesmen Tengah Semester / ASTS (P4)' },
      { monthName: 'Oktober 2025', totalWeeks: 4, nonEffectiveWeeks: 0, effectiveWeeks: 4, description: 'KBM Efektif & Pekan P5', nonEffectiveNotes: 'KBM Efektif & Pekan P5' },
      { monthName: 'November 2025', totalWeeks: 4, nonEffectiveWeeks: 0, effectiveWeeks: 4, description: 'KBM Efektif', nonEffectiveNotes: 'KBM Efektif' },
      { monthName: 'Desember 2025', totalWeeks: 4, nonEffectiveWeeks: 4, effectiveWeeks: 0, description: 'ASAS (P1), Pengolahan Nilai (P2), Rapor (P3), Libur Semester 1 (P4)', nonEffectiveNotes: 'ASAS (P1), Pengolahan Nilai (P2), Rapor (P3), Libur Semester 1 (P4)' },
    ],
  },
  semester2: {
    semester: 'Genap',
    semesterName: 'Genap',
    academicYear: '2025/2026',
    jpPerWeek: 3,
    totalWeeks: 26,
    totalCalendarWeeks: 26,
    nonEffectiveWeeks: 8,
    totalNonEffectiveWeeks: 8,
    totalEffectiveWeeks: 18,
    totalEffectiveHours: 54,
    totalJpSemester: 54,
    reservedHours: 6,
    netTeachingHours: 48,
    months: [
      { monthName: 'Januari 2026', totalWeeks: 5, nonEffectiveWeeks: 1, effectiveWeeks: 4, description: 'Libur Awal Semester Genap (P1)', nonEffectiveNotes: 'Libur Awal Semester Genap (P1)' },
      { monthName: 'Februari 2026', totalWeeks: 4, nonEffectiveWeeks: 0, effectiveWeeks: 4, description: 'KBM Efektif', nonEffectiveNotes: 'KBM Efektif' },
      { monthName: 'Maret 2026', totalWeeks: 4, nonEffectiveWeeks: 1, effectiveWeeks: 3, description: 'ASTS Genap & Libur Awal Ramadhan (P3)', nonEffectiveNotes: 'ASTS Genap & Libur Awal Ramadhan (P3)' },
      { monthName: 'April 2026', totalWeeks: 5, nonEffectiveWeeks: 2, effectiveWeeks: 3, description: 'Libur Hari Raya Idul Fitri (P1-P2)', nonEffectiveNotes: 'Libur Hari Raya Idul Fitri (P1-P2)' },
      { monthName: 'Mei 2026', totalWeeks: 4, nonEffectiveWeeks: 1, effectiveWeeks: 3, description: 'Ujian Sekolah / Asesmen Akhir Jenjang (P3)', nonEffectiveNotes: 'Ujian Sekolah / Asesmen Akhir Jenjang (P3)' },
      { monthName: 'Juni 2026', totalWeeks: 4, nonEffectiveWeeks: 3, effectiveWeeks: 1, description: 'ASAS Genap (P1), Pembagian Rapor (P2), Libur Akhir Tahun (P3-P4)', nonEffectiveNotes: 'ASAS Genap (P1), Pembagian Rapor (P2), Libur Akhir Tahun (P3-P4)' },
    ],
  },
};

export const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  schoolName: 'SMA NEGERI 30 MALUKU TENGAH',
  npsn: '60103210',
  address: 'Jl. Pendidikan No. 30, Maluku Tengah, Maluku',
  headmasterName: 'Drs. M. Taher, M.Pd.',
  headmasterNip: '19700315 199602 1 002',
  teacherName: 'Aspian La Ode Madimu, S.Pd. Gr',
  teacherNip: '19900822 201801 1 004',
  city: 'Maluku Tengah',
  semester: 'Ganjil',
  academicYear: '2025/2026',
  subject: 'Fisika',
  level: 'SMA',
  grade: 10,
  phase: 'Fase E',
  jpPerWeek: 3,
  totalHoursPerYear: 108,
  timeAllocationPerWeek: '45 Menit',
  cpText: 'Peserta didik mampu mengamati, menyelidiki, dan menjelaskan fenomena sehari-hari yang berkaitan dengan pengukuran besaran fisika, energi terbarukan, pemanasan global, dan pemanfaatan teknologi ramah lingkungan dengan pendekatan Deep Learning (Mindful, Meaningful, Joyful).',
};

export const INITIAL_CP_DISTRIBUTIONS: CPDistributionPlan[] = [];

// Initial admin and client users
export const DEFAULT_ADMIN: UserAccount = {
  id: 'usr-admin-1',
  email: 'aspianmadimu22@guru.sma.belajar.id',
  name: 'Aspian La Ode Madimu, S.Pd. Gr',
  role: 'admin',
  status: 'approved',
  password: 'Yuli@n12',
  school: 'SMA Negeri 30 Maluku Tengah',
  subject: 'Fisika',
  phone: '081255678901',
  requestDate: '2025-01-01 08:00',
  approvalDate: '2025-01-01 08:00',
  approvedBy: 'Sistem Master',
  authCode: 'ADMIN-MASTER-2025',
  lastLogin: '2026-08-22 01:00',
  monthlyAIClicks: 0,
  monthlyAILimit: 35,
  monthlyTokensUsed: 0,
  monthlyTokensLimit: 500000,
  billingCycleDay: 1,
  subscriptionStartDate: '2025-01-01',
  subscriptionExpiryDate: '2099-12-31',
  subscriptionStatus: 'active',
  paymentStatus: 'paid',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

export const INITIAL_CLIENTS: UserAccount[] = [
  DEFAULT_ADMIN,
];

export const INITIAL_TOKEN_VOUCHERS: TokenVoucher[] = [
  {
    id: 'vouch-1',
    code: 'GURUKREATIF20',
    extraClicks: 20,
    isRedeemed: false,
    createdAt: '2026-08-25 00:00',
    createdBy: 'Sistem Master',
    description: 'Bonus Kuota Tambahan 20 Klik AI Kurikulum Merdeka',
  },
  {
    id: 'vouch-2',
    code: 'DEEPLEARNING10',
    extraClicks: 10,
    isRedeemed: false,
    createdAt: '2026-08-25 00:00',
    createdBy: 'Sistem Master',
    description: 'Bonus Kuota Tambahan 10 Klik AI Modul & Perangkat',
  },
  {
    id: 'vouch-3',
    code: 'MERDEKABELAJAR20',
    extraClicks: 20,
    isRedeemed: false,
    createdAt: '2026-08-25 00:00',
    createdBy: 'Sistem Master',
    description: 'Voucher Spesial Guru Inspiratif +20 Klik AI',
  },
];

export const INITIAL_SCHEDULES: ScheduleItem[] = [];

export const INITIAL_AGENDAS: AgendaItem[] = [];

export const INITIAL_JOURNALS: JournalItem[] = [
  {
    id: 'jr-sample-1',
    date: '2025-07-21',
    className: 'X SMA 1 (Fase E)',
    subject: 'Fisika',
    material: 'Hakikat Fisika dan Pengukuran Besaran Pokok (Jangka Sorong & Mikrometer Sekrup)',
    materi: 'Hakikat Fisika dan Pengukuran Besaran Pokok (Jangka Sorong & Mikrometer Sekrup)',
    tpCovered: 'TP.10.1: Mengidentifikasi macam-macam alat ukur dan melakukan pengukuran besaran panjang dengan ketelitian yang tepat.',
    learningProgress: 'Sebagian besar peserta didik (88%) telah mampu membaca skala utama dan nonius jangka sorong secara presisi melalui simulasi praktikum kelompok.',
    obstacles: '3 peserta didik masih keliru dalam menentukan angka taksiran pada skala nonius mikrometer sekrup.',
    solution: 'Diberikan bimbingan terfokus (scaffolding) dan latihan mandiri dengan alat peraga mikrometer fisik.',
    teacherNotes: 'Suasana kelas sangat aktif dan antusias saat eksperimen kelompok. Disiplin lab terjaga dengan baik.',
    signatureVerified: true,
    supervisorNotes: 'Telah diverifikasi oleh Kepala Sekolah / Pengawas Pembina.',
    hadir: 32,
    sakit: 1,
    izin: 1,
    alpa: 0,
    bolos: 0,
    absentNames: 'Ahmad Faisal (Sakit - Surat Dokter), Siti Rahma (Izin Acara Keluarga)',
  },
  {
    id: 'jr-sample-2',
    date: '2025-07-28',
    className: 'X SMA 2 (Fase E)',
    subject: 'Fisika',
    material: 'Angka Penting dan Notasi Ilmiah dalam Hasil Pengukuran',
    materi: 'Angka Penting dan Notasi Ilmiah dalam Hasil Pengukuran',
    tpCovered: 'TP.10.2: Menuliskan hasil pengolahan data pengukuran menggunakan aturan angka penting dan notasi ilmiah.',
    learningProgress: 'Peserta didik memahami konsep pembulatan dan aturan perkalian/pembagian angka penting dengan baik.',
    obstacles: '1 siswa izin karena kegiatan OSIS, 1 siswa terlambat dan 1 siswa alpa tanpa keterangan.',
    solution: 'Diberikan lembar kerja mandiri (LKM) susulan bagi siswa yang tidak hadir dan penegasan tata tertib kelas.',
    teacherNotes: 'Pembelajaran berbasis masalah (PBL) berjalan efektif, diskusi kelompok berjalan lancar.',
    signatureVerified: true,
    supervisorNotes: 'Jurnal harian tersusun rapi dan terdokumentasi dengan baik.',
    hadir: 33,
    sakit: 0,
    izin: 1,
    alpa: 1,
    bolos: 0,
    absentNames: 'Rian Pratama (Izin Tugas OSIS), Dedi Kurniawan (Alpa)',
  },
];

export const INITIAL_HOMEROOMS: HomeroomStudent[] = [];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_UNIFIED_GRADES: GradeEntry[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_ACCESS_LOGS: AccessLog[] = [];

// Storage Helper
type StorageChangeListener = (key: string) => void;
const storageListeners: StorageChangeListener[] = [];

export function addStorageListener(listener: StorageChangeListener): () => void {
  storageListeners.push(listener);
  return () => {
    const idx = storageListeners.indexOf(listener);
    if (idx >= 0) storageListeners.splice(idx, 1);
  };
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error loading key ${key}:`, err);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    if (key !== KEYS.CURRENT_USER && key !== KEYS.SUPABASE_CONFIG) {
      storageListeners.forEach((fn) => {
        try {
          fn(key);
        } catch (e) {
          console.warn('Storage listener error:', e);
        }
      });
    }
  } catch (err) {
    console.error(`Error saving key ${key}:`, err);
  }
}

// Storage Manager
export class StorageService {
  static getCurrentUser(): UserAccount | null {
    const user = loadFromStorage<UserAccount | null>(KEYS.CURRENT_USER, DEFAULT_ADMIN);
    if (user && user.role === 'admin' && user.email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase()) {
      // Sync master admin fields
      const syncedAdmin: UserAccount = {
        ...user,
        name: DEFAULT_ADMIN.name,
        school: DEFAULT_ADMIN.school,
        subject: DEFAULT_ADMIN.subject,
      };
      return syncedAdmin;
    }
    return user;
  }

  static setCurrentUser(user: UserAccount | null): void {
    saveToStorage(KEYS.CURRENT_USER, user);
  }

  static getUsers(): UserAccount[] {
    let users = loadFromStorage<UserAccount[]>(KEYS.USERS, INITIAL_CLIENTS);

    // Filter out any unwanted users or users named Uus
    users = users.filter((u) => {
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      if (name.includes('uus') || email.includes('uus')) return false;
      return true;
    });

    // Ensure master admin is always present
    const hasAdmin = users.some(
      (u) => u.email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase()
    );
    if (!hasAdmin) {
      users = [DEFAULT_ADMIN, ...users];
    }

    return users.map((u) => {
      if (u.role === 'admin' && u.email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase()) {
        return {
          ...u,
          name: DEFAULT_ADMIN.name,
          school: DEFAULT_ADMIN.school,
          subject: DEFAULT_ADMIN.subject,
        };
      }
      return u;
    });
  }

  static saveUsers(users: UserAccount[]): void {
    const filtered = users.filter((u) => {
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      return !name.includes('uus') && !email.includes('uus');
    });
    saveToStorage(KEYS.USERS, filtered);
  }

  static deleteUser(userId: string): void {
    const users = this.getUsers().filter((u) => u.id !== userId && u.email.toLowerCase() !== DEFAULT_ADMIN.email.toLowerCase());
    this.saveUsers(users);
  }

  static purgeUserByQuery(query: string): number {
    const q = query.toLowerCase().trim();
    if (!q) return 0;
    const current = this.getUsers();
    const filtered = current.filter((u) => {
      if (u.email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase()) return true; // keep admin
      const matchName = (u.name || '').toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      const matchId = (u.id || '').toLowerCase().includes(q);
      return !(matchName || matchEmail || matchId);
    });
    const deletedCount = current.length - filtered.length;
    this.saveUsers(filtered);
    return deletedCount;
  }

  /**
   * Reset total semua data menjadi seperti aplikasi baru yang belum pernah digunakan
   */
  static resetAllDataToFresh(): void {
    try {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(DEFAULT_ADMIN));
      localStorage.setItem(KEYS.USERS, JSON.stringify([DEFAULT_ADMIN]));
      localStorage.setItem(KEYS.CLASSES, JSON.stringify([]));
      localStorage.setItem(KEYS.STUDENTS, JSON.stringify([]));
      localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify([]));
      localStorage.setItem(KEYS.SCHEDULE, JSON.stringify([]));
      localStorage.setItem(KEYS.AGENDA, JSON.stringify([]));
      localStorage.setItem(KEYS.JOURNAL, JSON.stringify([]));
      localStorage.setItem(KEYS.HOMEROOM, JSON.stringify([]));
      localStorage.setItem(KEYS.DAILY_GRADES, JSON.stringify([]));
      localStorage.setItem(KEYS.PTS_GRADES, JSON.stringify([]));
      localStorage.setItem(KEYS.PAS_GRADES, JSON.stringify([]));
      localStorage.setItem(KEYS.RECAP_GRADES, JSON.stringify([]));
      localStorage.setItem(KEYS.GRADES_UNIFIED, JSON.stringify([]));
      localStorage.setItem(KEYS.AI_DOCS, JSON.stringify([]));
      localStorage.setItem(KEYS.CP_DISTRIBUTIONS, JSON.stringify([]));
      localStorage.setItem(KEYS.FEEDBACKS, JSON.stringify([]));
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify([]));
      localStorage.setItem(KEYS.ACCESS_LOGS, JSON.stringify([]));
      localStorage.removeItem('agk_current_draft');
      localStorage.setItem('agk_fresh_clean_v3', 'true');

      // Notify all listeners
      Object.values(KEYS).forEach((k) => {
        storageListeners.forEach((fn) => {
          try {
            fn(k);
          } catch {}
        });
      });
    } catch (e) {
      console.error('Failed to reset data:', e);
    }
  }

  /**
   * Pembersihan otomatis data dummy lama dan akun Uus saat aplikasi dimuat pertama kali
   */
  static autoCleanLegacyMockData(): void {
    try {
      const isCleaned = localStorage.getItem('agk_fresh_clean_v3');
      if (!isCleaned) {
        this.resetAllDataToFresh();
      } else {
        // Tetap pastikan akun Uus terhapus jika ada di local
        this.purgeUserByQuery('uus');
      }
    } catch {}
  }

  static getAccessLogs(): AccessLog[] {
    return loadFromStorage<AccessLog[]>(KEYS.ACCESS_LOGS, INITIAL_ACCESS_LOGS);
  }

  static addAccessLog(log: Omit<AccessLog, 'id' | 'timestamp'>): void {
    const logs = this.getAccessLogs();
    const newLog: AccessLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    logs.unshift(newLog);
    saveToStorage(KEYS.ACCESS_LOGS, logs.slice(0, 200));
  }

  static getNotifications(): NotificationItem[] {
    return loadFromStorage<NotificationItem[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  static saveNotifications(items: NotificationItem[]): void {
    saveToStorage(KEYS.NOTIFICATIONS, items);
  }

  static addNotification(item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>): void {
    const notifs = this.getNotifications();
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
    };
    notifs.unshift(newNotif);
    saveToStorage(KEYS.NOTIFICATIONS, notifs);
  }

  static markNotificationsRead(): void {
    const notifs = this.getNotifications().map((n) => ({ ...n, isRead: true }));
    saveToStorage(KEYS.NOTIFICATIONS, notifs);
  }

  static getClasses(): ClassRoom[] {
    return loadFromStorage<ClassRoom[]>(KEYS.CLASSES, INITIAL_CLASSES);
  }

  static saveClasses(classes: ClassRoom[]): void {
    saveToStorage(KEYS.CLASSES, classes);
  }

  static getStudents(): Student[] {
    return loadFromStorage<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
  }

  static saveStudents(students: Student[]): void {
    saveToStorage(KEYS.STUDENTS, students);
  }

  static getAttendance(): AttendanceRecord[] {
    return loadFromStorage<AttendanceRecord[]>(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  }

  static saveAttendance(records: AttendanceRecord[]): void {
    saveToStorage(KEYS.ATTENDANCE, records);
  }

  static getSchedule(): ScheduleItem[] {
    return loadFromStorage<ScheduleItem[]>(KEYS.SCHEDULE, INITIAL_SCHEDULES);
  }

  static saveSchedule(items: ScheduleItem[]): void {
    saveToStorage(KEYS.SCHEDULE, items);
  }

  static getAgenda(): AgendaItem[] {
    return loadFromStorage<AgendaItem[]>(KEYS.AGENDA, INITIAL_AGENDAS);
  }

  static saveAgenda(items: AgendaItem[]): void {
    saveToStorage(KEYS.AGENDA, items);
  }

  static getJournal(): JournalItem[] {
    return loadFromStorage<JournalItem[]>(KEYS.JOURNAL, INITIAL_JOURNALS);
  }

  static saveJournal(items: JournalItem[]): void {
    saveToStorage(KEYS.JOURNAL, items);
  }

  static getHomeroom(): HomeroomStudent[] {
    return loadFromStorage<HomeroomStudent[]>(KEYS.HOMEROOM, INITIAL_HOMEROOMS);
  }

  static saveHomeroom(items: HomeroomStudent[]): void {
    saveToStorage(KEYS.HOMEROOM, items);
  }

  static getGrades(): GradeEntry[] {
    return loadFromStorage<GradeEntry[]>(KEYS.GRADES_UNIFIED, INITIAL_UNIFIED_GRADES);
  }

  static saveGrades(grades: GradeEntry[]): void {
    saveToStorage(KEYS.GRADES_UNIFIED, grades);
  }

  static getDailyGrades(): DailyGrade[] {
    return loadFromStorage<DailyGrade[]>(KEYS.DAILY_GRADES, []);
  }

  static saveDailyGrades(grades: DailyGrade[]): void {
    saveToStorage(KEYS.DAILY_GRADES, grades);
  }

  static getPTSGrades(): PTSGrade[] {
    return loadFromStorage<PTSGrade[]>(KEYS.PTS_GRADES, []);
  }

  static savePTSGrades(grades: PTSGrade[]): void {
    saveToStorage(KEYS.PTS_GRADES, grades);
  }

  static getPASGrades(): PASGrade[] {
    return loadFromStorage<PASGrade[]>(KEYS.PAS_GRADES, []);
  }

  static savePASGrades(grades: PASGrade[]): void {
    saveToStorage(KEYS.PAS_GRADES, grades);
  }

  static getRecapGrades(): AutomaticRecapGrade[] {
    return loadFromStorage<AutomaticRecapGrade[]>(KEYS.RECAP_GRADES, []);
  }

  static saveRecapGrades(grades: AutomaticRecapGrade[]): void {
    saveToStorage(KEYS.RECAP_GRADES, grades);
  }

  static getAIDocuments(): AIDocument[] {
    return loadFromStorage<AIDocument[]>(KEYS.AI_DOCS, []);
  }

  static saveAIDocuments(docs: AIDocument[]): void {
    saveToStorage(KEYS.AI_DOCS, docs);
  }

  static saveAIDocument(doc: AIDocument): void {
    const docs = this.getAIDocuments();
    const idx = docs.findIndex((d) => d.id === doc.id);
    if (idx >= 0) {
      docs[idx] = doc;
    } else {
      docs.unshift(doc);
    }
    saveToStorage(KEYS.AI_DOCS, docs);
  }

  static getCPReferences(): CPReference[] {
    return loadFromStorage<CPReference[]>(KEYS.CP_REFS, INITIAL_CP_REFERENCES);
  }

  static saveCPReferences(refs: CPReference[]): void {
    saveToStorage(KEYS.CP_REFS, refs);
  }

  static getCPDistributions(): CPDistributionPlan[] {
    return loadFromStorage<CPDistributionPlan[]>(KEYS.CP_DISTRIBUTIONS, INITIAL_CP_DISTRIBUTIONS);
  }

  static saveCPDistributions(plans: CPDistributionPlan[]): void {
    saveToStorage(KEYS.CP_DISTRIBUTIONS, plans);
  }

  static saveCPDistribution(plan: CPDistributionPlan): void {
    const plans = this.getCPDistributions();
    const idx = plans.findIndex((p) => p.id === plan.id);
    if (idx >= 0) {
      plans[idx] = plan;
    } else {
      plans.unshift(plan);
    }
    saveToStorage(KEYS.CP_DISTRIBUTIONS, plans);
  }

  static deleteCPDistribution(id: string): void {
    const plans = this.getCPDistributions().filter((p) => p.id !== id);
    saveToStorage(KEYS.CP_DISTRIBUTIONS, plans);
  }

  static getActiveMasterCP(): ActiveMasterCPData | null {
    return loadFromStorage<ActiveMasterCPData | null>(KEYS.ACTIVE_MASTER_CP, null);
  }

  static setActiveMasterCP(masterData: ActiveMasterCPData): void {
    saveToStorage(KEYS.ACTIVE_MASTER_CP, masterData);

    // Also auto-save/update in CP Distributions so it is immediately visible in tables
    const planId = masterData.id?.startsWith('plan-') || masterData.id?.startsWith('master-') ? masterData.id : `master-plan-${masterData.id || Date.now()}`;
    const sem1 = masterData.materialsSem1 || [];
    const sem2 = masterData.materialsSem2 || [];
    const totSem1 = sem1.reduce((s, m) => s + (Number(m.allocatedHours) || 0), 0);
    const totSem2 = sem2.reduce((s, m) => s + (Number(m.allocatedHours) || 0), 0);

    const distPlan: CPDistributionPlan = {
      id: planId,
      teacherName: masterData.teacherName || 'Guru Pengampu',
      teacherNip: (masterData as any).teacherNip || this.getSchoolProfile().teacherNip,
      subject: masterData.subject,
      schoolName: masterData.schoolName || this.getSchoolProfile().schoolName,
      level: masterData.level,
      grade: masterData.grade,
      phase: masterData.phase,
      academicYear: masterData.academicYear || this.getAcademicYear() || '2025/2026',
      semesterOption: 'all',
      totalHoursPerYear: masterData.totalHoursPerYear || (totSem1 + totSem2),
      totalTPCount: (sem1.length) + (sem2.length),
      jpPerWeek: masterData.jpPerWeek || 3,
      timeAllocationPerWeek: masterData.timeAllocationPerWeek,
      cpText: masterData.cpText,
      elements: masterData.elements?.map(e => ({ name: e.name, description: e.description })),
      materialsSem1: sem1,
      materialsSem2: sem2,
      totalHoursSem1: totSem1,
      totalHoursSem2: totSem2,
      createdAt: masterData.uploadedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.saveCPDistribution(distPlan);

    // Also register in CP References bank
    const refId = `ref-master-${masterData.id || Date.now()}`;
    const cpRef: CPReference = {
      id: refId,
      title: `[Master Dokumen] ${masterData.subject} (${masterData.level} - ${masterData.phase})`,
      level: masterData.level,
      phase: masterData.phase,
      grade: typeof masterData.grade === 'number' ? masterData.grade : parseInt(String(masterData.grade)) || 10,
      subject: masterData.subject,
      curriculumVersion: 'Pendekatan Deep Learning 2026/2027',
      uploadedAt: masterData.uploadedAt || new Date().toISOString().substring(0, 16),
      uploadedBy: masterData.teacherName || 'Admin Master',
      fileName: masterData.fileName,
      cpText: masterData.cpText,
      elements: (masterData.elements || []).map(e => ({
        name: e.name,
        description: e.description,
        competencies: e.competencies || ['Pemahaman Konsep', 'Keterampilan Proses', 'Nalar Kritis 6C'],
        essentialMaterials: e.essentialMaterials || [masterData.subject],
      })),
      rawText: masterData.fullMarkdownReport || masterData.cpText,
      aiAnalysisSummary: masterData.executiveSummary,
    };
    this.saveCPReference(cpRef);

    // Sync School Profile if needed
    const currentProfile = this.getSchoolProfile();
    const updatedProfile: SchoolProfile = {
      ...currentProfile,
      teacherName: masterData.teacherName || currentProfile.teacherName,
      schoolName: masterData.schoolName || currentProfile.schoolName,
      academicYear: masterData.academicYear || currentProfile.academicYear,
    };
    saveToStorage(KEYS.SCHOOL_PROFILE, updatedProfile);

    // Sync Kalender Pendidikan JP per week if needed
    if (masterData.jpPerWeek && masterData.jpPerWeek > 0) {
      const kaldik = this.getKalenderPendidikan();
      if (kaldik.semester1 && kaldik.semester1.jpPerWeek !== masterData.jpPerWeek) {
        kaldik.semester1.jpPerWeek = masterData.jpPerWeek;
        kaldik.semester1.totalEffectiveHours = (kaldik.semester1.totalEffectiveWeeks || 19) * masterData.jpPerWeek;
        kaldik.semester1.totalJpSemester = kaldik.semester1.totalEffectiveHours;
        kaldik.semester1.netTeachingHours = Math.max(0, kaldik.semester1.totalEffectiveHours - (kaldik.semester1.reservedHours || 6));
      }
      if (kaldik.semester2 && kaldik.semester2.jpPerWeek !== masterData.jpPerWeek) {
        kaldik.semester2.jpPerWeek = masterData.jpPerWeek;
        kaldik.semester2.totalEffectiveHours = (kaldik.semester2.totalEffectiveWeeks || 18) * masterData.jpPerWeek;
        kaldik.semester2.totalJpSemester = kaldik.semester2.totalEffectiveHours;
        kaldik.semester2.netTeachingHours = Math.max(0, kaldik.semester2.totalEffectiveHours - (kaldik.semester2.reservedHours || 6));
      }
      saveToStorage(KEYS.KALENDER_PENDIDIKAN, kaldik);
    }
  }

  static saveCPReference(ref: CPReference): void {
    const refs = this.getCPReferences();
    const idx = refs.findIndex((r) => r.id === ref.id);
    if (idx >= 0) {
      refs[idx] = ref;
    } else {
      refs.unshift(ref);
    }
    saveToStorage(KEYS.CP_REFS, refs);
  }

  static clearActiveMasterCP(): void {
    saveToStorage(KEYS.ACTIVE_MASTER_CP, null);
  }

  static addClass(cls: Omit<ClassRoom, 'id'>): ClassRoom {
    const classes = this.getClasses();
    const newClass: ClassRoom = {
      ...cls,
      id: `c-${Date.now()}`,
    };
    classes.push(newClass);
    this.saveClasses(classes);
    return newClass;
  }

  static updateClass(cls: ClassRoom): void {
    const classes = this.getClasses().map((c) => (c.id === cls.id ? cls : c));
    this.saveClasses(classes);
  }

  static deleteClass(classId: string): void {
    const classes = this.getClasses().filter((c) => c.id !== classId);
    this.saveClasses(classes);
  }

  static addStudent(student: Omit<Student, 'id'>): Student {
    const students = this.getStudents();
    const newStudent: Student = {
      ...student,
      id: `s-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    };
    students.push(newStudent);
    this.saveStudents(students);
    return newStudent;
  }

  static updateStudent(student: Student): void {
    const students = this.getStudents().map((s) => (s.id === student.id ? student : s));
    this.saveStudents(students);
  }

  static deleteStudent(studentId: string): void {
    const students = this.getStudents().filter((s) => s.id !== studentId);
    this.saveStudents(students);
  }

  static batchAddStudents(newStudents: Omit<Student, 'id'>[]): Student[] {
    const current = this.getStudents();
    const created: Student[] = newStudents.map((s, idx) => ({
      ...s,
      id: `s-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
    }));
    const updated = [...current, ...created];
    this.saveStudents(updated);
    return created;
  }

  static getFeedbacks(): UserFeedback[] {
    return loadFromStorage<UserFeedback[]>(KEYS.FEEDBACKS, []);
  }

  static saveFeedbacks(feedbacks: UserFeedback[]): void {
    saveToStorage(KEYS.FEEDBACKS, feedbacks);
  }

  static getSupabaseConfig(): SupabaseConfig {
    return loadFromStorage<SupabaseConfig>(KEYS.SUPABASE_CONFIG, {
      url: 'https://xyzcompany.supabase.co',
      apiKey: 'sbp_mock_live_integration_token_guru_kreatif_2025',
      autoSync: true,
      lastSyncedAt: '2026-08-21 21:00',
      syncStatus: 'idle',
    });
  }

  static saveSupabaseConfig(config: SupabaseConfig): void {
    saveToStorage(KEYS.SUPABASE_CONFIG, config);
  }

  static getAcademicYear(): string {
    const kaldik = loadFromStorage<KalenderPendidikanData>(KEYS.KALENDER_PENDIDIKAN, DEFAULT_KALENDER_PENDIDIKAN);
    return kaldik.tahunAjaran || kaldik.academicYear || '2025/2026';
  }

  static getSchoolProfile(): SchoolProfile {
    const profile = loadFromStorage<SchoolProfile>(KEYS.SCHOOL_PROFILE, DEFAULT_SCHOOL_PROFILE);
    if (!profile || !profile.schoolName || String(profile.schoolName).includes('SAMARINDA')) {
      const defaultProf = { ...DEFAULT_SCHOOL_PROFILE };
      const kaldikYear = this.getAcademicYear();
      if (kaldikYear) defaultProf.academicYear = kaldikYear;
      return defaultProf;
    }
    const kaldikYear = this.getAcademicYear();
    if (kaldikYear) {
      profile.academicYear = kaldikYear;
    }
    return profile;
  }

  static saveSchoolProfile(profile: SchoolProfile): void {
    saveToStorage(KEYS.SCHOOL_PROFILE, profile);
    const yr = profile.academicYear?.trim();
    if (yr) {
      const kaldik = loadFromStorage<KalenderPendidikanData>(KEYS.KALENDER_PENDIDIKAN, DEFAULT_KALENDER_PENDIDIKAN);
      if (kaldik && (kaldik.tahunAjaran !== yr || kaldik.academicYear !== yr)) {
        kaldik.tahunAjaran = yr;
        kaldik.academicYear = yr;
        if (kaldik.semester1) kaldik.semester1.academicYear = yr;
        if (kaldik.semester2) kaldik.semester2.academicYear = yr;
        saveToStorage(KEYS.KALENDER_PENDIDIKAN, kaldik);
      }
    }

    // Synchronize school & teacher names across active master CP and CP distribution plans
    const masterCP = this.getActiveMasterCP();
    if (masterCP) {
      let changed = false;
      if (profile.teacherName && masterCP.teacherName !== profile.teacherName) {
        masterCP.teacherName = profile.teacherName;
        changed = true;
      }
      if (profile.schoolName && masterCP.schoolName !== profile.schoolName) {
        masterCP.schoolName = profile.schoolName;
        changed = true;
      }
      if (yr && masterCP.academicYear !== yr) {
        masterCP.academicYear = yr;
        changed = true;
      }
      if (changed) {
        saveToStorage(KEYS.ACTIVE_MASTER_CP, masterCP);
      }
    }

    const plans = this.getCPDistributions();
    if (plans.length > 0) {
      let plansChanged = false;
      const updatedPlans = plans.map(p => {
        let pChanged = false;
        const newP = { ...p };
        if (profile.teacherName && p.teacherName !== profile.teacherName) {
          newP.teacherName = profile.teacherName;
          pChanged = true;
        }
        if (profile.schoolName && p.schoolName !== profile.schoolName) {
          newP.schoolName = profile.schoolName;
          pChanged = true;
        }
        if (yr && p.academicYear !== yr) {
          newP.academicYear = yr;
          pChanged = true;
        }
        if (pChanged) plansChanged = true;
        return newP;
      });
      if (plansChanged) {
        this.saveCPDistributions(updatedPlans);
      }
    }
  }

  static getAdminSettings(): AdminSystemSettings {
    return loadFromStorage<AdminSystemSettings>(KEYS.ADMIN_SETTINGS, DEFAULT_ADMIN_SETTINGS);
  }

  static saveAdminSettings(partialSettings: Partial<AdminSystemSettings>): AdminSystemSettings {
    const current = this.getAdminSettings();
    const updated: AdminSystemSettings = {
      ...current,
      ...partialSettings,
      lastUpdated: new Date().toISOString(),
    };
    saveToStorage(KEYS.ADMIN_SETTINGS, updated);

    // Asynchronously synchronize with backend
    try {
      if (typeof window !== 'undefined' && window.fetch) {
        fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        }).catch(() => {
          // Ignore network errors gracefully in background
        });
      }
    } catch {
      // Ignore background sync errors
    }

    return updated;
  }

  /**
   * Helper terpadu untuk mengambil seluruh ekosistem data kurikulum yang saling tersinkronisasi
   * secara otomatis menyesuaikan Jenjang dan Kelas yang dipilih berdasarkan analisis CP
   */
  static getSyncedCurriculumContext(subjectFilter?: string, gradeFilter?: number | string, levelFilter?: string) {
    const schoolProfile = this.getSchoolProfile();
    const kaldik = this.getKalenderPendidikan();
    const activeMaster = this.getActiveMasterCP();
    const allPlans = this.getCPDistributions();

    const targetSub = subjectFilter || schoolProfile?.subject || activeMaster?.subject || 'Fisika';
    const targetLvl = (levelFilter || schoolProfile?.level || activeMaster?.level || 'SMA') as 'SMA' | 'SMP' | 'SD' | 'SMK';
    const targetGrade = Number(gradeFilter) || Number(schoolProfile?.grade) || Number(activeMaster?.grade) || (targetLvl === 'SD' ? 4 : targetLvl === 'SMP' ? 7 : 10);
    
    // Find matching distribution plan for subject and specific grade if available
    const matchingPlanWithGrade = allPlans.find(
      p => p.subject.toLowerCase() === targetSub.toLowerCase() && Number(p.grade) === targetGrade
    );

    const matchingPlanGeneral = allPlans.find(
      p => p.subject.toLowerCase() === targetSub.toLowerCase()
    );

    let effectiveMaster: CPDistributionPlan | ActiveMasterCPData | null = matchingPlanWithGrade || null;
    if (!effectiveMaster && activeMaster && (!subjectFilter || activeMaster.subject.toLowerCase() === targetSub.toLowerCase()) && (!gradeFilter || Number(activeMaster.grade) === targetGrade)) {
      effectiveMaster = activeMaster;
    }
    if (!effectiveMaster) {
      effectiveMaster = matchingPlanGeneral || activeMaster || (allPlans.length > 0 ? allPlans[0] : null);
    }

    // If grade filter differs from effectiveMaster or if materials are empty, generate/fetch grade-aligned materials
    let sem1Materials = (effectiveMaster && Number(effectiveMaster.grade) === targetGrade) ? (effectiveMaster.materialsSem1 || []) : [];
    let sem2Materials = (effectiveMaster && Number(effectiveMaster.grade) === targetGrade) ? (effectiveMaster.materialsSem2 || []) : [];

    let cpSummary = effectiveMaster?.cpText || schoolProfile?.cpText || '';

    if (sem1Materials.length === 0 && sem2Materials.length === 0) {
      const gradePreset = getSubjectPresetByGrade(targetSub, targetLvl, targetGrade);
      sem1Materials = gradePreset.materialsSem1.map((m, idx) => ({ ...m, id: `sem1-mat-${idx + 1}` }));
      sem2Materials = gradePreset.materialsSem2.map((m, idx) => ({ ...m, id: `sem2-mat-${idx + 1}` }));
      cpSummary = gradePreset.cpSummary;
    }

    const totalHoursSem1 = (effectiveMaster as any)?.totalHoursSem1 || sem1Materials.reduce((s, m) => s + (Number(m.allocatedHours) || 0), 0);
    const totalHoursSem2 = (effectiveMaster as any)?.totalHoursSem2 || sem2Materials.reduce((s, m) => s + (Number(m.allocatedHours) || 0), 0);
    const totalHoursPerYear = effectiveMaster?.totalHoursPerYear || schoolProfile?.totalHoursPerYear || (totalHoursSem1 + totalHoursSem2) || 108;
    const jpPerWeek = effectiveMaster?.jpPerWeek || schoolProfile?.jpPerWeek || kaldik.semester1?.jpPerWeek || 3;

    const resolvedPhase = schoolProfile?.phase || (targetGrade === 10 ? 'Fase E' : targetGrade > 10 ? 'Fase F' : targetGrade >= 7 ? 'Fase D' : targetGrade >= 4 ? 'Fase B/C' : 'Fase A');

    return {
      schoolProfile,
      kaldik,
      activeMaster: effectiveMaster,
      allPlans,
      subject: targetSub,
      level: targetLvl,
      grade: targetGrade,
      phase: effectiveMaster?.phase || resolvedPhase,
      academicYear: effectiveMaster?.academicYear || schoolProfile.academicYear || kaldik.tahunAjaran || '2025/2026',
      teacherName: schoolProfile.teacherName || effectiveMaster?.teacherName || 'Aspian La Ode Madimu, S.Pd. Gr',
      teacherNip: schoolProfile.teacherNip || '19900822 201801 1 004',
      headmasterName: schoolProfile.headmasterName || (schoolProfile as any).principalName || 'Drs. M. Taher, M.Pd.',
      headmasterNip: schoolProfile.headmasterNip || (schoolProfile as any).principalNip || '19700315 199602 1 002',
      schoolName: schoolProfile.schoolName || effectiveMaster?.schoolName || 'SMA NEGERI 30 MALUKU TENGAH',
      city: schoolProfile.city || 'Maluku Tengah',
      jpPerWeek,
      totalHoursPerYear,
      totalHoursSem1,
      totalHoursSem2,
      sem1Materials,
      sem2Materials,
      cpSummary,
      sem1EffWeeks: kaldik.semester1?.totalEffectiveWeeks || 19,
      sem2EffWeeks: kaldik.semester2?.totalEffectiveWeeks || 18,
    };
  }

  static saveCurrentDraft(draft: { id: string; title: string; content: string; updatedAt: string }): void {
    saveToStorage('agk_current_draft', draft);
  }

  static getCurrentDraft(): { id: string; title: string; content: string; updatedAt: string } | null {
    return loadFromStorage<{ id: string; title: string; content: string; updatedAt: string } | null>(
      'agk_current_draft',
      null
    );
  }

  static getTheme(): AppTheme {
    return loadFromStorage<AppTheme>('agk_app_theme', 'dark');
  }

  static saveTheme(theme: AppTheme): void {
    saveToStorage('agk_app_theme', theme);
  }

  // ==========================================
  // TOKEN & DAILY AI QUOTA MANAGEMENT (MAX 20/HARI)
  // ==========================================

  /**
   * Mendapatkan string tanggal hari ini dalam format YYYY-MM-DD lokal
   */
  static getTodayDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Menghitung informasi siklus tagihan bulanan berdasarkan tanggal persetujuan admin (approvalDate)
   * Kuota direset otomatis pada tanggal yang sama setiap bulannya
   */
  static getBillingCycleInfo(approvalDateStr?: string, lastResetDateStr?: string): {
    billingDay: number;
    currentCycleStart: string;
    nextResetDate: string;
    isNewCycle: boolean;
  } {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0 - 11
    const currentDay = now.getDate();

    // Default billing day = 1 jika tidak ada tanggal persetujuan
    let billingDay = 1;
    if (approvalDateStr) {
      const parsed = new Date(approvalDateStr);
      if (!isNaN(parsed.getTime())) {
        billingDay = parsed.getDate();
      } else {
        const match = approvalDateStr.match(/(\d{4})-(\d{2})-(\d{2})/) || approvalDateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (match) {
          billingDay = parseInt(match[3] || match[1], 10) || 1;
        }
      }
    }

    // Tentukan awal siklus bulan ini
    let cycleYear = currentYear;
    let cycleMonth = currentMonth;
    if (currentDay < billingDay) {
      cycleMonth -= 1;
      if (cycleMonth < 0) {
        cycleMonth = 11;
        cycleYear -= 1;
      }
    }

    const daysInCycleMonth = new Date(cycleYear, cycleMonth + 1, 0).getDate();
    const actualCycleDay = Math.min(billingDay, daysInCycleMonth);
    const currentCycleStart = `${cycleYear}-${String(cycleMonth + 1).padStart(2, '0')}-${String(actualCycleDay).padStart(2, '0')}`;

    // Tentukan tanggal reset berikutnya
    let nextYear = cycleYear;
    let nextMonth = cycleMonth + 1;
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    const daysInNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
    const actualNextDay = Math.min(billingDay, daysInNextMonth);
    const nextResetDate = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(actualNextDay).padStart(2, '0')}`;

    const isNewCycle = !lastResetDateStr || lastResetDateStr < currentCycleStart;

    return {
      billingDay,
      currentCycleStart,
      nextResetDate,
      isNewCycle,
    };
  }

  /**
   * Menghitung status masa aktif akun (1 tahun dari tanggal disetujui admin)
   * Memberikan peringatan jika masa aktif tersisa <= 7 hari
   */
  static getSubscriptionStatus(user: UserAccount): {
    isExpired: boolean;
    isExpiringSoon: boolean;
    daysUntilExpiry: number;
    expiryDate: string;
    startDate: string;
    statusText: string;
  } {
    const isAdmin = user.role === 'admin' || user.email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase();
    if (isAdmin) {
      return {
        isExpired: false,
        isExpiringSoon: false,
        daysUntilExpiry: 9999,
        expiryDate: '2099-12-31',
        startDate: user.requestDate || user.approvalDate || '2025-01-01',
        statusText: 'Akses Penuh Permanen (Administrator)',
      };
    }

    const startDateStr = user.subscriptionStartDate || (user.approvalDate ? user.approvalDate.split(' ')[0] : null) || user.requestDate.split(' ')[0] || this.getTodayDateString();
    let expiryDateStr = user.subscriptionExpiryDate;
    if (!expiryDateStr) {
      const startDate = new Date(startDateStr);
      if (!isNaN(startDate.getTime())) {
        const expDate = new Date(startDate);
        expDate.setFullYear(expDate.getFullYear() + 1);
        expiryDateStr = expDate.toISOString().split('T')[0];
      } else {
        const expDate = new Date();
        expDate.setFullYear(expDate.getFullYear() + 1);
        expiryDateStr = expDate.toISOString().split('T')[0];
      }
    }

    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const expiryParsed = new Date(expiryDateStr);
    const expiryMidnight = new Date(expiryParsed.getFullYear(), expiryParsed.getMonth(), expiryParsed.getDate()).getTime();

    const diffMs = expiryMidnight - todayMidnight;
    const daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const isExpired = daysUntilExpiry < 0;
    const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 7;

    let statusText = 'Aktif (1 Tahun)';
    if (isExpired) {
      statusText = `Kedaluwarsa (${Math.abs(daysUntilExpiry)} hari yang lalu)`;
    } else if (isExpiringSoon) {
      statusText = `Peringatan: Berakhir dalam ${daysUntilExpiry} hari`;
    } else {
      statusText = `Aktif (Sisa ${daysUntilExpiry} hari)`;
    }

    return {
      isExpired,
      isExpiringSoon,
      daysUntilExpiry,
      expiryDate: expiryDateStr,
      startDate: startDateStr,
      statusText,
    };
  }

  /**
   * Cek dan ambil status kuota token akun pengguna
   * Kuota standar: 35 kali generate (500.000 token/bulan) untuk 1 orang guru
   * Otomatis direset pada tanggal yang sama saat mendapat ijin akses dari admin setiap bulannya
   */
  static getTokenQuotaStatus(targetUser?: UserAccount | null): TokenQuotaStatus {
    const user = targetUser !== undefined ? targetUser : this.getCurrentUser();
    const todayStr = this.getTodayDateString();

    if (!user) {
      return {
        monthlyUsed: 0,
        monthlyLimit: 35,
        monthlyTokensUsed: 0,
        monthlyTokensLimit: 500000,
        monthlyRemaining: 0,
        monthlyTokensRemaining: 0,
        monthlyResetDate: todayStr,
        billingCycleDay: 1,
        used: 0,
        limit: 35,
        extra: 0,
        totalAllowed: 35,
        remaining: 0,
        isExhausted: true,
        resetDate: todayStr,
        isAdmin: false,
        daysUntilExpiry: 0,
        isExpiringSoon: false,
        isExpired: true,
        subscriptionStatusText: 'Sesi Belum Login',
        isSubscriptionActive: false,
      };
    }

    const isAdmin = user.role === 'admin' || user.email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase();
    const subInfo = this.getSubscriptionStatus(user);

    // Billing Cycle & Monthly Auto-Reset Check
    const approvalDate = user.approvalDate || user.requestDate || todayStr;
    const billingInfo = this.getBillingCycleInfo(approvalDate, user.lastMonthlyResetDate);

    let monthlyUsed = user.monthlyAIClicks ?? 0;
    let monthlyTokensUsed = user.monthlyTokensUsed ?? 0;

    // Reset otomatis jika sudah memasuki siklus tanggal baru
    if (billingInfo.isNewCycle) {
      monthlyUsed = 0;
      monthlyTokensUsed = 0;

      const updatedUser: UserAccount = {
        ...user,
        monthlyAIClicks: 0,
        monthlyTokensUsed: 0,
        lastMonthlyResetDate: billingInfo.currentCycleStart,
        nextMonthlyResetDate: billingInfo.nextResetDate,
        billingCycleDay: billingInfo.billingDay,
        subscriptionExpiryDate: user.subscriptionExpiryDate || subInfo.expiryDate,
        subscriptionStartDate: user.subscriptionStartDate || subInfo.startDate,
      };

      const allUsers = this.getUsers();
      const idx = allUsers.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
      if (idx >= 0) {
        allUsers[idx] = { ...allUsers[idx], ...updatedUser };
        this.saveUsers(allUsers);
      }
      const currentSessionUser = loadFromStorage<UserAccount | null>(KEYS.CURRENT_USER, null);
      if (currentSessionUser && (currentSessionUser.id === user.id || currentSessionUser.email.toLowerCase() === user.email.toLowerCase())) {
        saveToStorage(KEYS.CURRENT_USER, updatedUser);
      }
    }

    const monthlyLimit = user.monthlyAILimit ?? 35;
    const monthlyTokensLimit = user.monthlyTokensLimit ?? 500000;
    const extra = user.extraTokens ?? 0;
    const totalAllowed = monthlyLimit + extra;
    const remaining = isAdmin ? 999 : Math.max(0, totalAllowed - monthlyUsed);
    const isExhausted = !isAdmin && (remaining <= 0 || subInfo.isExpired);
    const monthlyTokensRemaining = isAdmin ? 9999999 : Math.max(0, monthlyTokensLimit - monthlyTokensUsed);

    // Auto-generate notification for expiring subscription (<= 7 days) if not already notified
    if (subInfo.isExpiringSoon && !isAdmin) {
      const notifs = this.getNotifications();
      const notifKey = `sub-warn-${user.id}-${subInfo.daysUntilExpiry}`;
      const hasNotifToday = notifs.some(n => n.title.includes('Peringatan Masa Aktif') && n.timestamp.startsWith(todayStr));
      if (!hasNotifToday) {
        this.addNotification({
          title: `Peringatan Masa Aktif Langganan (${subInfo.daysUntilExpiry} Hari Lagi)`,
          message: `Masa akses aplikasi untuk akun ${user.name} akan jatuh tempo pada ${subInfo.expiryDate}. Segera lakukan perpanjangan lisensi melalui Admin.`,
          type: 'system',
        });
      }
    }

    return {
      monthlyUsed,
      monthlyLimit,
      monthlyTokensUsed,
      monthlyTokensLimit,
      monthlyRemaining: remaining,
      monthlyTokensRemaining,
      monthlyResetDate: billingInfo.nextResetDate,
      billingCycleDay: billingInfo.billingDay,

      used: monthlyUsed,
      limit: monthlyLimit,
      extra,
      totalAllowed,
      remaining,
      isExhausted,
      resetDate: billingInfo.nextResetDate,
      isAdmin,

      subscriptionStartDate: subInfo.startDate,
      subscriptionExpiryDate: subInfo.expiryDate,
      daysUntilExpiry: subInfo.daysUntilExpiry,
      isExpiringSoon: subInfo.isExpiringSoon,
      isExpired: subInfo.isExpired,
      subscriptionStatusText: subInfo.statusText,
      isSubscriptionActive: !subInfo.isExpired,
    };
  }

  /**
   * Mengonsumsi 1 kali generate AI (dan setara ~14.286 token dari batas 500.000 token/bulan)
   */
  static consumeAIToken(
    targetUser?: UserAccount | null,
    featureName: string = 'Generasi Dokumen AI',
    estimatedTokens: number = 14286
  ): { success: boolean; status: TokenQuotaStatus; message: string } {
    const user = targetUser !== undefined ? targetUser : this.getCurrentUser();
    const todayStr = this.getTodayDateString();

    if (!user) {
      return {
        success: false,
        status: this.getTokenQuotaStatus(null),
        message: 'Silakan login terlebih dahulu untuk menggunakan fitur AI.',
      };
    }

    const statusBefore = this.getTokenQuotaStatus(user);

    // 1. Cek masa aktif 1 tahun
    if (statusBefore.isExpired && !statusBefore.isAdmin) {
      return {
        success: false,
        status: statusBefore,
        message: `Masa aktif langganan 1 tahun Anda telah berakhir (Jatuh tempo: ${statusBefore.subscriptionExpiryDate}). Silakan hubungi Admin Sekolah untuk perpanjangan akses lisensi.`,
      };
    }

    // 2. Cek kuota bulanan (35 kali / 500.000 token)
    if (statusBefore.isExhausted && !statusBefore.isAdmin) {
      return {
        success: false,
        status: statusBefore,
        message: `Batas kuota bulanan Anda (${statusBefore.totalAllowed} kali generate / 500.000 token) telah habis. Kuota akan otomatis di-reset pada tanggal ${statusBefore.billingCycleDay} (${statusBefore.monthlyResetDate}) atau gunakan voucher token tambahan.`,
      };
    }

    const newMonthlyUsed = statusBefore.monthlyUsed + 1;
    const newTokensUsed = Math.min(statusBefore.monthlyTokensLimit, statusBefore.monthlyTokensUsed + estimatedTokens);
    const newTotalEver = (user.totalAIClicksEver ?? 0) + 1;

    const updatedUser: UserAccount = {
      ...user,
      monthlyAIClicks: newMonthlyUsed,
      monthlyTokensUsed: newTokensUsed,
      dailyAIClicks: newMonthlyUsed,
      totalAIClicksEver: newTotalEver,
      lastTokenResetDate: todayStr,
      lastMonthlyResetDate: user.lastMonthlyResetDate || todayStr,
      billingCycleDay: statusBefore.billingCycleDay,
      subscriptionExpiryDate: statusBefore.subscriptionExpiryDate,
      subscriptionStartDate: statusBefore.subscriptionStartDate,
    };

    // Simpan ke database pengguna
    const allUsers = this.getUsers();
    const userIndex = allUsers.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (userIndex >= 0) {
      allUsers[userIndex] = { ...allUsers[userIndex], ...updatedUser };
      this.saveUsers(allUsers);
    }

    // Simpan ke sesi aktif
    const currentUser = loadFromStorage<UserAccount | null>(KEYS.CURRENT_USER, null);
    if (currentUser && (currentUser.id === user.id || currentUser.email.toLowerCase() === user.email.toLowerCase())) {
      saveToStorage(KEYS.CURRENT_USER, updatedUser);
    }

    const statusAfter = this.getTokenQuotaStatus(updatedUser);

    // Audit log
    this.addAccessLog({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      action: `Konsumsi Kuota AI (${featureName})`,
      details: `Menggunakan 1x Generate AI (~${estimatedTokens.toLocaleString('id-ID')} token). Kuota bulan ini: ${statusAfter.monthlyUsed}/${statusAfter.totalAllowed} kali (${statusAfter.monthlyTokensUsed.toLocaleString('id-ID')}/${statusAfter.monthlyTokensLimit.toLocaleString('id-ID')} token). Reset berikutnya: ${statusAfter.monthlyResetDate}.`,
      status: 'success',
    });

    return {
      success: true,
      status: statusAfter,
      message: `Dokumen AI berhasil diproses. Sisa kuota bulan ini: ${statusAfter.isAdmin ? 'Unlimited (Admin)' : `${statusAfter.monthlyRemaining}x generate (${statusAfter.monthlyTokensRemaining.toLocaleString('id-ID')} token)`}.`,
    };
  }

  /**
   * Perpanjang masa aktif langganan akun guru oleh Admin (1 Tahun / sesuai durasi)
   */
  static renewUserSubscription(
    userId: string,
    durationYears: number = 1,
    paymentNotes?: string
  ): { success: boolean; message: string; updatedUser?: UserAccount } {
    const allUsers = this.getUsers();
    const userIndex = allUsers.findIndex((u) => u.id === userId);
    if (userIndex < 0) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    const user = allUsers[userIndex];
    const now = new Date();
    const currentExpiry = user.subscriptionExpiryDate ? new Date(user.subscriptionExpiryDate) : now;
    const baseDate = currentExpiry > now ? currentExpiry : now;

    const newExpiry = new Date(baseDate);
    newExpiry.setFullYear(newExpiry.getFullYear() + durationYears);
    const newExpiryStr = newExpiry.toISOString().split('T')[0];

    const updatedUser: UserAccount = {
      ...user,
      status: 'approved',
      subscriptionStatus: 'active',
      paymentStatus: 'renewed',
      subscriptionStartDate: user.subscriptionStartDate || (user.approvalDate ? user.approvalDate.split(' ')[0] : null) || this.getTodayDateString(),
      subscriptionExpiryDate: newExpiryStr,
      subscriptionDurationYears: (user.subscriptionDurationYears || 1) + durationYears,
      subscriptionNotes: paymentNotes || `Perpanjangan lisensi akses ${durationYears} tahun oleh Admin pada ${now.toLocaleDateString('id-ID')}`,
      monthlyAIClicks: 0, // Reset kuota bulanan baru
      monthlyTokensUsed: 0,
      lastMonthlyResetDate: this.getTodayDateString(),
    };

    allUsers[userIndex] = updatedUser;
    this.saveUsers(allUsers);

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      saveToStorage(KEYS.CURRENT_USER, updatedUser);
    }

    this.addAccessLog({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      action: 'Perpanjangan Masa Aktif Langganan (1 Tahun)',
      details: `Admin ${DEFAULT_ADMIN.name} memperpanjang akses ${durationYears} tahun untuk ${user.name} (${user.email}). Jatuh tempo baru: ${newExpiryStr}. Catatan: ${paymentNotes || 'Pembayaran/berlangganan terverifikasi'}.`,
      status: 'success',
    });

    this.addNotification({
      title: 'Masa Aktif Akses Diperpanjang',
      message: `Selamat! Masa aktif akun guru ${user.name} telah berhasil diperpanjang 1 tahun hingga ${newExpiryStr}.`,
      type: 'access_approved',
    });

    return {
      success: true,
      message: `Akses akun ${user.name} berhasil diperpanjang 1 tahun hingga ${newExpiryStr}.`,
      updatedUser,
    };
  }

  /**
   * Reset kuota generate bulanan akun tertentu menjadi 0 (Admin action)
   */
  static resetUserMonthlyTokens(userId: string): void {
    const allUsers = this.getUsers();
    const user = allUsers.find((u) => u.id === userId);
    if (!user) return;

    const updatedUser: UserAccount = {
      ...user,
      monthlyAIClicks: 0,
      monthlyTokensUsed: 0,
      dailyAIClicks: 0,
      lastMonthlyResetDate: this.getTodayDateString(),
    };

    const updated = allUsers.map((u) => (u.id === userId ? updatedUser : u));
    this.saveUsers(updated);

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      saveToStorage(KEYS.CURRENT_USER, updatedUser);
    }

    this.addAccessLog({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      action: 'Reset Kuota Token AI Bulanan',
      details: `Admin mereset kuota bulanan akun ${user.name} (${user.email}) menjadi 0/${user.monthlyAILimit || 35} generate (0/${user.monthlyTokensLimit || 500000} token).`,
      status: 'success',
    });
  }

  /**
   * Reset kuota klik harian (alias untuk reset kuota bulanan)
   */
  static resetUserDailyTokens(userId: string): void {
    this.resetUserMonthlyTokens(userId);
  }

  /**
   * Tambah bonus token extra untuk akun tertentu
   */
  static addUserExtraTokens(userId: string, extraAmount: number): void {
    const allUsers = this.getUsers();
    const user = allUsers.find((u) => u.id === userId);
    if (!user) return;

    const currentExtra = user.extraTokens ?? 0;
    const updatedUser: UserAccount = {
      ...user,
      extraTokens: Math.max(0, currentExtra + extraAmount),
    };

    const updated = allUsers.map((u) => (u.id === userId ? updatedUser : u));
    this.saveUsers(updated);

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      saveToStorage(KEYS.CURRENT_USER, updatedUser);
    }

    this.addAccessLog({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      action: 'Penambahan Bonus Token AI',
      details: `Admin menambahkan ${extraAmount} bonus generate token untuk akun ${user.name} (${user.email}).`,
      status: 'success',
    });
  }

  /**
   * Ubah limit bulanan & token akun pengguna oleh Admin
   */
  static setUserMonthlyLimit(userId: string, newGenerateLimit: number, newTokenLimit?: number): void {
    const allUsers = this.getUsers();
    const user = allUsers.find((u) => u.id === userId);
    if (!user) return;

    const updatedUser: UserAccount = {
      ...user,
      monthlyAILimit: Math.max(1, newGenerateLimit),
      monthlyTokensLimit: newTokenLimit || (newGenerateLimit * 14286),
      dailyAILimit: Math.max(1, newGenerateLimit),
    };

    const updated = allUsers.map((u) => (u.id === userId ? updatedUser : u));
    this.saveUsers(updated);

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      saveToStorage(KEYS.CURRENT_USER, updatedUser);
    }
  }

  /**
   * Ubah limit harian dasar akun pengguna (kompatibilitas)
   */
  static setUserDailyLimit(userId: string, newLimit: number): void {
    this.setUserMonthlyLimit(userId, newLimit);
  }

  /**
   * Mengambil daftar seluruh Voucher Token
   */
  static getTokenVouchers(): TokenVoucher[] {
    return loadFromStorage<TokenVoucher[]>(KEYS.TOKEN_VOUCHERS, INITIAL_TOKEN_VOUCHERS);
  }

  /**
   * Menyimpan daftar Voucher Token
   */
  static saveTokenVouchers(vouchers: TokenVoucher[]): void {
    saveToStorage(KEYS.TOKEN_VOUCHERS, vouchers);
  }

  /**
   * Membuat Voucher Token Baru oleh Admin
   */
  static createTokenVoucher(code: string, extraClicks: number, description?: string): TokenVoucher {
    const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    const vouchers = this.getTokenVouchers();

    const existing = vouchers.find((v) => v.code.toUpperCase() === cleanCode);
    if (existing) {
      throw new Error(`Kode voucher "${cleanCode}" sudah ada.`);
    }

    const newVoucher: TokenVoucher = {
      id: `vouch-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      code: cleanCode,
      extraClicks: Math.max(1, extraClicks),
      isRedeemed: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      createdBy: DEFAULT_ADMIN.name,
      description: description || `Bonus Tambahan ${extraClicks} Klik AI`,
    };

    vouchers.unshift(newVoucher);
    this.saveTokenVouchers(vouchers);

    return newVoucher;
  }

  /**
   * Hapus Voucher Token
   */
  static deleteTokenVoucher(voucherId: string): void {
    const vouchers = this.getTokenVouchers().filter((v) => v.id !== voucherId);
    this.saveTokenVouchers(vouchers);
  }

  /**
   * Redeem / Klaim Voucher Token oleh Akun Pengguna
   */
  static redeemTokenVoucher(
    inputCode: string,
    targetUser: UserAccount
  ): { success: boolean; message: string; extraAdded: number } {
    const cleanCode = inputCode.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Masukkan kode voucher yang valid.', extraAdded: 0 };
    }

    const vouchers = this.getTokenVouchers();
    const voucher = vouchers.find((v) => v.code.toUpperCase() === cleanCode);

    if (!voucher) {
      return {
        success: false,
        message: `Kode voucher "${cleanCode}" tidak ditemukan atau tidak valid.`,
        extraAdded: 0,
      };
    }

    const redeemedList = targetUser.tokenVouchersRedeemed || [];
    if (redeemedList.includes(cleanCode)) {
      return {
        success: false,
        message: `Akun Anda sudah pernah mengklaim voucher "${cleanCode}".`,
        extraAdded: 0,
      };
    }

    // Update voucher redeemed details
    voucher.isRedeemed = true;
    voucher.redeemedBy = `${targetUser.name} (${targetUser.email})`;
    voucher.redeemedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    this.saveTokenVouchers(vouchers);

    // Add extra tokens to user
    const currentExtra = targetUser.extraTokens ?? 0;
    const updatedRedeemedList = [...redeemedList, cleanCode];

    const updatedUser: UserAccount = {
      ...targetUser,
      extraTokens: currentExtra + voucher.extraClicks,
      tokenVouchersRedeemed: updatedRedeemedList,
    };

    const allUsers = this.getUsers();
    const userIdx = allUsers.findIndex((u) => u.id === targetUser.id || u.email.toLowerCase() === targetUser.email.toLowerCase());
    if (userIdx >= 0) {
      allUsers[userIdx] = { ...allUsers[userIdx], ...updatedUser };
      this.saveUsers(allUsers);
    }

    saveToStorage(KEYS.CURRENT_USER, updatedUser);

    this.addAccessLog({
      userId: targetUser.id,
      userEmail: targetUser.email,
      userName: targetUser.name,
      userRole: targetUser.role,
      action: 'Klaim Voucher Token AI',
      details: `Pengguna berhasil mengklaim voucher "${cleanCode}" (+${voucher.extraClicks} klik AI).`,
      status: 'success',
    });

    return {
      success: true,
      message: `Selamat! Voucher "${cleanCode}" berhasil diklaim. Anda mendapatkan tambahan +${voucher.extraClicks} klik AI!`,
      extraAdded: voucher.extraClicks,
    };
  }

  // ==========================================
  // KALENDER PENDIDIKAN & ANALISIS ALOKASI WAKTU
  // ==========================================
  static getKalenderPendidikan(): KalenderPendidikanData {
    return loadFromStorage<KalenderPendidikanData>(KEYS.KALENDER_PENDIDIKAN, DEFAULT_KALENDER_PENDIDIKAN);
  }

  static saveKalenderPendidikan(data: KalenderPendidikanData): void {
    const yr = (data.tahunAjaran || data.academicYear || '2025/2026').trim();
    const normalizedData: KalenderPendidikanData = {
      ...data,
      tahunAjaran: yr,
      academicYear: yr,
      semester1: {
        ...data.semester1,
        academicYear: yr,
      },
      semester2: {
        ...data.semester2,
        academicYear: yr,
      },
      lastUpdated: new Date().toISOString(),
    };

    saveToStorage(KEYS.KALENDER_PENDIDIKAN, normalizedData);

    if (yr) {
      const profile = loadFromStorage<SchoolProfile>(KEYS.SCHOOL_PROFILE, DEFAULT_SCHOOL_PROFILE);
      if (profile && profile.academicYear !== yr) {
        profile.academicYear = yr;
        saveToStorage(KEYS.SCHOOL_PROFILE, profile);
      }

      const masterCP = loadFromStorage<any>(KEYS.ACTIVE_MASTER_CP, null);
      if (masterCP && masterCP.academicYear !== yr) {
        masterCP.academicYear = yr;
        saveToStorage(KEYS.ACTIVE_MASTER_CP, masterCP);
      }
    }
  }
}
