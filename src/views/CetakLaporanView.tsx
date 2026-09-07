import React, { useState } from 'react';
import {
  Printer,
  FileSpreadsheet,
  FileText,
  FileCode,
  School,
  CheckCircle2,
  Calendar,
  Users,
  Award,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Sparkles,
  Settings,
} from 'lucide-react';
import { StorageService } from '../lib/storage';
import { ExportService } from '../lib/exportUtils';
import { SchoolProfileModal } from '../components/SchoolProfileModal';

export const CetakLaporanView: React.FC = () => {
  const [schoolProfile, setSchoolProfile] = useState(() => StorageService.getSchoolProfile());
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string>('rekap_nilai');

  const reportItems = [
    {
      id: 'absensi',
      title: '1. Laporan Daftar Hadir & Presensi Siswa',
      category: 'Presensi',
      desc: 'Rekap kehadiran harian siswa per pertemuan, sakit, izin, dan alpa.',
      icon: Users,
      color: 'text-indigo-400 bg-indigo-500/10',
    },
    {
      id: 'jadwal',
      title: '2. Jadwal Tatap Muka Mengajar Guru',
      category: 'Jadwal',
      desc: 'Matriks jam mengajar mingguan guru, alokasi ruang, dan beban tatap muka.',
      icon: Calendar,
      color: 'text-blue-400 bg-blue-500/10',
    },
    {
      id: 'jurnal',
      title: '3. Jurnal Mengajar & Supervisi',
      category: 'Jurnal',
      desc: 'Evaluasi ketercapaian TP, kendala kelas, solusi, dan paraf supervisi.',
      icon: BookOpen,
      color: 'text-teal-400 bg-teal-500/10',
    },
    {
      id: 'wali',
      title: '4. Buku Laporan Wali Kelas & BK',
      category: 'Wali Kelas',
      desc: 'Buku induk data siswa kelas binaan, catatan konseling, dan prestasi.',
      icon: GraduationCap,
      color: 'text-amber-400 bg-amber-500/10',
    },
    {
      id: 'nilai_harian',
      title: '5. Daftar Nilai Formatif & Harian',
      category: 'Penilaian',
      desc: 'Rincian tugas 1-2, ulangan harian (UH), kinerja/proyek, dan NRH.',
      icon: Award,
      color: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      id: 'nilai_pts',
      title: '6. Daftar Nilai Tengah Semester (PTS/STS)',
      category: 'Penilaian',
      desc: 'Skor PG, uraian, remedial, dan capaian KKTP tengah semester.',
      icon: Award,
      color: 'text-cyan-400 bg-cyan-500/10',
    },
    {
      id: 'nilai_pas',
      title: '7. Daftar Nilai Akhir Semester (PAS/SAS)',
      category: 'Penilaian',
      desc: 'Skor teori asesmen sumatif, praktik/portofolio, dan capaian KKTP.',
      icon: Award,
      color: 'text-rose-400 bg-rose-500/10',
    },
    {
      id: 'rekap_nilai',
      title: '8. Leger Rekapitulasi Nilai Rapor Otomatis',
      category: 'Leger',
      desc: 'Kompilasi nilai akhir berbobot, predikat huruf (A/B/C/D), dan deskripsi kompetensi.',
      icon: Award,
      color: 'text-amber-400 bg-amber-500/10',
    },
  ];

  const handleExport = (docId: string, format: 'excel' | 'word' | 'pdf') => {
    const profile = StorageService.getSchoolProfile();
    const students = StorageService.getStudents();
    const classes = StorageService.getClasses();
    const activeClass = classes[0]?.name || `${profile.level || 'SMA'} Kelas ${profile.grade || 10}`;
    const activeSubject = profile.subject || 'Fisika';

    if (docId === 'absensi') {
      const attendanceList = StorageService.getAttendance();
      const latestAttendance = attendanceList[0];
      const records = students.map((s, i) => {
        const att = latestAttendance?.records.find(r => r.studentId === s.id);
        const status = att ? (att.status === 'H' ? 'Hadir' : att.status === 'S' ? 'Sakit' : att.status === 'I' ? 'Izin' : 'Alpa') : 'Hadir';
        return {
          No: i + 1,
          NIS: s.nis,
          'Nama Lengkap': s.name,
          'L/P': s.gender,
          'Status Kehadiran': status,
          Keterangan: att?.notes || 'Disiplin & Aktif',
        };
      });

      if (format === 'excel') {
        ExportService.exportToExcel(records, `Daftar_Hadir_${activeClass}`, 'Presensi', {
          schoolName: profile.schoolName,
          docTitle: `DAFTAR HADIR SISWA - KELAS ${activeClass}`,
          academicYear: profile.academicYear,
          teacherName: profile.teacherName,
        });
      } else {
        const rows = students.map((s, i) => {
          const att = latestAttendance?.records.find(r => r.studentId === s.id);
          const status = att ? att.status : 'H';
          const badge = status === 'H'
            ? '<span style="background-color:#dcfce7; color:#15803d; border:1px solid #86efac; padding:2px 8px; border-radius:10px; font-weight:bold;">Hadir</span>'
            : status === 'S'
            ? '<span style="background-color:#fef9c3; color:#854d0e; border:1px solid #fde047; padding:2px 8px; border-radius:10px; font-weight:bold;">Sakit</span>'
            : status === 'I'
            ? '<span style="background-color:#e0f2fe; color:#0369a1; border:1px solid #7dd3fc; padding:2px 8px; border-radius:10px; font-weight:bold;">Izin</span>'
            : '<span style="background-color:#fee2e2; color:#991b1b; border:1px solid #fca5a5; padding:2px 8px; border-radius:10px; font-weight:bold;">Alpa</span>';
          return `<tr><td style="text-align:center;">${i+1}</td><td>${s.nis}</td><td><strong>${s.name}</strong></td><td style="text-align:center;">${s.gender}</td><td style="text-align:center;">${badge}</td><td>${att?.notes || 'Disiplin dan aktif mengikuti KBM'}</td></tr>`;
        }).join('');

        const tableHtml = `
          <div style="margin-bottom:12px; font-size:10pt;">
            <strong>Mata Pelajaran:</strong> ${activeSubject} | <strong>Kelas:</strong> ${activeClass} | <strong>Semester:</strong> ${profile.semester}
          </div>
          <table style="width:100%; border-collapse:collapse;">
            <thead><tr style="background-color:#1e3a8a; color:#ffffff;"><th style="width:40px;">No</th><th style="width:110px;">NIS</th><th>Nama Lengkap Peserta Didik</th><th style="width:60px;">L/P</th><th style="width:100px;">Status</th><th>Catatan Kehadiran</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        `;

        if (format === 'word') {
          ExportService.exportToWord(`DAFTAR HADIR SISWA - ${activeClass}`, tableHtml, profile, `Absensi_${activeClass}`);
        } else {
          ExportService.printPdfPreview(`DAFTAR HADIR SISWA - ${activeClass}`, tableHtml, profile);
        }
      }
    } else if (docId === 'rekap_nilai' || docId === 'nilai_harian' || docId === 'nilai_pts' || docId === 'nilai_pas') {
      const grades = StorageService.getGrades();
      const records = students.map((s, i) => {
        const g = grades.find(x => x.studentId === s.id);
        const nrh = g?.dailyAverage || 85;
        const pts = g?.ptsScore || 84;
        const pas = g?.pasScore || 86;
        const na = g?.finalScore || Math.round((nrh * 0.4) + (pts * 0.3) + (pas * 0.3));
        const predikat = g?.predicate || (na >= 90 ? 'A' : na >= 80 ? 'B' : na >= 70 ? 'C' : 'D');
        const status = na >= 75 ? 'Tuntas' : 'Remedial';

        return {
          No: i + 1,
          NIS: s.nis,
          'Nama Lengkap': s.name,
          'Rata Harian (NRH)': nrh,
          'Nilai PTS': pts,
          'Nilai PAS': pas,
          'Nilai Akhir (NA)': na,
          Predikat: predikat,
          'Status KKTP': status,
        };
      });

      if (format === 'excel') {
        ExportService.exportToExcel(records, `Leger_Nilai_${activeClass}`, 'Leger Nilai', {
          schoolName: profile.schoolName,
          docTitle: `LEGER REKAPITULASI NILAI - KELAS ${activeClass}`,
          academicYear: profile.academicYear,
          teacherName: profile.teacherName,
        });
      } else {
        const rows = students.map((s, i) => {
          const g = grades.find(x => x.studentId === s.id);
          const nrh = g?.dailyAverage || 85;
          const pts = g?.ptsScore || 84;
          const pas = g?.pasScore || 86;
          const na = g?.finalScore || Math.round((nrh * 0.4) + (pts * 0.3) + (pas * 0.3));
          const predikat = g?.predicate || (na >= 90 ? 'A' : na >= 80 ? 'B' : na >= 70 ? 'C' : 'D');
          const predBadge = predikat === 'A'
            ? '<span style="background-color:#dcfce7; color:#15803d; font-weight:bold; padding:2px 8px; border-radius:6px;">A</span>'
            : predikat === 'B'
            ? '<span style="background-color:#e0f2fe; color:#0369a1; font-weight:bold; padding:2px 8px; border-radius:6px;">B</span>'
            : '<span style="background-color:#fef9c3; color:#854d0e; font-weight:bold; padding:2px 8px; border-radius:6px;">C</span>';
          const statusBadge = na >= 75
            ? '<span style="background-color:#dcfce7; color:#15803d; border:1px solid #86efac; padding:2px 8px; border-radius:10px; font-weight:bold;">✓ Tuntas</span>'
            : '<span style="background-color:#fee2e2; color:#991b1b; border:1px solid #fca5a5; padding:2px 8px; border-radius:10px; font-weight:bold;">⚠ Remedial</span>';

          return `<tr><td style="text-align:center;">${i+1}</td><td>${s.nis}</td><td><strong>${s.name}</strong></td><td style="text-align:center;">${nrh}</td><td style="text-align:center;">${pts}</td><td style="text-align:center;">${pas}</td><td style="text-align:center; font-weight:bold; background-color:#f1f5f9; color:#1e3a8a;">${na}</td><td style="text-align:center;">${predBadge}</td><td style="text-align:center;">${statusBadge}</td></tr>`;
        }).join('');

        const tableHtml = `
          <div style="margin-bottom:12px; font-size:10pt;">
            <strong>Mata Pelajaran:</strong> ${activeSubject} | <strong>Kelas:</strong> ${activeClass} | <strong>Kriteria Ketuntasan (KKTP):</strong> 75
          </div>
          <table style="width:100%; border-collapse:collapse;">
            <thead><tr style="background-color:#1e3a8a; color:#ffffff;"><th style="width:35px;">No</th><th style="width:100px;">NIS</th><th>Nama Siswa</th><th style="width:65px;">NRH</th><th style="width:65px;">PTS</th><th style="width:65px;">PAS</th><th style="width:70px;">NA</th><th style="width:60px;">Pred</th><th style="width:90px;">Status</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        `;

        if (format === 'word') {
          ExportService.exportToWord(`LEGER NILAI RAPOR - ${activeClass}`, tableHtml, profile, `Leger_Nilai_${activeClass}`);
        } else {
          ExportService.printPdfPreview(`LEGER NILAI RAPOR - ${activeClass}`, tableHtml, profile);
        }
      }
    } else if (docId === 'jadwal') {
      const sched = StorageService.getSchedule();
      const records = sched.map((s, i) => ({
        No: i + 1,
        Hari: s.day,
        'Jam Ke': s.period,
        Waktu: `${s.startTime} - ${s.endTime}`,
        Kelas: s.className,
        Mapel: s.subject,
        Ruang: s.room,
      }));

      if (format === 'excel') {
        ExportService.exportToExcel(records, `Jadwal_Mengajar`, 'Jadwal', {
          schoolName: profile.schoolName,
          docTitle: `JADWAL TATAP MUKA MENGAJAR GURU`,
          academicYear: profile.academicYear,
          teacherName: profile.teacherName,
        });
      } else {
        const rows = sched.map((s, i) => `<tr><td style="text-align:center;">${i+1}</td><td><span style="background-color:#eff6ff; color:#1d4ed8; font-weight:bold; padding:2px 8px; border-radius:6px;">${s.day}</span></td><td style="text-align:center;">Jam ${s.period}</td><td style="text-align:center;">${s.startTime} - ${s.endTime}</td><td><strong>${s.className}</strong></td><td>${s.subject}</td><td><span style="background-color:#f1f5f9; padding:2px 6px; border-radius:4px;">${s.room}</span></td></tr>`).join('');
        const tableHtml = `
          <table style="width:100%; border-collapse:collapse;">
            <thead><tr style="background-color:#1e3a8a; color:#ffffff;"><th style="width:40px;">No</th><th style="width:100px;">Hari</th><th style="width:80px;">Jam Ke</th><th style="width:120px;">Waktu KBM</th><th>Kelas / Rombel</th><th>Mata Pelajaran</th><th>Ruangan</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        `;
        if (format === 'word') ExportService.exportToWord(`JADWAL MENGAJAR GURU`, tableHtml, profile, `Jadwal_Mengajar`);
        else ExportService.printPdfPreview(`JADWAL MENGAJAR GURU`, tableHtml, profile);
      }
    } else if (docId === 'agenda') {
      const ag = StorageService.getAgenda();
      const records = ag.map((a, i) => ({
        No: i + 1,
        Tanggal: a.date,
        Kelas: a.className,
        Mapel: a.subject,
        Materi: a.topic,
        Kegiatan: a.activities,
        Status: a.status,
      }));

      if (format === 'excel') {
        ExportService.exportToExcel(records, `Buku_Agenda_Guru`, 'Agenda', {
          schoolName: profile.schoolName,
          docTitle: `BUKU AGENDA HARIAN MENGAJAR GURU`,
          academicYear: profile.academicYear,
          teacherName: profile.teacherName,
        });
      } else {
        const rows = ag.map((a, i) => {
          const statusBadge = a.status === 'Selesai'
            ? '<span style="background-color:#dcfce7; color:#15803d; border:1px solid #86efac; padding:2px 8px; border-radius:10px; font-weight:bold;">✓ Selesai</span>'
            : '<span style="background-color:#fef9c3; color:#854d0e; border:1px solid #fde047; padding:2px 8px; border-radius:10px; font-weight:bold;">Tertunda</span>';
          return `<tr><td style="text-align:center;">${i+1}</td><td>${a.date}</td><td><strong>${a.className}</strong></td><td>${a.topic}</td><td>${a.activities}</td><td style="text-align:center;">${statusBadge}</td></tr>`;
        }).join('');
        const tableHtml = `
          <table style="width:100%; border-collapse:collapse;">
            <thead><tr style="background-color:#1e3a8a; color:#ffffff;"><th style="width:40px;">No</th><th style="width:100px;">Tanggal</th><th style="width:90px;">Kelas</th><th>Pokok Materi / TP</th><th>Aktivitas KBM</th><th style="width:110px;">Keterlaksanaan</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        `;
        if (format === 'word') ExportService.exportToWord(`BUKU AGENDA GURU`, tableHtml, profile, `Buku_Agenda_Guru`);
        else ExportService.printPdfPreview(`BUKU AGENDA GURU`, tableHtml, profile);
      }
    } else {
      // Jurnal / Wali
      const jr = StorageService.getJournal();
      const records = jr.map((j, i) => ({
        No: i + 1,
        Tanggal: j.date,
        Kelas: j.className,
        Mapel: j.subject,
        'TP Capaian': j.tpCovered,
        Kemajuan: j.learningProgress,
      }));

      if (format === 'excel') {
        ExportService.exportToExcel(records, `Jurnal_Mengajar`, 'Jurnal', {
          schoolName: profile.schoolName,
          docTitle: `JURNAL MENGAJAR & KEMAJUAN BELAJAR`,
          academicYear: profile.academicYear,
          teacherName: profile.teacherName,
        });
      } else {
        const rows = jr.map((j, i) => `<tr><td style="text-align:center;">${i+1}</td><td>${j.date}</td><td><strong>${j.className}</strong></td><td><span style="background-color:#dbeafe; color:#1e40af; padding:2px 6px; border-radius:4px; font-weight:bold;">${j.tpCovered}</span></td><td>${j.learningProgress}</td></tr>`).join('');
        const tableHtml = `
          <table style="width:100%; border-collapse:collapse;">
            <thead><tr style="background-color:#1e3a8a; color:#ffffff;"><th style="width:40px;">No</th><th style="width:100px;">Tanggal</th><th style="width:90px;">Kelas</th><th>Tujuan Pembelajaran</th><th>Evaluasi & Kemajuan Peserta Didik</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        `;
        if (format === 'word') ExportService.exportToWord(`JURNAL MENGAJAR GURU`, tableHtml, profile, `Jurnal_Mengajar`);
        else ExportService.printPdfPreview(`JURNAL MENGAJAR GURU`, tableHtml, profile);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">6. Pusat Cetak Dokumen & Ekspor Laporan</h1>
            <p className="text-xs text-slate-400">
              Cetak laporan administrasi guru resmi berstandar Dinas Pendidikan dengan 3 opsi format (Excel, Word, dan PDF).
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowProfileModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-sm"
        >
          <Settings className="w-4 h-4 text-indigo-400" />
          <span>Atur Kop & TTD Pejabat</span>
        </button>
      </div>

      {/* Current Kop Surat Preview Banner */}
      <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-300">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">{schoolProfile.schoolName}</div>
            <div className="text-[11px] text-slate-300">
              {schoolProfile.address}, {schoolProfile.city} • TP. {schoolProfile.academicYear} ({schoolProfile.semester})
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Kepsek: <strong>{schoolProfile.headmasterName}</strong> (NIP. {schoolProfile.headmasterNip}) | Guru: <strong>{schoolProfile.teacherName}</strong>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowProfileModal(true)}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 self-start sm:self-center transition"
        >
          Ubah Data Kop
        </button>
      </div>

      {/* Grid of Report Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <div className={`p-2 rounded-xl ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>

              {/* 3 Format Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-1.5 text-xs">
                <button
                  onClick={() => handleExport(item.id, 'excel')}
                  className="py-1.5 px-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold transition flex items-center justify-center space-x-1"
                  title="Ekspor Format Spreadsheet Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Excel</span>
                </button>

                <button
                  onClick={() => handleExport(item.id, 'word')}
                  className="py-1.5 px-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold transition flex items-center justify-center space-x-1"
                  title="Ekspor Format Microsoft Word (.doc)"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Word</span>
                </button>

                <button
                  onClick={() => handleExport(item.id, 'pdf')}
                  className="py-1.5 px-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold transition flex items-center justify-center space-x-1"
                  title="Cetak Langsung / Simpan PDF dengan Kop Surat"
                >
                  <Printer className="w-3.5 h-3.5 text-rose-400" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <SchoolProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSaved={() => setSchoolProfile(StorageService.getSchoolProfile())}
      />
    </div>
  );
};
