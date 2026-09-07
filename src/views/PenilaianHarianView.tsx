import React, { useState, useEffect } from 'react';
import {
  Award,
  FileSpreadsheet,
  FileText,
  Printer,
  Save,
  Check,
  Calculator,
  Search,
  UserPlus,
  Sparkles,
  Plus,
  Download,
  Upload,
  Users,
} from 'lucide-react';
import { ClassRoom, Student, GradeEntry } from '../types';
import { StorageService } from '../lib/storage';
import { ExportService } from '../lib/exportUtils';
import { SUBJECT_LIST } from '../lib/curriculumData';
import { StudentExcelImportModal } from '../components/StudentExcelImportModal';
import { StudentExcelUtils } from '../lib/studentExcelUtils';

export const PenilaianHarianView: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>(() => StorageService.getClasses());
  const [students, setStudents] = useState<Student[]>(() => StorageService.getStudents());
  const [grades, setGrades] = useState<GradeEntry[]>(() => StorageService.getGrades());

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'c1');
  const [subject, setSubject] = useState('Bahasa Indonesia');
  const [kktp, setKktp] = useState(75);
  const [searchTerm, setSearchTerm] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false);

  // Quick add student modal state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNis, setNewStudentNis] = useState('');
  const [newStudentNisn, setNewStudentNisn] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'L' | 'P'>('L');

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((s) => s.classId === selectedClassId || s.className === selectedClass?.name);

  // Local state for dynamic grades per student
  const [studentGrades, setStudentGrades] = useState<
    Record<
      string,
      {
        tugas1: number;
        tugas2: number;
        uh1: number;
        uh2: number;
        kinerja: number;
      }
    >
  >({});

  // Dynamic sync whenever class, subject, or student list changes
  useEffect(() => {
    const currentGrades = StorageService.getGrades();
    const map: Record<string, any> = {};
    classStudents.forEach((s) => {
      const existing = currentGrades.find((g) => g.studentId === s.id && g.subject === subject);
      map[s.id] = {
        tugas1: existing?.task1 ?? 82,
        tugas2: existing?.task2 ?? 84,
        uh1: existing?.uh1 ?? 80,
        uh2: existing?.uh2 ?? 83,
        kinerja: existing?.performance ?? 88,
      };
    });
    setStudentGrades(map);
  }, [selectedClassId, subject, students.length]);

  const handleGradeChange = (studentId: string, field: string, val: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(val) ? 0 : val));
    setStudentGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: clamped,
      },
    }));
  };

  const handleFillDefaultScores = (baseScore: number = 85) => {
    const map: Record<string, any> = {};
    classStudents.forEach((s, idx) => {
      const variance = (idx % 5) - 2; // -2 to +2
      map[s.id] = {
        tugas1: Math.min(100, baseScore + variance),
        tugas2: Math.min(100, baseScore + variance + 1),
        uh1: Math.min(100, baseScore + variance - 1),
        uh2: Math.min(100, baseScore + variance + 2),
        kinerja: Math.min(100, baseScore + 4),
      };
    });
    setStudentGrades(map);
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

    setStudentGrades((prev) => ({
      ...prev,
      [createdStudent.id]: {
        tugas1: 85,
        tugas2: 85,
        uh1: 85,
        uh2: 85,
        kinerja: 88,
      },
    }));

    setNewStudentName('');
    setNewStudentNis('');
    setNewStudentNisn('');
    setShowAddStudentModal(false);
  };

  const calculateAverage = (scores: { tugas1: number; tugas2: number; uh1: number; uh2: number; kinerja: number }) => {
    const total = scores.tugas1 + scores.tugas2 + scores.uh1 + scores.uh2 + scores.kinerja;
    return Math.round((total / 5) * 10) / 10;
  };

  const handleSaveGrades = () => {
    const updatedGrades = [...grades];
    classStudents.forEach((s) => {
      const scores = studentGrades[s.id] || { tugas1: 80, tugas2: 80, uh1: 80, uh2: 80, kinerja: 80 };
      const avg = calculateAverage(scores);
      const idx = updatedGrades.findIndex((g) => g.studentId === s.id && g.subject === subject);
      const newEntry: GradeEntry = {
        id: idx >= 0 ? updatedGrades[idx].id : `gr-${Date.now()}-${s.id}`,
        studentId: s.id,
        studentName: s.name,
        className: selectedClass?.name || 'Kelas',
        subject: subject,
        dailyAverage: avg,
        ptsScore: updatedGrades[idx]?.ptsScore || 80,
        pasScore: updatedGrades[idx]?.pasScore || 80,
        finalScore: Math.round(((avg * 2 + (updatedGrades[idx]?.ptsScore || 80) + (updatedGrades[idx]?.pasScore || 80)) / 4) * 10) / 10,
        predicate: avg >= 90 ? 'A' : avg >= 80 ? 'B' : avg >= 70 ? 'C' : 'D',
        task1: scores.tugas1,
        task2: scores.tugas2,
        uh1: scores.uh1,
        uh2: scores.uh2,
        performance: scores.kinerja,
      };

      if (idx >= 0) {
        updatedGrades[idx] = newEntry;
      } else {
        updatedGrades.push(newEntry);
      }
    });

    setGrades(updatedGrades);
    StorageService.saveGrades(updatedGrades);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Exports
  const handleExportExcel = () => {
    const exportData = classStudents.map((s, idx) => {
      const sc = studentGrades[s.id] || { tugas1: 0, tugas2: 0, uh1: 0, uh2: 0, kinerja: 0 };
      const avg = calculateAverage(sc);
      return {
        No: idx + 1,
        NIS: s.nis,
        'Nama Siswa': s.name,
        'Tugas 1': sc.tugas1,
        'Tugas 2': sc.tugas2,
        'UH 1': sc.uh1,
        'UH 2': sc.uh2,
        'Kinerja/Proyek': sc.kinerja,
        'Rata-rata Harian (NRH)': avg,
        'Status KKTP': avg >= kktp ? 'Tuntas' : 'Belum Tuntas',
      };
    });
    ExportService.exportToExcel(exportData, `Penilaian_Harian_${selectedClass?.name}_${subject}`);
  };

  const handleExportWord = () => {
    const schoolProfile = StorageService.getSchoolProfile();
    let rows = '';
    classStudents.forEach((s, idx) => {
      const sc = studentGrades[s.id] || { tugas1: 0, tugas2: 0, uh1: 0, uh2: 0, kinerja: 0 };
      const avg = calculateAverage(sc);
      rows += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td>${s.nis}</td>
          <td><strong>${s.name}</strong></td>
          <td style="text-align:center;">${sc.tugas1}</td>
          <td style="text-align:center;">${sc.tugas2}</td>
          <td style="text-align:center;">${sc.uh1}</td>
          <td style="text-align:center;">${sc.uh2}</td>
          <td style="text-align:center;">${sc.kinerja}</td>
          <td style="text-align:center; font-weight:bold; background-color:#f1f5f9;">${avg}</td>
          <td style="text-align:center; font-weight:bold; color:${avg >= kktp ? '#16a34a' : '#dc2626'};">${avg >= kktp ? 'Tuntas' : 'Remedial'}</td>
        </tr>
      `;
    });

    const bodyHtml = `
      <div style="margin-bottom:15px;">
        <strong>Mata Pelajaran:</strong> ${subject} | <strong>Kelas:</strong> ${selectedClass?.name} | <strong>KKTP:</strong> ${kktp}
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:35px;">No</th>
            <th style="width:90px;">NIS</th>
            <th>Nama Lengkap Peserta Didik</th>
            <th>Tugas 1</th>
            <th>Tugas 2</th>
            <th>UH 1</th>
            <th>UH 2</th>
            <th>Kinerja</th>
            <th>Rata-rata (NRH)</th>
            <th>Ketercapaian</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    ExportService.exportToWord(`DAFTAR NILAI HARIAN - ${selectedClass?.name}`, bodyHtml, schoolProfile, `Nilai_Harian_${selectedClass?.name}`);
  };

  const handlePrintPdf = () => {
    const schoolProfile = StorageService.getSchoolProfile();
    let rows = '';
    classStudents.forEach((s, idx) => {
      const sc = studentGrades[s.id] || { tugas1: 0, tugas2: 0, uh1: 0, uh2: 0, kinerja: 0 };
      const avg = calculateAverage(sc);
      rows += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td>${s.nis}</td>
          <td><strong>${s.name}</strong></td>
          <td style="text-align:center;">${sc.tugas1}</td>
          <td style="text-align:center;">${sc.tugas2}</td>
          <td style="text-align:center;">${sc.uh1}</td>
          <td style="text-align:center;">${sc.uh2}</td>
          <td style="text-align:center;">${sc.kinerja}</td>
          <td style="text-align:center; font-weight:bold;">${avg}</td>
          <td style="text-align:center;">${avg >= kktp ? 'Tuntas' : 'Remedial'}</td>
        </tr>
      `;
    });

    const bodyHtml = `
      <div style="margin-bottom:10px;">
        <strong>Penilaian Formatif / Harian:</strong> ${subject} | Kelas: ${selectedClass?.name} (KKTP: ${kktp})
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:30px;">No</th>
            <th>NIS</th>
            <th>Nama Siswa</th>
            <th>T1</th>
            <th>T2</th>
            <th>UH1</th>
            <th>UH2</th>
            <th>Kinerja</th>
            <th>NRH</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    ExportService.printPdfPreview(`NILAI HARIAN ${selectedClass?.name}`, bodyHtml, schoolProfile);
  };

  const filteredStudents = classStudents.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.nis.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">7. Penilaian Harian (Formatif & Tugas)</h1>
            <p className="text-xs text-slate-400">
              Input nilai tugas, ulangan harian (UH), kinerja/proyek, dan perhitungan rata-rata harian (NRH) otomatis.
            </p>
          </div>
        </div>

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
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Excel</span>
          </button>
          <button
            onClick={handleExportWord}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Word</span>
          </button>
          <button
            onClick={handlePrintPdf}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition"
          >
            <Printer className="w-4 h-4 text-rose-400" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block text-slate-400 font-semibold mb-1">Kelas</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-bold"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-400 font-semibold mb-1">Mata Pelajaran</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-bold"
          >
            {SUBJECT_LIST.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
            {!SUBJECT_LIST.includes(subject) && <option value={subject}>{subject} (Kustom)</option>}
          </select>
        </div>

        <div>
          <label className="block text-slate-400 font-semibold mb-1">KKTP (Batas Kelulusan)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={kktp}
            onChange={(e) => setKktp(parseInt(e.target.value) || 75)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Grade Input Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-800/60 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
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

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 flex items-center space-x-1.5 transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Siswa Baru</span>
            </button>
            <button
              onClick={() => handleFillDefaultScores(85)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/40 border border-emerald-700/50 flex items-center space-x-1.5 transition"
              title="Isi otomatis nilai standar tuntas rata-rata 85"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Set Standar (85)</span>
            </button>
            <button
              onClick={handleSaveGrades}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30 transition"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Nilai Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Nilai Harian</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-3 w-24">NIS</th>
                <th className="py-3 px-3">Nama Siswa</th>
                <th className="py-3 px-2 w-16 text-center">Tugas 1</th>
                <th className="py-3 px-2 w-16 text-center">Tugas 2</th>
                <th className="py-3 px-2 w-16 text-center">UH 1</th>
                <th className="py-3 px-2 w-16 text-center">UH 2</th>
                <th className="py-3 px-2 w-16 text-center">Kinerja</th>
                <th className="py-3 px-3 w-20 text-center bg-indigo-950/40 text-indigo-300">NRH</th>
                <th className="py-3 px-3 w-24 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-2xl inline-block text-indigo-400">
                        <Users className="w-8 h-8 mx-auto" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Belum Ada Data Siswa pada {selectedClass?.name || 'Kelas Ini'}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Anda dapat mengimpor data siswa secara instan menggunakan file Excel template (NO, NISN/NIS, Nama Siswa, Kelas).
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
                const sc = studentGrades[s.id] || { tugas1: 80, tugas2: 80, uh1: 80, uh2: 80, kinerja: 80 };
                const avg = calculateAverage(sc);
                const isPassed = avg >= kktp;
                return (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 text-center text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{s.nis}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{s.name}</td>
                    <td className="py-2.5 px-1 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={sc.tugas1}
                        onChange={(e) => handleGradeChange(s.id, 'tugas1', parseInt(e.target.value))}
                        className="w-14 text-center px-1.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="py-2.5 px-1 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={sc.tugas2}
                        onChange={(e) => handleGradeChange(s.id, 'tugas2', parseInt(e.target.value))}
                        className="w-14 text-center px-1.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="py-2.5 px-1 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={sc.uh1}
                        onChange={(e) => handleGradeChange(s.id, 'uh1', parseInt(e.target.value))}
                        className="w-14 text-center px-1.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="py-2.5 px-1 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={sc.uh2}
                        onChange={(e) => handleGradeChange(s.id, 'uh2', parseInt(e.target.value))}
                        className="w-14 text-center px-1.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="py-2.5 px-1 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={sc.kinerja}
                        onChange={(e) => handleGradeChange(s.id, 'kinerja', parseInt(e.target.value))}
                        className="w-14 text-center px-1.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold font-mono bg-indigo-950/20 text-indigo-300 text-sm">
                      {avg}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isPassed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {isPassed ? 'Tuntas' : 'Remedial'}
                      </span>
                    </td>
                  </tr>
                );
              }))}
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
                      name="quick-gender-ph"
                      checked={newStudentGender === 'L'}
                      onChange={() => setNewStudentGender('L')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Laki-Laki (L)</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="quick-gender-ph"
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

      {/* Excel Import Modal */}
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
