import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  UploadCloud,
  Database,
  FileSpreadsheet,
  FileText,
  Printer,
  Sparkles,
  Search,
  Key,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Activity,
  UserCheck,
  UserX,
  FileCheck,
  Trash2,
  Gift,
  Zap,
  Copy,
  PlusCircle,
  RotateCcw,
  Edit3,
  Award,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Settings,
  Sliders,
  Save,
  Check,
  ToggleLeft,
  ToggleRight,
  DatabaseZap,
  Globe,
  HardDrive,
  MessageSquare,
  Cpu,
} from 'lucide-react';
import { UserAccount, AccessLog, UserNotification, TokenVoucher, AdminSystemSettings } from '../types';
import { StorageService, DEFAULT_ADMIN } from '../lib/storage';
import { SupabaseService } from '../lib/supabase';
import { ExportService } from '../lib/exportUtils';
import { SupabaseSyncView } from './SupabaseSyncView';
import { CPUploaderAndAnalyzer } from '../components/CPUploaderAndAnalyzer';
import { AdminApiKeyManager } from '../components/AdminApiKeyManager';

interface AdminDashboardViewProps {
  initialSubTab?: 'dashboard' | 'tokens' | 'access' | 'sync' | 'api_key' | 'settings';
  onNavigate?: (tab: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  initialSubTab = 'dashboard',
  onNavigate,
}) => {
  const [subTab, setSubTab] = useState<'dashboard' | 'tokens' | 'access' | 'sync' | 'api_key' | 'settings'>(initialSubTab);
  const [users, setUsers] = useState<UserAccount[]>(() => StorageService.getUsers());
  const [logs, setLogs] = useState<AccessLog[]>(() => StorageService.getAccessLogs());
  const [notifications, setNotifications] = useState<UserNotification[]>(() => StorageService.getNotifications());
  const [tokenVouchers, setTokenVouchers] = useState<TokenVoucher[]>(() => StorageService.getTokenVouchers());
  const [adminSettings, setAdminSettings] = useState<AdminSystemSettings>(() => StorageService.getAdminSettings());
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string>(() => new Date().toLocaleTimeString('id-ID'));
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const handleUpdateSetting = <K extends keyof AdminSystemSettings>(key: K, value: AdminSystemSettings[K]) => {
    setIsAutoSaving(true);
    const updated = { ...adminSettings, [key]: value };
    setAdminSettings(updated);
    StorageService.saveAdminSettings(updated);
    setLastSavedTimestamp(new Date().toLocaleTimeString('id-ID'));
    setTimeout(() => setIsAutoSaving(false), 400);
  };

  // Token Management state
  const [newVoucherCode, setNewVoucherCode] = useState('');
  const [newVoucherClicks, setNewVoucherClicks] = useState(20);
  const [newVoucherDesc, setNewVoucherDesc] = useState('');
  const [tokenActionMsg, setTokenActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedVoucher, setCopiedVoucher] = useState<string | null>(null);

  // CP Upload state
  const [cpFileName, setCpFileName] = useState('');
  const [cpText, setCpText] = useState('');
  const [cpLevel, setCpLevel] = useState('SMA');
  const [cpSubject, setCpSubject] = useState('Bahasa Indonesia');
  const [isAnalyzingCP, setIsAnalyzingCP] = useState(false);
  const [cpAnalysisResult, setCpAnalysisResult] = useState<string>('');

  // Stats calculation
  const totalUsers = users.length;
  const pendingRequests = users.filter((u) => u.status === 'pending');
  const approvedClients = users.filter((u) => u.status === 'approved');
  const totalLogs = logs.length;

  const handleApproveUser = (user: UserAccount) => {
    const authCode = `AGK-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`;
    const now = new Date();
    const approvalDate = now.toISOString().replace('T', ' ').substring(0, 16);
    const startDateStr = now.toISOString().split('T')[0];
    const expDate = new Date(now);
    expDate.setFullYear(expDate.getFullYear() + 1);
    const expiryDateStr = expDate.toISOString().split('T')[0];
    const billingDay = now.getDate();

    const updatedUser: UserAccount = {
      ...user,
      status: 'approved',
      approvalDate,
      approvedBy: DEFAULT_ADMIN.email,
      authCode,
      subscriptionStartDate: startDateStr,
      subscriptionExpiryDate: expiryDateStr,
      subscriptionStatus: 'active',
      paymentStatus: 'paid',
      billingCycleDay: billingDay,
      monthlyAIClicks: 0,
      monthlyAILimit: 35,
      monthlyTokensUsed: 0,
      monthlyTokensLimit: 500000,
      lastMonthlyResetDate: startDateStr,
    };

    const updated = users.map((u) => (u.id === user.id ? updatedUser : u));
    setUsers(updated);
    StorageService.saveUsers(updated);

    // Audit log
    StorageService.addAccessLog({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      action: 'Pemberian Izin Akses (1 Tahun) oleh Admin',
      details: `Admin ${DEFAULT_ADMIN.name} menyetujui akun ${user.name} (${user.email}). Masa aktif 1 tahun (Jatuh tempo: ${expiryDateStr}). Kuota bulanan: 35x generate (500k token), reset setiap tgl ${billingDay}. Kode auth: ${authCode}.`,
      status: 'success',
    });

    // Real-time Notification
    StorageService.addNotification({
      title: 'Akses Disetujui (1 Tahun)',
      message: `Akun guru ${user.name} telah disetujui untuk akses 1 tahun hingga ${expiryDateStr} (Kuota: 35 generate/bulan, reset tgl ${billingDay}).`,
      type: 'access_approved',
    });
    setNotifications(StorageService.getNotifications());
  };

  const handleRejectUser = (user: UserAccount) => {
    const updatedUser: UserAccount = {
      ...user,
      status: 'rejected',
    };

    const updated = users.map((u) => (u.id === user.id ? updatedUser : u));
    setUsers(updated);
    StorageService.saveUsers(updated);

    StorageService.addAccessLog({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      action: 'Penolakan Izin Akses oleh Admin',
      details: `Admin ${DEFAULT_ADMIN.name} menolak permohonan akses dari ${user.name} (${user.email}).`,
      status: 'warning',
    });
  };

  const handleDeleteUser = async (user: UserAccount) => {
    if (!window.confirm(`Hapus akun ${user.name} (${user.email}) secara permanen?`)) return;

    StorageService.deleteUser(user.id);
    setUsers(StorageService.getUsers());

    // Also delete from Supabase if connected
    try {
      await SupabaseService.deleteUserFromSupabase(user.email);
    } catch {}

    StorageService.addAccessLog({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      action: 'Penghapusan Akun oleh Admin',
      details: `Admin ${DEFAULT_ADMIN.name} menghapus akun ${user.name} (${user.email}).`,
      status: 'warning',
    });
  };

  const handlePurgeUus = async () => {
    const deletedLocal = StorageService.purgeUserByQuery('uus');
    setUsers(StorageService.getUsers());
    try {
      await SupabaseService.purgeUusFromSupabase();
    } catch {}
    alert(`Pembersihan data "Uus" selesai (${deletedLocal} akun lokal dihapus & sinkronisasi hapus Supabase dijalankan).`);
  };

  // Upload CP File Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCpFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCpText(text || `Isi dokumen Capaian Pembelajaran dari file: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleAnalyzeCPWithAI = async () => {
    if (!cpText) {
      alert('Silakan pilih atau ketik isi Capaian Pembelajaran (CP).');
      return;
    }

    setIsAnalyzingCP(true);
    setCpAnalysisResult('');

    try {
      const res = await fetch('/api/ai/analyze-cp-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: cpFileName || 'Capaian_Pembelajaran_2024.txt',
          fileContent: cpText,
          level: cpLevel,
          subject: cpSubject,
        }),
      });

      const data = await res.json();
      setCpAnalysisResult(data.analysis || 'Analisis berhasil dilakukan.');

      StorageService.addAccessLog({
        userId: DEFAULT_ADMIN.id,
        userEmail: DEFAULT_ADMIN.email,
        userName: DEFAULT_ADMIN.name,
        userRole: 'admin',
        action: 'AI Analisis CP Master Baru',
        details: `Melakukan ekstraksi elemen & TP dari berkas ${cpFileName || 'CP'} (${cpSubject} ${cpLevel}).`,
        status: 'success',
      });
    } catch (err: any) {
      setCpAnalysisResult('Gagal menganalisis berkas CP. Pastikan format teks sesuai.');
    } finally {
      setIsAnalyzingCP(false);
    }
  };

  // Export audit logs
  const handleExportLogsExcel = () => {
    const data = logs.map((l, i) => ({
      No: i + 1,
      Waktu: l.timestamp,
      'Nama Pengguna': l.userName,
      'Email Akun': l.userEmail,
      Peran: l.userRole,
      Aktivitas: l.action,
      Rincian: l.details,
      Status: l.status,
      'IP Address': l.ipAddress || '127.0.0.1',
    }));
    ExportService.exportToExcel(data, `Log_Audit_Akses_AGK_${new Date().toISOString().substring(0, 10)}`);
  };

  const handleExportLogsWord = () => {
    const schoolProfile = StorageService.getSchoolProfile();
    let rows = logs
      .map(
        (l, i) => `
      <tr>
        <td style="text-align:center;">${i + 1}</td>
        <td><small>${l.timestamp}</small></td>
        <td><strong>${l.userName}</strong><br><small>${l.userEmail}</small></td>
        <td>${l.action}</td>
        <td><small>${l.details}</small></td>
        <td style="text-align:center;"><strong>${l.status.toUpperCase()}</strong></td>
      </tr>
    `
      )
      .join('');

    const bodyHtml = `
      <div style="margin-bottom:15px;">
        <strong>LAPORAN AUDIT RIWAYAT AKSES PENGGUNA REAL-TIME</strong><br>
        Dicetak oleh Administrator: ${DEFAULT_ADMIN.name} (${DEFAULT_ADMIN.email})
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:30px;">No</th>
            <th style="width:110px;">Waktu Akses</th>
            <th style="width:130px;">Pengguna & Akun</th>
            <th>Tindakan / Aktivitas</th>
            <th>Rincian Log</th>
            <th style="width:60px;">Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    ExportService.exportToWord('RIWAYAT AKSES & LOG AUDIT SISTEM', bodyHtml, schoolProfile, 'Log_Audit_Sistem');
  };

  const handlePrintLogsPdf = () => {
    const schoolProfile = StorageService.getSchoolProfile();
    let rows = logs
      .map(
        (l, i) => `
      <tr>
        <td style="text-align:center;">${i + 1}</td>
        <td><small>${l.timestamp}</small></td>
        <td><strong>${l.userName}</strong></td>
        <td>${l.action}</td>
        <td><small>${l.details}</small></td>
        <td style="text-align:center;">${l.status}</td>
      </tr>
    `
      )
      .join('');

    const bodyHtml = `
      <div style="margin-bottom:10px; font-size:9pt;">
        <strong>Audit Trail & Log Akses Real-Time Administrator</strong> (Total ${logs.length} Aktivitas)
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:30px;">No</th>
            <th>Waktu</th>
            <th>Pengguna</th>
            <th>Aktivitas</th>
            <th>Rincian</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    ExportService.printPdfPreview('LOG AUDIT SISTEM', bodyHtml, schoolProfile);
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleResetUserQuota = (userId: string, userName: string) => {
    StorageService.resetUserMonthlyTokens(userId);
    setUsers(StorageService.getUsers());
    setTokenActionMsg({ text: `Kuota generate bulanan ${userName} berhasil direset ke 0 pemakaian.`, type: 'success' });
  };

  const handleAddTokens = (userId: string, userName: string, amount: number) => {
    StorageService.addUserExtraTokens(userId, amount);
    setUsers(StorageService.getUsers());
    setTokenActionMsg({ text: `Berhasil menambahkan +${amount} token ekstra untuk ${userName}.`, type: 'success' });
  };

  const handleSetLimit = (userId: string, userName: string, currentLimit: number = 35) => {
    const input = prompt(`Masukkan batas kuota generate AI bulanan baru untuk ${userName} (Default 35 kali / 500.000 token):`, currentLimit.toString());
    if (input !== null) {
      const parsed = parseInt(input, 10);
      if (!isNaN(parsed) && parsed >= 1) {
        StorageService.setUserMonthlyLimit(userId, parsed);
        setUsers(StorageService.getUsers());
        setTokenActionMsg({ text: `Batas kuota bulanan ${userName} diatur menjadi ${parsed} kali generate/bulan.`, type: 'success' });
      }
    }
  };

  const handleRenewUserSubscription = (userId: string, userName: string) => {
    const confirmRenew = window.confirm(`Perpanjang masa aktif akun 1 tahun untuk guru ${userName} (telah verifikasi pembayaran/berlangganan)?`);
    if (!confirmRenew) return;

    const res = StorageService.renewUserSubscription(userId, 1, 'Perpanjangan langganan 1 tahun via Admin Dashboard');
    setUsers(StorageService.getUsers());
    if (res.success) {
      setTokenActionMsg({ text: res.message, type: 'success' });
      setNotifications(StorageService.getNotifications());
    } else {
      setTokenActionMsg({ text: res.message, type: 'error' });
    }
  };

  const handleCreateVoucher = () => {
    if (!newVoucherCode.trim()) {
      setTokenActionMsg({ text: 'Kode voucher tidak boleh kosong.', type: 'error' });
      return;
    }
    try {
      const newV = StorageService.createTokenVoucher(
        newVoucherCode.trim().toUpperCase(),
        newVoucherClicks || 20,
        newVoucherDesc.trim() || 'Voucher Bonus AI oleh Admin'
      );
      setTokenVouchers(StorageService.getTokenVouchers());
      setNewVoucherCode('');
      setNewVoucherDesc('');
      setTokenActionMsg({
        text: `Voucher "${newV.code}" (+${newV.extraClicks} klik) berhasil diterbitkan!`,
        type: 'success',
      });
    } catch (err: any) {
      setTokenActionMsg({ text: err.message || 'Gagal membuat voucher.', type: 'error' });
    }
  };

  const handleDeleteVoucher = (voucherId: string) => {
    if (confirm('Hapus voucher ini?')) {
      StorageService.deleteTokenVoucher(voucherId);
      setTokenVouchers(StorageService.getTokenVouchers());
      setTokenActionMsg({ text: 'Voucher berhasil dihapus.', type: 'success' });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedVoucher(code);
    setTimeout(() => setCopiedVoucher(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white tracking-tight">Panel Administrator & Keamanan</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelola otorisasi akun guru client, pantau riwayat audit log real-time, manajemen token AI, dan sinkronisasi database.
            </p>
          </div>
        </div>

        {/* SubTab Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-[11px] font-bold">
            <CheckCircle2 className={`w-3.5 h-3.5 text-emerald-400 ${isAutoSaving ? 'animate-spin' : ''}`} />
            <span>{isAutoSaving ? 'Menyimpan Otomatis...' : `Tersimpan Otomatis (${lastSavedTimestamp})`}</span>
          </div>

          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs flex-wrap gap-1">
            <button
              onClick={() => setSubTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                subTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Log Audit ({logs.length})
            </button>
            <button
              onClick={() => setSubTab('tokens')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                subTab === 'tokens' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Token & Kuota AI</span>
            </button>
            <button
              onClick={() => setSubTab('access')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1 ${
                subTab === 'access' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Persetujuan Client</span>
              {pendingRequests.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[9px]">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setSubTab('settings')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                subTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pengaturan & Auto-Save</span>
            </button>
            <button
              onClick={() => setSubTab('api_key')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                subTab === 'api_key' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-violet-400" />
              <span>API Key</span>
            </button>
            <button
              onClick={() => setSubTab('sync')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                subTab === 'sync' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Supabase DB
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
            <Users className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Total Pengguna
          </div>
          <div className="text-xl font-black text-white mt-1">{totalUsers} Akun</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Admin: 1 | Guru: {totalUsers - 1}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1" /> Menunggu Otorisasi
          </div>
          <div className="text-xl font-black text-amber-400 mt-1">{pendingRequests.length} Permintaan</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Perlu persetujuan admin</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center">
            <UserCheck className="w-3.5 h-3.5 mr-1" /> Client Aktif Permanen
          </div>
          <div className="text-xl font-black text-emerald-400 mt-1">{approvedClients.length} Terverifikasi</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Bebas login tanpa izin ulang</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center">
            <Activity className="w-3.5 h-3.5 mr-1" /> Total Riwayat Akses
          </div>
          <div className="text-xl font-black text-blue-400 mt-1">{totalLogs} Log</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Audit trail terenkripsi</div>
        </div>
      </div>

      {/* SUBTAB 1: AUDIT LOGS */}
      {subTab === 'dashboard' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama, email, atau aktivitas log..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportLogsExcel}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Excel</span>
              </button>
              <button
                onClick={handleExportLogsWord}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 transition"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Word</span>
              </button>
              <button
                onClick={handlePrintLogsPdf}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 transition"
              >
                <Printer className="w-3.5 h-3.5 text-rose-400" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">No</th>
                  <th className="py-3 px-3 w-36">Waktu Kejadian</th>
                  <th className="py-3 px-3">Pengguna & Peran</th>
                  <th className="py-3 px-3">Tindakan / Event</th>
                  <th className="py-3 px-3">Rincian Deskripsi</th>
                  <th className="py-3 px-3 w-20 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Tidak ada catatan log akses yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((l, idx) => (
                    <tr key={l.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {l.timestamp}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-white">{l.userName}</div>
                        <div className="text-[10px] text-slate-400">{l.userEmail} ({l.userRole})</div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-indigo-300">{l.action}</td>
                      <td className="py-2.5 px-3 text-slate-300 text-[11px]">{l.details}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            l.status === 'success'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : l.status === 'warning'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB TOKENS: MANAJEMEN TOKEN & KUOTA AI */}
      {subTab === 'tokens' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Token Stats Header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-3.5">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Kuota Bulanan Standar</span>
                <div className="text-xl font-black text-white font-mono">35x Generate</div>
                <span className="text-[10px] text-slate-500">500.000 Token / Akun Guru</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-3.5">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Siklus Reset Otomatis</span>
                <div className="text-lg font-black text-emerald-400 font-mono">Tgl Izin Akses</div>
                <span className="text-[10px] text-slate-500">Reset otomatis tiap bulan</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-3.5">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Masa Aktif Akses</span>
                <div className="text-xl font-black text-amber-400 font-mono">1 Tahun</div>
                <span className="text-[10px] text-slate-500">Peringatan 7 hari sebelum tempo</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-3.5">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Akun Terdaftar</span>
                <div className="text-xl font-black text-purple-400 font-mono">{users.length} Akun</div>
                <span className="text-[10px] text-slate-500">Admin + Guru Terdaftar</span>
              </div>
            </div>
          </div>

          {/* Action Message Banner */}
          {tokenActionMsg && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-lg ${
                tokenActionMsg.type === 'success'
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-500/20 border border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                {tokenActionMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{tokenActionMsg.text}</span>
              </div>
              <button
                onClick={() => setTokenActionMsg(null)}
                className="text-[10px] uppercase tracking-wider text-slate-400 hover:text-white"
              >
                Tutup
              </button>
            </div>
          )}

          {/* Table 1: Quota Management per User */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Daftar & Kontrol Kuota Token AI dan Masa Aktif 1 Tahun Setiap Guru
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Batas 35x generate (500k token/bulan), reset berkala per tanggal izin admin, dan perpanjangan lisensi 1 tahun.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nama / email guru..."
                    className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">No</th>
                    <th className="py-3 px-3">Nama Guru & Email</th>
                    <th className="py-3 px-3">Masa Aktif (1 Thn)</th>
                    <th className="py-3 px-3 text-center">Kuota Bulan Ini</th>
                    <th className="py-3 px-3 text-center">Sisa Kuota</th>
                    <th className="py-3 px-3 text-center">Reset Tiap</th>
                    <th className="py-3 px-3 text-center">Bonus</th>
                    <th className="py-3 px-3 text-center">Aksi Manajemen Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {users
                    .filter(
                      (u) =>
                        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((u, idx) => {
                      const quota = StorageService.getTokenQuotaStatus(u);
                      const isCurrentUserAdmin = u.role === 'admin' || u.email === DEFAULT_ADMIN.email;

                      return (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrentUserAdmin && (
                                <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 rounded text-[9px] font-bold">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">{u.email}</div>
                          </td>
                          <td className="py-3 px-3">
                            {isCurrentUserAdmin ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                                Permanen (Admin)
                              </span>
                            ) : (
                              <div className="space-y-0.5">
                                <div className="flex items-center space-x-1.5">
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                      quota.isExpired
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                        : quota.isExpiringSoon
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                                        : 'bg-indigo-500/20 text-indigo-300'
                                    }`}
                                  >
                                    {quota.isExpired
                                      ? 'Kedaluwarsa'
                                      : quota.isExpiringSoon
                                      ? `${quota.daysUntilExpiry} hr lagi`
                                      : 'Aktif'}
                                  </span>
                                  <span className="text-[10px] text-slate-300 font-mono">
                                    s/d {quota.subscriptionExpiryDate || '-'}
                                  </span>
                                </div>
                                <div className="text-[9px] text-slate-500">
                                  Mulai: {quota.subscriptionStartDate || '-'}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center font-mono">
                            {isCurrentUserAdmin ? (
                              <span className="text-emerald-400 font-bold">Tanpa Batas (∞)</span>
                            ) : (
                              <div>
                                <span className="font-bold text-white">
                                  {quota.monthlyUsed} / {quota.totalAllowed}x
                                </span>
                                <div className="text-[9px] text-slate-400">
                                  ~{(quota.monthlyTokensUsed || 0).toLocaleString('id-ID')} / {(quota.monthlyTokensLimit || 500000).toLocaleString('id-ID')} tk
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center font-mono">
                            {isCurrentUserAdmin ? (
                              <span className="text-emerald-400 font-bold">Unlimited</span>
                            ) : (
                              <span
                                className={`px-2 py-0.5 rounded font-bold ${
                                  quota.monthlyRemaining > 5
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : quota.monthlyRemaining > 0
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-rose-500/20 text-rose-300'
                                }`}
                              >
                                {quota.monthlyRemaining}x Generate
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-indigo-300 text-[11px]">
                            {isCurrentUserAdmin ? '-' : `Tgl ${quota.billingCycleDay || 1}`}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-amber-300 font-bold">
                            {u.extraTokens && u.extraTokens > 0 ? `+${u.extraTokens}` : '-'}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center space-x-1.5 flex-wrap gap-y-1">
                              {!isCurrentUserAdmin && (
                                <button
                                  onClick={() => handleRenewUserSubscription(u.id, u.name)}
                                  title="Perpanjang Masa Aktif 1 Tahun (Pembayaran/Langganan)"
                                  className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-[10px] font-bold flex items-center space-x-1 border border-emerald-500/40 transition"
                                >
                                  <Calendar className="w-3 h-3" />
                                  <span>+1 Thn</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleResetUserQuota(u.id, u.name)}
                                title="Reset Kuota Generate Bulan Ini ke 0"
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold flex items-center space-x-1 border border-slate-700 transition"
                              >
                                <RotateCcw className="w-3 h-3 text-amber-400" />
                                <span>Reset (0)</span>
                              </button>

                              <button
                                onClick={() => handleAddTokens(u.id, u.name, 10)}
                                title="Tambah +10 Token Ekstra"
                                className="px-2 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-[10px] font-bold flex items-center space-x-1 transition"
                              >
                                <PlusCircle className="w-3 h-3" />
                                <span>+10</span>
                              </button>

                              <button
                                onClick={() => handleSetLimit(u.id, u.name, u.monthlyAILimit || 35)}
                                title="Ubah Batas Kuota Bulanan"
                                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Token Voucher Generator & Inventory */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Voucher Form */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-400" />
                  Buat Voucher Token AI Baru
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generate voucher kode untuk dibagikan kepada guru atau peserta pelatihan.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Kode Voucher (Unik)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newVoucherCode}
                      onChange={(e) => setNewVoucherCode(e.target.value.toUpperCase())}
                      placeholder="Contoh: PELATIHAN-AI-50"
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono uppercase text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const randomCode = `GURU-${Math.floor(1000 + Math.random() * 9000)}-${newVoucherClicks}`;
                        setNewVoucherCode(randomCode);
                      }}
                      className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-bold"
                    >
                      Acak
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Jumlah Bonus Klik AI
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 20, 50, 100].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setNewVoucherClicks(count)}
                        className={`py-1.5 rounded-lg text-xs font-mono font-bold transition border ${
                          newVoucherClicks === count
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        +{count}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Deskripsi / Catatan Acara
                  </label>
                  <input
                    type="text"
                    value={newVoucherDesc}
                    onChange={(e) => setNewVoucherDesc(e.target.value)}
                    placeholder="Contoh: Peserta Pelatihan Guru Hebat 2025"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCreateVoucher}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Terbitkan Voucher Token</span>
                </button>
              </div>
            </div>

            {/* Voucher List & Status */}
            <div className="lg:col-span-2 bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-400" />
                    Daftar Inventaris Kode Voucher
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Total {tokenVouchers.length} voucher terdaftar dalam sistem
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  {tokenVouchers.filter((v) => !v.isRedeemed).length} Tersedia
                </span>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                {tokenVouchers.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    Belum ada voucher token yang diterbitkan.
                  </div>
                ) : (
                  tokenVouchers.map((v) => (
                    <div
                      key={v.id}
                      className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition ${
                        v.isRedeemed
                          ? 'bg-slate-950/40 border-slate-800/80 opacity-70'
                          : 'bg-slate-950 border-slate-700/80 hover:border-indigo-500/50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-sm text-indigo-300 tracking-wide">
                            {v.code}
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded-full text-[10px] font-mono">
                            +{v.extraClicks} Klik
                          </span>
                          {v.isRedeemed ? (
                            <span className="px-2 py-0.5 bg-slate-800 text-slate-400 font-semibold rounded-full text-[10px]">
                              Sudah Diklaim
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-semibold rounded-full text-[10px]">
                              Aktif
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{v.description}</p>
                        {v.isRedeemed && (
                          <div className="text-[10px] text-slate-500">
                            Diklaim oleh <strong>{v.redeemedByName || v.redeemedByEmail}</strong> pada {v.redeemedAt}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-1.5 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => handleCopyCode(v.code)}
                          title="Salin Kode Voucher"
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold flex items-center space-x-1 transition"
                        >
                          {copiedVoucher === v.code ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteVoucher(v.id)}
                          title="Hapus Voucher"
                          className="p-1.5 bg-rose-950/30 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 rounded-lg border border-rose-800/40 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: CLIENT ACCESS PERMISSION */}
      {subTab === 'access' && (
        <div className="space-y-4">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center">
                  <Key className="w-4 h-4 mr-2 text-indigo-400" />
                  Permintaan Izin Akses Masuk Akun Client (Guru)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Client yang mendaftar harus disetujui oleh admin. Sekali disetujui, guru dapat login kapan pun tanpa meminta izin ulang.
                </p>
              </div>
              <button
                id="btn-admin-purge-uus"
                onClick={handlePurgeUus}
                className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition self-start shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Akun Uus</span>
              </button>
            </div>

            <div className="space-y-3">
              {users.filter((u) => u.role !== 'admin').length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Belum ada permohonan akses dari guru luar.
                </div>
              ) : (
                users
                  .filter((u) => u.role !== 'admin')
                  .map((u) => (
                    <div
                      key={u.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-xs">{u.name}</span>
                          <span className="text-slate-400 text-xs font-mono">({u.email})</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : u.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {u.status === 'approved'
                              ? 'Akses Disetujui'
                              : u.status === 'pending'
                              ? 'Menunggu Otorisasi'
                              : 'Ditolak'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Asal: <strong>{u.school || '-'}</strong> | Mapel: <strong>{u.subject || '-'}</strong> | Kode Tiket:{' '}
                          <span className="font-mono text-indigo-300">{u.authCode || '-'}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Diajukan: {u.requestDate || '-'} | Terakhir Login: {u.lastLogin || 'Belum pernah'}
                          {u.status === 'approved' && (
                            <span className="text-indigo-400 font-mono ml-2">
                              &bull; Aktif s/d: <strong>{u.subscriptionExpiryDate || '1 Tahun'}</strong> (Reset tgl {u.billingCycleDay || 1})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {u.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApproveUser(u)}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1 shadow-md shadow-emerald-600/30 transition"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Setujui (1 Thn / 35x Bulan)</span>
                            </button>
                            <button
                              onClick={() => handleRejectUser(u)}
                              className="px-3.5 py-1.5 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 font-bold text-xs flex items-center space-x-1 transition"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Tolak</span>
                            </button>
                          </>
                        ) : u.status === 'approved' ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleRenewUserSubscription(u.id, u.name)}
                              title="Perpanjang Masa Aktif 1 Tahun"
                              className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[11px] font-bold border border-indigo-500/40 flex items-center space-x-1 transition"
                            >
                              <Calendar className="w-3 h-3" />
                              <span>+1 Thn</span>
                            </button>
                            <span className="text-[11px] text-emerald-400 font-semibold flex items-center">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Aktif
                            </span>
                            <button
                              onClick={() => handleRejectUser(u)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-950 text-rose-400 text-[10px] font-bold border border-slate-700 transition"
                            >
                              Cabut
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApproveUser(u)}
                            className="px-3 py-1 rounded bg-slate-800 hover:bg-emerald-950 text-emerald-400 text-xs font-bold border border-slate-700 transition"
                          >
                            Buka Kembali
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteUser(u)}
                          title="Hapus Akun Pengguna"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-700 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: PENGATURAN SISTEM & AUTO-SAVE ADMIN */}
      {subTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Auto-Save Status Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-5 rounded-2xl border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <DatabaseZap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white">Pusat Pengaturan Admin & Auto-Save Terpadu</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Auto-Save Aktif</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Setiap perubahan parameter, nilai kuota, kebijakan otorisasi, dan preferensi modul otomatis disimpan ke sistem dan database.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="text-right hidden sm:block">
                <div className="text-[10px] text-slate-400">Sinkronisasi Terakhir:</div>
                <div className="text-xs font-mono font-bold text-emerald-400">{lastSavedTimestamp} WIB</div>
              </div>
              <button
                onClick={() => {
                  StorageService.saveAdminSettings(adminSettings);
                  setLastSavedTimestamp(new Date().toLocaleTimeString('id-ID'));
                  alert('✓ Seluruh pengaturan dan konfigurasi Admin berhasil disimpan dan diverifikasi!');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Semua</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Konfigurasi Kuota & Token AI Guru */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">Default Kuota & Batas AI Guru</h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Batas Default Generate AI Bulanan per Guru
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={adminSettings.defaultMonthlyQuota || 35}
                      onChange={(e) => handleUpdateSetting('defaultMonthlyQuota', Number(e.target.value) || 35)}
                      className="w-32 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-indigo-500"
                    />
                    <span className="text-slate-400">kali generate / bulan (Saran: 35x)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Batas Default Token Bulanan per Akun
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={50000}
                      step={50000}
                      value={adminSettings.defaultMonthlyTokenLimit || 500000}
                      onChange={(e) => handleUpdateSetting('defaultMonthlyTokenLimit', Number(e.target.value) || 500000)}
                      className="w-40 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-indigo-500"
                    />
                    <span className="text-slate-400">token / bulan (Standar: 500.000)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Durasi Default Masa Aktif Akun Baru
                  </label>
                  <select
                    value={adminSettings.defaultSubscriptionDurationYears || 1}
                    onChange={(e) => handleUpdateSetting('defaultSubscriptionDurationYears', Number(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value={1}>1 Tahun Penuh (12 Bulan)</option>
                    <option value={2}>2 Tahun (24 Bulan)</option>
                    <option value={3}>3 Tahun (36 Bulan)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Otorisasi & Pendaftaran Akun */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Kebijakan Otorisasi & Akses</h4>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <div className="font-semibold text-white">Auto-Approve Pendaftaran Guru Baru</div>
                    <div className="text-[11px] text-slate-400">
                      Otomatis aktifkan akun guru baru tanpa perlu persetujuan manual admin
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpdateSetting('autoApproveNewUsers', !adminSettings.autoApproveNewUsers)}
                    className={`p-1.5 rounded-xl transition ${
                      adminSettings.autoApproveNewUsers ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-500 bg-slate-800'
                    }`}
                  >
                    {adminSettings.autoApproveNewUsers ? (
                      <ToggleRight className="w-6 h-6" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <div className="font-semibold text-white">Audit Log & Rekam Jejak Aktivitas</div>
                    <div className="text-[11px] text-slate-400">
                      Catat setiap generate AI, ekspor dokumen, dan login guru ke riwayat audit
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpdateSetting('enableActivityLogging', !adminSettings.enableActivityLogging)}
                    className={`p-1.5 rounded-xl transition ${
                      adminSettings.enableActivityLogging ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-500 bg-slate-800'
                    }`}
                  >
                    {adminSettings.enableActivityLogging ? (
                      <ToggleRight className="w-6 h-6" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <div className="font-semibold text-white">Sinkronisasi Cloud Terpadu</div>
                    <div className="text-[11px] text-slate-400">
                      Sinkronkan data secara otomatis ke database Supabase & server
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpdateSetting('enableCloudSync', !adminSettings.enableCloudSync)}
                    className={`p-1.5 rounded-xl transition ${
                      adminSettings.enableCloudSync ? 'text-indigo-400 bg-indigo-500/20' : 'text-slate-500 bg-slate-800'
                    }`}
                  >
                    {adminSettings.enableCloudSync ? (
                      <ToggleRight className="w-6 h-6" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Mesin AI & Model Generator */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">Mesin AI & Standar Format Kurikulum</h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Model Utama Google AI Studio
                  </label>
                  <select
                    value={adminSettings.preferredModel || 'gemini-3.8-flash'}
                    onChange={(e) => handleUpdateSetting('preferredModel', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="gemini-3.8-flash">Gemini 3.8 Flash (Direkomendasikan - Paling Cepat & Presisi)</option>
                    <option value="gemini-3.7-flash">Gemini 3.7 Flash</option>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Standar Acuan Utama Format RPM (Rencana Pelaksanaan Modul)
                  </label>
                  <select
                    value={adminSettings.rpmDefaultFormat || 'rpm_deep_learning_master'}
                    onChange={(e) => handleUpdateSetting('rpmDefaultFormat', e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="rpm_deep_learning_master">Format Master RPM Deep Learning (Sintaks 6 Fase - Standar Utama)</option>
                    <option value="modul_sekolah">Format Modul Sekolah (3 Komponen Utama)</option>
                    <option value="lengkap">Format Standar Lengkap Permendikbud</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Framework Pembelajaran Aktif
                  </label>
                  <input
                    type="text"
                    value={adminSettings.deepLearningFrameworkVersion || 'Deep Learning (Mindful, Meaningful, Joyful)'}
                    onChange={(e) => handleUpdateSetting('deepLearningFrameworkVersion', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* 4. Broadcast Pengumuman Sistem */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <MessageSquare className="w-4 h-4 text-violet-400" />
                <h4 className="text-sm font-bold text-white">Broadcast Pesan Sistem ke Guru</h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Pesan Pemberitahuan Admin di Dashboard Guru
                  </label>
                  <textarea
                    rows={3}
                    value={adminSettings.systemBroadcastMessage || ''}
                    onChange={(e) => handleUpdateSetting('systemBroadcastMessage', e.target.value)}
                    placeholder="Contoh: Selamat datang di Tahun Ajaran 2025/2026! Silakan lengkapi perangkat RPM Deep Learning Anda..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Pesan ini akan otomatis tampil di beranda seluruh guru yang terdaftar.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Pengaturan diperbarui oleh:</span>
                  <span className="text-xs font-bold text-slate-300">{adminSettings.updatedBy || 'Super Admin'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: GOOGLE AI STUDIO API KEY MANAGEMENT */}
      {subTab === 'api_key' && (
        <div className="space-y-4">
          <AdminApiKeyManager />
        </div>
      )}

      {/* SUBTAB 4: SUPABASE DATABASE SYNC */}
      {subTab === 'sync' && (
        <div className="space-y-4">
          <SupabaseSyncView />
        </div>
      )}
    </div>
  );
};
