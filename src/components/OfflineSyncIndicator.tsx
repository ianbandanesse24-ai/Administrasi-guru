import React from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  HardDrive,
  Download,
  CheckCircle2,
  AlertCircle,
  Cloud,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { useOfflineSync } from '../lib/offlineManager';

interface OfflineSyncIndicatorProps {
  compact?: boolean;
}

export const OfflineSyncIndicator: React.FC<OfflineSyncIndicatorProps> = ({ compact = false }) => {
  const {
    isOnline,
    isSyncing,
    isPwaInstallable,
    isPwaInstalled,
    pendingCount,
    lastSyncedAt,
    reconnectedToast,
    dismissToast,
    triggerManualSync,
    promptInstallPwa,
  } = useOfflineSync();

  return (
    <>
      {/* Toast Alert saat internet terhubung kembali dan berhasil sinkronisasi otomatis */}
      {reconnectedToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md p-4 rounded-2xl bg-emerald-950 border border-emerald-500/40 shadow-2xl text-white animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-sm text-emerald-200 flex items-center gap-1.5">
                  <span>Internet Terhubung Kembali</span>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Data kasar yang tersimpan di HP/Laptop saat offline sedang atau telah disinkronkan otomatis ke Supabase Cloud.
                </p>
              </div>
            </div>
            <button
              onClick={dismissToast}
              className="text-xs text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {compact ? (
        <div className="flex items-center space-x-1.5 text-xs">
          {isOnline ? (
            <button
              type="button"
              onClick={triggerManualSync}
              disabled={isSyncing}
              title={`Online • Tersinkron ${lastSyncedAt ? `(${lastSyncedAt})` : ''} - Klik untuk sinkronisasi`}
              className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition active:scale-95 text-[11px] font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">Online</span>
              {isSyncing && <RefreshCw className="w-3 h-3 animate-spin text-emerald-400 ml-1" />}
            </button>
          ) : (
            <div
              title="Mode Offline: Semua data yang Anda buat/edit tersimpan aman di HP/Laptop dan akan otomatis sinkron saat ada internet."
              className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <WifiOff className="w-3 h-3 text-amber-400" />
              <span>Offline (Lokal)</span>
              {pendingCount > 0 && (
                <span className="ml-1 px-1 py-0.2 bg-amber-500/20 text-[10px] rounded-full">
                  {pendingCount}
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Full Card / Banner */
        <div
          className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
            isOnline
              ? 'bg-slate-900/90 border-slate-800 text-slate-200'
              : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-xl shrink-0 ${
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>
            <div>
              <div className="font-bold text-xs flex items-center gap-1.5">
                <span>{isOnline ? 'Koneksi Online & Siap Sinkron' : 'Mode Offline Aktif'}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isOnline
                  ? lastSyncedAt
                    ? `Data lokal telah disinkronkan ke Supabase Cloud (Terakhir: ${lastSyncedAt}).`
                    : 'Perangkat terhubung. Perubahan otomatis disinkronkan ke Cloud.'
                  : 'Aplikasi dan Menu Administrasi Pokok tetap dapat digunakan penuh tanpa internet. Data tersimpan di memori HP/Laptop Anda.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {isOnline ? (
              <button
                type="button"
                onClick={triggerManualSync}
                disabled={isSyncing}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center space-x-1.5 border border-slate-700 transition active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkron Sekarang'}</span>
              </button>
            ) : (
              <div className="flex items-center space-x-1 text-[11px] font-semibold text-amber-300 bg-amber-900/40 px-2.5 py-1 rounded-lg border border-amber-700/40">
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                <span>Tersimpan di HP/Laptop</span>
              </div>
            )}

            {!isPwaInstalled && (
              <button
                type="button"
                onClick={promptInstallPwa}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Pasang PWA</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Banner petunjuk Mode Offline khusus untuk Menu A (Administrasi Pokok)
 */
export const OfflineAdminNotice: React.FC<{ menuTitle: string }> = ({ menuTitle }) => {
  const { isOnline, pendingCount } = useOfflineSync();

  return (
    <div className="flex items-center justify-between p-2.5 px-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400">
      <div className="flex items-center space-x-2">
        <HardDrive className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span>
          <strong className="text-slate-200">{menuTitle}</strong> mendukung{' '}
          <span className="text-emerald-400 font-semibold">Penyimpanan Offline (HP/Laptop)</span> &{' '}
          <span className="text-indigo-400 font-semibold">Otomatis Sinkron ke Supabase Cloud</span>.
        </span>
      </div>
      <div className="hidden sm:flex items-center space-x-1.5 font-medium">
        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
        <span className={isOnline ? 'text-emerald-400 text-[10px]' : 'text-amber-400 text-[10px]'}>
          {isOnline ? 'Online (Tersinkron)' : 'Offline (Tersimpan Lokal)'}
        </span>
      </div>
    </div>
  );
};
