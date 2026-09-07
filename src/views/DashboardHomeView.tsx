import React, { useState } from 'react';
import {
  Users,
  Calendar,
  ClipboardList,
  GraduationCap,
  Award,
  Sparkles,
  Printer,
  Clock,
  ArrowRight,
  School,
  CheckCircle2,
  BarChart3,
  Calculator,
  Layers,
  FileSearch,
  Target,
  GitMerge,
  CalendarRange,
  CalendarCheck,
  FileText,
  FileSpreadsheet,
  CheckSquare,
  HelpCircle,
  LayoutGrid,
  Bot,
  Zap,
  TrendingUp,
  HeartHandshake,
  BookMarked,
  CalendarDays,
  Scale,
  Search,
  FileCheck2,
  FolderSync,
  Compass,
  Cpu,
  Flame,
  UploadCloud,
  UserCheck,
} from 'lucide-react';
import { UserAccount, SchoolProfile, AppTheme } from '../types';
import { StorageService } from '../lib/storage';
import { OfflineSyncIndicator } from '../components/OfflineSyncIndicator';

interface DashboardHomeViewProps {
  currentUser: UserAccount;
  onNavigate: (viewId: string) => void;
  onOpenSchoolProfile: () => void;
  theme?: AppTheme;
}

export const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({
  currentUser,
  onNavigate,
  onOpenSchoolProfile,
  theme = 'dark',
}) => {
  const [schoolProfile] = useState<SchoolProfile>(() => StorageService.getSchoolProfile());
  const [activeTab, setActiveTab] = useState<'all' | 'ai' | 'admin' | 'kaldik'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const students = StorageService.getStudents();
  const schedule = StorageService.getSchedule();
  const aiDocs = StorageService.getAIDocuments();
  const users = StorageService.getUsers();
  const kalender = StorageService.getKalenderPendidikan();
  const adminSettings = StorageService.getAdminSettings();

  const pendingApprovals = users.filter((u) => u.status === 'pending');

  const isLight = theme === 'light';
  const isEmerald = theme === 'emerald';
  const isSlate = theme === 'slate';

  // Greeting based on hours
  const hour = new Date().getHours();
  const greeting =
    hour < 11
      ? 'Selamat Pagi'
      : hour < 15
      ? 'Selamat Siang'
      : hour < 18
      ? 'Selamat Sore'
      : 'Selamat Malam';

  const quickLaunchers = [
    {
      id: 'upload_cp',
      title: 'Hasil Analisis CP Master',
      desc: 'Tabel analisis elemen CP, TP, & alokasi semester dari dokumen yang diunggah Master Admin.',
      icon: FileSearch,
      gradient: 'from-sky-600 via-indigo-600 to-violet-600',
      badge: 'Master Acuan',
      btnText: 'Lihat Tabel Analisis CP',
    },
    {
      id: 'ai_modul_ajar',
      title: 'RPM (Rencana Pelaksanaan Modul)',
      desc: 'Buat Rencana Pelaksanaan Modul dengan Sintaks Deep Learning dalam hitungan detik.',
      icon: Sparkles,
      gradient: 'from-violet-600 via-indigo-600 to-purple-600',
      badge: 'Paling Populer',
      btnText: 'Susun RPM Sekarang',
    },
    {
      id: 'analisis_cp_distribusi',
      title: 'Penginputan CP & Materi',
      desc: 'Petakan Capaian Pembelajaran & Pembagian Materi Semester 1 & 2.',
      icon: Layers,
      gradient: 'from-indigo-600 via-blue-600 to-cyan-600',
      badge: 'Distribusi Materi',
      btnText: 'Kelola Materi',
    },
    {
      id: 'kalender_pendidikan',
      title: 'Kalender & Alokasi Waktu',
      desc: 'Upload Kalender Pendidikan & analisis otomatis rincian pekan efektif (RBE) dan alokasi JP.',
      icon: CalendarDays,
      gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
      badge: 'Kaldik Otomatis',
      btnText: 'Lihat Analisis RBE',
    },
    {
      id: 'rekap_nilai',
      title: 'Rekap Nilai Leger Rapor',
      desc: 'Kalkulasi otomatis bobot Formatif, PTS & PAS langsung jadi.',
      icon: Calculator,
      gradient: 'from-amber-600 via-orange-600 to-rose-600',
      badge: 'Otomatis',
      btnText: 'Buka Leger Nilai',
    },
  ];

  const mainShortcuts = [
    {
      id: 'kelas_siswa',
      title: 'Kelola Kelas & Siswa',
      desc: 'Manajemen data rombel, NISN, biodata siswa terpusat',
      icon: Users,
      category: 'admin',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
    },
    {
      id: 'absensi',
      title: 'Absensi Siswa',
      desc: 'Presensi harian, rekap sakit, izin, dan alpa otomatis',
      icon: CheckCircle2,
      category: 'admin',
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/15 border-sky-500/30',
    },
    {
      id: 'jadwal',
      title: 'Jadwal Mengajar',
      desc: 'Matriks jam tatap muka mingguan dan alokasi JP',
      icon: Calendar,
      category: 'admin',
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/15 border-amber-500/30',
    },
    {
      id: 'jurnal',
      title: 'Jurnal Mengajar',
      desc: 'Refleksi pedagogis, catatan supervisi & tindak lanjut',
      icon: BookMarked,
      category: 'admin',
      iconColor: 'text-teal-400',
      iconBg: 'bg-teal-500/15 border-teal-500/30',
    },
    {
      id: 'guru_wali',
      title: 'Guru Wali & BK',
      desc: 'Bimbingan siswa, catatan disiplin & home visit',
      icon: HeartHandshake,
      category: 'admin',
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/15 border-rose-500/30',
    },
    {
      id: 'cetak_laporan',
      title: 'Cetak Laporan Lengkap',
      desc: 'Pusat ekspor format resmi Excel, Word & PDF siap cetak',
      icon: Printer,
      category: 'admin',
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/15 border-cyan-500/30',
    },
    {
      id: 'penilaian_harian',
      title: 'Penilaian Harian',
      desc: 'Tugas, tes formatif, proyek & nilai harian siswa',
      icon: Award,
      category: 'admin',
      iconColor: 'text-yellow-400',
      iconBg: 'bg-yellow-500/15 border-yellow-500/30',
    },
    {
      id: 'penilaian_pts',
      title: 'Penilaian PTS / STS',
      desc: 'Skor asesmen tengah semester dan remedial',
      icon: TrendingUp,
      category: 'admin',
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/15 border-indigo-500/30',
    },
    {
      id: 'penilaian_pas',
      title: 'Penilaian PAS / SAS',
      desc: 'Asesmen sumatif akhir semester & pembagian rapor',
      icon: BarChart3,
      category: 'admin',
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/15 border-purple-500/30',
    },
    {
      id: 'rekap_nilai',
      title: 'Rekap Nilai Otomatis',
      desc: 'Leger nilai akhir, predikat & deskripsi capaian rapor',
      icon: Calculator,
      category: 'admin',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
    },
  ];

  const aiShortcuts = [
    {
      id: 'profil_guru_mapel',
      title: 'Profil Guru Mata Pelajaran',
      desc: 'Biodata Guru, Beban Belajar (JP & TP) & Upload CP Resmi (Acuan Utama)',
      icon: UserCheck,
      category: 'ai',
      iconColor: 'text-indigo-300',
      iconBg: 'bg-indigo-600/25 border-indigo-400/40',
      badge: 'Acuan Utama',
    },
    {
      id: 'kalender_pendidikan',
      title: 'Kalender Pendidikan & Alokasi Waktu',
      desc: 'Upload Kaldik resmi sekolah & analisis otomatis Rincian Pekan Efektif (RBE) dan Jam Pelajaran (JP)',
      icon: CalendarDays,
      category: 'kaldik',
      iconColor: 'text-sky-300',
      iconBg: 'bg-sky-500/20 border-sky-400/40',
      badge: 'Otomatis',
    },
    {
      id: 'ai_analisis_cp',
      title: '1. Analisis CP Terbaru',
      desc: 'Pemetaan Elemen & Dimensi Deep Learning',
      icon: FileSearch,
      category: 'ai',
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/15 border-cyan-500/30',
    },
    {
      id: 'ai_tp',
      title: '2. Tujuan Pembelajaran (TP)',
      desc: 'Rumusan Kompetensi & KKO Taksonomi Bloom',
      icon: Target,
      category: 'ai',
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/15 border-rose-500/30',
    },
    {
      id: 'ai_atp',
      title: '3. Alur TP (ATP)',
      desc: 'Urutan Logis & Alokasi Jam Pelajaran (JP)',
      icon: GitMerge,
      category: 'ai',
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/15 border-amber-500/30',
    },
    {
      id: 'ai_prota',
      title: '4. Program Tahunan (PROTA)',
      desc: 'Distribusi Alokasi Waktu 2 Semester',
      icon: CalendarRange,
      category: 'ai',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/15 border-blue-500/30',
    },
    {
      id: 'ai_prosem',
      title: '5. Program Semester (PROSEM)',
      desc: 'Matriks Pekan Efektif & Rencana Bulanan Berwarna',
      icon: CalendarCheck,
      category: 'ai',
      iconColor: 'text-fuchsia-400',
      iconBg: 'bg-fuchsia-500/15 border-fuchsia-500/30',
      badge: 'Berwarna',
    },
    {
      id: 'ai_kktp',
      title: '6. Kriteria Ketuntasan (KKTP)',
      desc: 'Interval Nilai, Rubrik & Deskripsi Kriteria Mutu',
      icon: CheckSquare,
      category: 'ai',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
      badge: 'Standar Mutu',
    },
    {
      id: 'ai_modul_ajar',
      title: '7. RPM (Rencana Pelaksanaan Modul)',
      desc: 'Rencana Pelaksanaan Modul dengan Sintaks Deep Learning',
      icon: FileText,
      category: 'ai',
      iconColor: 'text-violet-400',
      iconBg: 'bg-violet-500/15 border-violet-500/30',
      badge: 'RPM',
    },
    {
      id: 'ai_lkpd',
      title: '8. Lembar Kerja Siswa (LKPD)',
      desc: 'Aktivitas Berdiferensiasi & Penyelidikan Terstruktur',
      icon: FileSpreadsheet,
      category: 'ai',
      iconColor: 'text-teal-400',
      iconBg: 'bg-teal-500/15 border-teal-500/30',
    },
    {
      id: 'ai_rubrik_penilaian',
      title: '9. Rubrik Penilaian Terpadu',
      desc: 'Sinkron dengan Asesmen pada RPM / Modul Ajar',
      icon: HelpCircle,
      category: 'ai',
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-500/15 border-orange-500/30',
    },
  ];

  const allItems = [...aiShortcuts, ...mainShortcuts];

  const filteredItems = allItems.filter((item) => {
    const matchTab =
      activeTab === 'all' ||
      (activeTab === 'ai' && (item.category === 'ai' || item.category === 'kaldik')) ||
      (activeTab === 'admin' && item.category === 'admin') ||
      (activeTab === 'kaldik' && item.category === 'kaldik');

    const matchQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Admin Broadcast Announcement Banner if configured */}
      {adminSettings?.systemBroadcastMessage && (
        <div className="p-4 bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl flex items-center space-x-3 text-xs text-white shadow-lg animate-in fade-in">
          <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30 shrink-0">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-indigo-300 text-[11px] uppercase tracking-wider">Pengumuman Administrator:</div>
            <div className="text-slate-200 mt-0.5">{adminSettings.systemBroadcastMessage}</div>
          </div>
        </div>
      )}

      {/* Hero Interactive Header Card */}
      <div
        className={`relative overflow-hidden p-6 sm:p-8 rounded-3xl border shadow-2xl transition-all ${
          isLight
            ? 'bg-gradient-to-br from-indigo-50 via-white to-sky-50 border-indigo-100 text-slate-900'
            : isEmerald
            ? 'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 border-emerald-800/40 text-white'
            : isSlate
            ? 'bg-gradient-to-br from-zinc-900 via-slate-900 to-zinc-950 border-zinc-800 text-white'
            : 'bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/70 border-indigo-800/40 text-white'
        }`}
      >
        {/* Ambient background glow dots */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-black bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span>Sistem Cerdas Administrasi Guru Kreatif 2025/2026</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-teal-300">{currentUser.name}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Selamat datang di pusat kendali pembelajaran Deep Learning. Siapkan RBE, PROSEM berwarna, dan perangkat ajar terintegrasi dengan cepat.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
              <button
                type="button"
                onClick={onOpenSchoolProfile}
                className="hover:text-indigo-300 transition flex items-center font-semibold bg-slate-900/60 px-3 py-1 rounded-xl border border-slate-800"
              >
                <School className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                {schoolProfile.schoolName}
              </button>
              <span className="px-2.5 py-1 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 font-medium">
                TP. {schoolProfile.academicYear} ({schoolProfile.semester})
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                {currentUser.role === 'admin' ? 'Super Administrator' : 'Guru Client'}
              </span>
            </div>
          </div>

          {/* Quick Primary Actions in Header */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('ai_modul_ajar')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 transition active:scale-95 group"
            >
              <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition" />
              <span>RPM (Rencana Pelaksanaan Modul)</span>
              <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={() => onNavigate('kalender_pendidikan')}
              className="px-5 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center space-x-2 transition"
            >
              <CalendarDays className="w-4 h-4 text-sky-400" />
              <span>Kalender & Alokasi Waktu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Offline Status & PWA Card */}
      <OfflineSyncIndicator compact={false} />

      {/* Admin Approval Banner if needed */}
      {currentUser.role === 'admin' && pendingApprovals.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-amber-950/20">
          <div className="flex items-center space-x-3 text-xs">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 shrink-0 border border-amber-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-amber-300 text-sm">
                Ada {pendingApprovals.length} Permintaan Izin Akses Akun Guru
              </div>
              <div className="text-xs text-slate-400">
                Menunggu otorisasi kode verifikasi dari panel admin Anda.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('admin_access')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition shrink-0 shadow-md shadow-amber-500/20"
          >
            Tinjau & Otorisasi
          </button>
        </div>
      )}

      {/* 4 Feature Launchpads (Top Cards) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Fitur Unggulan Kurikulum Merdeka</span>
          </h2>
          <span className="text-[11px] text-indigo-400 font-semibold">Siap Digunakan 2025/2026</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {quickLaunchers.map((ql) => {
            const Icon = ql.icon;
            return (
              <div
                key={ql.id}
                onClick={() => onNavigate(ql.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer group flex flex-col justify-between space-y-4 relative overflow-hidden shadow-lg ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-xl'
                    : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 hover:shadow-indigo-950/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl bg-gradient-to-r ${ql.gradient} text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {ql.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-white group-hover:text-indigo-300 transition">
                    {ql.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {ql.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
                  <span>{ql.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4 Interactive Statistics Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          className={`p-4 rounded-2xl border transition ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/90 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Total Siswa</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black mt-2 text-white">{students.length}</div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Siswa terdaftar aktif</div>
        </div>

        <div
          className={`p-4 rounded-2xl border transition ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/90 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Beban Mengajar</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black mt-2 text-indigo-400">{schedule.length * 2} JP</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{schedule.length} sesi pertemuan mingguan</div>
        </div>

        <div
          className={`p-4 rounded-2xl border transition ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/90 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Perangkat AI</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black mt-2 text-purple-400">{aiDocs.length} Modul</div>
          <div className="text-[10px] text-purple-300 font-semibold mt-0.5">Tersimpan di database</div>
        </div>

        <div
          className={`p-4 rounded-2xl border transition ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/90 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Pekan Efektif</span>
            <CalendarDays className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black mt-2 text-sky-400">
            {kalender.semester1?.totalEffectiveWeeks || 19} RBE
          </div>
          <div className="text-[10px] text-sky-300 font-semibold mt-0.5">Semester Ganjil 2025/2026</div>
        </div>
      </div>

      {/* Tab Filter & Search Matrix */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua Modul ({allItems.length})
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Asisten AI & Perangkat ({aiShortcuts.length})
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
              activeTab === 'admin'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Administrasi Pokok ({mainShortcuts.length})
          </button>
          <button
            onClick={() => setActiveTab('kaldik')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
              activeTab === 'kaldik'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Kalender & RBE (2)
          </button>
        </div>

        {/* Search Filter Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari modul (misal: LKPD, Nilai)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-2xl text-xs focus:outline-none transition border ${
              isLight
                ? 'bg-white text-slate-900 border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                : 'bg-slate-900 text-white border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30'
            }`}
          />
        </div>
      </div>

      {/* Grid of All Application Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isAI = item.category === 'ai' || item.category === 'kaldik';
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`p-4.5 rounded-3xl border transition-all text-left flex flex-col justify-between space-y-3 group shadow-sm hover:scale-[1.01] active:scale-[0.99] ${
                isLight
                  ? 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50 shadow-sm'
                  : isEmerald
                  ? 'bg-emerald-950/40 border-emerald-800/30 hover:border-emerald-500/50 hover:bg-emerald-900/30'
                  : isSlate
                  ? 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60'
                  : 'bg-slate-900/90 border-slate-800/90 hover:border-indigo-500/40 hover:bg-slate-850 hover:shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`p-2.5 rounded-2xl border transition group-hover:scale-110 ${item.iconBg} ${item.iconColor}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex items-center space-x-1.5">
                  {'badge' in item && Boolean(item.badge) && (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {String(item.badge)}
                    </span>
                  )}
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-white group-hover:bg-indigo-600 transition">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div>
                <div
                  className={`text-xs font-extrabold transition leading-tight ${
                    isLight
                      ? 'text-slate-900 group-hover:text-indigo-600'
                      : 'text-white group-hover:text-indigo-300'
                  }`}
                >
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
