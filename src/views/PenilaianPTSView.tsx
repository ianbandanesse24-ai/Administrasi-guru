import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  Printer,
  Save,
  Check,
  Search,
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

export const PenilaianPTSView: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>(() => StorageService.getClasses());
  const [students, setStudents] = useState<Student[]>(() => StorageService.getStudents());
  const [grades, setGrades] = useState<GradeEntry[]>(() => StorageService.getGrades());

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'c1');
  const [subject, setSubject] = useState('Bahasa Indonesia');
  const [kktp, setKktp] = useState(75);
  const [searchTerm, setSearchTerm] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((s) => s.classId === selectedClassId || s.className === selectedClass?.name);

  const [ptsScores, setPtsScores] = useState<Record<string, { pg: number; uraian: number; remedial?: number }>>({});

  useEffect(() => {
    const currentGrades = StorageService.getGrades();
    const map: Record<string, any> = {};
    classStudents.forEach((s) => {
      const existing = currentGrades.find((g) => g.studentId === s.id && g.subject === subject);
      map[s.id] = {
        pg: existing?.ptsScore ? Math.min(50, Math.floor(existing.ptsScore * 0.5)) : 42,
        uraian: existing?.ptsScore ? Math.min(50, Math.ceil(existing.ptsScore * 0.5)) : 40,
        remedial: existing?.ptsScore && existing.ptsScore < kktp ? kktp : undefined,
      };
    });
    setPtsScores(map);
  }, [selectedClassId, subject, students.length]);

  const handleScoreChange = (studentId: string, field: 'pg' | 'uraian' | 'remedial', val: number) => {
    const maxVal = field === 'remedial' ? 100 : 50;
    const clamped = Math.max(0, Math.min(maxVal, isNaN(val) ? 0 : val));
    setPtsScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: clamped,
      },
    }));
  };

  const getFinalPTS = (scores: { pg: number; uraian: number; remedial?: number }) => {
    const raw = (scores.pg || 0) + (scores.uraian || 0);
    if (scores.remedial && scores.remedial > raw) {
      return Math.min(kktp, scores.remedial); // Remedial capped at KKTP
    }
    return raw;
  };

  const handleSavePTS = () => {
    const updatedGrades = [...grades];
    classStudents.forEach((s) => {
      const sc = ptsScores[s.id] || { pg: 40, uraian: 40 };
      const finalPts = getFinalPTS(sc);
      const idx = updatedGrades.findIndex((g) => g.studentId === s.id && g.subject === subject);
      if (idx >= 0) {
        updatedGrades[idx] = {
          ...updatedGrades[idx],
          ptsScore: finalPts,
        };
      } else {
        updatedGrades.push({
          id: `gr-${Date.now()}-${s.id}`,
          studentId: s.id,
          studentName: s.name,
          className: selectedClass?.name || 'Kelas',
          subject: subject,
          dailyAverage: 80,
          ptsScore: finalPts,
          pasScore: 80,
          finalScore: Math.round(((80 * 2 + finalPts + 80) / 4) * 10) / 10,
          predicate: finalPts >= 90 ? 'A' : finalPts >= 80 ? 'B' : finalPts >= 70 ? 'C' : 'D',
        });
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
      const sc = ptsScores[s.id] || { pg: 0, uraian: 0 };
      const finalPts = getFinalPTS(sc);
      return {
        No: idx + 1,
        NIS: s.nis,
        'Nama Siswa': s.name,
        'Nilai PG (Max 50)': sc.pg,
        'Nilai Uraian (Max 50)': sc.uraian,
        'Remedial (Jika Ada)': sc.remedial || '-',
        'Nilai Akhir PTS': finalPts,
        'Status KKTP': finalPts >= kktp ? 'Tuntas' : 'Remedial',
      };
    });
    ExportService.exportToExcel(exportData, `Nilai_PTS_${selectedClass?.name}_${subject}`);
  };

  const handleExportWord = () => {
    const schoolProfile = StorageService.getSchoolProfile();
    let rows = '';
    classStudents.forEach((s, idx) => {
      const sc = ptsScores[s.id] || { pg: 0, uraian: 0 };
      const finalPts = getFinalPTS(sc);
      rows += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td>${s.nis}</td>
          <td><strong>${s.name}</strong></td>
          <td style="text-align:center;">${sc.pg}</td>
          <td style="text-align:center;">${sc.uraian}</td>
          <td style="text-align:center;">${sc.remedial || '-'}</td>
          <td style="text-align:center; font-weight:bold; background-color:#f1f5f9;">${finalPts}</td>
          <td style="text-align:center; font-weight:bold; color:${finalPts >= kktp ? '#16a34a' : '#dc2626'};">${finalPts >= kktp ? 'Tuntas' : 'Remedial'}</td>
        </tr>
      `;
    });

    const bodyHtml = `
      <div style="margin-bottom:15px;">
        <strong>PENILAIAN TENGAH SEMESTER (PTS / SUMATIF TENGAH SEMESTER)</strong><br>
        Mata Pelajaran: ${subject} | Kelas: ${selectedClass?.name} | KKTP: ${kktp}
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:35px;">No</th>
            <th style="width:90px;">NIS</th>
            <th>Nama Lengkap Peserta Didik</th>
            <th>Pilihan Ganda (50)</th>
            <th>Uraian (50)</th>
            <th>Remedial</th>
            <th>Nilai Akhir PTS</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    ExportService.exportToWord(`DAFTAR NILAI PTS - ${selectedClass?.name}`, bodyHtml, schoolProfile, `Nilai_PTS_${selectedClass?.name}`);
  };

  const handlePrintPdf = () => {
    const schoolProfile = StorageService.getSchoolProfile();
    let rows = '';
    classStudents.forEach((s, idx) => {
      const sc = ptsScores[s.id] || { pg: 0, uraian: 0 };
      const finalPts = getFinalPTS(sc);
      rows += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td>${s.nis}</td>
          <td><strong>${s.name}</strong></td>
          <td style="text-align:center;">${sc.pg}</td>
          <td style="text-align:center;">${sc.uraian}</td>
          <td style="text-align:center; font-weight:bold;">${finalPts}</td>
          <td style="text-align:center;">${finalPts >= kktp ? 'Tuntas' : 'Remedial'}</td>
        </tr>
      `;
    });

    const bodyHtml = `
      <div style="margin-bottom:10px;">
        <strong>Nilai Penilaian Tengah Semester (PTS):</strong> ${subject} | Kelas: ${selectedClass?.name} (KKTP: ${kktp})
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:30px;">No</th>
            <th>NIS</th>
            <th>Nama Siswa</th>
            <th>PG (50)</th>
            <th>Uraian (50)</th>
            <th>Nilai PTS</th>
            <th>Ketercapaian</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    ExportService.printPdfPreview(`NILAI PTS ${selectedClass?.name}`, bodyHtml, schoolProfile);
  };

  const filteredStudents = classStudents.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.nis.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">8. Penilaian Tengah Semester (PTS / STS)</h1>
            <p className="text-xs text-slate-400">
              Pengolahan skor Pilihan Ganda (PG), Uraian, nilai remedial, dan penentuan kelulusan KKTP tengah semester.
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
          <label className="block text-slate-400 font-semibold mb-1">KKTP</label>
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

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-800/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari siswa..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleSavePTS}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30 transition"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Nilai PTS Tersimpan!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Semua Nilai PTS</span>
              </>
            )}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 w-28">NIS</th>
                <th className="py-3 px-4">Nama Lengkap Siswa</th>
                <th className="py-3 px-3 w-24 text-center">PG (Maks 50)</th>
                <th className="py-3 px-3 w-24 text-center">Uraian (Maks 50)</th>
                <th className="py-3 px-3 w-24 text-center">Remedial</th>
                <th className="py-3 px-4 w-24 text-center bg-blue-950/40 text-blue-300">Nilai PTS</th>
                <th className="py-3 px-4 w-24 text-center">Ketercapaian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-2xl inline-block text-blue-400">
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
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => {
                const sc = ptsScores[s.id] || { pg: 40, uraian: 40 };
                const finalPts = getFinalPTS(sc);
                const isPassed = finalPts >= kktp;
                return (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-4 text-center text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-400">{s.nis}</td>
                    <td className="py-2.5 px-4 font-semibold text-white">{s.name}</td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={sc.pg}
                        onChange={(e) => handleScoreChange(s.id, 'pg', parseInt(e.target.value))}
                        className="w-16 text-center px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={sc.uraian}
                        onChange={(e) => handleScoreChange(s.id, 'uraian', parseInt(e.target.value))}
                        className="w-16 text-center px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="-"
                        value={sc.remedial || ''}
                        onChange={(e) => handleScoreChange(s.id, 'remedial', parseInt(e.target.value))}
                        className="w-16 text-center px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-center font-bold font-mono bg-blue-950/20 text-blue-300 text-sm">
                      {finalPts}
                    </td>
                    <td className="py-2.5 px-4 text-center">
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
