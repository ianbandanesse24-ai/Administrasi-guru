import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  FileSpreadsheet,
  FileText,
  Printer,
  CheckCircle2,
  ShieldCheck,
  Save,
  AlertTriangle,
  Sparkles,
  Layers,
  Users,
  UserCheck,
  UserX,
  AlertCircle,
  RotateCcw,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { JournalItem, ClassRoom, CPDistributionPlan, AttendanceRecord, Student } from '../types';
import { StorageService } from '../lib/storage';
import { ExportService } from '../lib/exportUtils';
import { SUBJECT_LIST } from '../lib/curriculumData';
import { OfflineAdminNotice } from '../components/OfflineSyncIndicator';

export const JurnalView: React.FC = () => {
  const [journals, setJournals] = useState<JournalItem[]>(() => StorageService.getJournal());
  const [classes, setClasses] = useState<ClassRoom[]>(() => StorageService.getClasses());
  const [students, setStudents] = useState<Student[]>(() => StorageService.getStudents());
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>(() => StorageService.getAttendance());
  const [cpPlans, setCpPlans] = useState<CPDistributionPlan[]>(() => StorageService.getCPDistributions());
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<JournalItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');

  // Form states
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [className, setClassName] = useState(classes[0]?.name || 'X SMA 1 (Fase E)');
  const [subject, setSubject] = useState(classes[0]?.level === 'SD' ? 'Guru Kelas (Tematik/IPAS)' : 'Bahasa Indonesia');
  const [material, setMaterial] = useState('');
  const [tpCovered, setTpCovered] = useState('');
  const [learningProgress, setLearningProgress] = useState('');
  const [obstacles, setObstacles] = useState('');
  const [solution, setSolution] = useState('');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [supervisorNotes, setSupervisorNotes] = useState('');

  // Attendance counts in Journal
  const [hadir, setHadir] = useState<number>(32);
  const [sakit, setSakit] = useState<number>(0);
  const [izin, setIzin] = useState<number>(0);
  const [alpa, setAlpa] = useState<number>(0);
  const [bolos, setBolos] = useState<number>(0);
  const [absentNames, setAbsentNames] = useState<string>('');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    setClasses(StorageService.getClasses());
    setStudents(StorageService.getStudents());
    setAttendanceList(StorageService.getAttendance());
    setCpPlans(StorageService.getCPDistributions());
  }, [showModal]);

  // Extract all available TPs from master CP plans
  const availableTPs = cpPlans.flatMap((plan) => [
    ...plan.materialsSem1.map((m) => ({
      subject: plan.subject,
      level: plan.level,
      grade: plan.grade,
      tpCode: m.tpCode,
      tpName: m.tpName,
      essentialMaterial: m.essentialMaterial,
      deepLearning: m.deepLearningMethod,
    })),
    ...plan.materialsSem2.map((m) => ({
      subject: plan.subject,
      level: plan.level,
      grade: plan.grade,
      tpCode: m.tpCode,
      tpName: m.tpName,
      essentialMaterial: m.essentialMaterial,
      deepLearning: m.deepLearningMethod,
    })),
  ]);

  const handleSelectQuickTP = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    if (!selectedCode) return;
    const found = availableTPs.find((tp) => tp.tpCode === selectedCode);
    if (found) {
      setTpCovered(`${found.tpCode}: ${found.tpName}`);
      if (found.essentialMaterial) {
        setMaterial(found.essentialMaterial);
      }
      if (found.subject && !subject) {
        setSubject(found.subject);
      }
      if (!learningProgress) {
        setLearningProgress(
          `Peserta didik aktif mempelajari materi "${found.essentialMaterial}" melalui pendekatan ${
            found.deepLearning || 'Deep Learning (Mindful, Meaningful, Joyful)'
          }.`
        );
      }
    }
  };

  // Auto-sync attendance data from Absensi records
  const handleAutoSyncAttendance = (targetClass: string, targetDate: string) => {
    const allAttendance = StorageService.getAttendance();
    const allStudents = StorageService.getStudents();
    const classStudents = allStudents.filter(
      (s) => s.className === targetClass || s.classId === classes.find((c) => c.name === targetClass)?.id
    );
    const totalClassSize = classStudents.length > 0 ? classStudents.length : 32;

    const matchedRecord = allAttendance.find(
      (a) => (a.className === targetClass || a.classId === classes.find((c) => c.name === targetClass)?.id) && a.date === targetDate
    );

    if (matchedRecord && matchedRecord.records && matchedRecord.records.length > 0) {
      let sCount = 0;
      let iCount = 0;
      let aCount = 0;
      let bCount = 0;
      let hCount = 0;
      const nonPresentNames: string[] = [];

      matchedRecord.records.forEach((r) => {
        const noteLower = (r.notes || '').toLowerCase();
        const isBolos = noteLower.includes('bolos') || noteLower.includes('kabur') || noteLower.includes('keluar kelas');

        if (isBolos) {
          bCount += 1;
          nonPresentNames.push(`${r.studentName} (Bolos${r.notes ? ': ' + r.notes : ''})`);
        } else if (r.status === 'S') {
          sCount += 1;
          nonPresentNames.push(`${r.studentName} (Sakit${r.notes ? ': ' + r.notes : ''})`);
        } else if (r.status === 'I') {
          iCount += 1;
          nonPresentNames.push(`${r.studentName} (Izin${r.notes ? ': ' + r.notes : ''})`);
        } else if (r.status === 'A') {
          aCount += 1;
          nonPresentNames.push(`${r.studentName} (Alpa${r.notes ? ': ' + r.notes : ''})`);
        } else {
          hCount += 1;
        }
      });

      setHadir(hCount);
      setSakit(sCount);
      setIzin(iCount);
      setAlpa(aCount);
      setBolos(bCount);
      setAbsentNames(nonPresentNames.join(', '));
      setSyncFeedback(`Berhasil disinkronkan dari Absensi Kelas: Hadir ${hCount}, Sakit ${sCount}, Izin ${iCount}, Alpa ${aCount}, Bolos ${bCount}`);
    } else {
      // Set reasonable defaults if no specific attendance record is found yet
      setHadir(totalClassSize);
      setSakit(0);
      setIzin(0);
      setAlpa(0);
      setBolos(0);
      setAbsentNames('');
      setSyncFeedback(`Data absensi tanggal ${targetDate} belum diisi di menu Absensi. Nilai kehadiran diatur default (Total ${totalClassSize} siswa).`);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    const today = new Date().toISOString().substring(0, 10);
    const initialClass = classes[0]?.name || 'X SMA 1 (Fase E)';
    const initialSubj = classes[0]?.level === 'SD' ? 'Guru Kelas (Tematik/IPAS)' : 'Bahasa Indonesia';
    const allStudents = StorageService.getStudents();
    const classStudents = allStudents.filter((s) => s.className === initialClass);
    const totalClassSize = classStudents.length > 0 ? classStudents.length : 32;

    setDate(today);
    setClassName(initialClass);
    setSubject(initialSubj);
    setMaterial('');
    setTpCovered('');
    setLearningProgress('');
    setObstacles('');
    setSolution('');
    setTeacherNotes('');
    setSupervisorNotes('');
    setHadir(totalClassSize);
    setSakit(0);
    setIzin(0);
    setAlpa(0);
    setBolos(0);
    setAbsentNames('');
    setSyncFeedback(null);
    setShowModal(true);

    // Try auto-syncing if today's attendance exists
    handleAutoSyncAttendance(initialClass, today);
  };

  const handleOpenEdit = (item: JournalItem) => {
    setEditingItem(item);
    setDate(item.date);
    setClassName(item.className);
    setSubject(item.subject);
    setMaterial(item.material || item.materi || '');
    setTpCovered(item.tpCovered);
    setLearningProgress(item.learningProgress);
    setObstacles(item.obstacles);
    setSolution(item.solution);
    setTeacherNotes(item.teacherNotes);
    setSupervisorNotes(item.supervisorNotes || '');
    setHadir(item.hadir !== undefined ? item.hadir : 32);
    setSakit(item.sakit || 0);
    setIzin(item.izin || 0);
    setAlpa(item.alpa || 0);
    setBolos(item.bolos || 0);
    setAbsentNames(item.absentNames || '');
    setSyncFeedback(null);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: JournalItem[];
    if (editingItem) {
      updated = journals.map((j) =>
        j.id === editingItem.id
          ? {
              ...j,
              date,
              className,
              subject,
              material: material || j.material || '',
              materi: material || j.materi || '',
              tpCovered,
              learningProgress,
              obstacles,
              solution,
              teacherNotes,
              supervisorNotes,
              hadir: Number(hadir),
              sakit: Number(sakit),
              izin: Number(izin),
              alpa: Number(alpa),
              bolos: Number(bolos),
              absentNames: absentNames.trim(),
            }
          : j
      );
    } else {
      const newItem: JournalItem = {
        id: `jr-${Date.now()}`,
        date,
        className,
        subject,
        material: material.trim(),
        materi: material.trim(),
        tpCovered,
        learningProgress,
        obstacles,
        solution,
        teacherNotes,
        signatureVerified: true,
        supervisorNotes: supervisorNotes || 'Telah diperiksa dan diverifikasi.',
        hadir: Number(hadir),
        sakit: Number(sakit),
        izin: Number(izin),
        alpa: Number(alpa),
        bolos: Number(bolos),
        absentNames: absentNames.trim(),
      };
      updated = [newItem, ...journals];
    }

    setJournals(updated);
    StorageService.saveJournal(updated);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus entri jurnal ini?')) {
      const updated = journals.filter((j) => j.id !== id);
      setJournals(updated);
      StorageService.saveJournal(updated);
    }
  };

  // Filtered journals
  const filteredJournals = journals.filter((j) => {
    const matchClass = filterClass === 'ALL' || j.className === filterClass;
    const matchSearch =
      searchTerm === '' ||
      j.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.material || j.materi || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.tpCovered.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.absentNames || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.date.includes(searchTerm);
    return matchClass && matchSearch;
  });

  // Calculate cumulative stats
  const totalSakit = journals.reduce((acc, curr) => acc + (curr.sakit || 0), 0);
  const totalIzin = journals.reduce((acc, curr) => acc + (curr.izin || 0), 0);
  const totalAlpa = journals.reduce((acc, curr) => acc + (curr.alpa || 0), 0);
  const totalBolos = journals.reduce((acc, curr) => acc + (curr.bolos || 0), 0);
  const totalTidakHadir = totalSakit + totalIzin + totalAlpa + totalBolos;

  // Exports
  const handleExportExcel = () => {
    const exportData = filteredJournals.map((j, idx) => ({
      No: idx + 1,
      Tanggal: j.date,
      Kelas: j.className,
      'Mata Pelajaran': j.subject,
      'Materi yang Diajarkan': j.material || j.materi || '-',
      'Tujuan Pembelajaran (TP)': j.tpCovered,
      'Hadir (H)': j.hadir ?? '-',
      'Sakit (S)': j.sakit || 0,
      'Izin (I)': j.izin || 0,
      'Alpa (A)': j.alpa || 0,
      'Bolos (B)': j.bolos || 0,
      'Total Tidak Hadir': (j.sakit || 0) + (j.izin || 0) + (j.alpa || 0) + (j.bolos || 0),
      'Rincian Siswa Tidak Hadir / Keterangan': j.absentNames || '-',
      'Ketercapaian / Kemajuan Belajar': j.learningProgress,
      'Hambatan / Kendala': j.obstacles || '-',
      'Solusi / Pemecahan Masalah': j.solution || '-',
      'Catatan Guru': j.teacherNotes || '-',
      'Status Verifikasi': j.signatureVerified ? 'Terverifikasi' : 'Belum Diverifikasi',
    }));
    ExportService.exportToExcel(exportData, 'Jurnal_Mengajar_Guru');
  };

  const handleExportWord = () => {
    const schoolProfile = StorageService.getSchoolProfile();
    let rows = '';
    filteredJournals.forEach((j, idx) => {
      const s = j.sakit || 0;
      const i = j.izin || 0;
      const a = j.alpa || 0;
      const b = j.bolos || 0;
      const h = j.hadir !== undefined ? j.hadir : '-';
      const absentInfo = j.absentNames ? `<br/><small style="color:#64748b; font-style:italic;">Ket: ${j.absentNames}</small>` : '';

      rows += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td style="text-align:center;">${j.date}</td>
          <td><strong>${j.className}</strong><br><small>${j.subject}</small></td>
          <td><strong>${j.material || j.materi || '-'}</strong><br><small><strong>TP:</strong> ${j.tpCovered}</small></td>
          <td style="text-align:center; font-size:11px;">
            <strong>H:${h}</strong> | S:${s} | I:${i} | <span style="color:#b91c1c; font-weight:bold;">A:${a}</span> | <span style="color:#7c3aed; font-weight:bold;">B:${b}</span>
            ${absentInfo}
          </td>
          <td>${j.learningProgress}</td>
          <td><strong style="color:#b91c1c;">Kendala:</strong> ${j.obstacles || '-'}<br><strong style="color:#15803d;">Solusi:</strong> ${j.solution || '-'}</td>
          <td>${j.teacherNotes || '-'}</td>
          <td style="text-align:center;"><strong>${j.signatureVerified ? 'VALID' : '-'}</strong></td>
        </tr>
      `;
    });

    const bodyHtml = `
      <table>
        <thead>
          <tr>
            <th style="width:30px;">No</th>
            <th style="width:75px;">Tanggal</th>
            <th style="width:105px;">Kelas & Mapel</th>
            <th>Materi Pokok & TP</th>
            <th style="width:130px;">Absensi (H/S/I/A/B)</th>
            <th>Ketercapaian Belajar</th>
            <th>Kendala & Solusi</th>
            <th>Catatan</th>
            <th style="width:50px;">Paraf</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    ExportService.exportToWord('JURNAL HARIAN MENGAJAR GURU', bodyHtml, schoolProfile, 'Jurnal_Mengajar_Guru');
  };

  const handlePrintPdf = () => {
    const schoolProfile = StorageService.getSchoolProfile();
    let rows = '';
    filteredJournals.forEach((j, idx) => {
      const s = j.sakit || 0;
      const i = j.izin || 0;
      const a = j.alpa || 0;
      const b = j.bolos || 0;
      const h = j.hadir !== undefined ? j.hadir : '-';
      const absentInfo = j.absentNames ? `<br/><small style="color:#64748b;">(${j.absentNames})</small>` : '';

      rows += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td style="text-align:center;">${j.date}</td>
          <td><strong>${j.className}</strong><br><small>${j.subject}</small></td>
          <td><strong>${j.material || j.materi || '-'}</strong><br><small>TP: ${j.tpCovered}</small></td>
          <td style="text-align:center; font-size:10px;">
            H:${h} | S:${s} | I:${i} | <strong>A:${a}</strong> | <strong>B:${b}</strong>
            ${absentInfo}
          </td>
          <td>${j.learningProgress}</td>
          <td><strong>K:</strong> ${j.obstacles || '-'}<br><strong>S:</strong> ${j.solution || '-'}</td>
          <td>${j.teacherNotes || '-'}</td>
          <td style="text-align:center;">${j.signatureVerified ? '✓' : '-'}</td>
        </tr>
      `;
    });

    const bodyHtml = `
      <table>
        <thead>
          <tr>
            <th style="width:28px;">No</th>
            <th style="width:70px;">Tanggal</th>
            <th style="width:100px;">Kelas/Mapel</th>
            <th>Materi & Capaian TP</th>
            <th style="width:125px;">Kehadiran</th>
            <th>Hasil Kemajuan</th>
            <th>Kendala & Solusi</th>
            <th>Catatan</th>
            <th style="width:40px;">Paraf</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    ExportService.printPdfPreview('JURNAL HARIAN MENGAJAR GURU', bodyHtml, schoolProfile);
  };

  return (
    <div className="space-y-6">
      {/* Offline Storage & Cloud Sync Notice */}
      <OfflineAdminNotice menuTitle="Jurnal Harian Mengajar Guru" />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">4. Jurnal Harian Mengajar Guru</h1>
            <p className="text-xs text-slate-400">
              Dokumentasi materi ajar, capaian TP, rekapitulasi kehadiran (Sakit, Izin, Alpa, Bolos), kendala kelas, dan solusi pedagogik.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Excel</span>
          </button>
          <button
            onClick={handleExportWord}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 transition"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Word</span>
          </button>
          <button
            onClick={handlePrintPdf}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 transition"
          >
            <Printer className="w-4 h-4 text-rose-400" />
            <span>PDF</span>
          </button>
          <button
            id="btn-add-journal"
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tulis Jurnal Baru</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Jurnal</span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-black text-white">{journals.length}</div>
          <p className="text-[10px] text-slate-500">Pertemuan tercatat</p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Sakit (S)</span>
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          </div>
          <div className="text-xl font-black text-amber-300">{totalSakit}</div>
          <p className="text-[10px] text-slate-500">Siswa izin sakit</p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Izin (I)</span>
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
          </div>
          <div className="text-xl font-black text-sky-300">{totalIzin}</div>
          <p className="text-[10px] text-slate-500">Izin keperluan/kegiatan</p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Alpa (A)</span>
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
          </div>
          <div className="text-xl font-black text-rose-300">{totalAlpa}</div>
          <p className="text-[10px] text-slate-500">Tanpa keterangan</p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Bolos (B)</span>
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          </div>
          <div className="text-xl font-black text-purple-300">{totalBolos}</div>
          <p className="text-[10px] text-slate-500">Keluar kelas/bolos</p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Absen</span>
            <UserX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-black text-slate-200">{totalTidakHadir}</div>
          <p className="text-[10px] text-slate-500">Akumulasi ketidakhadiran</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari materi, TP, tanggal, kelas, atau nama siswa absen..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Semua Kelas / Rombel</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.name}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Journal Cards List */}
      <div className="space-y-4">
        {filteredJournals.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-500 text-xs space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p>Belum ada catatan jurnal mengajar yang sesuai filter.</p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tulis Jurnal Sekarang</span>
            </button>
          </div>
        ) : (
          filteredJournals.map((j) => {
            const sakitCount = j.sakit || 0;
            const izinCount = j.izin || 0;
            const alpaCount = j.alpa || 0;
            const bolosCount = j.bolos || 0;
            const hadirCount = j.hadir !== undefined ? j.hadir : '-';
            const totalAbsenEntry = sakitCount + izinCount + alpaCount + bolosCount;

            return (
              <div
                key={j.id}
                className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-4 shadow-sm"
              >
                {/* Header Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {j.className}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300">
                      {j.subject}
                    </span>
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Paraf Terverifikasi</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span className="font-medium text-slate-300">📅 {j.date}</span>
                    <div className="flex space-x-1 pl-2">
                      <button
                        onClick={() => handleOpenEdit(j)}
                        title="Edit Jurnal"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(j.id)}
                        title="Hapus Jurnal"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Materi yang Diajarkan & TP Covered */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  {/* Materi Box */}
                  <div className="md:col-span-6 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/90 space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      <span>Materi yang Diajarkan / Pokok Bahasan:</span>
                    </div>
                    <p className="text-xs text-white font-semibold">
                      {j.material || j.materi || '(Materi belum ditentukan)'}
                    </p>
                  </div>

                  {/* TP Box */}
                  <div className="md:col-span-6 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/90 space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-400">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Tujuan Pembelajaran (TP) yang Dicapai:</span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium">
                      {j.tpCovered}
                    </p>
                  </div>
                </div>

                {/* Kehadiran / Absensi Siswa Bar */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-teal-400" />
                      <span>Rekapitulasi Kehadiran Siswa Pertemuan Ini:</span>
                    </span>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center space-x-1">
                        <UserCheck className="w-3 h-3 text-emerald-400" />
                        <span>Hadir: {hadirCount}</span>
                      </span>

                      <span className={`px-2 py-0.5 rounded-md font-bold border ${sakitCount > 0 ? 'bg-amber-950/80 text-amber-300 border-amber-800/60' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                        Sakit: {sakitCount}
                      </span>

                      <span className={`px-2 py-0.5 rounded-md font-bold border ${izinCount > 0 ? 'bg-sky-950/80 text-sky-300 border-sky-800/60' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                        Izin: {izinCount}
                      </span>

                      <span className={`px-2 py-0.5 rounded-md font-bold border ${alpaCount > 0 ? 'bg-rose-950/80 text-rose-300 border-rose-800/60' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                        Alpa: {alpaCount}
                      </span>

                      <span className={`px-2 py-0.5 rounded-md font-bold border ${bolosCount > 0 ? 'bg-purple-950/80 text-purple-300 border-purple-800/60' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                        Bolos: {bolosCount}
                      </span>
                    </div>
                  </div>

                  {j.absentNames && (
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 flex items-start space-x-1.5">
                      <AlertCircle className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-slate-300">Rincian Siswa Tidak Hadir / Bolos:</strong> {j.absentNames}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress / Hasil Belajar */}
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-300">Hasil & Kemajuan Belajar Siswa:</span>
                  <p className="text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                    {j.learningProgress}
                  </p>
                </div>

                {/* Obstacle vs Solution Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Kendala / Hambatan di Kelas:
                    </span>
                    <p className="text-slate-300">{j.obstacles || 'Tidak ada kendala berarti.'}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Solusi & Tindak Lanjut Pedagogik:
                    </span>
                    <p className="text-slate-300">{j.solution || 'Pembelajaran berjalan lancar dan interaktif.'}</p>
                  </div>
                </div>

                {/* Teacher Notes & Supervisor Notes */}
                {(j.teacherNotes || j.supervisorNotes) && (
                  <div className="flex flex-col sm:flex-row gap-2 text-[11px] text-slate-400 pt-1">
                    {j.teacherNotes && (
                      <div className="flex-1 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/50">
                        <strong className="text-slate-300">Catatan Guru:</strong> {j.teacherNotes}
                      </div>
                    )}
                    {j.supervisorNotes && (
                      <div className="bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/50">
                        <strong className="text-slate-300">Catatan Verifikasi:</strong> {j.supervisorNotes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add/Edit Journal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  {editingItem ? 'Edit Jurnal Harian Mengajar' : 'Tulis Jurnal Harian Mengajar Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Row 1: Tanggal, Kelas, Mapel */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tanggal KBM</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      handleAutoSyncAttendance(className, e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Pilih Kelas / Rombel</label>
                  <select
                    value={className}
                    onChange={(e) => {
                      setClassName(e.target.value);
                      handleAutoSyncAttendance(e.target.value, date);
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.name}>
                        {cls.name}
                      </option>
                    ))}
                    {!classes.some((c) => c.name === className) && (
                      <option value={className}>{className} (Kustom)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Mata Pelajaran</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    {SUBJECT_LIST.map((subj) => (
                      <option key={subj} value={subj}>
                        {subj}
                      </option>
                    ))}
                    {!SUBJECT_LIST.includes(subject) && <option value={subject}>{subject} (Kustom)</option>}
                  </select>
                </div>
              </div>

              {/* Quick TP Picker */}
              {availableTPs.length > 0 && (
                <div className="bg-indigo-950/40 p-3 rounded-xl border border-indigo-500/30 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-indigo-300 font-bold text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Pilih Cepat Tujuan Pembelajaran & Materi (Bank TP Master):</span>
                  </div>
                  <select
                    defaultValue=""
                    onChange={handleSelectQuickTP}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-indigo-500/40 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-400"
                  >
                    <option value="">-- Pilih TP dari Bank Data Pembagian Materi CP --</option>
                    {availableTPs.map((tp, idx) => (
                      <option key={`${tp.tpCode}-${idx}`} value={tp.tpCode}>
                        [{tp.tpCode}] {tp.subject} - {tp.essentialMaterial}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Materi yang Diajarkan & TP Covered */}
              <div className="space-y-3">
                <div>
                  <label className="block text-amber-300 font-bold mb-1 flex items-center space-x-1">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Materi yang Diajarkan / Pokok Bahasan</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="Contoh: Pengukuran Besaran Fisika & Angka Penting..."
                    className="w-full px-3 py-2 bg-slate-950 border border-amber-500/40 rounded-xl text-white font-medium focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Capaian / Tujuan Pembelajaran (TP) yang Diajarkan</label>
                  <textarea
                    rows={2}
                    required
                    value={tpCovered}
                    onChange={(e) => setTpCovered(e.target.value)}
                    placeholder="Contoh: TP.10.1: Mengidentifikasi macam-macam alat ukur besaran panjang dan mengolah data hasil pengukuran..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Rekapitulasi Kehadiran Siswa (Sakit, Izin, Alpa, Bolos, Hadir) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5 text-teal-300 font-bold text-xs">
                    <Users className="w-4 h-4 text-teal-400" />
                    <span>Rekapitulasi Jumlah Kehadiran Siswa:</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAutoSyncAttendance(className, date)}
                    className="flex items-center space-x-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 hover:bg-indigo-950 px-2.5 py-1 rounded-lg border border-indigo-800/60 transition"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Tarik Data dari Absensi Kelas</span>
                  </button>
                </div>

                {syncFeedback && (
                  <p className="text-[10px] text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800">
                    ℹ️ {syncFeedback}
                  </p>
                )}

                {/* 5 Attendance Counters */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {/* Hadir */}
                  <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/60 space-y-1">
                    <label className="block text-[10px] font-bold text-emerald-300">🟢 Hadir (H)</label>
                    <input
                      type="number"
                      min={0}
                      value={hadir}
                      onChange={(e) => setHadir(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-2 py-1 bg-slate-950 border border-emerald-700/60 rounded-lg text-white font-bold text-center focus:outline-none"
                    />
                  </div>

                  {/* Sakit */}
                  <div className="bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/60 space-y-1">
                    <label className="block text-[10px] font-bold text-amber-300">🟡 Sakit (S)</label>
                    <input
                      type="number"
                      min={0}
                      value={sakit}
                      onChange={(e) => setSakit(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-2 py-1 bg-slate-950 border border-amber-700/60 rounded-lg text-white font-bold text-center focus:outline-none"
                    />
                  </div>

                  {/* Izin */}
                  <div className="bg-sky-950/40 p-2.5 rounded-xl border border-sky-800/60 space-y-1">
                    <label className="block text-[10px] font-bold text-sky-300">🔵 Izin (I)</label>
                    <input
                      type="number"
                      min={0}
                      value={izin}
                      onChange={(e) => setIzin(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-2 py-1 bg-slate-950 border border-sky-700/60 rounded-lg text-white font-bold text-center focus:outline-none"
                    />
                  </div>

                  {/* Alpa */}
                  <div className="bg-rose-950/40 p-2.5 rounded-xl border border-rose-800/60 space-y-1">
                    <label className="block text-[10px] font-bold text-rose-300">🔴 Alpa (A)</label>
                    <input
                      type="number"
                      min={0}
                      value={alpa}
                      onChange={(e) => setAlpa(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-2 py-1 bg-slate-950 border border-rose-700/60 rounded-lg text-white font-bold text-center focus:outline-none"
                    />
                  </div>

                  {/* Bolos */}
                  <div className="bg-purple-950/40 p-2.5 rounded-xl border border-purple-800/60 space-y-1 col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-bold text-purple-300">🟣 Bolos (B)</label>
                    <input
                      type="number"
                      min={0}
                      value={bolos}
                      onChange={(e) => setBolos(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-2 py-1 bg-slate-950 border border-purple-700/60 rounded-lg text-white font-bold text-center focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Rincian Nama Siswa Tidak Hadir / Keterangan Bolos (Opsional)
                  </label>
                  <input
                    type="text"
                    value={absentNames}
                    onChange={(e) => setAbsentNames(e.target.value)}
                    placeholder="Contoh: Ahmad Faisal (Sakit), Siti Rahma (Izin), Dedi (Alpa), Rian (Bolos di jam ke-2)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Hasil & Kemajuan Belajar Siswa</label>
                <textarea
                  rows={2}
                  required
                  value={learningProgress}
                  onChange={(e) => setLearningProgress(e.target.value)}
                  placeholder="Kemajuan pemahaman konsep dan capaian asesmen formatif siswa..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Kendala / Masalah yang Ditemui</label>
                  <textarea
                    rows={2}
                    value={obstacles}
                    onChange={(e) => setObstacles(e.target.value)}
                    placeholder="Kendala pemahaman, sarana, atau perilaku di kelas..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Solusi / Pemecahan Masalah</label>
                  <textarea
                    rows={2}
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    placeholder="Tindakan korektif guru, scaffolding, atau penguatan..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Catatan Tambahan Guru</label>
                  <input
                    type="text"
                    value={teacherNotes}
                    onChange={(e) => setTeacherNotes(e.target.value)}
                    placeholder="Catatan suasana kelas atau perlengkapan sarana..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Catatan Verifikasi Supervisor / Kepsek</label>
                  <input
                    type="text"
                    value={supervisorNotes}
                    onChange={(e) => setSupervisorNotes(e.target.value)}
                    placeholder="Telah diperiksa dan diverifikasi..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Jurnal Mengajar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
