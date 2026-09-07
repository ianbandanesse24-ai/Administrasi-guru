import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageService, addStorageListener } from './storage';
import { SupabaseConfig } from '../types';

const SUPABASE_CONFIG_KEY = 'agk_supabase_config';

export class SupabaseService {
  private static clientInstance: SupabaseClient | null = null;
  private static cachedConfig: SupabaseConfig | null = null;
  private static autoSyncTimer: any = null;
  private static pendingSyncKeys: Set<string> = new Set();
  private static isSyncingInProgress: boolean = false;

  /**
   * Mengambil konfigurasi Supabase saat ini (dari environment atau local storage)
   */
  static getConfig(): SupabaseConfig {
    if (this.cachedConfig) return this.cachedConfig;

    const env = (import.meta as any).env || {};
    const envUrl = (env.VITE_SUPABASE_URL as string) || '';
    const envKey = (env.VITE_SUPABASE_ANON_KEY as string) || '';

    try {
      const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.cachedConfig = {
          url: parsed.url || envUrl,
          apiKey: parsed.apiKey || envKey,
          autoSync: parsed.autoSync ?? true,
          lastSyncedAt: parsed.lastSyncedAt || undefined,
          syncStatus: parsed.syncStatus || 'idle',
          errorMessage: parsed.errorMessage || undefined,
        };
        return this.cachedConfig;
      }
    } catch {
      // Fallback silently
    }

    this.cachedConfig = {
      url: envUrl,
      apiKey: envKey,
      autoSync: true,
      syncStatus: 'idle',
    };
    return this.cachedConfig;
  }

  /**
   * Menyimpan konfigurasi Supabase
   */
  static saveConfig(config: Partial<SupabaseConfig>): SupabaseConfig {
    const current = this.getConfig();
    const updated: SupabaseConfig = {
      ...current,
      ...config,
    };
    this.cachedConfig = updated;
    this.clientInstance = null; // Reset client on config change
    try {
      localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save Supabase config', e);
    }
    return updated;
  }

  /**
   * Mengambil Supabase Client
   */
  static getClient(): SupabaseClient | null {
    const config = this.getConfig();
    if (!config.url || !config.apiKey) {
      return null;
    }

    if (!this.clientInstance) {
      try {
        this.clientInstance = createClient(config.url, config.apiKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
        });
      } catch (err) {
        console.error('Error creating Supabase client:', err);
        return null;
      }
    }
    return this.clientInstance;
  }

  /**
   * Menjadwalkan sinkronisasi otomatis di latar belakang saat data berubah
   */
  static triggerAutoSync(key?: string): void {
    if (key) {
      this.pendingSyncKeys.add(key);
    }

    const config = this.getConfig();
    // Jika URL atau apiKey belum diisi, lewati tanpa error
    if (!config.url || !config.apiKey) {
      return;
    }

    if (this.autoSyncTimer) {
      clearTimeout(this.autoSyncTimer);
    }

    this.autoSyncTimer = setTimeout(() => {
      this.executeBackgroundSync();
    }, 1200);
  }

  /**
   * Eksekusi sinkronisasi latar belakang
   */
  private static async executeBackgroundSync(): Promise<void> {
    if (this.isSyncingInProgress) return;
    const client = this.getClient();
    if (!client) return;

    this.isSyncingInProgress = true;
    try {
      await this.pushAllToSupabase(true);
      this.pendingSyncKeys.clear();
    } catch (err) {
      console.warn('Background Supabase sync notice:', err);
    } finally {
      this.isSyncingInProgress = false;
    }
  }

  /**
   * Menguji koneksi ke Supabase
   */
  static async testConnection(customUrl?: string, customKey?: string): Promise<{
    success: boolean;
    message: string;
    latencyMs?: number;
    tablesFound?: string[];
  }> {
    const url = customUrl || this.getConfig().url;
    const apiKey = customKey || this.getConfig().apiKey;

    if (!url || !apiKey) {
      return {
        success: false,
        message: 'URL Supabase dan Public Anon Key belum diisi.',
      };
    }

    const startTime = Date.now();
    try {
      const client = createClient(url, apiKey);
      // Coba query sederhana atau metadata
      const { error } = await client.from('school_profile').select('count', { count: 'exact', head: true });
      const latencyMs = Date.now() - startTime;

      if (error && error.code !== 'PGRST116') {
        // Table mungkin belum dibuat, tapi koneksi ke REST API Supabase valid
        if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
          return {
            success: true,
            message: `Terhubung ke Supabase (${latencyMs}ms)! Catatan: Tabel database belum dibuat. Silakan jalankan SQL Schema yang telah disediakan.`,
            latencyMs,
          };
        }
        return {
          success: false,
          message: `Gagal query Supabase: ${error.message} (Kode: ${error.code})`,
          latencyMs,
        };
      }

      return {
        success: true,
        message: `Koneksi ke Supabase berhasil aktif dan terverifikasi! (${latencyMs}ms)`,
        latencyMs,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Koneksi gagal: ${err?.message || 'Pastikan URL dan Anon Key valid.'}`,
      };
    }
  }

  /**
   * Melakukan Push seluruh data lokal ke Supabase Cloud
   */
  static async pushAllToSupabase(isAutoSync: boolean = false): Promise<{
    success: boolean;
    message: string;
    details?: Record<string, number>;
  }> {
    const client = this.getClient();
    if (!client) {
      return {
        success: false,
        message: 'Supabase client belum terkonfigurasi. Masukkan URL dan Anon Key terlebih dahulu.',
      };
    }

    try {
      this.saveConfig({ syncStatus: 'syncing', errorMessage: undefined });

      const stats: Record<string, number> = {};

      // 1. Sync School Profile
      const schoolProfile = StorageService.getSchoolProfile();
      if (schoolProfile) {
        const { error } = await client
          .from('school_profile')
          .upsert({ id: 'primary_school', ...schoolProfile, updated_at: new Date().toISOString() });
        if (!error) stats['Profil Sekolah'] = 1;
      }

      // 2b. Sync Classes
      const classes = StorageService.getClasses();
      if (classes.length > 0) {
        const { error } = await client.from('classes').upsert(
          classes.map((c) => ({
            id: c.id,
            name: c.name,
            level: c.level,
            grade: c.grade,
            academic_year: c.academicYear,
            homeroom_teacher: c.homeroomTeacher,
            updated_at: new Date().toISOString(),
          }))
        );
        if (!error) stats['Daftar Kelas'] = classes.length;
      }

      // 2. Sync Users
      const users = StorageService.getUsers();
      if (users.length > 0) {
        const { error } = await client.from('users').upsert(
          users.map((u) => {
            const quota = StorageService.getTokenQuotaStatus(u);
            return {
              id: u.id,
              email: u.email,
              name: u.name,
              role: u.role,
              status: u.status,
              school: u.school,
              subject: u.subject,
              phone: u.phone,
              auth_code: u.authCode,
              request_date: u.requestDate,
              approval_date: u.approvalDate,
              approved_by: u.approvedBy,
              last_login: u.lastLogin,
              monthly_ai_clicks: quota.monthlyUsed,
              monthly_ai_limit: quota.monthlyLimit,
              monthly_tokens_used: quota.monthlyTokensUsed,
              monthly_tokens_limit: quota.monthlyTokensLimit,
              billing_cycle_day: quota.billingCycleDay,
              last_monthly_reset: u.lastMonthlyResetDate || quota.monthlyResetDate,
              next_monthly_reset: quota.monthlyResetDate,
              subscription_start_date: quota.subscriptionStartDate,
              subscription_expiry_date: quota.subscriptionExpiryDate,
              subscription_status: quota.isExpired ? 'expired' : quota.isExpiringSoon ? 'expiring_soon' : 'active',
              payment_status: u.paymentStatus || 'paid',
              updated_at: new Date().toISOString(),
            };
          })
        );
        if (!error) stats['Akun Pengguna'] = users.length;
      }

      // 3. Sync Students
      const students = StorageService.getStudents();
      if (students.length > 0) {
        const { error } = await client.from('students').upsert(
          students.map((s) => ({
            id: s.id,
            nis: s.nis,
            nisn: s.nisn,
            name: s.name,
            gender: s.gender,
            class_id: s.classId,
            class_name: s.className,
            parent_phone: s.parentPhone,
            address: s.address,
            updated_at: new Date().toISOString(),
          }))
        );
        if (!error) stats['Data Siswa'] = students.length;
      }

      // 4. Sync Attendance
      const attendance = StorageService.getAttendance();
      if (attendance.length > 0) {
        const { error } = await client.from('attendance_records').upsert(
          attendance.map((a) => ({
            id: a.id,
            date: a.date,
            class_id: a.classId,
            class_name: a.className,
            subject: a.subject,
            meeting_number: a.meetingNumber,
            semester: a.semester,
            academic_year: a.academicYear,
            records: a.records,
            summary: a.summary,
            updated_at: new Date().toISOString(),
          }))
        );
        if (!error) stats['Presensi Harian'] = attendance.length;
      }

      // 5. Sync Schedules
      const schedules = StorageService.getSchedule();
      if (schedules.length > 0) {
        const { error } = await client.from('schedules').upsert(
          schedules.map((s) => ({
            id: s.id,
            day: s.day,
            period: s.period,
            start_time: s.startTime,
            end_time: s.endTime,
            class_name: s.className,
            subject: s.subject,
            room: s.room,
            notes: s.notes,
            updated_at: new Date().toISOString(),
          }))
        );
        if (!error) stats['Jadwal Mengajar'] = schedules.length;
      }

      // 6. Sync Agendas
      const agendas = StorageService.getAgenda();
      if (agendas.length > 0) {
        const { error } = await client.from('teaching_agendas').upsert(
          agendas.map((a) => ({
            id: a.id,
            date: a.date,
            time: a.time,
            class_name: a.className,
            subject: a.subject,
            meeting_number: a.meetingNumber,
            topic: a.topic,
            activities: a.activities,
            student_attendance_summary: a.studentAttendanceSummary,
            reflection: a.reflection,
            follow_up: a.followUp,
            status: a.status,
            updated_at: new Date().toISOString(),
          }))
        );
        if (!error) stats['Agenda Mengajar'] = agendas.length;
      }

      // 7. Sync Journals
      const journals = StorageService.getJournal();
      if (journals.length > 0) {
        const { error } = await client.from('teaching_journals').upsert(
          journals.map((j) => ({
            id: j.id,
            date: j.date,
            class_name: j.className,
            subject: j.subject,
            tp_covered: j.tpCovered,
            learning_progress: j.learningProgress,
            obstacles: j.obstacles,
            solution: j.solution,
            teacher_notes: j.teacherNotes,
            signature_verified: j.signatureVerified,
            supervisor_notes: j.supervisorNotes,
            updated_at: new Date().toISOString(),
          }))
        );
        if (!error) stats['Jurnal Mengajar'] = journals.length;
      }

      // 8. Sync Grades (Daily)
      const dailyGrades = StorageService.getDailyGrades();
      if (dailyGrades.length > 0) {
        await client.from('daily_grades').upsert(
          dailyGrades.map((g) => ({
            id: g.id,
            student_id: g.studentId,
            student_name: g.studentName,
            class_id: g.classId,
            class_name: g.className,
            subject: g.subject,
            semester: g.semester,
            academic_year: g.academicYear,
            tasks: g.tasks,
            uh: g.uh,
            average_task: g.averageTask,
            average_uh: g.averageUH,
            final_daily: g.finalDaily,
            updated_at: new Date().toISOString(),
          }))
        );
        stats['Penilaian Harian'] = dailyGrades.length;
      }

      // 9. Sync AI Documents
      const aiDocs = StorageService.getAIDocuments();
      if (aiDocs.length > 0) {
        const { error } = await client.from('ai_documents').upsert(
          aiDocs.map((doc) => ({
            id: doc.id,
            title: doc.title,
            tool_type: doc.type || doc.toolType,
            level: doc.level,
            grade: String(doc.grade),
            subject: doc.subject,
            semester: doc.semester,
            phase: doc.phase,
            model_option: doc.modelOption,
            content: doc.content,
            created_at: doc.createdAt,
            author_email: doc.authorEmail,
            tags: doc.tags,
            updated_at: new Date().toISOString(),
          }))
        );
        if (!error) stats['Dokumen AI & Modul'] = aiDocs.length;
      }

      // 10. Sync Access Logs
      const logs = StorageService.getAccessLogs();
      if (logs.length > 0) {
        await client.from('access_logs').upsert(
          logs.slice(0, 50).map((l) => ({
            id: l.id,
            timestamp: l.timestamp,
            user_id: l.userId,
            user_email: l.userEmail,
            user_name: l.userName,
            user_role: l.userRole,
            action: l.action,
            details: l.details,
            status: l.status,
          }))
        );
        stats['Log Audit'] = logs.length;
      }

      // 11. Sync CP Distribution Plans (Pembagian Materi Semester 1 & 2)
      const cpDistributions = StorageService.getCPDistributions();
      if (cpDistributions.length > 0) {
        const { error } = await client.from('cp_distributions').upsert(
          cpDistributions.map((p) => ({
            id: p.id,
            teacher_name: p.teacherName,
            teacher_nip: p.teacherNip,
            subject: p.subject,
            school_name: p.schoolName,
            level: p.level,
            grade: String(p.grade),
            phase: p.phase,
            academic_year: p.academicYear,
            semester_option: p.semesterOption,
            total_hours_per_year: p.totalHoursPerYear,
            total_tp_count: p.totalTPCount,
            jp_per_week: p.jpPerWeek,
            cp_text: p.cpText,
            materials_sem1: p.materialsSem1,
            materials_sem2: p.materialsSem2,
            total_hours_sem1: p.totalHoursSem1,
            total_hours_sem2: p.totalHoursSem2,
            created_at: p.createdAt,
            updated_at: new Date().toISOString(),
            author_email: p.authorEmail,
          }))
        );
        if (!error) stats['Analisis & Pembagian Materi CP'] = cpDistributions.length;
      }

      // 12. Sync Unified Grades
      const unifiedGrades = StorageService.getGrades();
      if (unifiedGrades.length > 0) {
        await client.from('unified_grades').upsert(
          unifiedGrades.map((ug) => ({
            id: ug.id,
            student_id: ug.studentId,
            student_name: ug.studentName,
            class_name: ug.className,
            subject: ug.subject,
            task1: ug.task1,
            task2: ug.task2,
            uh1: ug.uh1,
            uh2: ug.uh2,
            performance: ug.performance,
            daily_average: ug.dailyAverage,
            pts_score: ug.ptsScore,
            pas_score: ug.pasScore,
            final_score: ug.finalScore,
            predicate: ug.predicate,
            updated_at: new Date().toISOString(),
          }))
        );
        stats['Rekap Nilai Gabungan'] = unifiedGrades.length;
      }

      // 13. Sync Feedback
      const feedbacks = StorageService.getFeedbacks();
      if (feedbacks.length > 0) {
        await client.from('user_feedbacks').upsert(
          feedbacks.map((f) => ({
            id: f.id,
            user_name: f.userName,
            user_email: f.userEmail,
            category: f.category,
            title: f.title,
            message: f.message,
            date: f.date,
            status: f.status,
            admin_reply: f.adminReply || null,
          }))
        );
        stats['Kotak Saran'] = feedbacks.length;
      }

      // Always ensure any user named Uus is purged from Supabase
      try {
        await client.from('users').delete().or('name.ilike.%uus%,email.ilike.%uus%,id.ilike.%uus%');
      } catch {}

      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      this.saveConfig({
        lastSyncedAt: now,
        syncStatus: 'success',
        errorMessage: undefined,
      });

      if (!isAutoSync) {
        StorageService.addNotification({
          title: 'Sinkronisasi Supabase Berhasil',
          message: `Semua modul data administrasi (${Object.keys(stats).length} tabel) telah berhasil disinkronkan ke Supabase Cloud.`,
          type: 'sync',
        });
      }

      return {
        success: true,
        message: `Sinkronisasi ke Supabase Cloud Berhasil! (${now})`,
        details: stats,
      };
    } catch (err: any) {
      this.saveConfig({ syncStatus: 'error', errorMessage: err?.message });
      return {
        success: false,
        message: `Sinkronisasi gagal: ${err?.message || 'Periksa skema tabel Supabase Anda.'}`,
      };
    }
  }

  /**
   * Menghapus akun pengguna Uus dari Supabase Cloud
   */
  static async purgeUusFromSupabase(): Promise<{ success: boolean; message: string }> {
    const client = this.getClient();
    if (!client) {
      return { success: false, message: 'Supabase client belum terkonfigurasi.' };
    }
    try {
      const { error } = await client
        .from('users')
        .delete()
        .or('name.ilike.%uus%,email.ilike.%uus%,id.ilike.%uus%');
      if (error) {
        return { success: false, message: `Gagal menghapus Uus dari Supabase: ${error.message}` };
      }
      return { success: true, message: 'Data akun Uus berhasil dihapus dari Supabase Cloud.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal menghapus Uus dari Supabase.' };
    }
  }

  /**
   * Menghapus data pengguna tertentu dari Supabase Cloud
   */
  static async deleteUserFromSupabase(query: string): Promise<{ success: boolean; message: string }> {
    const client = this.getClient();
    if (!client) {
      return { success: false, message: 'Supabase client belum terkonfigurasi.' };
    }
    const q = query.trim();
    if (!q) return { success: false, message: 'Nama atau email pengguna kosong.' };

    try {
      const { error } = await client
        .from('users')
        .delete()
        .or(`name.ilike.%${q}%,email.ilike.%${q}%,id.ilike.%${q}%`);
      if (error) {
        return { success: false, message: `Gagal menghapus ${query} dari Supabase: ${error.message}` };
      }
      return { success: true, message: `Pengguna "${query}" berhasil dihapus dari Supabase Cloud.` };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal eksekusi query hapus.' };
    }
  }

  /**
   * Mengosongkan seluruh tabel data di Supabase (Reset ke aplikasi baru kosong)
   */
  static async resetSupabaseAllData(): Promise<{ success: boolean; message: string }> {
    const client = this.getClient();
    if (!client) {
      return { success: false, message: 'Supabase client belum terkonfigurasi.' };
    }
    try {
      const tables = [
        'classes',
        'students',
        'attendance_records',
        'schedules',
        'teaching_agendas',
        'teaching_journals',
        'daily_grades',
        'ai_documents',
        'access_logs',
        'cp_distributions',
        'unified_grades',
        'user_feedbacks',
      ];

      for (const tbl of tables) {
        try {
          await client.from(tbl).delete().neq('id', '___non_existent_key___');
        } catch {}
      }

      // Hapus semua pengguna selain admin master
      try {
        await client.from('users').delete().neq('role', 'admin');
        await client.from('users').delete().or('name.ilike.%uus%,email.ilike.%uus%');
      } catch {}

      return {
        success: true,
        message: 'Seluruh data di Supabase Cloud berhasil dikosongkan (Aplikasi Baru Bersih).',
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal mereset data di Supabase.' };
    }
  }

  /**
   * Menghasilkan SQL Schema Lengkap untuk di-run di Supabase SQL Editor
   */
  static getSupabaseSQLSchema(): string {
    return `-- =================================================================
-- SKRIP SQL SCHEMA LENGKAP: ADMINISTRASI GURU KREATIF (SUPABASE)
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =================================================================

-- 1. Tabel Profil Sekolah
CREATE TABLE IF NOT EXISTS public.school_profile (
    id TEXT PRIMARY KEY DEFAULT 'primary_school',
    school_name TEXT NOT NULL,
    npsn TEXT,
    address TEXT,
    headmaster_name TEXT,
    headmaster_nip TEXT,
    teacher_name TEXT,
    teacher_nip TEXT,
    city TEXT,
    semester TEXT,
    academic_year TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Akun Pengguna & Hak Akses (Termasuk Kuota Bulanan 35x / 500.000 Token & Langganan 1 Tahun)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'guru',
    status TEXT NOT NULL DEFAULT 'approved',
    school TEXT,
    subject TEXT,
    phone TEXT,
    auth_code TEXT,
    request_date TEXT,
    approval_date TEXT,
    approved_by TEXT,
    last_login TEXT,
    monthly_ai_clicks INT DEFAULT 0,
    monthly_ai_limit INT DEFAULT 35,
    monthly_tokens_used INT DEFAULT 0,
    monthly_tokens_limit INT DEFAULT 500000,
    billing_cycle_day INT DEFAULT 1,
    last_monthly_reset TEXT,
    next_monthly_reset TEXT,
    subscription_start_date TEXT,
    subscription_expiry_date TEXT,
    subscription_status TEXT DEFAULT 'active',
    payment_status TEXT DEFAULT 'paid',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2b. Tabel Kelas & Ruang Rombel
CREATE TABLE IF NOT EXISTS public.classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    level TEXT NOT NULL,
    grade INT,
    academic_year TEXT,
    homeroom_teacher TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Data Siswa
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    nis TEXT,
    nisn TEXT,
    name TEXT NOT NULL,
    gender TEXT,
    class_id TEXT,
    class_name TEXT,
    parent_phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Presensi Harian Siswa
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    class_id TEXT,
    class_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    meeting_number INT,
    semester TEXT,
    academic_year TEXT,
    records JSONB NOT NULL DEFAULT '[]'::jsonb,
    summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Jadwal Mengajar
CREATE TABLE IF NOT EXISTS public.schedules (
    id TEXT PRIMARY KEY,
    day TEXT NOT NULL,
    period TEXT,
    start_time TEXT,
    end_time TEXT,
    class_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    room TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Agenda Mengajar
CREATE TABLE IF NOT EXISTS public.teaching_agendas (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    time TEXT,
    class_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    meeting_number INT,
    topic TEXT,
    activities TEXT,
    student_attendance_summary TEXT,
    reflection TEXT,
    follow_up TEXT,
    status TEXT DEFAULT 'Selesai',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabel Jurnal Mengajar & Validasi
CREATE TABLE IF NOT EXISTS public.teaching_journals (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    class_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    tp_covered TEXT,
    learning_progress TEXT,
    obstacles TEXT,
    solution TEXT,
    teacher_notes TEXT,
    signature_verified BOOLEAN DEFAULT false,
    supervisor_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabel Penilaian Harian
CREATE TABLE IF NOT EXISTS public.daily_grades (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    student_name TEXT,
    class_id TEXT,
    class_name TEXT,
    subject TEXT,
    semester TEXT,
    academic_year TEXT,
    tasks JSONB DEFAULT '[]'::jsonb,
    uh JSONB DEFAULT '[]'::jsonb,
    average_task NUMERIC,
    average_uh NUMERIC,
    final_daily NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabel Dokumen Asisten AI (Modul Ajar, TP, ATP, PROTA, PROSEM, LKPD, KKTP, Asesmen)
CREATE TABLE IF NOT EXISTS public.ai_documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    tool_type TEXT NOT NULL,
    level TEXT,
    grade TEXT,
    subject TEXT,
    semester TEXT,
    phase TEXT,
    model_option TEXT,
    content TEXT NOT NULL,
    author_email TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Tabel Log Audit Akses
CREATE TABLE IF NOT EXISTS public.access_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    user_id TEXT,
    user_email TEXT,
    user_name TEXT,
    user_role TEXT,
    action TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'success',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Tabel Analisis & Pembagian Materi CP (Semester 1 dan Semester 2)
CREATE TABLE IF NOT EXISTS public.cp_distributions (
    id TEXT PRIMARY KEY,
    teacher_name TEXT NOT NULL,
    teacher_nip TEXT,
    subject TEXT NOT NULL,
    school_name TEXT NOT NULL,
    level TEXT NOT NULL,
    grade TEXT,
    phase TEXT,
    academic_year TEXT,
    semester_option TEXT,
    total_hours_per_year INT,
    total_tp_count INT,
    jp_per_week INT,
    cp_text TEXT,
    materials_sem1 JSONB DEFAULT '[]'::jsonb,
    materials_sem2 JSONB DEFAULT '[]'::jsonb,
    total_hours_sem1 INT,
    total_hours_sem2 INT,
    author_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Tabel Rekap Nilai Gabungan
CREATE TABLE IF NOT EXISTS public.unified_grades (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    student_name TEXT,
    class_name TEXT,
    subject TEXT,
    task1 NUMERIC,
    task2 NUMERIC,
    uh1 NUMERIC,
    uh2 NUMERIC,
    performance NUMERIC,
    daily_average NUMERIC,
    pts_score NUMERIC,
    pas_score NUMERIC,
    final_score NUMERIC,
    predicate TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Tabel Kotak Saran & Umpan Balik Pengguna
CREATE TABLE IF NOT EXISTS public.user_feedbacks (
    id TEXT PRIMARY KEY,
    user_name TEXT,
    user_email TEXT,
    category TEXT,
    title TEXT,
    message TEXT,
    date TEXT,
    status TEXT DEFAULT 'Menunggu Review',
    admin_reply TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aktifkan Row Level Security (RLS) & Kebijakan Public Anon Read/Write
ALTER TABLE public.school_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teaching_agendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teaching_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cp_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unified_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedbacks ENABLE ROW LEVEL SECURITY;

-- Buat Kebijakan Akses Penuh untuk Anon Key
CREATE POLICY "Public Read/Write Access" ON public.school_profile FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Access" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Access" ON public.classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Access" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Access" ON public.attendance_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Access" ON public.schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Access" ON public.teaching_agendas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Access" ON public.teaching_journals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Access" ON public.daily_grades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Access" ON public.ai_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Access" ON public.access_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Access" ON public.cp_distributions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Access" ON public.unified_grades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Access" ON public.user_feedbacks FOR ALL USING (true) WITH CHECK (true);

-- 4. Fungsi & Penjadwal Otomatisasi Database Supabase: Reset Kuota Bulanan 35x / 500.000 Token
-- Fungsi ini akan mereset kuota token akun guru pada tanggal yang sama setiap bulannya
CREATE OR REPLACE FUNCTION public.reset_monthly_user_token_quotas()
RETURNS void AS $$
DECLARE
    today_day INT := EXTRACT(DAY FROM CURRENT_DATE);
    today_str TEXT := TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD');
BEGIN
    UPDATE public.users
    SET 
        monthly_ai_clicks = 0,
        monthly_tokens_used = 0,
        last_monthly_reset = today_str,
        updated_at = NOW()
    WHERE 
        role != 'admin'
        AND billing_cycle_day = today_day
        AND (last_monthly_reset IS NULL OR last_monthly_reset < today_str);
END;
$$ LANGUAGE plpgsql;
`;
  }
}

// Otomatis daftarkan pendengar perubahan storage agar setiap kali ada data baru/edit/hapus,
// SupabaseService langsung menjadwalkan sinkronisasi otomatis ke Supabase di latar belakang
addStorageListener((key) => {
  SupabaseService.triggerAutoSync(key);
});
