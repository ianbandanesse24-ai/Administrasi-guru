import React, { useState, useEffect } from 'react';
import {
  Key,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Eye,
  EyeOff,
  Copy,
  Check,
  RotateCcw,
  Cpu,
  Server,
  Activity,
  Lock,
} from 'lucide-react';
import { StorageService, DEFAULT_ADMIN } from '../lib/storage';

interface GeminiKeyStatus {
  configured: boolean;
  source: 'env' | 'custom' | 'none';
  maskedKey: string;
  hasCustomKey: boolean;
  preferredModel: string;
}

export const AdminApiKeyManager: React.FC = () => {
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [keyStatus, setKeyStatus] = useState<GeminiKeyStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    reply?: string;
    latencyMs?: number;
  } | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const fetchKeyStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/admin/gemini-key-status');
      if (res.ok) {
        const data = await res.json();
        setKeyStatus(data);
      } else {
        setKeyStatus({
          configured: false,
          source: 'none',
          maskedKey: '',
          hasCustomKey: false,
          preferredModel: 'gemini-3.8-flash',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchKeyStatus();
  }, []);

  const handleSaveAndSync = async () => {
    if (!apiKeyInput.trim()) {
      setFeedback({ text: 'Masukkan API Key Google AI Studio Anda.', type: 'error' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/set-gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKeyInput.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFeedback({
          text: 'API Key Google AI Studio Berhasil Diverifikasi dan Tersinkronisasi ke Seluruh Sistem!',
          type: 'success',
        });
        setTestResult({
          success: true,
          message: data.message,
          reply: data.testResponse,
          latencyMs: data.latencyMs,
        });
        setApiKeyInput('');
        fetchKeyStatus();

        StorageService.addAccessLog({
          userId: DEFAULT_ADMIN.id,
          userEmail: DEFAULT_ADMIN.email,
          userName: DEFAULT_ADMIN.name,
          userRole: 'admin',
          action: 'Pembaruan API Key Google AI Studio',
          details: `Admin memperbarui konfigurasi API Key Google AI Studio. Verifikasi sukses (${data.latencyMs}ms).`,
          status: 'success',
        });
      } else {
        setFeedback({
          text: data.error || 'Gagal memverifikasi API Key ke Google AI Studio.',
          type: 'error',
        });
      }
    } catch (err: any) {
      setFeedback({
        text: `Terjadi kendala jaringan: ${err.message || 'Koneksi gagal'}`,
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/test-gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message,
          reply: data.reply,
          latencyMs: data.latencyMs,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Gagal melakukan tes koneksi ke Google AI Studio.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Terjadi kendala jaringan saat pengujian: ${err.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!confirm('Apakah Anda yakin ingin mereset konfigurasi API Key ke setelan lingkungan default?')) {
      return;
    }

    try {
      const res = await fetch('/api/admin/reset-gemini-key', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ text: data.message, type: 'success' });
        setTestResult(null);
        fetchKeyStatus();
      }
    } catch (err: any) {
      setFeedback({ text: 'Gagal mereset API Key.', type: 'error' });
    }
  };

  const handleCopyAiStudioUrl = () => {
    navigator.clipboard.writeText('https://aistudio.google.com/app/apikey');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 p-6 rounded-3xl border border-indigo-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white tracking-tight">Konfigurasi API Key Google AI Studio</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  Model Gemini 3.7 Flash
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Kelola dan singkronkan API Key Google AI Studio untuk mengaktifkan seluruh fitur kecerdasan buatan (Analisis CP Mendalam, Modul Ajar Deep Learning 3 Pilar, LKPD Kreatif, KKTP, dan Rubrik Penilaian).
              </p>
            </div>
          </div>

          {/* Quick Status Badge */}
          <div className="flex items-center space-x-2 shrink-0">
            {isLoadingStatus ? (
              <div className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Memeriksa Status...</span>
              </div>
            ) : keyStatus?.configured ? (
              <div className="px-4 py-2 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-black flex items-center space-x-2 shadow-lg shadow-emerald-950/50">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Google AI Studio Terhubung</span>
              </div>
            ) : (
              <div className="px-4 py-2 rounded-2xl bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-black flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>API Key Belum Diisi</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs animate-in slide-in-from-top duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span className="font-bold">{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white font-bold text-[11px] ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Main Grid: Form & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: API Key Input & Actions (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Input & Sinkronisasi API Key</span>
              </h3>
              {keyStatus?.maskedKey && (
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-xl border border-emerald-800/40">
                  Aktif: {keyStatus.maskedKey}
                </span>
              )}
            </div>

            {/* Input Form */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-300">
                Google AI Studio Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Tempelkan API Key Anda di sini (misal: AIzaSy...)"
                  className="w-full pl-4 pr-12 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs font-mono tracking-wide"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white transition"
                  title={showKey ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Kunci ini akan digunakan oleh server untuk memproses seluruh pembuatan perangkat pembelajaran interaktif berbasis AI.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveAndSync}
                disabled={isSaving || !apiKeyInput.trim()}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi ke Google AI Studio...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Simpan & Singkronkan Kunci</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !keyStatus?.configured}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center space-x-2 transition disabled:opacity-50"
                title="Uji respon dan latensi koneksi API Gemini saat ini"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menguji Koneksi...</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Uji Koneksi Real-time</span>
                  </>
                )}
              </button>

              {keyStatus?.hasCustomKey && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="px-3.5 py-2.5 rounded-2xl bg-slate-950 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 text-xs font-bold flex items-center space-x-1.5 transition ml-auto"
                  title="Kembalikan ke kunci sistem bawaan"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>
              )}
            </div>

            {/* Test Results Console */}
            {testResult && (
              <div
                className={`p-4 rounded-2xl border space-y-2 text-xs animate-in fade-in duration-200 ${
                  testResult.success
                    ? 'bg-slate-950 border-emerald-500/40 text-slate-200'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between font-extrabold">
                  <span className="flex items-center space-x-2">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>{testResult.message}</span>
                  </span>
                  {testResult.latencyMs && (
                    <span className="font-mono text-emerald-400 text-[11px] bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                      Latensi: {testResult.latencyMs} ms
                    </span>
                  )}
                </div>
                {testResult.reply && (
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 font-mono text-[11px] text-emerald-300">
                    &gt; {testResult.reply}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* System Environment Details */}
          <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-extrabold text-white flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>Spesifikasi & Model AI yang Digunakan</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 block font-bold">Model Utama</span>
                <span className="font-bold text-white font-mono">{keyStatus?.preferredModel || 'gemini-3.8-flash'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 block font-bold">Model Ringan (Fallback)</span>
                <span className="font-bold text-white font-mono">gemini-3.1-flash-lite</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 block font-bold">Sumber Kunci Aktif</span>
                <span className="font-bold text-emerald-400">
                  {keyStatus?.source === 'custom'
                    ? 'Kustom Admin'
                    : keyStatus?.source === 'env'
                    ? 'Google Cloud / Env'
                    : 'Belum Terpasang'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Guide & Quick Tutorial (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Panduan Mendapatkan API Key</span>
              </h3>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-lg">
                100% Gratis
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Google AI Studio menyediakan akses API resmi Gemini tanpa dipungut biaya untuk keperluan pengembangan dan pendidikan. Ikuti 3 langkah mudah berikut:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span className="font-bold text-white">Buka Google AI Studio</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-7">
                  Masuk dengan akun Google (Gmail) Anda ke portal pengembang Google AI Studio.
                </p>
                <div className="pl-7 pt-1 flex items-center space-x-2">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold text-[11px] border border-indigo-500/40 transition"
                  >
                    <span>Buka AI Studio</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={handleCopyAiStudioUrl}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition"
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? 'Tersalin' : 'Salin URL'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span className="font-bold text-white">Klik &quot;Create API key&quot;</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-7">
                  Pilih proyek baru atau proyek yang sudah ada untuk membuat API Key dalam satu kali klik.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span className="font-bold text-white">Salin & Tempelkan ke Aplikasi</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-7">
                  Salin string kode kunci (berawalan <code>AIzaSy...</code>) lalu tempelkan pada kolom formulir di sebelah kiri dan klik <strong>&quot;Simpan & Singkronkan Kunci&quot;</strong>.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start space-x-2.5 text-xs text-indigo-200">
              <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>Keamanan Terjamin:</strong> Kunci disimpan dengan enkripsi di server dan tidak pernah dibocorkan ke sisi browser publik.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
