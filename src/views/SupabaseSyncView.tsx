import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Server,
  UploadCloud,
  DownloadCloud,
  Layers,
  Key,
  Globe,
  ExternalLink,
  ShieldCheck,
  Zap,
  Trash2,
} from 'lucide-react';
import { SupabaseService } from '../lib/supabase';
import { StorageService } from '../lib/storage';
import { SupabaseConfig } from '../types';

export const SupabaseSyncView: React.FC = () => {
  const [config, setConfig] = useState<SupabaseConfig>(() => SupabaseService.getConfig());
  const [urlInput, setUrlInput] = useState(config.url);
  const [keyInput, setKeyInput] = useState(config.apiKey);
  const [autoSyncInput, setAutoSyncInput] = useState(config.autoSync);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
    details?: Record<string, number>;
  } | null>(null);

  const [isCopied, setIsCopied] = useState(false);
  const [showSqlSchema, setShowSqlSchema] = useState(false);

  useEffect(() => {
    const current = SupabaseService.getConfig();
    setConfig(current);
    setUrlInput(current.url);
    setKeyInput(current.apiKey);
    setAutoSyncInput(current.autoSync);
  }, []);

  const handleSaveConfig = () => {
    const updated = SupabaseService.saveConfig({
      url: urlInput.trim(),
      apiKey: keyInput.trim(),
      autoSync: autoSyncInput,
    });
    setConfig(updated);
    setTestResult({
      success: true,
      message: 'Konfigurasi kredensial Supabase berhasil disimpan secara lokal.',
    });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await SupabaseService.testConnection(urlInput.trim(), keyInput.trim());
      setTestResult(result);
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e?.message || 'Gagal terhubung ke Supabase.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handlePushSync = async () => {
    // Save first
    SupabaseService.saveConfig({
      url: urlInput.trim(),
      apiKey: keyInput.trim(),
      autoSync: autoSyncInput,
    });

    setIsSyncing(true);
    setSyncResult(null);
    try {
      const result = await SupabaseService.pushAllToSupabase();
      setSyncResult(result);
      setConfig(SupabaseService.getConfig());
    } catch (e: any) {
      setSyncResult({
        success: false,
        message: e?.message || 'Sinkronisasi gagal.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const [isPurgingUus, setIsPurgingUus] = useState(false);
  const [purgeUusMsg, setPurgeUusMsg] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  const handlePurgeUus = async () => {
    setIsPurgingUus(true);
    setPurgeUusMsg(null);
    try {
      // 1. Purge from local
      const localCount = StorageService.purgeUserByQuery('uus');
      // 2. Purge from Supabase
      const sbResult = await SupabaseService.purgeUusFromSupabase();
      
      setPurgeUusMsg(
        `Berhasil! Data akun "Uus" telah dihapus dari sistem lokal (${localCount} akun dibersihkan) dan perintah hapus telah dikirim ke Supabase (${sbResult.message}).`
      );
    } catch (e: any) {
      setPurgeUusMsg(`Pembersihan: ${e?.message || 'Selesai dijalankan.'}`);
    } finally {
      setIsPurgingUus(false);
    }
  };

  const handleResetAllData = async () => {
    const confirmReset = window.confirm(
      'PERINGATAN: Apakah Anda yakin ingin mereset seluruh data aplikasi menjadi seperti aplikasi baru yang belum pernah digunakan?\n\nSemua data lokal (presensi, jadwal, agenda, jurnal, nilai, draft) akan dikosongkan.'
    );
    if (!confirmReset) return;

    setIsResetting(true);
    setResetMsg(null);
    try {
      // 1. Reset local storage
      StorageService.resetAllDataToFresh();
      // 2. Also clear remote Supabase data if configured
      const sbRes = await SupabaseService.resetSupabaseAllData();
      
      setResetMsg(
        `Sukses! Seluruh data aplikasi telah direset menjadi kondisi awal aplikasi baru (bersih). Status Supabase: ${sbRes.message}`
      );
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (e: any) {
      setResetMsg(`Reset lokal berhasil. Catatan: ${e?.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const sqlCode = SupabaseService.getSupabaseSQLSchema();

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Database className="w-48 h-48 text-emerald-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Sinkronisasi Database Cloud Terpusat</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Database className="w-6 h-6 text-emerald-400" />
              Integrasi Database Supabase (PostgreSQL)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Sinkronkan seluruh data administrasi guru—presensi siswa, jadwal, agenda, jurnal mengajar, penilaian otomatis harian/PTS/PAS, modul ajar AI, hingga akun guru secara aman dan real-time ke Supabase Cloud.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <div className="text-xs text-slate-400">
              Terakhir Disinkronkan:{' '}
              <strong className="text-emerald-400">{config.lastSyncedAt || 'Belum pernah'}</strong>
            </div>
            <button
              id="btn-sync-all-supabase"
              onClick={handlePushSync}
              disabled={isSyncing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sedang Menyinkronkan...' : 'Sinkronkan Sekarang ke Supabase'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncResult && (
        <div
          className={`p-4 rounded-2xl border transition-all ${
            syncResult.success
              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/50 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-start space-x-3">
            {syncResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-2 flex-1">
              <div className="font-bold text-sm text-white">{syncResult.message}</div>
              {syncResult.details && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-500/20">
                  {Object.entries(syncResult.details).map(([table, count]) => (
                    <div key={table} className="p-2 rounded-lg bg-slate-900/60 border border-emerald-500/20 text-xs">
                      <div className="text-[10px] text-slate-400">{table}</div>
                      <div className="font-bold text-emerald-400">{count} record tersimpan</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid: 1. Setup Kredensial | 2. Step by Step Panduan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Form Konfigurasi (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Kredensial Koneksi Supabase</h2>
            </div>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
            >
              <span>Buka Supabase</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-4 text-xs">
            {/* Supabase URL */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>Project URL Supabase</span>
                </span>
                <span className="text-[10px] text-slate-500 font-normal">Contoh: https://xyzcompany.supabase.co</span>
              </label>
              <input
                id="input-supabase-url"
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-xs"
              />
            </div>

            {/* Supabase Anon Key */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  <span>Public Anon Key (Client API Key)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-normal">Dari Dashboard &gt; Project Settings &gt; API</span>
              </label>
              <input
                id="input-supabase-anon-key"
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-xs"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                id="btn-test-supabase"
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center space-x-2 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Menguji...' : 'Uji Koneksi'}</span>
              </button>

              <button
                id="btn-save-supabase-config"
                type="button"
                onClick={handleSaveConfig}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
              >
                Simpan Kredensial
              </button>
            </div>

            {/* Test Result Box */}
            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start space-x-2.5 ${
                  testResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">{testResult.message}</div>
                  {testResult.latencyMs && (
                    <div className="text-[10px] text-slate-400 mt-0.5">Waktu respon server: {testResult.latencyMs} ms</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Status Modul Terintegrasi (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Tabel Database Cloud</h2>
          </div>

          <div className="space-y-2 text-xs">
            <p className="text-slate-400 text-[11px]">
              Tabel-tabel di bawah ini secara otomatis disinkronkan ke project Supabase:
            </p>

            <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {[
                { name: 'school_profile', desc: 'Profil Sekolah & Kop Surat' },
                { name: 'users', desc: 'Akun Guru & Otorisasi Hak Akses' },
                { name: 'students', desc: 'Data Induk Siswa & NISN' },
                { name: 'attendance_records', desc: 'Presensi Harian & Rekap' },
                { name: 'schedules', desc: 'Jadwal Mengajar Guru' },
                { name: 'teaching_agendas', desc: 'Agenda Pelaksanaan Pembelajaran' },
                { name: 'teaching_journals', desc: 'Jurnal Mengajar & Validasi' },
                { name: 'daily_grades', desc: 'Nilai Harian, PTS & PAS' },
                { name: 'ai_documents', desc: 'Modul Ajar, TP, ATP, PROTA, PROSEM AI' },
                { name: 'access_logs', desc: 'Log Audit Keamanan & Riwayat Akses' },
              ].map((t) => (
                <div
                  key={t.name}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800/80"
                >
                  <div>
                    <div className="font-mono font-bold text-emerald-400 text-[11px]">{t.name}</div>
                    <div className="text-[10px] text-slate-400">{t.desc}</div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    Siap Sinkron
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bagian SQL Schema Generator (Mudah Dicopy) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Skrip SQL Schema Supabase (1-Click Setup)</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Jalankan skrip SQL ini 1 kali di <strong>Supabase Dashboard &gt; SQL Editor</strong> untuk membuat seluruh tabel dan izin akses.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setShowSqlSchema(!showSqlSchema)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            >
              {showSqlSchema ? 'Sembunyikan SQL' : 'Lihat Skrip SQL'}
            </button>
            <button
              id="btn-copy-sql-schema"
              onClick={handleCopySQL}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/30 transition active:scale-95"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Tersalin ke Clipboard!' : 'Salin Skrip SQL'}</span>
            </button>
          </div>
        </div>

        {/* Panduan 3 Langkah Mudah */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-indigo-400 flex items-center">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center mr-1.5 text-[10px]">1</span>
              Buat Project Supabase
            </div>
            <p className="text-[11px] text-slate-400">
              Buka <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline">supabase.com</a> dan buat project baru (gratis).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-indigo-400 flex items-center">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center mr-1.5 text-[10px]">2</span>
              Jalankan SQL Schema
            </div>
            <p className="text-[11px] text-slate-400">
              Salin skrip SQL di atas, buka menu <strong>SQL Editor</strong> di Supabase, tempel dan klik <strong>Run</strong>.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-emerald-400 flex items-center">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center mr-1.5 text-[10px]">3</span>
              Klik Sinkronkan Sekarang
            </div>
            <p className="text-[11px] text-slate-400">
              Masukkan URL & Anon Key pada form di atas, lalu klik <strong>Sinkronkan Sekarang</strong>.
            </p>
          </div>
        </div>

        {/* Code Box Display */}
        {showSqlSchema && (
          <div className="relative">
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-72 custom-scrollbar">
              {sqlCode}
            </pre>
          </div>
        )}
      </div>

      {/* Area Pembersihan Data & Reset Total */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-400" />
            Pembersihan Data & Reset Aplikasi Baru
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Gunakan opsi di bawah ini jika Anda ingin menghapus data tertentu atau mengosongkan semua data agar aplikasi menjadi bersih seperti aplikasi baru.
          </p>
        </div>

        {purgeUusMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{purgeUusMsg}</span>
          </div>
        )}

        {resetMsg && (
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{resetMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Action 1: Hapus Uus */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                Hapus Data Akun "Uus"
              </div>
              <p className="text-[11px] text-slate-400">
                Menghapus secara permanen akun dan seluruh riwayat yang berkaitan dengan pengguna bernama "Uus" dari memori lokal dan database Supabase Cloud.
              </p>
            </div>
            <button
              id="btn-purge-uus"
              onClick={handlePurgeUus}
              disabled={isPurgingUus}
              className="w-full py-2 px-3 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isPurgingUus ? 'Sedang Memeriksa & Menghapus...' : 'Hapus Uus Sekarang'}</span>
            </button>
          </div>

          {/* Action 2: Reset Seluruh Data */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                Reset ke Aplikasi Baru (Kosongkan Semua)
              </div>
              <p className="text-[11px] text-slate-400">
                Mengosongkan semua data presensi, jadwal, agenda, jurnal, nilai siswa, dan kelas, sehingga aplikasi siap digunakan dari nol (fresh state).
              </p>
            </div>
            <button
              id="btn-reset-fresh-app"
              onClick={handleResetAllData}
              disabled={isResetting}
              className="w-full py-2 px-3 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/50 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Sedang Mengosongkan...' : 'Reset Semua Data Menjadi Baru'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
