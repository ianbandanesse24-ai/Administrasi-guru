import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
  School,
  FileSearch,
  FileText,
  Calendar,
  Award,
  Layers,
  Database,
  Search,
  ChevronRight,
  UserCheck,
  HeartHandshake,
  Cpu,
  GraduationCap,
  FileSpreadsheet,
  Printer,
  Sliders,
  Check,
  Users,
  Compass,
} from 'lucide-react';
import { UserAccount, CPReference } from '../types';
import { StorageService } from '../lib/storage';

interface WelcomeSyncViewProps {
  currentUser: UserAccount;
  onNavigate: (viewId: string) => void;
}

export const WelcomeSyncView: React.FC<WelcomeSyncViewProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [cpList] = useState<CPReference[]>(() => StorageService.getCPReferences());
  const [schoolProfile] = useState(() => StorageService.getSchoolProfile());
  const [selectedLevel, setSelectedLevel] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewCP, setPreviewCP] = useState<CPReference | null>(null);

  const slides = [
    { id: 'welcome', label: '1. Sambutan & Apresiasi', shortLabel: 'Sambutan' },
    { id: 'sync_status', label: '2. Status Sinkronisasi CP Terbaru', shortLabel: 'Sinkronisasi CP' },
    { id: 'ai_generators', label: '3. Asisten AI Deep Learning', shortLabel: 'Generator AI' },
    { id: 'admin_modules', label: '4. Administrasi & Siap Pakai', shortLabel: 'Mulai Bekerja' },
  ];

  const filteredCPs = cpList.filter((cp) => {
    const matchLevel = selectedLevel === 'SEMUA' || cp.level === selectedLevel;
    const matchSearch =
      cp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cp.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cp.phase.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLevel && matchSearch;
  });

  const aiModules = [
    { id: 'ai_analisis_cp', name: 'Analisis CP', desc: 'Pemetaan Elemen & Dimensi Kompetensi', icon: FileSearch, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    { id: 'ai_tp', name: 'Tujuan Pembelajaran (TP)', desc: 'Rumusan KKO ABCD & Indikator Capaian', icon: Compass, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { id: 'ai_atp', name: 'Alur Tujuan Pembelajaran (ATP)', desc: 'Urutan Logis & Alokasi Jam Pelajaran', icon: Layers, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    { id: 'ai_prota', name: 'Program Tahunan (PROTA)', desc: 'Distribusi Alokasi Waktu 2 Semester', icon: Calendar, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { id: 'ai_prosem', name: 'Program Semester (PROSEM)', desc: 'Rincian Pekan Efektif & Jadwal Bulanan', icon: Calendar, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    { id: 'ai_kktp', name: '6. Kriteria Ketuntasan (KKTP)', desc: 'Interval Nilai & Deskripsi Rubrik Mutu', icon: Award, color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
    { id: 'ai_modul_ajar', name: '7. RPM (Rencana Pelaksanaan Modul)', desc: 'Rencana Pelaksanaan Modul dengan Sintaks Deep Learning', icon: FileText, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30', highlight: true },
    { id: 'ai_lkpd', name: '8. Lembar Kerja Peserta Didik (LKPD)', desc: 'Aktivitas Berdiferensiasi & Penyelidikan Siswa', icon: BookOpen, color: 'text-violet-400 bg-violet-500/10 border-violet-500/30' },
    { id: 'ai_rubrik_penilaian', name: '9. Rubrik Penilaian Terpadu', desc: 'Sinkron dengan Asesmen RPM/Modul Ajar', icon: Zap, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  ];

  const adminFeatures = [
    { id: 'absensi', name: 'Absensi Siswa', desc: 'Presensi harian, persentase kehadiran & rekap semester', icon: Users },
    { id: 'jadwal', name: 'Jadwal Mengajar', desc: 'Matriks jam tatap muka mingguan dan alokasi ruang', icon: Calendar },
    { id: 'jurnal', name: 'Jurnal Guru', desc: 'Evaluasi ketercapaian TP & catatan supervisi', icon: BookOpen },
    { id: 'guru_wali', name: 'Guru Wali & BK', desc: 'Buku siswa asuh, catatan karakter & kontak wali', icon: GraduationCap },
    { id: 'penilaian_harian', name: 'Penilaian Harian', desc: 'Tugas, Ulangan Harian, Kinerja & Rata-rata NRH', icon: Sliders },
    { id: 'penilaian_pts', name: 'Penilaian PTS / STS', desc: 'Asesmen tengah semester, PG & Uraian', icon: Award },
    { id: 'penilaian_pas', name: 'Penilaian PAS / SAS', desc: 'Asesmen sumatif akhir semester & portofolio', icon: Zap },
    { id: 'rekap_nilai', name: 'Rekap Nilai Leger', desc: 'Kalkulasi nilai berbobot & deskripsi otomatis', icon: FileSpreadsheet },
    { id: 'cetak_laporan', name: 'Cetak Laporan & Ekspor', desc: 'Unduh Excel, Word, & PDF dengan Kop Sekolah', icon: Printer },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* SLIDE NAVIGATION HEADER / TABS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2 shadow-lg backdrop-blur-md">
        <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              id={`slide-tab-${idx}`}
              onClick={() => setCurrentSlide(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
                currentSlide === idx
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40'
                  : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black ${
                  currentSlide === idx ? 'bg-white text-indigo-700' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {idx + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{s.shortLabel}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="btn-skip-to-dashboard"
            onClick={() => onNavigate('dashboard')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition flex items-center space-x-1.5"
          >
            <span>Lewati ke Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SLIDE DISPLAY CONTAINER (FIXED HEIGHT / COMPACT SLIDE VIEW) */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl min-h-[580px] flex flex-col justify-between overflow-hidden">
        
        {/* ========================================================================= */}
        {/* SLIDE 1: UCAPAN TERIMA KASIH & SAMBUTAN RESMI */}
        {/* ========================================================================= */}
        {currentSlide === 0 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Badge & School Info */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-500/30">
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                <span>Selamat Datang & Terima Kasih</span>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <School className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold text-slate-200">{schoolProfile.schoolName}</span>
                <span>•</span>
                <span className="text-indigo-400 font-bold">{schoolProfile.academicYear} ({schoolProfile.semester})</span>
              </div>
            </div>

            {/* Main Greeting Hero */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-snug">
                Terima Kasih Telah Menggunakan Aplikasi{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400">
                  ADMINISTRASI GURU KREATIF
                </span>
                !
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
                Halo, Bapak/Ibu <strong className="text-white">{currentUser.name}</strong> ({currentUser.role === 'admin' ? 'Super Administrator Master' : 'Client Guru Terverifikasi'}). Kami menyambut Anda di portal otomasi pembelajaran dan administrasi pendidikan berbasis kurikulum masa depan.
              </p>
            </div>

            {/* Key Value Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">Pendekatan Deep Learning</h4>
                <p className="text-xs text-indigo-200/80 leading-relaxed">
                  Dirancang khusus dengan prinsip <em>Mindful, Meaningful, & Joyful Learning</em> untuk menciptakan pembelajaran yang mendalam dan bermakna.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">Sinkronisasi CP Resmi</h4>
                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  Terintegrasi langsung dengan <strong>Keputusan BSKAP No. 032/H/KR/2024</strong> terbaru yang telah ditambahkan oleh Admin di website admin.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">Ekspor 3 Format Resmi</h4>
                <p className="text-xs text-purple-200/80 leading-relaxed">
                  Cetak dan unduh langsung seluruh dokumen dalam format <strong>Excel (.xlsx)</strong>, <strong>Word (.doc)</strong>, atau <strong>PDF Cetak</strong> dengan Kop Sekolah.
                </p>
              </div>
            </div>

            {/* Quick Status Notice */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3 text-xs text-slate-300">
                <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Akun Anda telah <strong>Aktif Permanen</strong>. Anda dapat login kapan saja tanpa perlu konfirmasi ulang.</span>
              </div>
              <span className="text-[11px] font-bold text-indigo-400">Slide 1 dari 4</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SLIDE 2: STATUS SINKRONISASI CP TERBARU */}
        {/* ========================================================================= */}
        {currentSlide === 1 && (
          <div className="space-y-5 animate-fadeIn">
            {/* Banner Sinkronisasi Utama */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/50 border-2 border-emerald-500/50 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                      Konfirmasi Sinkronisasi Sukses
                    </span>
                    <span className="text-[11px] text-emerald-300 font-semibold">
                      Terhubung ke Database AI
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Telah Singkron dengan CP Terbaru yang Telah Ditambahkan oleh Admin di Website Admin
                  </h3>
                  <p className="text-xs text-emerald-200/90 leading-relaxed">
                    Dasar acuan: <strong>Keputusan Kepala BSKAP Kemendikbudristek No. 032/H/KR/2024</strong> (Fase A s.d. Fase F untuk Jenjang SD, SMP, SMA, dan SMK).
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right text-xs bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Verifikator Admin:</div>
                <div className="font-bold text-white">Aspian La Ode Madimu, S.Pd. Gr</div>
              </div>
            </div>

            {/* Filter & Search CP Mini-Explorer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>Pilih & Lihat Rincian CP yang Telah Tersinkronkan:</span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Cari Mata Pelajaran / Fase..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
                  />
                </div>

                <div className="flex bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-[11px]">
                  {['SEMUA', 'SD', 'SMP', 'SMA', 'SMK'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setSelectedLevel(lvl)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition ${
                        selectedLevel === lvl
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CP Mini Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredCPs.map((cp) => (
                <div
                  key={cp.id}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 transition flex flex-col justify-between space-y-2 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {cp.level} • {cp.phase}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center">
                        <Check className="w-3 h-3 mr-1" />
                        Tersinkron
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                      {cp.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Mapel: <strong className="text-slate-200">{cp.subject}</strong> | Versi: <span className="text-indigo-400">{cp.curriculumVersion}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500">
                      Diunggah: {cp.uploadedAt.split(' ')[0]}
                    </span>
                    <button
                      onClick={() => setPreviewCP(cp)}
                      className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center"
                    >
                      <span>Lihat Elemen</span>
                      <ChevronRight className="w-3 h-3 ml-0.5" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredCPs.length === 0 && (
                <div className="col-span-full p-6 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-slate-400 text-xs">
                  Tidak ada CP yang sesuai filter pencarian.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SLIDE 3: 9 MODUL GENERATOR AI KURIKULUM DEEP LEARNING */}
        {/* ========================================================================= */}
        {currentSlide === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>9 Generator Perangkat Ajar Otomatis</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Pilih Dokumen Perangkat Ajar Deep Learning yang Ingin Disusun
                </h3>
              </div>
              <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Powered by Gemini AI 2.5
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
              {aiModules.map((mod) => {
                const Icon = mod.icon;
                return (
                  <button
                    key={mod.id}
                    id={`btn-slide-ai-${mod.id}`}
                    onClick={() => onNavigate(mod.id)}
                    className={`p-3 rounded-xl text-left transition flex items-start space-x-3 group ${
                      mod.highlight
                        ? 'bg-indigo-950/60 border-2 border-indigo-500/50 hover:bg-indigo-900/60 shadow-md shadow-indigo-950/50'
                        : 'bg-slate-950/70 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-950'
                    }`}
                  >
                    <div className={`p-2 rounded-lg border shrink-0 ${mod.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition truncate">
                          {mod.name}
                        </h4>
                        {mod.highlight && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500 text-white">
                            Populer
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {mod.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SLIDE 4: ADMINISTRASI POKOK GURU & SIAP BEKERJA */}
        {/* ========================================================================= */}
        {currentSlide === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>10 Modul Administrasi Guru Lengkap</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Semua Fitur Siap Digunakan untuk Menunjang Kinerja Harian Anda
                </h3>
              </div>
            </div>

            {/* Quick Admin Feature Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {adminFeatures.map((feat) => {
                const Icon = feat.icon;
                return (
                  <button
                    key={feat.id}
                    id={`btn-slide-admin-${feat.id}`}
                    onClick={() => onNavigate(feat.id)}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-950 text-left transition space-y-1.5 group flex flex-col justify-between"
                  >
                    <Icon className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" />
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-indigo-200 truncate">
                        {feat.name}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">
                        {feat.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Call to Actions */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950/60 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-300">
                <span className="font-bold text-white">Siap untuk memulai?</span> Pilih aksi di samping untuk langsung bekerja atau jelajahi Dashboard utama.
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btn-slide-modul-ajar-start"
                  onClick={() => onNavigate('ai_modul_ajar')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md transition transform active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Susun RPM / Modul Ajar AI</span>
                </button>

                <button
                  id="btn-slide-dashboard-start"
                  onClick={() => onNavigate('dashboard')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md transition transform active:scale-95"
                >
                  <span>Buka Dashboard Utama</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BOTTOM SLIDE CONTROLS / STEPPER */}
        {/* ========================================================================= */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            id="btn-prev-slide"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${
              currentSlide === 0
                ? 'opacity-30 cursor-not-allowed text-slate-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Slide Sebelumnya</span>
          </button>

          {/* Dots indicator */}
          <div className="flex items-center space-x-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === idx
                    ? 'w-7 bg-indigo-500 shadow-sm shadow-indigo-500/50'
                    : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>

          {currentSlide < slides.length - 1 ? (
            <button
              id="btn-next-slide"
              onClick={nextSlide}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition transform active:scale-95"
            >
              <span>Slide Berikutnya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              id="btn-finish-slide"
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/30 transition transform active:scale-95"
            >
              <span>Masuk Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* MODAL PREVIEW DETAIL CP */}
      {previewCP && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {previewCP.level} • {previewCP.phase}
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {previewCP.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewCP(null)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3.5 text-xs text-slate-300 leading-relaxed">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-slate-500">Mata Pelajaran:</span>
                  <p className="font-bold text-white">{previewCP.subject}</p>
                </div>
                <div>
                  <span className="text-slate-500">Versi Regulasi:</span>
                  <p className="font-bold text-emerald-400">{previewCP.curriculumVersion}</p>
                </div>
                <div>
                  <span className="text-slate-500">Tanggal Sinkronisasi:</span>
                  <p className="font-semibold text-slate-200">{previewCP.uploadedAt}</p>
                </div>
                <div>
                  <span className="text-slate-500">Pengunggah:</span>
                  <p className="font-semibold text-slate-200">{previewCP.uploadedBy}</p>
                </div>
              </div>

              {previewCP.elements && previewCP.elements.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="font-bold text-white text-xs">Elemen & Capaian Pembelajaran:</h4>
                  {previewCP.elements.map((elem, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                      <div className="font-bold text-indigo-300 text-xs">
                        Elemen {i + 1}: {elem.name}
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{elem.description}</p>
                      {elem.competencies && elem.competencies.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Kompetensi Inti:</span>
                          <ul className="list-disc list-inside text-slate-400 pl-1 mt-0.5 space-y-0.5 text-[11px]">
                            {elem.competencies.map((c, ci) => (
                              <li key={ci}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end space-x-2">
              <button
                onClick={() => setPreviewCP(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setPreviewCP(null);
                  onNavigate('ai_analisis_cp');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gunakan CP Ini di AI Generator</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
