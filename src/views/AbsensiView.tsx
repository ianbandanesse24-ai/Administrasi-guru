import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserX,
  FileSpreadsheet,
  FileText,
  Printer,
  Plus,
  Save,
  Check,
  Search,
  UserPlus,
  Download,
  Upload,
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, ClassRoom, Student } from '../types';
import { StorageService } from '../lib/storage';
import { ExportService } from '../lib/exportUtils';
import { SUBJECT_LIST } from '../lib/curriculumData';
import { OfflineAdminNotice } from '../components/OfflineSyncIndicator';
import { StudentExcelImportModal } from '../components/StudentExcelImportModal';
import { StudentExcelUtils } from '../lib/studentExcelUtils';

export const AbsensiView: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>(() => StorageService.getClasses());
  const [students, setStudents] = useState<Student[]>(() => StorageService.getStudents());
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>(() => StorageService.getAttendance());

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'c1');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [meetingNumber, setMeetingNumber] = useState<number>(1);
  const [subject, setSubject] = useState<string>('Bahasa Indonesia');
  const [searchTerm, setSearchTerm] = useState('');
  const [manualClassName, setManualClassName] = useState('');
  const [showManualClassModal, setShowManualClassModal] = useState(false);
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false);

  // Quick add student modal state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNis, setNewStudentNis] = useState('');
  const [newStudentNisn, setNewStudentNisn] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'L' | 'P'>('L');

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((s) => s.classId === selectedClassId || s.className === selectedClass?.name);

  // Active attendance state
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Synchronize statuses and notes whenever selectedClassId, selectedDate, or meetingNumber changes
  useEffect(() => {
    const existing = attendanceList.find(
      (a) =>
        (a.classId === selectedClassId || a.className === selectedClass?.name) &&
        a.date === selectedDate &&
        a.meetingNumber === Number(meetingNumber)
    );

    const initialStatuses: Record<string, AttendanceStatus> = {};
    const initialNotes: Record<string, string> = {};

    classStudents.forEach((s) => {
      if (existing) {
        const rec = existing.records.find((r) => r.studentId === s.id || r.studentName === s.name);
        initialStatuses[s.id] = rec ? rec.status : 'H';
        initialNotes[s.id] = rec?.notes || '';
      } else {
        initialStatuses[s.id] = 'H';
        initialNotes[s.id] = '';
      }
    });

    setStatuses(initialStatuses);
    setNotes(initialNotes);
  }, [selectedClassId, selectedDate, meetingNumber, students.length]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSetAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    classStudents.forEach((s) => (updated[s.id] = 'H'));
    setStatuses(updated);
  };

  const handleQuickAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const generatedNis = newStudentNis.trim() || String(2025000 + students.length + 1);
    const generatedNisn = newStudentNisn.trim() || `0089${String(100000 + students.length + 1)}`;

    const createdStudent = StorageService.addStudent({
      name: newStudentName.trim(),
      nis: generatedNis,
      nisn: generatedNisn,
      gender: newStudentGender,
      classId: selectedClassId,
      className: selectedClass?.name || 'Kelas',
      parentPhone: '081234567890',
      address: 'Alamat Siswa',
    });

    const updatedStudents = StorageService.getStudents();
    setStudents(updatedStudents);

    // Set initial status for new student
    setStatuses((prev) => ({ ...prev, [createdStudent.id]: 'H' }));

    setNewStudentName('');
    setNewStudentNis('');
    setNewStudentNisn('');
    setShowAddStudentModal(false);
  };

  // Calculate live summary
  const summary = {
    hadir: Object.values(statuses).filter((v) => v === 'H').length,
    sakit: Object.values(statuses).filter((v) => v === 'S').length,
    izin: Object.values(statuses).filter((v) => v === 'I').length,
    alpa: Object.values(statuses).filter((v) => v === 'A').length,
    total: classStudents.length,
  };
  const presentPct = summary.total > 0 ? Math.round((summary.hadir / summary.total) * 1000) / 10 : 100;

  const handleSaveAttendance = () => {
    const schoolProfile = StorageService.getSchoolProfile();
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      date: selectedDate,
      classId: selectedClassId,
      className: selectedClass?.name || 'Kelas',
      subject: subject,
      meetingNumber: Number(meetingNumber),
      semester: schoolProfile.semester,
      academicYear: schoolProfile.academicYear,
      records: classStudents.map((s) => ({
        studentId: s.id,
        studentName: s.name,
        status: statuses[s.id] || 'H',
        notes: notes[s.id] || '',
      })),
      summary: {
        ...summary,
        presentPercentage: presentPct,
      },
    };

    const updated = [newRecord, ...attendanceList.filter((a) => !(a.date === selectedDate && a.className === selectedClass?.name && a.meetingNumber === Number(meetingNumber)))];
    setAttendanceList(updated);
    StorageService.saveAttendance(updated);

    StorageService.addAccessLog({
      userId: 'active-user',
      userEmail: 'guru@belajar.id',
      userName: 'Guru Pengampu',
      userRole: 'guru',
      action: 'Simpan Absensi Siswa',
      details: `Menyimpan presensi ${selectedClass?.name} (${selectedDate}, Pertemuan ke-${meetingNumber}) - Kehadiran: ${presentPct}%.`,
      status: 'success',
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAddManualClass = () => {
    if (!manualClassName.trim()) return;
    const newClass: ClassRoom = {
      id: `c-custom-${Date.now()}`,
      name: manualClassName.trim(),
      level: 'SMA',
      grade: 10,
      academicYear: StorageService.getSchoolProfile().academicYear,
    };
    const updated = [...classes, newClass];
    setClasses(updated);
    StorageService.saveClasses(updated);
    setSelectedClassId(newClass.id);
    setManualClassName('');
    setShowManualClassModal(false);
  };

  // Export handlers
  const handleExportExcel = () => {
    const exportData = classStudents.map((s, idx) => ({
      No: idx + 1,
      NIS: s.nis,
      'Nama Siswa': s.name,
      'L/P': s.gender,
      'Status Kehadiran': statuses[s.id] === 'H' ? 'Hadir' : statuses[s.id] === 'S' ? 'Sakit' : statuses[s.id] === 'I' ? 'Izin' : 'Alpa',
      Keterangan: notes[s.id] || '-',
    }));
    ExportService.exportToExcel(exportData, `Rekap_Absensi_${selectedClass?.name}_${selectedDate}`);
  };

  const handleExportWord = () => {
    const schoolProfile = StorageService.getSchoolProfile();
    let rowsHtml = '';
    classStudents.forEach((s, idx) => {
      rowsHtml += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td>${s.nis}</td>
          <td><strong>${s.name}</strong></td>
          <td style="text-align:center;">${s.gender}</td>
          <td style="text-align:center; font-weight:bold;">${statuses[s.id] || 'H'}</td>
          <td>${notes[s.id] || '-'}</td>
        </tr>
      `;
    });

    const bodyHtml = `
      <div style="margin-bottom:15px;">
        <table style="border:none; width:100%; margin:0;">
          <tr><td style="border:none; width:150px;"><strong>Mata Pelajaran</strong></td><td style="border:none;">: ${subject}</td></tr>
          <tr><td style="border:none;"><strong>Kelas / Fase</strong></td><td style="border:none;">: ${selectedClass?.name}</td></tr>
          <tr><td style="border:none;"><strong>Hari / Tanggal</strong></td><td style="border:none;">: ${selectedDate}</td></tr>
          <tr><td style="border:none;"><strong>Pertemuan Ke-</strong></td><td style="border:none;">: ${meetingNumber}</td></tr>
          <tr><td style="border:none;"><strong>Persentase Kehadiran</strong></td><td style="border:none;">: <strong>${presentPct}%</strong> (H:${summary.hadir}, S:${summary.sakit}, I:${summary.izin}, A:${summary.alpa})</td></tr>
        </table>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:40px;">No</th>
            <th style="width:100px;">NIS</th>
            <th>Nama Lengkap Peserta Didik</th>
            <th style="width:50px;">L/P</th>
            <th style="width:80px;">Status</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;

    ExportService.exportToWord(
      `DAFTAR HADIR SISWA - ${selectedClass?.name}`,
      bodyHtml,
      schoolProfile,
      `Daftar_Hadir_${selectedClass?.name}_${selectedDate}`
    );
  };

  const handlePrintPdf = () => {
    const schoolProfile = StorageService.getSchoolProfile();
    let rowsHtml = '';
    classStudents.forEach((s, idx) => {
      rowsHtml += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td>${s.nis}</td>
          <td><strong>${s.name}</strong></td>
          <td style="text-align:center;">${s.gender}</td>
          <td style="text-align:center; font-weight:bold;">${statuses[s.id] || 'H'}</td>
          <td>${notes[s.id] || '-'}</td>
        </tr>
      `;
    });

    const bodyHtml = `
      <div style="margin-bottom:12px; font-size:9.5pt;">
        <div><strong>Mata Pelajaran:</strong> ${subject} | <strong>Kelas:</strong> ${selectedClass?.name}</div>
        <div><strong>Tanggal Presensi:</strong> ${selectedDate} | <strong>Pertemuan Ke:</strong> ${meetingNumber}</div>
        <div><strong>Rekapitulasi:</strong> Hadir: ${summary.hadir}, Sakit: ${summary.sakit}, Izin: ${summary.izin}, Alpa: ${summary.alpa} (Tingkat Kehadiran: ${presentPct}%)</div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:35px;">No</th>
            <th style="width:90px;">NIS</th>
            <th>Nama Peserta Didik</th>
            <th style="width:40px;">L/P</th>
            <th style="width:70px;">Status</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;

    ExportService.printPdfPreview(`PRESENSI KELAS ${selectedClass?.name}`, bodyHtml, schoolProfile);
  };

  const filteredStudents = classStudents.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.nis.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Offline Storage & Cloud Sync Notice */}
      <OfflineAdminNotice menuTitle="Presensi & Absensi Siswa" />

      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">1. Presensi & Absensi Siswa</h1>
              <p className="text-xs text-slate-400">
                Pencatatan kehadiran harian siswa, status H/S/I/A otomatis, dan ekspor multi-format (Excel, Word, PDF).
              </p>
            </div>
          </div>
        </div>

        {/* Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => StudentExcelUtils.downloadTemplate(selectedClassId)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 transition shadow"
            title="Unduh Template Excel Siswa (NO, NISN/NIS, Nama Siswa, Kelas)"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Template Siswa</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExcelImportModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white transition shadow"
            title="Import data siswa dari template Excel (.xlsx)"
          >
            <Upload className="w-4 h-4 text-emerald-300" />
            <span>Import Siswa Excel</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition"
            title="Ekspor ke Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Excel (.xlsx)</span>
          </button>
          <button
            onClick={handleExportWord}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition"
            title="Ekspor ke Word"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Word (.doc)</span>
          </button>
          <button
            onClick={handlePrintPdf}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition"
            title="Cetak Laporan Presensi / Simpan PDF"
          >
            <Printer className="w-4 h-4 text-rose-400" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Pilih Kelas</label>
            <div className="flex space-x-1.5">
              <select
                id="select-class-absensi"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowManualClassModal(true)}
                title="Tambah Kelas Manual"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                <Plus className="w-4 h-4 text-indigo-400" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Tanggal Pertemuan</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Pertemuan Ke-</label>
            <input
              type="number"
              min="1"
              max="40"
              value={meetingNumber}
              onChange={(e) => setMeetingNumber(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
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

        {/* Live Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-800/80">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-400 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Hadir (H)
            </span>
            <span className="text-sm font-black text-white">{summary.hadir}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-400 flex items-center">
              <AlertCircle className="w-3.5 h-3.5 mr-1" /> Sakit (S)
            </span>
            <span className="text-sm font-black text-white">{summary.sakit}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" /> Izin (I)
            </span>
            <span className="text-sm font-black text-white">{summary.izin}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-400 flex items-center">
              <UserX className="w-3.5 h-3.5 mr-1" /> Alpa (A)
            </span>
            <span className="text-sm font-black text-white">{summary.alpa}</span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-300">Kehadiran</span>
            <span className="text-sm font-black text-indigo-400">{presentPct}%</span>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-800/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama atau NIS siswa..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 flex items-center space-x-1.5 transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Siswa Baru</span>
            </button>
            <button
              onClick={handleSetAllPresent}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Set Semua Hadir (H)
            </button>
            <button
              id="btn-save-attendance"
              onClick={handleSaveAttendance}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30 transition"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Presensi</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 w-28">NIS / NISN</th>
                <th className="py-3 px-4">Nama Lengkap Peserta Didik</th>
                <th className="py-3 px-4 w-16 text-center">L/P</th>
                <th className="py-3 px-4 w-64 text-center">Status Presensi</th>
                <th className="py-3 px-4">Keterangan / Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-2xl inline-block text-indigo-400">
                        <Users className="w-8 h-8 mx-auto" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Belum Ada Data Siswa pada {selectedClass?.name || 'Kelas Ini'}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Anda dapat mengimpor data siswa secara instan menggunakan file Excel standar (terdiri dari kolom NO, NISN/NIS, Nama Siswa, dan Kelas).
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => StudentExcelUtils.downloadTemplate(selectedClassId)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh Template (.xlsx)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsExcelImportModalOpen(true)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Import File Excel</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddStudentModal(true)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                        >
                          + Manual
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => {
                  const currentStatus = statuses[s.id] || 'H';
                  return (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{s.nis}</td>
                      <td className="py-3 px-4 font-semibold text-white">{s.name}</td>
                      <td className="py-3 px-4 text-center text-slate-400">{s.gender}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-1.5">
                          {(['H', 'S', 'I', 'A'] as AttendanceStatus[]).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusChange(s.id, st)}
                              className={`w-8 h-8 rounded-lg font-black text-xs transition ${
                                currentStatus === st
                                  ? st === 'H'
                                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                                    : st === 'S'
                                    ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                                    : st === 'I'
                                    ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                                    : 'bg-rose-600 text-white ring-2 ring-rose-400'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={notes[s.id] || ''}
                          onChange={(e) => setNotes({ ...notes, [s.id]: e.target.value })}
                          placeholder="Catatan..."
                          className="w-full px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-indigo-400" />
                <span>Tambah Siswa Baru ke {selectedClass?.name}</span>
              </h3>
              <button onClick={() => setShowAddStudentModal(false)} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickAddStudent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Contoh: Muhammad Rizky Pratama"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">NIS (Otomatis/Ketik)</label>
                  <input
                    type="text"
                    value={newStudentNis}
                    onChange={(e) => setNewStudentNis(e.target.value)}
                    placeholder={`Contoh: ${2025000 + students.length + 1}`}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">NISN (Opsional)</label>
                  <input
                    type="text"
                    value={newStudentNisn}
                    onChange={(e) => setNewStudentNisn(e.target.value)}
                    placeholder="Contoh: 0089123456"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Jenis Kelamin</label>
                <div className="flex space-x-3">
                  <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="quick-gender"
                      checked={newStudentGender === 'L'}
                      onChange={() => setNewStudentGender('L')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Laki-Laki (L)</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="quick-gender"
                      checked={newStudentGender === 'P'}
                      onChange={() => setNewStudentGender('P')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Perempuan (P)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambahkan Siswa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Class Creation Modal */}
      {showManualClassModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Tambah Nama Kelas Manual</h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nama Kelas (Contoh: X MIPA 3, XII IPS 1, dll)</label>
              <input
                type="text"
                autoFocus
                value={manualClassName}
                onChange={(e) => setManualClassName(e.target.value)}
                placeholder="X IPA 3..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowManualClassModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleAddManualClass}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Tambah Kelas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Excel Import Modal */}
      <StudentExcelImportModal
        isOpen={isExcelImportModalOpen}
        onClose={() => setIsExcelImportModalOpen(false)}
        onSuccess={() => {
          setStudents(StorageService.getStudents());
          setClasses(StorageService.getClasses());
        }}
        defaultClassId={selectedClassId}
        defaultClassName={selectedClass?.name}
      />
    </div>
  );
};
