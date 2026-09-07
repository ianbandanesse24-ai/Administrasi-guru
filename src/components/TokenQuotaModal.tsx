import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Zap,
  Gift,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  ArrowRight,
  Award,
  Calendar,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { UserAccount, TokenQuotaStatus } from '../types';
import { StorageService } from '../lib/storage';

interface TokenQuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onTokenUpdated?: () => void;
  onNavigateToAdminTokens?: () => void;
}

export const TokenQuotaModal: React.FC<TokenQuotaModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onTokenUpdated,
  onNavigateToAdminTokens,
}) => {
  const [quotaStatus, setQuotaStatus] = useState<TokenQuotaStatus>(() =>
    StorageService.getTokenQuotaStatus(currentUser)
  );
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherMsg, setVoucherMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const refreshStatus = () => {
    const status = StorageService.getTokenQuotaStatus(currentUser);
    setQuotaStatus(status);
  };

  useEffect(() => {
    if (isOpen) {
      refreshStatus();
      setVoucherMsg(null);
      setVoucherCode('');
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleRedeemVoucher = (codeToRedeem?: string | unknown) => {
    const targetCode = typeof codeToRedeem === 'string' ? codeToRedeem : voucherCode;
    const code = (targetCode || '').trim().toUpperCase();
    if (!code) {
      setVoucherMsg({ text: 'Harap masukkan kode voucher.', type: 'error' });
      return;
    }

    const res = StorageService.redeemTokenVoucher(code, currentUser);
    if (res.success) {
      setVoucherMsg({ text: res.message, type: 'success' });
      setVoucherCode('');
      refreshStatus();
      if (onTokenUpdated) onTokenUpdated();
    } else {
      setVoucherMsg({ text: res.message, type: 'error' });
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const percentUsed = quotaStatus.totalAllowed > 0
    ? Math.min(100, Math.round((quotaStatus.monthlyUsed / quotaStatus.totalAllowed) * 100))
    : 0;

  const tokensPercentUsed = quotaStatus.monthlyTokensLimit > 0
    ? Math.min(100, Math.round((quotaStatus.monthlyTokensUsed / quotaStatus.monthlyTokensLimit) * 100))
    : 0;

  const sampleVouchers = StorageService.getTokenVouchers().filter(v => !v.isRedeemed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh]">
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                Status Kuota AI & Lisensi Akses
                {quotaStatus.isAdmin && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                    Super Admin
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Batas 35x Generate (500.000 Token/Bulan) &bull; Masa Aktif 1 Tahun
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar text-xs">
          {/* Subscription Expiry Alert / Warning (7 Days or Expired) */}
          {quotaStatus.isExpired && !quotaStatus.isAdmin && (
            <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-start space-x-3 text-rose-200">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-sm text-rose-300">Masa Aktif Aplikasi 1 Tahun Telah Habis</div>
                <p className="text-xs text-rose-200/90 leading-relaxed">
                  Akses akun Anda telah jatuh tempo pada <strong>{quotaStatus.subscriptionExpiryDate}</strong>. Silakan hubungi Administrator Sekolah untuk perpanjangan masa aktif (berlangganan/pembayaran).
                </p>
              </div>
            </div>
          )}

          {quotaStatus.isExpiringSoon && !quotaStatus.isExpired && !quotaStatus.isAdmin && (
            <div className="p-4 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-start space-x-3 text-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
              <div className="space-y-1">
                <div className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
                  <span>Peringatan Jatuh Tempo: {quotaStatus.daysUntilExpiry} Hari Lagi!</span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  Masa aktif akses 1 tahun Anda akan berakhir pada <strong>{quotaStatus.subscriptionExpiryDate}</strong>. Segera lakukan perpanjangan lisensi melalui Admin Sekolah agar akses AI tidak terhenti.
                </p>
              </div>
            </div>
          )}

          {/* 1-Year Subscription Status Card */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-300">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-xs uppercase tracking-wider">Masa Aktif Akun Guru</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  quotaStatus.isAdmin
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : quotaStatus.isExpired
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : quotaStatus.isExpiringSoon
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}
              >
                {quotaStatus.isAdmin ? 'Akses Permanen Admin' : quotaStatus.subscriptionStatusText}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-slate-300">
              <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800/80">
                <div className="text-[10px] text-slate-400">Tanggal Disetujui</div>
                <div className="font-mono font-bold text-white text-xs mt-0.5">
                  {quotaStatus.subscriptionStartDate || '-'}
                </div>
              </div>
              <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800/80">
                <div className="text-[10px] text-slate-400">Tanggal Jatuh Tempo</div>
                <div className="font-mono font-bold text-white text-xs mt-0.5">
                  {quotaStatus.isAdmin ? 'Tidak Terbatas' : (quotaStatus.subscriptionExpiryDate || '-')}
                </div>
              </div>
              <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800/80">
                <div className="text-[10px] text-slate-400">Sisa Masa Aktif</div>
                <div className="font-bold text-xs mt-0.5 text-indigo-300">
                  {quotaStatus.isAdmin ? '∞ Selamanya' : `${quotaStatus.daysUntilExpiry} Hari`}
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Generation & Token Quota Meter */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Pemakaian Bulan Ini (35x Generate)
                </span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-3xl font-black text-white font-mono">
                    {quotaStatus.monthlyUsed}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">
                    / {quotaStatus.totalAllowed} Generate
                  </span>
                </div>
                <div className="text-[11px] text-indigo-300 mt-0.5 font-mono">
                  ~{quotaStatus.monthlyTokensUsed.toLocaleString('id-ID')} / {quotaStatus.monthlyTokensLimit.toLocaleString('id-ID')} Token
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Sisa Kuota Bulan Ini
                </span>
                <div className="mt-1">
                  {quotaStatus.isAdmin ? (
                    <span className="text-xl font-black text-emerald-400">Unlimited (∞)</span>
                  ) : (
                    <span
                      className={`text-2xl font-black font-mono ${
                        quotaStatus.monthlyRemaining > 5
                          ? 'text-emerald-400'
                          : quotaStatus.monthlyRemaining > 0
                          ? 'text-amber-400'
                          : 'text-rose-500 animate-pulse'
                      }`}
                    >
                      {quotaStatus.monthlyRemaining}x Generate
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {quotaStatus.isAdmin ? 'Akses Admin' : `${quotaStatus.monthlyTokensRemaining.toLocaleString('id-ID')} Token Tersisa`}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    quotaStatus.isAdmin
                      ? 'bg-gradient-to-r from-emerald-500 to-indigo-500 w-full'
                      : percentUsed >= 100
                      ? 'bg-rose-500'
                      : percentUsed >= 75
                      ? 'bg-amber-500'
                      : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                  }`}
                  style={{ width: quotaStatus.isAdmin ? '100%' : `${percentUsed}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{percentUsed}% kuota bulanan terpakai</span>
                {quotaStatus.extra > 0 && (
                  <span className="text-indigo-400 font-semibold flex items-center gap-1">
                    <Award className="w-3 h-3" /> Termasuk +{quotaStatus.extra} Token Bonus
                  </span>
                )}
              </div>
            </div>

            {/* Quota Exhausted Warning */}
            {quotaStatus.isExhausted && !quotaStatus.isAdmin && !quotaStatus.isExpired && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-start space-x-2.5 text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold">Kuota AI Bulan Ini Telah Habis!</span>
                  <p className="text-rose-300/90 mt-0.5">
                    Anda telah mencapai batas 35 kali generate (500.000 token) untuk bulan ini. Kuota akan otomatis di-reset pada tanggal <strong>{quotaStatus.billingCycleDay} ({quotaStatus.monthlyResetDate})</strong> atau gunakan kode voucher token di bawah.
                  </p>
                </div>
              </div>
            )}

            {/* Reset Time Info based on user approval date anniversary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400 gap-1.5">
              <div className="flex items-center space-x-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Reset Otomatis: <strong>Setiap Tanggal {quotaStatus.billingCycleDay} per Bulan</strong></span>
              </div>
              <span className="text-slate-400 font-mono">Reset Berikutnya: {quotaStatus.monthlyResetDate}</span>
            </div>
          </div>

          {/* Voucher Redeem Section */}
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-800 space-y-3.5">
            <div className="flex items-center space-x-2 text-slate-200">
              <Gift className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-sm">Klaim Voucher Tambahan Kuota</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Klaim kode voucher token dari Admin Sekolah untuk menambah batas kuota generate AI Anda di luar kuota bulanan.
            </p>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="Contoh: GURUKREATIF20"
                className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs uppercase placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => handleRedeemVoucher()}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-600/20 active:scale-95 shrink-0 flex items-center space-x-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Klaim</span>
              </button>
            </div>

            {voucherMsg && (
              <div
                className={`p-3 rounded-xl text-[11px] flex items-center space-x-2 ${
                  voucherMsg.type === 'success'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                }`}
              >
                {voucherMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{voucherMsg.text}</span>
              </div>
            )}

            {/* Available Vouchers for Demonstration */}
            {sampleVouchers.length > 0 && (
              <div className="pt-2 border-t border-slate-700/60 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Voucher Tersedia untuk Diklaim:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sampleVouchers.slice(0, 4).map((v) => (
                    <div
                      key={v.id}
                      className="p-2 bg-slate-900/90 border border-slate-700/80 rounded-xl flex items-center justify-between hover:border-indigo-500/50 transition group"
                    >
                      <div>
                        <div className="font-mono font-bold text-indigo-300 text-xs flex items-center gap-1">
                          <span>{v.code}</span>
                          <span className="text-[9px] px-1 bg-emerald-500/20 text-emerald-400 rounded">
                            +{v.extraClicks}
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-400 truncate max-w-[130px]">
                          {v.description}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleCopy(v.code)}
                          title="Salin Kode"
                          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                        >
                          {copiedCode === v.code ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleRedeemVoucher(v.code)}
                          className="px-2 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[10px] font-bold rounded-lg transition"
                        >
                          Pakai
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin Tools Link */}
          {currentUser.role === 'admin' && onNavigateToAdminTokens && (
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="font-bold text-white text-xs">Manajemen Token & Lisensi Admin</div>
                  <div className="text-[10px] text-slate-400">Atur kuota guru, perpanjangan 1 tahun, & generate voucher</div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToAdminTokens();
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs flex items-center space-x-1 transition"
              >
                <span>Buka Panel</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            Sistem Kuota 35x Generate (500.000 Token/Bulan) &bull; Masa Aktif 1 Tahun
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
