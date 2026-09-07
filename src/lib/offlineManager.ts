import { useState, useEffect, useCallback } from 'react';
import { SupabaseService } from './supabase';
import { StorageService, addStorageListener } from './storage';

export interface OfflineSyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  isPwaInstallable: boolean;
  isPwaInstalled: boolean;
  pendingSyncCount: number;
  lastSyncedAt?: string;
  syncMessage?: string;
}

let deferredPrompt: any = null;
const offlineChangeKey = 'agk_pending_offline_edits';

export class OfflineManager {
  /**
   * Daftarkan Service Worker untuk PWA Offline Caching
   */
  static registerServiceWorker(): void {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('[PWA] Service Worker registration failed:', error);
          });
      });
    }
  }

  /**
   * Catat adanya perubahan offline
   */
  static recordLocalChange(tableName: string): void {
    try {
      const count = this.getPendingChangeCount() + 1;
      localStorage.setItem(offlineChangeKey, String(count));
      // Jika online, coba langsung auto sync
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        SupabaseService.triggerAutoSync(tableName);
      }
    } catch {}
  }

  static getPendingChangeCount(): number {
    try {
      return parseInt(localStorage.getItem(offlineChangeKey) || '0', 10);
    } catch {
      return 0;
    }
  }

  static resetPendingChangeCount(): void {
    try {
      localStorage.setItem(offlineChangeKey, '0');
    } catch {}
  }

  /**
   * Memicu sinkronisasi ke Supabase saat koneksi kembali terhubung
   */
  static async syncWhenOnline(showNotification: boolean = true): Promise<{
    success: boolean;
    message: string;
  }> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return {
        success: false,
        message: 'Perangkat masih dalam keadaan offline (tidak ada koneksi internet). Data tetap tersimpan aman di HP/Laptop Anda.',
      };
    }

    try {
      const result = await SupabaseService.pushAllToSupabase(false);
      if (result.success) {
        this.resetPendingChangeCount();
        if (showNotification) {
          StorageService.addNotification({
            title: 'Sinkronisasi Otomatis Sukses',
            message: 'Koneksi terhubung kembali. Seluruh data lokal (administrasi, absensi, nilai, agenda) berhasil disinkronkan ke Supabase Cloud.',
            type: 'sync',
          });
        }
      }
      return result;
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Gagal sinkronisasi otomatis ke Supabase.',
      };
    }
  }
}

// Inisialisasi listener otomatis
if (typeof window !== 'undefined') {
  // Listener perubahan storage lokal
  addStorageListener((key) => {
    OfflineManager.recordLocalChange(key);
  });

  // Listener PWA beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    window.dispatchEvent(new CustomEvent('agk_pwa_installable'));
  });

  // Listener internet kembali online
  window.addEventListener('online', () => {
    console.log('[Network] Koneksi internet kembali terhubung. Memulai sinkronisasi otomatis...');
    window.dispatchEvent(new CustomEvent('agk_online_status', { detail: { online: true } }));
    OfflineManager.syncWhenOnline(true).catch(() => {});
  });

  window.addEventListener('offline', () => {
    console.log('[Network] Beralih ke Mode Offline. Data tetap aman di penyimpanan lokal.');
    window.dispatchEvent(new CustomEvent('agk_online_status', { detail: { online: false } }));
  });
}

/**
 * Custom React Hook untuk memantau status offline & kontrol PWA
 */
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isPwaInstallable, setIsPwaInstallable] = useState<boolean>(false);
  const [isPwaInstalled, setIsPwaInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  });
  const [pendingCount, setPendingCount] = useState<number>(() =>
    OfflineManager.getPendingChangeCount()
  );
  const [lastSyncedAt, setLastSyncedAt] = useState<string | undefined>(
    () => SupabaseService.getConfig().lastSyncedAt
  );
  const [reconnectedToast, setReconnectedToast] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setReconnectedToast(true);
      setIsSyncing(true);
      OfflineManager.syncWhenOnline(true)
        .then((res) => {
          if (res.success) {
            setPendingCount(0);
            setLastSyncedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
          }
        })
        .finally(() => {
          setIsSyncing(false);
          setTimeout(() => setReconnectedToast(false), 6000);
        });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setPendingCount(OfflineManager.getPendingChangeCount());
    };

    const handleInstallable = () => {
      setIsPwaInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setIsPwaInstallable(false);
      deferredPrompt = null;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('agk_pwa_installable', handleInstallable);
    window.addEventListener('appinstalled', handleAppInstalled);

    const unsubscribeStorage = addStorageListener(() => {
      setPendingCount(OfflineManager.getPendingChangeCount());
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('agk_pwa_installable', handleInstallable);
      window.removeEventListener('appinstalled', handleAppInstalled);
      unsubscribeStorage();
    };
  }, []);

  const triggerManualSync = useCallback(async () => {
    if (!isOnline) {
      alert('Perangkat Anda saat ini sedang offline. Data Anda tersimpan aman di HP/Laptop dan akan otomatis disinkronkan saat terhubung ke internet.');
      return;
    }

    setIsSyncing(true);
    try {
      const res = await SupabaseService.pushAllToSupabase(false);
      if (res.success) {
        OfflineManager.resetPendingChangeCount();
        setPendingCount(0);
        setLastSyncedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
      }
      return res;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline]);

  const promptInstallPwa = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsPwaInstalled(true);
        setIsPwaInstallable(false);
      }
      deferredPrompt = null;
    } else {
      // Petunjuk manual install jika browser tidak memicu prompt otomatis
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIos) {
        alert('Untuk memasang di iPhone/iPad (iOS):\n1. Ketuk tombol Share (ikon bagikan di Safari)\n2. Pilih "Add to Home Screen" (Tambah ke Layar Utama).');
      } else {
        alert('Untuk memasang di HP / Laptop (Android / Chrome / Edge):\n1. Klik menu browser (titik 3 di kanan atas)\n2. Pilih "Pasang Aplikasi" / "Install App" / "Tambahkan ke Layar Utama".');
      }
    }
  }, []);

  return {
    isOnline,
    isSyncing,
    isPwaInstallable,
    isPwaInstalled,
    pendingCount,
    lastSyncedAt,
    reconnectedToast,
    dismissToast: () => setReconnectedToast(false),
    triggerManualSync,
    promptInstallPwa,
  };
}
