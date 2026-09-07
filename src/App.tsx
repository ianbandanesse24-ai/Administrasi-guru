import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Bell,
  LogOut,
  School,
  Sparkles,
  Download,
  Trash2,
  Zap,
} from 'lucide-react';
import { UserAccount, UserNotification, SchoolProfile, AppTheme, TokenQuotaStatus } from './types';
import { StorageService, addStorageListener } from './lib/storage';
import { useOfflineSync } from './lib/offlineManager';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { SchoolProfileModal } from './components/SchoolProfileModal';
import { OfflineSyncIndicator } from './components/OfflineSyncIndicator';
import { TokenQuotaModal } from './components/TokenQuotaModal';
import { ErrorBoundary } from './components/ErrorBoundary';

// Views
import { DashboardHomeView } from './views/DashboardHomeView';
import { AbsensiView } from './views/AbsensiView';
import { JadwalView } from './views/JadwalView';
import { AgendaView } from './views/AgendaView';
import { JurnalView } from './views/JurnalView';
import { GuruWaliView } from './views/GuruWaliView';
import { CetakLaporanView } from './views/CetakLaporanView';
import { PenilaianHarianView } from './views/PenilaianHarianView';
import { PenilaianPTSView } from './views/PenilaianPTSView';
import { PenilaianPASView } from './views/PenilaianPASView';
import { RekapNilaiView } from './views/RekapNilaiView';
import { AIAssistantView } from './views/AIAssistantView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { SaranView } from './views/SaranView';
import { WelcomeSyncView } from './views/WelcomeSyncView';
import { SupabaseSyncView } from './views/SupabaseSyncView';
import { KelasSiswaView } from './views/KelasSiswaView';
import { AnalisisCPDistributionView } from './views/AnalisisCPDistributionView';
import { ProfilGuruMapelView } from './views/ProfilGuruMapelView';
import { KalenderPendidikanView } from './views/KalenderPendidikanView';
import { UploadCPMasterView } from './views/UploadCPMasterView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() =>
    StorageService.getCurrentUser()
  );
  const [activeView, setActiveView] = useState<string>('welcome_sync');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(!currentUser);
  const [showSchoolModal, setShowSchoolModal] = useState<boolean>(false);
  const [showTokenModal, setShowTokenModal] = useState<boolean>(false);
  const [tokenQuota, setTokenQuota] = useState<TokenQuotaStatus>(() =>
    StorageService.getTokenQuotaStatus(currentUser)
  );
  const [theme, setTheme] = useState<AppTheme>(() => StorageService.getTheme());
  const { isPwaInstalled, promptInstallPwa } = useOfflineSync();

  // Notification state
  const [notifications, setNotifications] = useState<UserNotification[]>(() =>
    StorageService.getNotifications()
  );
  const [showNotificationPopover, setShowNotificationPopover] = useState<boolean>(false);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() =>
    StorageService.getSchoolProfile()
  );

  const handleThemeChange = (newTheme: AppTheme) => {
    setTheme(newTheme);
    StorageService.saveTheme(newTheme);
  };

  // Sync notifications and token quota periodically & on storage changes
  useEffect(() => {
    const updateQuota = () => {
      const user = StorageService.getCurrentUser();
      setTokenQuota(StorageService.getTokenQuotaStatus(user));
    };

    updateQuota();

    const unsubscribe = addStorageListener(() => {
      updateQuota();
      setNotifications(StorageService.getNotifications());
    });

    const interval = setInterval(() => {
      setNotifications(StorageService.getNotifications());
      updateQuota();
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setTokenQuota(StorageService.getTokenQuotaStatus(user));
    setShowAuthModal(false);
    setActiveView('welcome_sync');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleLogout = () => {
    if (currentUser) {
      StorageService.addAccessLog({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'Logout Sistem',
        details: `Pengguna ${currentUser.name} keluar dari sesi aplikasi.`,
        status: 'info',
      });
    }
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    setShowAuthModal(true);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleClearNotifications = () => {
    StorageService.saveNotifications([]);
    setNotifications([]);
    setShowNotificationPopover(false);
  };

  // Helper for active view breadcrumb label and badge
  const getViewInfo = (viewId: string) => {
    switch (viewId) {
      case 'dashboard':
        return { label: 'Dashboard & Ikhtisar', category: 'Utama' };
      case 'welcome_sync':
        return { label: 'Pusat Sinkronisasi', category: 'Sistem' };
      case 'kelas_siswa':
      case 'siswa_kelas':
      case 'input_siswa':
        return { label: 'Kelola Kelas & Siswa', category: 'Administrasi' };
      case 'absensi':
        return { label: 'Absensi Siswa', category: 'Administrasi' };
      case 'jadwal':
        return { label: 'Jadwal Mengajar', category: 'Administrasi' };
      case 'agenda':
        return { label: 'Agenda Mengajar', category: 'Administrasi' };
      case 'jurnal':
        return { label: 'Jurnal Mengajar', category: 'Administrasi' };
      case 'guru_wali':
      case 'wali':
        return { label: 'Guru Wali & BK', category: 'Administrasi' };
      case 'cetak_laporan':
      case 'cetak':
        return { label: 'Cetak Laporan Lengkap', category: 'Administrasi' };
      case 'penilaian_harian':
      case 'nilai_harian':
        return { label: 'Penilaian Harian', category: 'Penilaian' };
      case 'penilaian_pts':
      case 'nilai_pts':
        return { label: 'Penilaian PTS / STS', category: 'Penilaian' };
      case 'penilaian_pas':
      case 'nilai_pas':
        return { label: 'Penilaian PAS / SAS', category: 'Penilaian' };
      case 'rekap_nilai':
        return { label: 'Rekap Nilai Leger', category: 'Penilaian' };
      case 'profil_guru_mapel':
      case 'profil_guru':
      case 'analisis_cp_distribusi':
      case 'cp_distribusi':
      case 'pembagian_materi':
        return { label: 'Profil Guru Mata Pelajaran', category: 'AI Kurikulum' };
      case 'kalender_pendidikan':
      case 'upload_kalender':
        return { label: 'Upload Kalender Pendidikan', category: 'Kalender & Waktu' };
      case 'analisis_alokasi_waktu':
      case 'alokasi_waktu':
      case 'ai_analisis_alokasi_waktu':
        return { label: 'Analisis Alokasi Waktu (RBE)', category: 'Kalender & Waktu' };
      case 'ai_bundle':
      case 'bundle':
        return { label: '📦 Bundel 1 Perangkat Ajar Lengkap', category: 'AI Kurikulum' };
      case 'ai_analisis_cp':
        return { label: '1. Analisis CP Terbaru', category: 'AI Kurikulum' };
      case 'ai_tp':
        return { label: '2. Tujuan Pembelajaran (TP)', category: 'AI Kurikulum' };
      case 'ai_atp':
        return { label: '3. Alur TP (ATP)', category: 'AI Kurikulum' };
      case 'ai_prota':
        return { label: '4. Program Tahunan (PROTA)', category: 'AI Kurikulum' };
      case 'ai_prosem':
        return { label: '5. Program Semester (PROSEM)', category: 'AI Kurikulum' };
      case 'ai_kktp':
        return { label: '6. Kriteria Ketuntasan (KKTP)', category: 'AI Kurikulum' };
      case 'ai_modul_ajar':
        return { label: '7. RPM (Rencana Pelaksanaan Modul)', category: 'AI Kurikulum' };
      case 'ai_lkpd':
        return { label: '8. Lembar Kerja Siswa (LKPD)', category: 'AI Kurikulum' };
      case 'ai_rubrik_penilaian':
      case 'ai_asesmen':
        return { label: '9. Rubrik Penilaian Terpadu', category: 'AI Kurikulum' };
      case 'admin_dashboard':
        return { label: 'Log Audit & Dashboard', category: 'Admin Panel' };
      case 'admin_api_key':
      case 'admin_gemini_key':
        return { label: 'API Key Google AI Studio', category: 'Admin Panel' };
      case 'admin_tokens':
        return { label: 'Manajemen Kuota Token AI', category: 'Admin Panel' };
      case 'admin_access':
        return { label: 'Otorisasi Akun Guru', category: 'Admin Panel' };
      case 'admin_sync':
      case 'supabase_sync':
        return { label: 'Integrasi Supabase Cloud', category: 'Admin Panel' };
      case 'saran':
        return { label: 'Kotak Saran & Masukan', category: 'Bantuan' };
      default:
        return { label: 'Perangkat Pembelajaran', category: 'Umum' };
    }
  };

  const currentViewInfo = getViewInfo(activeView);

  const isLight = theme === 'light';
  const isEmerald = theme === 'emerald';
  const isSlate = theme === 'slate';

  const renderActiveView = () => {
    if (!currentUser) return null;

    if (activeView === 'welcome_sync') {
      return (
        <WelcomeSyncView
          currentUser={currentUser}
          onNavigate={(viewId) => setActiveView(viewId)}
        />
      );
    }

    if (activeView === 'dashboard') {
      return (
        <DashboardHomeView
          currentUser={currentUser}
          onNavigate={(viewId) => setActiveView(viewId)}
          onOpenSchoolProfile={() => setShowSchoolModal(true)}
          theme={theme}
        />
      );
    }
    if (activeView === 'kelas_siswa' || activeView === 'siswa_kelas' || activeView === 'input_siswa') {
      return <KelasSiswaView />;
    }
    if (activeView === 'upload_cp' || activeView === 'upload_cp_master' || activeView === 'ai_analisis_cp' || activeView === 'analisis_cp') {
      return <UploadCPMasterView onNavigate={(v) => setActiveView(v)} />;
    }
    if (
      activeView === 'profil_guru_mapel' ||
      activeView === 'profil_guru' ||
      activeView === 'analisis_cp_distribusi' ||
      activeView === 'ai_analisis_cp_distribusi' ||
      activeView === 'cp_distribusi' ||
      activeView === 'pembagian_materi'
    ) {
      return <ProfilGuruMapelView onNavigate={(v) => setActiveView(v)} />;
    }
    if (
      activeView === 'kalender_pendidikan' ||
      activeView === 'upload_kalender' ||
      activeView === 'analisis_alokasi_waktu' ||
      activeView === 'alokasi_waktu' ||
      activeView === 'ai_analisis_alokasi_waktu'
    ) {
      const initialTab = activeView === 'upload_kalender' ? 'upload' : 'analisis';
      return <KalenderPendidikanView initialTab={initialTab} onNavigate={(v) => setActiveView(v)} />;
    }
    if (activeView === 'absensi') return <AbsensiView />;
    if (activeView === 'jadwal') return <JadwalView />;
    if (activeView === 'agenda') return <AgendaView />;
    if (activeView === 'jurnal') return <JurnalView />;
    if (activeView === 'guru_wali' || activeView === 'wali') return <GuruWaliView />;
    if (activeView === 'cetak_laporan' || activeView === 'cetak') return <CetakLaporanView />;
    if (activeView === 'penilaian_harian' || activeView === 'nilai_harian') return <PenilaianHarianView />;
    if (activeView === 'penilaian_pts' || activeView === 'nilai_pts') return <PenilaianPTSView />;
    if (activeView === 'penilaian_pas' || activeView === 'nilai_pas') return <PenilaianPASView />;
    if (activeView === 'rekap_nilai') return <RekapNilaiView />;

    // AI Assistant Views
    if (activeView.startsWith('ai_')) {
      return <AIAssistantView initialDocType={activeView} onNavigate={(v) => setActiveView(v)} />;
    }

    // Admin & Supabase Sync Views (Protected - Only for Admin)
    if (activeView === 'admin_api_key' || activeView === 'admin_gemini_key') {
      if (currentUser.role !== 'admin') {
        return <DashboardHomeView currentUser={currentUser} onNavigate={setActiveView} onOpenSchoolProfile={() => setShowSchoolModal(true)} theme={theme} />;
      }
      return <AdminDashboardView initialSubTab="api_key" />;
    }
    if (activeView === 'admin_tokens') {
      if (currentUser.role !== 'admin') {
        return <DashboardHomeView currentUser={currentUser} onNavigate={setActiveView} onOpenSchoolProfile={() => setShowSchoolModal(true)} theme={theme} />;
      }
      return <AdminDashboardView initialSubTab="tokens" />;
    }
    if (activeView === 'admin_dashboard') {
      if (currentUser.role !== 'admin') {
        return <DashboardHomeView currentUser={currentUser} onNavigate={setActiveView} onOpenSchoolProfile={() => setShowSchoolModal(true)} theme={theme} />;
      }
      return <AdminDashboardView initialSubTab="dashboard" />;
    }
    if (activeView === 'admin_access') {
      if (currentUser.role !== 'admin') {
        return <DashboardHomeView currentUser={currentUser} onNavigate={setActiveView} onOpenSchoolProfile={() => setShowSchoolModal(true)} theme={theme} />;
      }
      return <AdminDashboardView initialSubTab="access" />;
    }
    if (activeView === 'admin_sync' || activeView === 'supabase_sync') {
      if (currentUser.role !== 'admin') {
        return <DashboardHomeView currentUser={currentUser} onNavigate={setActiveView} onOpenSchoolProfile={() => setShowSchoolModal(true)} theme={theme} />;
      }
      return <SupabaseSyncView />;
    }

    if (activeView === 'saran') {
      return <SaranView currentUser={currentUser} />;
    }

    return <DashboardHomeView currentUser={currentUser} onNavigate={setActiveView} onOpenSchoolProfile={() => setShowSchoolModal(true)} theme={theme} />;
  };

  // If not logged in or in auth screen, render only the Auth Page
  if (!currentUser || showAuthModal) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white font-sans">
        <AuthModal
          isOpen={true}
          onClose={() => {
            if (currentUser) setShowAuthModal(false);
          }}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white font-sans transition-colors duration-200 ${
        isLight
          ? 'bg-slate-100 text-slate-900'
          : isEmerald
          ? 'bg-slate-950 text-emerald-50'
          : isSlate
          ? 'bg-zinc-950 text-zinc-100'
          : 'bg-slate-950 text-slate-100'
      }`}
    >
      <div className="flex h-screen overflow-hidden">
        {/* Universal Menu Drawer (Triggered by 3-Line / Garis 3 Menu Button) */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            {/* Slide-out Menu Panel */}
            <div
              className={`relative w-84 max-w-[90vw] sm:w-96 flex flex-col z-10 shadow-2xl border-r ${
                isLight
                  ? 'bg-white border-slate-200'
                  : isEmerald
                  ? 'bg-emerald-950 border-emerald-900/80'
                  : isSlate
                  ? 'bg-zinc-900 border-zinc-800'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div
                className={`p-4 border-b flex items-center justify-between ${
                  isLight
                    ? 'bg-slate-100 border-slate-200'
                    : isEmerald
                    ? 'bg-emerald-950 border-emerald-900/60'
                    : isSlate
                    ? 'bg-zinc-950 border-zinc-800'
                    : 'bg-slate-950/90 border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                    <Menu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className={`font-black text-sm tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      DAFTAR MENU LENGKAP
                    </div>
                    <div className="text-[10px] text-slate-400">Administrasi Guru & AI Kurikulum</div>
                  </div>
                </div>
                <button
                  id="btn-close-menu"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                  title="Tutup Menu (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <Sidebar
                  activeView={activeView}
                  setActiveView={(view) => {
                    setActiveView(view);
                    setIsMobileSidebarOpen(false);
                    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                  }}
                  onSelectView={(view) => {
                    setActiveView(view);
                    setIsMobileSidebarOpen(false);
                    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                  }}
                  onNavigate={(view) => {
                    setActiveView(view);
                    setIsMobileSidebarOpen(false);
                    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                  }}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                  theme={theme}
                  onThemeChange={handleThemeChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main App Container (Full Width & Clean) */}
        <div
          className={`flex-1 flex flex-col min-w-0 overflow-hidden ${
            isLight ? 'bg-slate-100' : isSlate ? 'bg-zinc-950' : 'bg-slate-950'
          }`}
        >
          {/* Top Navigation Header with 3-Line Menu Button & Breadcrumb */}
          <header
            className={`h-16 px-4 lg:px-6 border-b backdrop-blur-xl flex items-center justify-between shrink-0 z-20 transition-colors ${
              isLight
                ? 'bg-white/90 border-slate-200 shadow-sm'
                : isEmerald
                ? 'bg-emerald-950/90 border-emerald-900/60'
                : isSlate
                ? 'bg-zinc-900/90 border-zinc-800'
                : 'bg-slate-900/90 border-slate-800/80'
            }`}
          >
            {/* Left Header Section */}
            <div className="flex items-center space-x-3">
              {/* Tombol Garis 3 / Daftar Menu */}
              <button
                id="btn-open-menu-garis-3"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition active:scale-95 group"
                title="Buka Daftar Menu Lengkap"
              >
                <Menu className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-300" />
                <span className="tracking-wide hidden sm:inline">Daftar Menu</span>
              </button>

              {/* Breadcrumb Info Pill */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-2xl bg-slate-950/40 border border-slate-800/60 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {currentViewInfo.category}
                </span>
                <span className="text-slate-500 font-bold">/</span>
                <span className={`font-black truncate max-w-[180px] lg:max-w-xs ${isLight ? 'text-slate-800' : 'text-white'}`}>
                  {currentViewInfo.label}
                </span>
              </div>
            </div>

            {/* Right Header Section Actions */}
            <div className="flex items-center space-x-2 sm:space-x-2.5">
              {/* Indikator Status Offline & PWA Sync */}
              <OfflineSyncIndicator compact={true} />

              {/* AI Token Quota & Subscription Status Badge Pill */}
              <button
                id="btn-ai-token-quota"
                onClick={() => setShowTokenModal(true)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl text-xs font-black border transition shadow-sm active:scale-95 ${
                  tokenQuota.isAdmin
                    ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-indigo-500/20 text-amber-300 border-amber-500/40 hover:border-amber-300'
                    : tokenQuota.isExpired
                    ? 'bg-rose-500/25 text-rose-200 border-rose-500/60 hover:bg-rose-500/40 animate-pulse'
                    : tokenQuota.isExpiringSoon
                    ? 'bg-amber-500/25 text-amber-200 border-amber-500/50 hover:bg-amber-500/40 animate-pulse'
                    : tokenQuota.isExhausted
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 hover:bg-rose-500/30 animate-pulse'
                    : tokenQuota.monthlyRemaining <= 5
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                    : isLight
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                    : 'bg-indigo-950/60 text-indigo-300 border-indigo-500/40 hover:bg-indigo-900/60'
                }`}
                title={`Kuota AI Bulanan: ${
                  tokenQuota.isAdmin
                    ? 'Super Admin (Unlimited)'
                    : `${tokenQuota.monthlyRemaining} sisa dari ${tokenQuota.totalAllowed} generate/bulan (~${tokenQuota.monthlyTokensRemaining.toLocaleString('id-ID')} token). Reset setiap tgl ${tokenQuota.billingCycleDay}. Masa aktif 1 thn s/d ${tokenQuota.subscriptionExpiryDate}.`
                }. Klik untuk detail & voucher.`}
              >
                <Sparkles
                  className={`w-3.5 h-3.5 ${
                    tokenQuota.isAdmin
                      ? 'text-amber-400 animate-spin-slow'
                      : tokenQuota.isExpired || tokenQuota.isExhausted
                      ? 'text-rose-400'
                      : tokenQuota.isExpiringSoon
                      ? 'text-amber-400'
                      : 'text-indigo-400'
                  }`}
                />
                <span className="font-mono text-[11px]">
                  {tokenQuota.isAdmin
                    ? 'AI: ∞ Admin'
                    : tokenQuota.isExpired
                    ? 'Akses Berakhir'
                    : tokenQuota.isExpiringSoon
                    ? `AI: ${tokenQuota.monthlyRemaining}/${tokenQuota.totalAllowed} (${tokenQuota.daysUntilExpiry}h)`
                    : `AI: ${tokenQuota.monthlyRemaining}/${tokenQuota.totalAllowed}`}
                </span>
              </button>

              {/* Tombol Pasang APP (PWA Android / PC / iOS) */}
              <button
                id="header-btn-install-app"
                type="button"
                onClick={promptInstallPwa}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl text-xs font-black border transition shadow-sm active:scale-95 ${
                  isPwaInstalled
                    ? isLight
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                    : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white border-transparent shadow-indigo-600/30'
                }`}
                title={
                  isPwaInstalled
                    ? 'Aplikasi PWA Sudah Terpasang di Perangkat'
                    : 'Pasang Aplikasi AGK (PWA) di HP / Laptop agar bisa dibuka langsung dan bekerja offline'
                }
              >
                <Download className="w-3.5 h-3.5" />
                <span className="text-[11px] tracking-tight">
                  {isPwaInstalled ? 'App Terpasang' : 'Pasang APP'}
                </span>
              </button>

              {/* School Profile Setup Shortcut */}
              <button
                onClick={() => setShowSchoolModal(true)}
                className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold border transition ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:bg-slate-700'
                }`}
                title="Atur Data Kop Surat & Pejabat Sekolah"
              >
                <School className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px]">Kop Sekolah</span>
              </button>

              {/* Notifications Popover */}
              <div className="relative">
                <button
                  onClick={() => setShowNotificationPopover(!showNotificationPopover)}
                  className={`relative p-2 rounded-2xl transition border ${
                    isLight
                      ? 'text-slate-600 hover:text-slate-900 bg-slate-100 border-slate-200'
                      : 'text-slate-300 hover:text-white bg-slate-800/80 border-slate-700/80'
                  }`}
                  title="Notifikasi Real-time"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center ring-2 ring-slate-950 animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Popover Dropdown */}
                {showNotificationPopover && (
                  <div
                    className={`absolute right-0 mt-2 w-80 sm:w-96 border rounded-3xl shadow-2xl z-50 overflow-hidden text-xs backdrop-blur-xl ${
                      isLight ? 'bg-white/95 border-slate-200' : 'bg-slate-900/95 border-slate-800'
                    }`}
                  >
                    <div
                      className={`p-3.5 border-b flex items-center justify-between ${
                        isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <span className={`font-extrabold flex items-center ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <Bell className="w-4 h-4 mr-1.5 text-indigo-400" />
                        Notifikasi Real-time & Audit
                      </span>
                      <button
                        onClick={handleClearNotifications}
                        className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center font-bold"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Bersihkan
                      </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-800 custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-xs">
                          Tidak ada notifikasi baru.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="p-3 hover:bg-slate-800/40 transition space-y-1">
                            <div className="flex items-center justify-between">
                              <span className={`font-bold text-[11px] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                {n.title}
                              </span>
                              <span className="text-[9px] text-slate-500">{n.timestamp}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Badge & Logout */}
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-700/60">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-teal-400 text-white font-black flex items-center justify-center text-xs shadow-md">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden xl:block text-left">
                    <div
                      className={`text-xs font-bold leading-tight truncate max-w-[110px] ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {currentUser.name}
                    </div>
                    <div className="text-[9px] text-emerald-400 font-extrabold uppercase">
                      {currentUser.role === 'admin' ? 'Super Admin' : 'Guru Client'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-2xl text-slate-400 hover:text-rose-300 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition"
                  title="Keluar / Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          {/* Content Body */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
              <ErrorBoundary fallbackTitle="Kendala Memuat Halaman Menu" onReset={() => setActiveView('dashboard')}>
                {renderActiveView()}
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </div>

      {/* School Profile Setup Modal */}
      <SchoolProfileModal
        isOpen={showSchoolModal}
        onClose={() => setShowSchoolModal(false)}
        onSaved={() => setSchoolProfile(StorageService.getSchoolProfile())}
      />

      {/* AI Token Quota & Voucher Modal */}
      <TokenQuotaModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        currentUser={currentUser}
        onTokenUpdated={() => {
          const user = StorageService.getCurrentUser();
          setTokenQuota(StorageService.getTokenQuotaStatus(user));
        }}
        onNavigateToAdminTokens={() => {
          setShowTokenModal(false);
          setActiveView('admin_tokens');
        }}
      />
    </div>
  );
}
