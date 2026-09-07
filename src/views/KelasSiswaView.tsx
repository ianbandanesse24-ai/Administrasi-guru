import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  Search,
  Download,
  Printer,
  Upload,
  CheckCircle2,
  X,
  AlertCircle,
  Filter,
  UserCheck,
  Building,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { ClassRoom, Student, SchoolLevel } from '../types';
import { StorageService } from '../lib/storage';
import { ExportService } from '../lib/exportUtils';
import { OfflineAdminNotice } from '../components/OfflineSyncIndicator';
import { StudentExcelImportModal } from '../components/StudentExcelImportModal';
import { StudentExcelUtils } from '../lib/studentExcelUtils';

export const KelasSiswaView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'siswa' | 'kelas'>('siswa');
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Excel Import Modal state
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState<boolean>(false);

  // Modal states for Student
  const [isStudentModalOpen, setIsStudentModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentFormData, setStudentFormData] = useState({
    name: '',
    nis: '',
    nisn: '',
    gender: 'L' as 'L' | 'P',
    classId: '',
    parentPhone: '',
    address: '',
  });

  // Batch import student state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [batchClassId, setBatchClassId] = useState<string>('');
  const [batchText, setBatchText] = useState<string>('');
  const [startNis, setStartNis] = useState<string>('2025001');

  // Modal states for Class
  const [isClassModalOpen, setIsClassModalOpen] = useState<boolean>(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [classFormData, setClassFormData] = useState({
    name: '',
    level: 'SMA' as SchoolLevel,
    grade: 10,
    academicYear: '2025/2026',
    homeroomTeacher: '',
  });

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedClasses = StorageService.getClasses();
    const loadedStudents = StorageService.getStudents();
    setClasses(loadedClasses);
    setStudents(loadedStudents);
    if (loadedClasses.length > 0 && !studentFormData.classId) {
      setStudentFormData((prev) => ({ ...prev, classId: loadedClasses[0].id }));
      setBatchClassId(loadedClasses[0].id);
    }
  };

  const showNotif = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // --- Student Operations ---
  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setStudentFormData({
      name: '',
      nis: `2025${String(students.length + 1).padStart(3, '0')}`,
      nisn: `0089${String(Date.now()).substring(9)}`,
      gender: 'L',
      classId: classes[0]?.id || '',
      parentPhone: '0812',
      address: '',
    });
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (student: Student) => {
    setEditingStudent(student);
    setStudentFormData({
      name: student.name,
      nis: student.nis,
      nisn: student.nisn,
      gender: student.gender,
      classId: student.classId,
      parentPhone: student.parentPhone || '',
      address: student.address || '',
    });
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentFormData.name.trim() || !studentFormData.classId) {
      alert('Nama Siswa dan Pilihan Kelas wajib diisi.');
      return;
    }

    const selectedClass = classes.find((c) => c.id === studentFormData.classId);
    const className = selectedClass ? selectedClass.name : 'Kelas Umum';

    if (editingStudent) {
      const updated: Student = {
        ...editingStudent,
        ...studentFormData,
        className,
      };
      StorageService.updateStudent(updated);
      showNotif(`Data siswa "${updated.name}" berhasil diperbarui.`);
    } else {
      const newStudent = StorageService.addStudent({
        ...studentFormData,
        className,
      });
      showNotif(`Siswa baru "${newStudent.name}" berhasil ditambahkan.`);
    }

    loadData();
    setIsStudentModalOpen(false);
  };

  const handleDeleteStudent = (student: Student) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data siswa "${student.name}"?`)) {
      StorageService.deleteStudent(student.id);
      loadData();
      showNotif(`Siswa "${student.name}" telah dihapus.`);
    }
  };

  const handleBatchImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchText.trim() || !batchClassId) {
      alert('Pilih kelas dan tempel daftar nama siswa.');
      return;
    }

    const lines = batchText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      alert('Tidak ada baris nama yang valid.');
      return;
    }

    const selectedClass = classes.find((c) => c.id === batchClassId);
    const className = selectedClass ? selectedClass.name : 'Kelas Umum';

    const baseNisNumber = parseInt(startNis) || 2025001;

    const newStudentsData = lines.map((line, idx) => {
      // Clean leading numbering if user pasted like "1. Ahmad", "2) Budi"
      const cleanName = line.replace(/^\d+[\.\)\-\s]+/, '').trim();
      const nis = String(baseNisNumber + idx);
      const nisn = `0089${String(100000 + idx)}`;
      return {
        name: cleanName,
        nis,
        nisn,
        gender: (idx % 2 === 0 ? 'L' : 'P') as 'L' | 'P',
        classId: batchClassId,
        className,
        parentPhone: '081234567890',
        address: 'Alamat Siswa',
      };
    });

    StorageService.batchAddStudents(newStudentsData);
    loadData();
    setIsBatchModalOpen(false);
    setBatchText('');
    showNotif(`Berhasil menambahkan ${newStudentsData.length} siswa baru sekaligus!`);
  };

  // --- Class Operations ---
  const handleOpenAddClass = () => {
    setEditingClass(null);
    setClassFormData({
      name: '',
      level: 'SMA',
      grade: 10,
      academicYear: '2025/2026',
      homeroomTeacher: '',
    });
    setIsClassModalOpen(true);
  };

  const handleOpenEditClass = (cls: ClassRoom) => {
    setEditingClass(cls);
    setClassFormData({
      name: cls.name,
      level: cls.level,
      grade: cls.grade,
      academicYear: cls.academicYear,
      homeroomTeacher: cls.homeroomTeacher || '',
    });
    setIsClassModalOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classFormData.name.trim()) {
      alert('Nama Kelas wajib diisi.');
      return;
    }

    if (editingClass) {
      const updated: ClassRoom = {
        ...editingClass,
        ...classFormData,
      };
      StorageService.updateClass(updated);
      showNotif(`Data kelas "${updated.name}" berhasil diperbarui.`);
    } else {
      const newClass = StorageService.addClass(classFormData);
      showNotif(`Kelas baru "${newClass.name}" berhasil dibuat.`);
    }

    loadData();
    setIsClassModalOpen(false);
  };

  const handleDeleteClass = (cls: ClassRoom) => {
    const studentCount = students.filter((s) => s.classId === cls.id).length;
    if (studentCount > 0) {
      if (
        !confirm(
          `Kelas "${cls.name}" memiliki ${studentCount} siswa terdaftar. Jika kelas ini dihapus, siswa tidak akan memiliki kelas aktif. Lanjutkan?`
        )
      ) {
        return;
      }
    } else {
      if (!confirm(`Hapus kelas "${cls.name}"?`)) return;
    }

    StorageService.deleteClass(cls.id);
    loadData();
    showNotif(`Kelas "${cls.name}" telah dihapus.`);
  };

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchesClass = selectedClassFilter === 'all' || s.classId === selectedClassFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const exportStudentsExcel = () => {
    const exportData = filteredStudents.map((s, idx) => ({
      No: idx + 1,
      'Nama Siswa': s.name,
      NIS: s.nis,
      NISN: s.nisn,
      'L/P': s.gender,
      Kelas: s.className,
      'No. HP Ortu': s.parentPhone || '-',
      Alamat: s.address || '-',
    }));
    ExportService.exportToExcel(exportData, `Daftar_Siswa_${selectedClassFilter !== 'all' ? selectedClassFilter : 'Semua'}`);
  };

  const handlePrintStudents = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Offline Storage & Cloud Sync Notice */}
      <OfflineAdminNotice menuTitle="Kelola Kelas & Siswa" />

      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 p-6 rounded-2xl shadow-xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="p-2 bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-indigo-300">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">Data Master: Penginputan Kelas & Siswa</h1>
          </div>
          <p className="text-xs text-slate-300 ml-10">
            Kelola data rombel kelas, penginputan manual nama siswa & NISN, serta batch import terintegrasi ke Absensi, Jurnal, dan Rekap Nilai.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('siswa')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'siswa'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Data Siswa ({students.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('kelas')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'kelas'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Data Rombel Kelas ({classes.length})</span>
          </button>
        </div>
      </div>

      {/* Floating Notification */}
      {notification && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: DATA SISWA */}
      {/* ========================================================================= */}
      {activeTab === 'siswa' && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search & Filter */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari Nama Siswa, NIS, atau NISN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 focus:outline-none"
                >
                  <option value="all">Semua Kelas ({students.length})</option>
                  {classes.map((c) => {
                    const count = students.filter((s) => s.classId === c.id).length;
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} ({count} siswa)
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => StudentExcelUtils.downloadTemplate(selectedClassFilter !== 'all' ? selectedClassFilter : undefined)}
                className="px-3.5 py-2 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow border border-emerald-500/40"
                title="Unduh Template Excel format: NO, NISN/NIS, Nama Siswa, Kelas (Multi-Sheet per Kelas)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Template Excel Siswa</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExcelImportModalOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow"
                title="Import data siswa dari template Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
                <span>Import Excel Siswa</span>
              </button>

              <button
                onClick={handleOpenAddStudent}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Input Manual</span>
              </button>

              <button
                onClick={() => setIsBatchModalOpen(true)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
                title="Tempel teks nama siswa"
              >
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span>Paste Batch</span>
              </button>

              <button
                onClick={exportStudentsExcel}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1 transition"
                title="Ekspor Data Siswa ke Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor Excel</span>
              </button>

              <button
                onClick={handlePrintStudents}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1 transition"
                title="Cetak"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak</span>
              </button>
            </div>
          </div>

          {/* Student Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Nama Lengkap Siswa</th>
                    <th className="py-3 px-4">NIS / NISN</th>
                    <th className="py-3 px-4 text-center">L/P</th>
                    <th className="py-3 px-4">Kelas / Rombel</th>
                    <th className="py-3 px-4">No. HP Orang Tua</th>
                    <th className="py-3 px-4">Alamat</th>
                    <th className="py-3 px-4 text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-white flex items-center space-x-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              s.gender === 'L' ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300'
                            }`}
                          >
                            {s.gender}
                          </div>
                          <span>{s.name}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          <div>NIS: {s.nis}</div>
                          <div className="text-[10px] text-slate-500">NISN: {s.nisn}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.gender === 'L' ? 'bg-blue-900/40 text-blue-300' : 'bg-pink-900/40 text-pink-300'
                            }`}
                          >
                            {s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-indigo-300 font-medium">
                            {s.className}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">{s.parentPhone || '-'}</td>
                        <td className="py-3 px-4 text-slate-400 max-w-[200px] truncate" title={s.address}>
                          {s.address || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => handleOpenEditStudent(s)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition"
                              title="Edit Siswa"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(s)}
                              className="p-1.5 bg-slate-800 hover:bg-red-900/40 text-red-400 rounded-lg transition"
                              title="Hapus Siswa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        Tidak ada siswa ditemukan dengan filter saat ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DATA KELAS / ROMBEL */}
      {/* ========================================================================= */}
      {activeTab === 'kelas' && (
        <div className="space-y-4">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Daftar Rombongan Belajar (Rombel) Kelas</h2>
              <p className="text-xs text-slate-400">Kelola ruang kelas, tingkat pendidikan, dan penugasan wali kelas.</p>
            </div>
            <button
              onClick={handleOpenAddClass}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kelas Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => {
              const studentCount = students.filter((s) => s.classId === cls.id).length;
              const maleCount = students.filter((s) => s.classId === cls.id && s.gender === 'L').length;
              const femaleCount = students.filter((s) => s.classId === cls.id && s.gender === 'P').length;

              return (
                <div
                  key={cls.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-lg space-y-3 relative group transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-900/50 text-indigo-300 border border-indigo-700/50">
                        {cls.level} • Kelas {cls.grade}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1">{cls.name}</h3>
                      <p className="text-xs text-slate-400">Tahun Ajaran: {cls.academicYear}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEditClass(cls)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
                        title="Edit Kelas"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls)}
                        className="p-1.5 rounded-lg bg-slate-800 text-red-400 hover:bg-red-900/40 transition"
                        title="Hapus Kelas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Wali Kelas:</span>
                      <span className="font-semibold text-slate-200">{cls.homeroomTeacher || 'Belum Ditentukan'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Total Siswa:</span>
                      <span className="font-bold text-emerald-400">{studentCount} Siswa</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Komposisi:</span>
                      <span>
                        {maleCount} Laki-laki / {femaleCount} Perempuan
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedClassFilter(cls.id);
                      setActiveTab('siswa');
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Lihat {studentCount} Siswa Kelas Ini</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INPUT / EDIT SISWA MANUAL */}
      {/* ========================================================================= */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fadeIn">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">{editingStudent ? 'Edit Data Siswa' : 'Penginputan Siswa Manual'}</h3>
              </div>
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Rizky Pratama"
                  value={studentFormData.name}
                  onChange={(e) => setStudentFormData({ ...studentFormData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">NIS (Nomor Induk Siswa) *</label>
                  <input
                    type="text"
                    required
                    placeholder="2025001"
                    value={studentFormData.nis}
                    onChange={(e) => setStudentFormData({ ...studentFormData, nis: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">NISN (10 Digit)</label>
                  <input
                    type="text"
                    placeholder="0089123456"
                    value={studentFormData.nisn}
                    onChange={(e) => setStudentFormData({ ...studentFormData, nisn: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Jenis Kelamin *</label>
                  <select
                    value={studentFormData.gender}
                    onChange={(e) => setStudentFormData({ ...studentFormData, gender: e.target.value as 'L' | 'P' })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Pilihan Kelas / Rombel *</label>
                  <select
                    value={studentFormData.classId}
                    onChange={(e) => setStudentFormData({ ...studentFormData, classId: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">No. HP Orang Tua / Wali</label>
                <input
                  type="text"
                  placeholder="081234567890"
                  value={studentFormData.parentPhone}
                  onChange={(e) => setStudentFormData({ ...studentFormData, parentPhone: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Alamat Tempat Tinggal</label>
                <textarea
                  rows={2}
                  placeholder="Jl. Pendidikan No. 12..."
                  value={studentFormData.address}
                  onChange={(e) => setStudentFormData({ ...studentFormData, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition shadow"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Simpan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BATCH / IMPORT CEPAT SISWA */}
      {/* ========================================================================= */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fadeIn">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">Import / Tambah Cepat Banyak Siswa</h3>
              </div>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBatchImport} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Pilih Kelas Sasaran *</label>
                  <select
                    value={batchClassId}
                    onChange={(e) => setBatchClassId(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Mulai Nomor Induk (NIS)</label>
                  <input
                    type="text"
                    value={startNis}
                    onChange={(e) => setStartNis(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Tempel Daftar Nama Siswa (1 Nama per Baris) *
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder={`1. Achmad Dani Ramadhan\n2. Aisyah Putri Azzahra\n3. Bagas Aditya Pratama\n4. Cantika Nasywa Aurelia`}
                  value={batchText}
                  onChange={(e) => setBatchText(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-xs leading-relaxed"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Tips: Anda bisa langsung menyalin kolom nama dari Excel/Word. Nomor urut di depan nama akan otomatis dibersihkan.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition shadow"
                >
                  Import Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INPUT / EDIT KELAS MANUAL */}
      {/* ========================================================================= */}
      {isClassModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fadeIn">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">{editingClass ? 'Edit Rombel Kelas' : 'Tambah Rombel Kelas Baru'}</h3>
              </div>
              <button
                onClick={() => setIsClassModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nama Kelas / Rombel *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: X SMA 1 (Fase E) atau VII SMP A"
                  value={classFormData.name}
                  onChange={(e) => setClassFormData({ ...classFormData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Jenjang Pendidikan *</label>
                  <select
                    value={classFormData.level}
                    onChange={(e) => setClassFormData({ ...classFormData, level: e.target.value as SchoolLevel })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                    <option value="SMK">SMK</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tingkat Kelas (1-12) *</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    required
                    value={classFormData.grade}
                    onChange={(e) => setClassFormData({ ...classFormData, grade: parseInt(e.target.value) || 10 })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Tahun Ajaran *</label>
                <input
                  type="text"
                  required
                  placeholder="2025/2026"
                  value={classFormData.academicYear}
                  onChange={(e) => setClassFormData({ ...classFormData, academicYear: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Nama Wali Kelas</label>
                <input
                  type="text"
                  placeholder="Contoh: Drs. Bambang Sudarsono, M.Si."
                  value={classFormData.homeroomTeacher}
                  onChange={(e) => setClassFormData({ ...classFormData, homeroomTeacher: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition shadow"
                >
                  {editingClass ? 'Simpan Perubahan' : 'Simpan Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Import Modal (Multi-Sheet per Kelas) */}
      <StudentExcelImportModal
        isOpen={isExcelImportModalOpen}
        onClose={() => setIsExcelImportModalOpen(false)}
        onSuccess={() => {
          loadData();
          showNotif('Data siswa dari Excel berhasil disinkronkan ke seluruh sistem!');
        }}
        defaultClassId={selectedClassFilter !== 'all' ? selectedClassFilter : undefined}
      />
    </div>
  );
};
