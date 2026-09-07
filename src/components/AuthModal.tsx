import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  School,
  BookOpen,
  KeyRound,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserPlus,
  LogIn,
  Key,
} from 'lucide-react';
import { UserAccount } from '../types';
import { StorageService, DEFAULT_ADMIN } from '../lib/storage';

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen = true,
  onClose,
  onLoginSuccess,
}) => {
  if (!isOpen) return null;
  const [tab, setTab] = useState<'login' | 'register' | 'check_status'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [subject, setSubject] = useState('');
  const [phone, setPhone] = useState('');
  const [authCodeInput, setAuthCodeInput] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [pendingUser, setPendingUser] = useState<UserAccount | null>(null);

  // Quick fill admin
  const fillAdmin = () => {
    setEmail('aspianmadimu22@guru.sma.belajar.id');
    setPassword('Yuli@n12');
    setErrorMsg('');
  };

  // Quick fill client (Demo Guru)
  const fillClient = () => {
    setEmail('Ian.bandanesse24@gmail.com');
    setPassword('Yulian12');
    setErrorMsg('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const users = StorageService.getUsers();
    const cleanEmail = email.trim().toLowerCase();

    // Check if master admin
    if (cleanEmail === DEFAULT_ADMIN.email.toLowerCase()) {
      if (password === DEFAULT_ADMIN.password) {
        // Record login log
        StorageService.addAccessLog({
          userId: DEFAULT_ADMIN.id,
          userEmail: DEFAULT_ADMIN.email,
          userName: DEFAULT_ADMIN.name,
          userRole: 'admin',
          action: 'Login Administrator Master',
          details: 'Autentikasi administrator utama berhasil.',
          status: 'success',
        });

        StorageService.addNotification({
          title: 'Admin Masuk ke Sistem',
          message: `Administrator ${DEFAULT_ADMIN.name} berhasil login pada ${new Date().toLocaleTimeString('id-ID')}.`,
          type: 'user_login',
        });

        StorageService.setCurrentUser(DEFAULT_ADMIN);
        onLoginSuccess(DEFAULT_ADMIN);
        return;
      } else {
        setErrorMsg('Kata sandi untuk Administrator salah. Silakan periksa kembali.');
        return;
      }
    }

    // Find in users database
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      setErrorMsg('Akun belum terdaftar. Silakan minta izin akses melalui tab "Buat Akun / Minta Izin".');
      return;
    }

    if (user.password && user.password !== password) {
      setErrorMsg('Kata sandi yang dimasukkan tidak sesuai.');
      return;
    }

    // Check approval status
    if (user.status === 'pending') {
      setPendingUser(user);
      setErrorMsg('Akun Anda masih dalam status Menunggu Persetujuan Otorisasi Admin.');
      return;
    }

    if (user.status === 'rejected') {
      setErrorMsg('Permintaan akses akun Anda ditolak oleh administrator. Hubungi admin untuk informasi lebih lanjut.');
      return;
    }

    // Approved client login
    const updatedUser: UserAccount = {
      ...user,
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    // Update in storage
    const updatedList = users.map((u) => (u.id === user.id ? updatedUser : u));
    StorageService.saveUsers(updatedList);

    // Add access log
    StorageService.addAccessLog({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      action: 'Login Client Guru Berhasil',
      details: `Guru ${user.name} (${user.school || 'Sekolah'}) berhasil masuk langsung tanpa izin ulang.`,
      status: 'success',
    });

    // Real-time notification for admin
    StorageService.addNotification({
      title: 'Aktivitas Login Pengguna',
      message: `Guru ${user.name} (${user.email}) telah login ke aplikasi.`,
      type: 'user_login',
    });

    StorageService.setCurrentUser(updatedUser);
    onLoginSuccess(updatedUser);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !fullName || !password) {
      setErrorMsg('Mohon lengkapi Nama, Email, dan Kata Sandi.');
      return;
    }

    const users = StorageService.getUsers();
    const cleanEmail = email.trim().toLowerCase();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      setErrorMsg('Email ini sudah terdaftar dalam sistem. Silakan login atau cek status izin Anda.');
      return;
    }

    const reqCode = `REQ-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`;

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      name: fullName.trim(),
      role: 'guru',
      status: 'pending',
      password: password,
      school: school.trim() || 'Sekolah Indonesia',
      subject: subject.trim() || 'Guru Mata Pelajaran',
      phone: phone.trim() || '-',
      requestDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      authCode: reqCode,
    };

    users.push(newUser);
    StorageService.saveUsers(users);

    // Add audit log
    StorageService.addAccessLog({
      userId: newUser.id,
      userEmail: newUser.email,
      userName: newUser.name,
      userRole: 'guru',
      action: 'Pengajuan Izin Akses Akun Baru',
      details: `Permintaan izin akses dari ${newUser.name} (${newUser.school}) dengan kode ${reqCode}.`,
      status: 'info',
    });

    // Real-time notification to admin
    StorageService.addNotification({
      title: 'Permintaan Izin Akses Baru',
      message: `Guru ${newUser.name} (${newUser.school}) mengajukan izin akses. Kode: ${reqCode}.`,
      type: 'access_request',
    });

    setPendingUser(newUser);
    setSuccessMsg(`Permintaan izin akses berhasil dikirim ke Admin! Kode Tiket: ${reqCode}. Admin akan memverifikasi dan menyetujui akun Anda.`);
  };

  const handleDirectApproveDemo = (user: UserAccount) => {
    const users = StorageService.getUsers();
    const approved: UserAccount = {
      ...user,
      status: 'approved',
      approvalDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      approvedBy: DEFAULT_ADMIN.email,
      authCode: `AGK-${Math.floor(1000 + Math.random() * 9000)}-APPROVED`,
    };
    const updated = users.map((u) => (u.id === user.id ? approved : u));
    StorageService.saveUsers(updated);

    StorageService.addAccessLog({
      userId: approved.id,
      userEmail: approved.email,
      userName: approved.name,
      userRole: 'guru',
      action: 'Persetujuan Akses Otomatis (Demo/Admin)',
      details: `Akses diberikan secara langsung kepada ${approved.name}.`,
      status: 'success',
    });

    StorageService.setCurrentUser(approved);
    onLoginSuccess(approved);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-teal-400 shadow-xl shadow-indigo-600/30 text-white font-black text-2xl tracking-wider mb-4 border border-indigo-400/30">
          AGK
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          ADMINISTRASI GURU KREATIF
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
          Sistem Terpadu Administrasi Guru, Otomatisasi Penilaian & Asisten AI Kurikulum Deep Learning
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-900/90 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-800 text-slate-100">
          {/* Tab Selector */}
          <div className="flex rounded-xl bg-slate-950/80 p-1 mb-6 border border-slate-800">
            <button
              id="tab-login"
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                tab === 'login'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk (Login)</span>
            </button>
            <button
              id="tab-register"
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                tab === 'register'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Buat Akun / Minta Izin</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Akun / Akun Belajar.id
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    id="input-login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@guru.sma.belajar.id"
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    id="input-login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                id="btn-submit-login"
                type="submit"
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold tracking-wide shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2"
              >
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Pending Approval Banner if detected */}
              {pendingUser && (
                <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-amber-300">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Menunggu Otorisasi Admin</span>
                  </div>
                  <p className="text-[11px] text-amber-200/80">
                    Akun <strong>{pendingUser.name}</strong> ({pendingUser.email}) telah mengajukan permohonan akses. Admin master ({DEFAULT_ADMIN.email}) akan memberikan persetujuan.
                  </p>
                  <div className="pt-1 flex items-center justify-between border-t border-amber-500/20">
                    <span className="text-[10px] text-amber-300">Kode: {pendingUser.authCode}</span>
                    <button
                      type="button"
                      onClick={() => handleDirectApproveDemo(pendingUser)}
                      className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] transition"
                    >
                      Bypass Persetujuan (Demo)
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Fill Credentials */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <p className="text-[11px] text-slate-400 font-semibold mb-2 text-center">
                  Akses Cepat Pengujian:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="btn-quick-admin"
                    type="button"
                    onClick={fillAdmin}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition"
                  >
                    <div className="text-[10px] font-bold text-emerald-400 flex items-center">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Admin Master
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">aspianmadimu22...</div>
                  </button>

                  <button
                    id="btn-quick-client"
                    type="button"
                    onClick={fillClient}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition"
                  >
                    <div className="text-[10px] font-bold text-indigo-400 flex items-center">
                      <User className="w-3 h-3 mr-1" /> Client Demo (Guru)
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">Ian.bandanesse24...</div>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: BUAT AKUN / MINTA IZIN AKSES */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Rahmat Hidayat, S.Pd."
                    className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Akun (Belajar.id / Pribadi) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@guru.belajar.id"
                    className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kata Sandi yang Diinginkan *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Asal Sekolah
                  </label>
                  <input
                    id="reg-school"
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="SMA Negeri 1 ..."
                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mata Pelajaran
                  </label>
                  <input
                    id="reg-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Bahasa / Fisika / dll"
                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-indigo-300">
                ℹ️ Sesuai kebijakan keamanan, akun baru akan dikirimkan ke <strong>Admin (Aspian La Ode Madimu, S.Pd. Gr)</strong> untuk otorisasi dan konfirmasi kode akses sebelum dapat masuk.
              </div>

              <button
                id="btn-submit-register"
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold tracking-wide shadow-lg shadow-emerald-600/30 transition flex items-center justify-center space-x-2"
              >
                <span>Kirim Permintaan Izin Akses</span>
                <Key className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Footer Info */}
        <p className="mt-4 text-center text-[11px] text-slate-500">
          Admin Master: <span className="text-slate-400 font-mono">aspianmadimu22@guru.sma.belajar.id</span>
        </p>
      </div>
    </div>
  );
};
