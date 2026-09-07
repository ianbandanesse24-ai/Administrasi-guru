import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Printer,
  Award,
  BarChart3,
  Calculator,
  Sparkles,
  FileSearch,
  Target,
  GitMerge,
  CalendarRange,
  CalendarCheck,
  FileText,
  FileSpreadsheet,
  CheckSquare,
  HelpCircle,
  ShieldCheck,
  UploadCloud,
  Database,
  Key,
  MessageSquareHeart,
  ChevronRight,
  Layers,
  UserCheck,
  Palette,
  Sun,
  Moon,
  Leaf,
  Layers2,
  Download,
  Wifi,
  WifiOff,
  RefreshCw,
  Search,
  X,
  Bot,
  Zap,
  TrendingUp,
  HeartHandshake,
  BookMarked,
  Flame,
  CalendarDays,
  Scale,
} from 'lucide-react';
import { UserAccount, AppTheme } from '../types';
import { useOfflineSync } from '../lib/offlineManager';

interface SidebarProps {
  activeView: string;
  setActiveView?: (view: string) => void;
  onSelectView?: (view: string) => void;
  onNavigate?: (view: string) => void;
  currentUser: UserAccount;
  pendingRequestsCount?: number;
  onLogout?: () => void;
  theme?: AppTheme;
  onThemeChange?: (t: AppTheme) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
  iconColor: string;
  iconBg: string;
  desc?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  onSelectView,
  onNavigate,
  currentUser,
  pendingRequestsCount = 0,
  onLogout,
  theme = 'dark',
  onThemeChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const isAdmin = currentUser.role === 'admin';
  const {
    isOnline,
    isSyncing,
    isPwaInstalled,
    triggerManualSync,
    promptInstallPwa,
    pendingCount,
    lastSyncedAt,
  } = useOfflineSync();

  const handleSelectView = (viewId: string) => {
    if (typeof setActiveView === 'function') {
      setActiveView(viewId);
    }
    if (typeof onSelectView === 'function') {
      onSelectView(viewId);
    }
    if (typeof onNavigate === 'function') {
      onNavigate(viewId);
    }
  };

  const menuUtama: MenuItem[] = [
    {
      id: 'kelas_siswa',
      label: 'Kelola Kelas & Siswa',
      icon: UserCheck,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
      desc: 'Daftar Siswa & Rombel',
    },
    {
      id: 'absensi',
      label: 'Absensi Siswa',
      icon: Users,
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/15 border-sky-500/30',
      desc: 'Presensi Harian & Rekap',
    },
    {
      id: 'jadwal',
      label: 'Jadwal Mengajar',
      icon: Calendar,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/15 border-amber-500/30',
      desc: 'Jam Tatap Muka Guru',
    },
    {
      id: 'jurnal',
      label: 'Jurnal Mengajar',
      icon: BookMarked,
      iconColor: 'text-teal-400',
      iconBg: 'bg-teal-500/15 border-teal-500/30',
      desc: 'Refleksi Guru & Supervisi',
    },
    {
      id: 'guru_wali',
      label: 'Guru Wali (Wali Kelas)',
      icon: HeartHandshake,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/15 border-rose-500/30',
      desc: 'Bimbingan & BK Siswa',
    },
    {
      id: 'cetak_laporan',
      label: 'Cetak Laporan Lengkap',
      icon: Printer,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/15 border-cyan-500/30',
      badge: 'PDF/Word',
      desc: 'Ekspor Berkas Siap Cetak',
    },
    {
      id: 'penilaian_harian',
      label: 'Penilaian Harian',
      icon: Award,
      iconColor: 'text-yellow-400',
      iconBg: 'bg-yellow-500/15 border-yellow-500/30',
      desc: 'Tugas & Ulangan Harian',
    },
    {
      id: 'penilaian_pts',
      label: 'Penilaian PTS / STS',
      icon: TrendingUp,
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/15 border-indigo-500/30',
      desc: 'Asesmen Tengah Semester',
    },
    {
      id: 'penilaian_pas',
      label: 'Penilaian PAS / SAS',
      icon: BarChart3,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/15 border-purple-500/30',
      desc: 'Asesmen Akhir Semester',
    },
    {
      id: 'rekap_nilai',
      label: 'Rekap Nilai Otomatis',
      icon: Calculator,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
      badge: 'Leger Rapor',
      desc: 'Kalkulasi Otomatis',
    },
  ];

  const menuAI: MenuItem[] = [
    {
      id: 'profil_guru_mapel',
      label: 'Profil Guru Mata Pelajaran',
      icon: UserCheck,
      iconColor: 'text-indigo-300',
      iconBg: 'bg-indigo-600/25 border-indigo-400/40',
      badge: 'Acuan Utama',
      badgeColor: 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white',
      desc: 'Biodata, JP, TP & CP Terkini',
    },
    {
      id: 'kalender_pendidikan',
      label: 'Kalender & Alokasi Waktu',
      icon: CalendarDays,
      iconColor: 'text-sky-300',
      iconBg: 'bg-sky-500/20 border-sky-400/40',
      badge: 'Otomatis',
      badgeColor: 'bg-gradient-to-r from-sky-500 to-emerald-600 text-white',
      desc: 'Upload Kaldik & Analisis RBE (Sem 1 & 2)',
    },
    {
      id: 'ai_analisis_cp',
      label: '1. Analisis CP Terbaru',
      icon: FileSearch,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/15 border-cyan-500/30',
      desc: 'Pemetaan Elemen CP',
    },
    {
      id: 'ai_tp',
      label: '2. Tujuan Pembelajaran (TP)',
      icon: Target,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/15 border-rose-500/30',
      desc: 'Rumusan KKO Kompetensi',
    },
    {
      id: 'ai_atp',
      label: '3. Alur TP (ATP)',
      icon: GitMerge,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/15 border-amber-500/30',
      desc: 'Alur Urutan & JP',
    },
    {
      id: 'ai_prota',
      label: '4. Program Tahunan (PROTA)',
      icon: CalendarRange,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/15 border-blue-500/30',
      desc: 'Rencana Alokasi 1 Tahun',
    },
    {
      id: 'ai_prosem',
      label: '5. Program Semester (PROSEM)',
      icon: CalendarCheck,
      iconColor: 'text-fuchsia-400',
      iconBg: 'bg-fuchsia-500/15 border-fuchsia-500/30',
      badge: 'Berwarna',
      badgeColor: 'bg-fuchsia-600 text-white',
      desc: 'Matriks Pekan Efektif',
    },
    {
      id: 'ai_kktp',
      label: '6. Kriteria Ketuntasan (KKTP)',
      icon: CheckSquare,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
      badge: 'Standar Mutu',
      badgeColor: 'bg-emerald-600 text-white',
      desc: 'Rubrik & Interval Nilai',
    },
    {
      id: 'ai_modul_ajar',
      label: '7. RPM (Rencana Pelaksanaan Modul)',
      icon: FileText,
      iconColor: 'text-violet-400',
      iconBg: 'bg-violet-500/15 border-violet-500/30',
      badge: 'RPM',
      badgeColor: 'bg-violet-600 text-white',
      desc: 'Rencana Pelaksanaan Modul',
    },
    {
      id: 'ai_lkpd',
      label: '8. Lembar Kerja Siswa (LKPD)',
      icon: FileSpreadsheet,
      iconColor: 'text-teal-400',
      iconBg: 'bg-teal-500/15 border-teal-500/30',
      desc: 'Aktivitas Berdiferensiasi',
    },
    {
      id: 'ai_rubrik_penilaian',
      label: '9. Rubrik Penilaian Terpadu',
      icon: HelpCircle,
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-500/15 border-orange-500/30',
      desc: 'Sinkron RPM / Modul Ajar',
    },
  ];

  const menuAdmin: MenuItem[] = [
    {
      id: 'admin_dashboard',
      label: 'Dashboard & Log Audit',
      icon: ShieldCheck,
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/15 border-indigo-500/30',
    },
    {
      id: 'admin_api_key',
      label: 'API Key Google AI Studio',
      icon: Key,
      iconColor: 'text-violet-400',
      iconBg: 'bg-violet-500/15 border-violet-500/30',
      badge: 'Gemini AI',
      badgeColor: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white',
      desc: 'Sinkronisasi Kunci Gemini',
    },
    {
      id: 'admin_tokens',
      label: 'Manajemen Token & Kuota AI',
      icon: Sparkles,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/15 border-amber-500/30',
      badge: '20/Hari',
      badgeColor: 'bg-indigo-600 text-white',
    },
    {
      id: 'admin_access',
      label: 'Otorisasi Akun Client',
      icon: Users,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount} Pending` : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'admin_sync',
      label: 'Integrasi Supabase & Cloud',
      icon: Database,
      iconColor: 'text-teal-400',
      iconBg: 'bg-teal-500/15 border-teal-500/30',
    },
  ];

  const themesList: { id: AppTheme; label: string; icon: any }[] = [
    { id: 'dark', label: 'Gelap', icon: Moon },
    { id: 'light', label: 'Terang', icon: Sun },
    { id: 'slate', label: 'Minimalis', icon: Layers2 },
    { id: 'emerald', label: 'Edu Hijau', icon: Leaf },
  ];

  const isLight = theme === 'light';
  const isEmerald = theme === 'emerald';
  const isSlate = theme === 'slate';

  // Filter items by search query
  const filterByQuery = (items: MenuItem[]) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter(
      (item) =>
        (item?.label || '').toLowerCase().includes(q) ||
        (item?.desc && String(item.desc).toLowerCase().includes(q))
    );
  };

  const filteredMenuUtama = filterByQuery(menuUtama);
  const filteredMenuAI = filterByQuery(menuAI);
  const filteredMenuAdmin = filterByQuery(menuAdmin);

  return (
    <aside
      className={`w-full flex flex-col flex-1 select-none transition-colors duration-200 ${
        isLight
          ? 'bg-slate-50 text-slate-800 border-r border-slate-200'
          : isEmerald
          ? 'bg-emerald-950/95 text-emerald-100 border-r border-emerald-900/60'
          : isSlate
          ? 'bg-zinc-950 text-zinc-200 border-r border-zinc-800'
          : 'bg-slate-950 text-slate-300 border-r border-slate-800/80'
      }`}
    >
      {/* Brand Header Banner */}
      <div className="p-3.5 border-b border-slate-800/60 bg-gradient-to-b from-indigo-950/30 to-transparent">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-teal-400 p-[1.5px] shadow-lg shadow-indigo-500/25">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-950"></span>
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-teal-200 uppercase truncate">
                AGK Guru AI
              </h2>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO 2025
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
              <span>Kurikulum Deep Learning</span>
            </p>
          </div>
        </div>

        {/* Quick Filter Search in Sidebar */}
        <div className="mt-3 relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cepat cari modul (mis: PROSEM)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-8 pr-7 py-1.5 rounded-xl text-[11px] focus:outline-none transition border ${
              isLight
                ? 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                : 'bg-slate-900/90 border-slate-800 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Scroll Area */}
      <div className="p-3 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
        {/* Top Link: Dashboard */}
        <div>
          <button
            id="nav-dashboard"
            onClick={() => handleSelectView('dashboard')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition group ${
              activeView === 'dashboard'
                ? isEmerald
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                : isLight
                ? 'text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                : 'text-slate-300 hover:bg-slate-900/90 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition border ${
                  activeView === 'dashboard'
                    ? 'bg-white/20 text-white border-white/30'
                    : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div className="text-left truncate">
                <span className="truncate block leading-tight">Dashboard & Ikhtisar</span>
                <span
                  className={`text-[9px] font-normal block ${
                    activeView === 'dashboard' ? 'text-indigo-100' : 'text-slate-500'
                  }`}
                >
                  Pusat Kendali Administrasi
                </span>
              </div>
            </div>
            <ChevronRight
              className={`w-3.5 h-3.5 transition ${
                activeView === 'dashboard' ? 'opacity-100 text-white' : 'opacity-40 group-hover:opacity-100'
              }`}
            />
          </button>
        </div>

        {/* Section B: Asisten AI Kurikulum (Moved to top priority for modern focus) */}
        <div>
          <div className="px-2 mb-1.5 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-indigo-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span>AI Kurikulum & Perangkat</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {filteredMenuAI.length}
            </span>
          </div>

          <nav className="space-y-1">
            {filteredMenuAI.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeView === item.id ||
                (item.id === 'kalender_pendidikan' &&
                  (activeView === 'upload_kalender' ||
                    activeView === 'analisis_alokasi_waktu' ||
                    activeView === 'alokasi_waktu' ||
                    activeView === 'ai_analisis_alokasi_waktu'));
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleSelectView(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition group relative ${
                    isActive
                      ? isEmerald
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow font-bold'
                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow font-bold'
                      : isLight
                      ? 'text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                      : 'text-slate-300 hover:bg-slate-900/90 hover:text-white'
                  }`}
                >
                  {/* Left active line glow indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-amber-300 rounded-r-full shadow-sm" />
                  )}

                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border transition ${
                        isActive
                          ? 'bg-white/20 text-white border-white/40'
                          : `${item.iconBg} ${item.iconColor} group-hover:scale-105`
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left min-w-0">
                      <span className="truncate block leading-tight">{item.label}</span>
                      {item.desc && (
                        <span
                          className={`text-[9px] font-normal truncate block ${
                            isActive ? 'text-indigo-100' : 'text-slate-500'
                          }`}
                        >
                          {item.desc}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ml-1 shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white border border-white/30'
                          : item.badgeColor || 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section A: Administrasi Pokok Guru */}
        <div>
          <div className="px-2 mb-1.5 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-emerald-400" />
              <span>Administrasi Pokok</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {filteredMenuUtama.length}
            </span>
          </div>

          <nav className="space-y-1">
            {filteredMenuUtama.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleSelectView(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition group relative ${
                    isActive
                      ? isEmerald
                        ? 'bg-emerald-600 text-white shadow font-bold'
                        : 'bg-indigo-600 text-white shadow font-bold'
                      : isLight
                      ? 'text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                      : 'text-slate-300 hover:bg-slate-900/90 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-300 rounded-r-full shadow-sm" />
                  )}

                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border transition ${
                        isActive
                          ? 'bg-white/20 text-white border-white/40'
                          : `${item.iconBg} ${item.iconColor} group-hover:scale-105`
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left min-w-0">
                      <span className="truncate block leading-tight">{item.label}</span>
                      {item.desc && (
                        <span
                          className={`text-[9px] font-normal truncate block ${
                            isActive ? 'text-indigo-100' : 'text-slate-500'
                          }`}
                        >
                          {item.desc}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ml-1 shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : isLight
                          ? 'bg-slate-200 text-slate-600'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section C: Panel Admin & Masukan */}
        <div>
          <div className="px-2 mb-1.5 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isAdmin ? 'Panel Super Admin' : 'Bantuan & Masukan'}</span>
            </span>
          </div>

          <nav className="space-y-1">
            {isAdmin &&
              filteredMenuAdmin.map((item) => {
                const Icon = item.icon;
                const isActive =
                  activeView === item.id ||
                  (item.id === 'admin_sync' && activeView === 'supabase_sync');
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => handleSelectView(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition group relative ${
                      isActive
                        ? isEmerald
                          ? 'bg-emerald-600 text-white shadow font-bold'
                          : 'bg-indigo-600 text-white shadow font-bold'
                        : isLight
                        ? 'text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                        : 'text-slate-300 hover:bg-slate-900/90 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-300 rounded-r-full" />
                    )}

                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border transition ${
                          isActive
                            ? 'bg-white/20 text-white border-white/40'
                            : `${item.iconBg} ${item.iconColor} group-hover:scale-105`
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ml-1 shrink-0 ${
                          item.badgeColor ||
                          (isLight ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-slate-300')
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

            {/* Kotak Saran */}
            <button
              id="nav-saran"
              onClick={() => handleSelectView('saran')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition group ${
                activeView === 'saran'
                  ? 'bg-rose-600 text-white shadow font-bold'
                  : isLight
                  ? 'text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                  : 'text-slate-300 hover:bg-slate-900/90 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border bg-rose-500/15 border-rose-500/30 text-rose-400">
                  <MessageSquareHeart className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">Kotak Saran & Masukan</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>
          </nav>
        </div>

        {/* Offline & Sync Status Card */}
        <div
          className={`p-3 rounded-2xl border text-xs space-y-2 ${
            isLight
              ? 'bg-slate-100/90 border-slate-200 text-slate-700'
              : isEmerald
              ? 'bg-emerald-900/40 border-emerald-800/60 text-emerald-100'
              : 'bg-slate-900/70 border-slate-800/80 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 font-bold text-[11px]">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isOnline ? 'bg-emerald-400 ring-2 ring-emerald-400/30 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>{isOnline ? 'Online (Cloud Auto-Sync)' : 'Offline (Mode Lokal)'}</span>
            </div>
            {isOnline ? (
              <button
                type="button"
                id="sidebar-btn-sync"
                onClick={() => triggerManualSync()}
                disabled={isSyncing}
                title="Sinkronkan data lokal ke Supabase Cloud sekarang"
                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            ) : (
              <span className="text-[10px] text-amber-400 font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                Lokal Aktif
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            {isOnline
              ? lastSyncedAt
                ? `Sinkron: ${lastSyncedAt}`
                : 'Data terenkripsi dan otomatis sinkron ke server.'
              : 'Administrasi tetap berjalan offline tanpa koneksi internet.'}
          </p>
          {!isPwaInstalled && (
            <button
              type="button"
              id="sidebar-btn-pwa"
              onClick={promptInstallPwa}
              className="w-full mt-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-[10px] flex items-center justify-center space-x-1.5 shadow-md transition active:scale-95"
            >
              <Download className="w-3 h-3" />
              <span>Pasang Aplikasi (PWA Android/PC)</span>
            </button>
          )}
        </div>
      </div>

      {/* Theme Switcher Footer */}
      <div
        className={`p-3 border-t ${
          isLight
            ? 'border-slate-200 bg-white'
            : isEmerald
            ? 'border-emerald-900/60 bg-emerald-950'
            : isSlate
            ? 'border-zinc-800 bg-zinc-950'
            : 'border-slate-800/80 bg-slate-950'
        }`}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center">
            <Palette className="w-3 h-3 mr-1 text-indigo-400" />
            Tema Tampilan:
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {themesList.map((t) => {
            const Icon = t.icon;
            const isCurrent = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onThemeChange && onThemeChange(t.id)}
                className={`py-1.5 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center space-y-0.5 transition ${
                  isCurrent
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800/60'
                }`}
                title={`Pilih Tema: ${t.label}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[9px] truncate">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Card */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-teal-400 flex items-center justify-center font-bold text-xs text-white shadow-md">
            {currentUser.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {currentUser.name}
            </p>
            <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
              {currentUser.role === 'admin' ? 'Super Admin' : 'Guru Client'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
