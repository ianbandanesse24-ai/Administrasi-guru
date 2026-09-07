import React, { useState } from 'react';
import {
  Calculator,
  FileSpreadsheet,
  FileText,
  Printer,
  TrendingUp,
  Award,
  AlertCircle,
  Sliders,
  CheckCircle2,
  Search,
  Download,
  Upload,
  Users,
} from 'lucide-react';
import { ClassRoom, Student, GradeEntry } from '../types';
import { StorageService } from '../lib/storage';
import { ExportService } from '../lib/exportUtils';
import { SUBJECT_LIST } from '../lib/curriculumData';
import { OfflineAdminNotice } from '../components/OfflineSyncIndicator';
import { StudentExcelImportModal } from '../components/StudentExcelImportModal';
import { StudentExcelUtils } from '../lib/studentExcelUtils';

export const RekapNilaiView: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>(() => StorageService.getClasses());
  const [students, setStudents] = useState<Student[]>(() => StorageService.getStudents());
  const [grades, setGrades] = useState<GradeEntry[]>(() => StorageService.getGrades());

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'c1');
  const [subject, setSubject] = useState('Bahasa Indonesia');
  const [kktp, setKktp] = useState(75);
  const [weightDaily, setWeightDaily] = useState(2); // 50%
  const [weightPts, setWeightPts] = useState(1); // 25%
  const [weightPas, setWeightPas] = useState(1); // 25%
  const [searchTerm, setSearchTerm] = useState('');
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((s) => s.classId === selectedClassId || s.className === selectedClass?.name);

  // Compute calculated grades list
  const calculatedList = classStudents.map((s) => {
    const existing = grades.find((g) => g.studentId === s.id && g.subject === subject);
    const nrh = existing?.dailyAverage ?? (80 + Math.floor(Math.random() * 15));
    const npts = existing?.ptsScore ?? (78 + Math.floor(Math.random() * 18));
    const npas = existing?.pasScore ?? (82 + Math.floor(Math.random() * 14));

    const totalWeight = weightDaily + weightPts + weightPas;
    const finalScore = totalWeight > 0 ? Math.round(((nrh * weightDaily + npts * weightPts + npas * weightPas) / totalWeight) * 10) / 10 : 0;

    let predicate: 'A' | 'B' | 'C' | 'D' = 'D';
    let description = '';

    if (finalScore >= 90) {
      predicate = 'A';
      description = `Menunjukkan penguasaan sangat istimewa dan pemahaman mendalam (Deep Learning) dalam materi ${subject}.`;
    } else if (finalScore >= 80) {
      predicate = 'B';
      description = `Menunjukkan penguasaan kompetensi yang baik dan mandiri dalam materi ${subject}.`;
    } else if (finalScore >= kktp) {
      predicate = 'C';
      description = `Mencapai kriteria ketuntasan minimal, perlu penguatan pada aspek penalaran kritis materi ${subject}.`;
    } else {
      predicate = 'D';
      description = `Belum mencapai kriteria ketuntasan minimal, memerlukan bimbingan intensif dan remedial ${subject}.`;
    }

    return {
      student: s,
      nrh,
      npts,
      npas,
      finalScore,
      predicate,
      description,
      isPassed: finalScore >= kktp,
    };
  });

  // Calculate statistics
  const totalStudents = calculatedList.length;
  const passedStudents = calculatedList.filter((c) => c.isPassed).length;
  const classAvg = totalStudents > 0 ? Math.round((calculatedList.reduce((acc, c) => acc + c.finalScore, 0) / totalStudents) * 10) / 10 : 0;
  const maxScore = totalStudents > 0 ? Math.max(...calculatedList.map((c) => c.finalScore)) : 0;
  const minScore = totalStudents > 0 ? Math.min(...calculatedList.map((c) => c.finalScore)) : 0;
  const passPercentage = totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 1000) / 10 : 100;

  // Exports
  const handleExportExcel = () => {
    const exportData = calculatedList.map((item, idx) => ({
      No: idx + 1,
      NIS: item.student.nis,
      'Nama Siswa': item.student.name,
      'L/P': item.student.gender,
      'Rata Harian (NRH)': item.nrh,
      'Nilai PTS': item.npts,
      'Nilai PAS': item.npas,
      'Nilai Akhir (NA)': item.finalScore,
      Predikat: item.predicate,
      'Status Kelulusan': item.isPassed ? 'Tuntas' : 'Belum Tuntas',
      'Capaian Kompetensi': item.description,
    }));
    ExportService.exportToExcel(exportData, `Rekap_Nilai_Otomatis_${selectedClass?.name}_${subject}`);
  };

  const handleExportWord = () => {
    const schoolProfile = StorageService.getSchoolProfile();
    let rows = '';
    calculatedList.forEach((item, idx) => {
      rows += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td>${item.student.nis}</td>
          <td><strong>${item.student.name}</strong></td>
          <td style="text-align:center;">${item.nrh}</td>
          <td style="text-align:center;">${item.npts}</td>
          <td style="text-align:center;">${item.npas}</td>
          <td style="text-align:center; font-weight:bold; background-color:#f1f5f9;">${item.finalScore}</td>
          <td style="text-align:center; font-weight:bold;">${item.predicate}</td>
          <td style="text-align:center; font-weight:bold; color:${item.isPassed ? '#16a34a' : '#dc2626'};">${item.isPassed ? 'Tuntas' : 'Remedial'}</td>
          <td><small>${item.description}</small></td>
        </tr>
      `;
    });

    const bodyHtml = `
      <div style="margin-bottom:15px;">
        <strong>LEGER REKAPITULASI NILAI OTOMATIS</strong><br>
        Mata Pelajaran: ${subject} | Kelas: ${selectedClass?.name} | KKTP: ${kktp}<br>
        Bobot Formula: NRH (${weightDaily}x) + PTS (${weightPts}x) + PAS (${weightPas}x) | Rata-rata Kelas: <strong>${classAvg}</strong> (Ketuntasan: ${passPercentage}%)
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:30px;">No</th>
            <th>NIS</th>
            <th>Nama Lengkap Peserta Didik</th>
            <th>NRH</th>
            <th>PTS</th>
            <th>PAS</th>
            <th>Nilai Akhir (NA)</th>
            <th>Predikat</th>
            <th>Status</th>
            <th>Deskripsi Capaian Kompetensi</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    ExportService.exportToWord(`LEGER NILAI RAPOR - ${selectedClass?.name}`, bodyHtml, schoolProfile, `Leger_Nilai_${selectedClass?.name}`);
  };

  const handlePrintPdf = () => {
    const schoolProfile = StorageService.getSchoolProfile();
    let rows = '';
    calculatedList.forEach((item, idx) => {
      rows += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td>${item.student.nis}</td>
          <td><strong>${item.student.name}</strong></td>
          <td style="text-align:center;">${item.nrh}</td>
          <td style="text-align:center;">${item.npts}</td>
          <td style="text-align:center;">${item.npas}</td>
          <td style="text-align:center; font-weight:bold;">${item.finalScore}</td>
          <td style="text-align:center; font-weight:bold;">${item.predicate}</td>
          <td style="text-align:center;">${item.isPassed ? 'Tuntas' : 'Remedial'}</td>
        </tr>
      `;
    });

    const bodyHtml = `
      <div style="margin-bottom:10px; font-size:9pt;">
        <div><strong>Leger Nilai Akhir Mata Pelajaran:</strong> ${subject} | <strong>Kelas:</strong> ${selectedClass?.name}</div>
        <div><strong>Statistik:</strong> Rata-rata: ${classAvg} | Tertinggi: ${maxScore} | Terendah: ${minScore} | Ketuntasan: ${passPercentage}%</div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:30px;">No</th>
            <th>NIS</th>
            <th>Nama Peserta Didik</th>
            <th>NRH</th>
            <th>PTS</th>
            <th>PAS</th>
            <th>NA</th>
            <th>Predikat</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    ExportService.printPdfPreview(`LEGER NILAI RAPOR ${selectedClass?.name}`, bodyHtml, schoolProfile);
  };

  const filteredList = calculatedList.filter((item) =>
    item.student.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.student.nis.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Offline Storage & Cloud Sync Notice */}
      <OfflineAdminNotice menuTitle="Rekap Nilai Otomatis & Leger Rapor" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">10. Rekap Nilai Otomatis & Leger Rapor</h1>
            <p className="text-xs text-slate-400">
              Integrasi nilai Harian (NRH), PTS, dan PAS dengan formula bobot, predikat, dan deskripsi capaian otomatis.
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
            <span>PDF Leger</span>
          </button>
        </div>
      </div>

      {/* Filter & Weight Controls */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

        {/* Formula Weight Sliders */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-indigo-300 font-bold">
            <Sliders className="w-4 h-4" />
            <span>Formula Bobot Nilai Akhir:</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Bobot Harian (NRH):</span>
              <input
                type="number"
                min="1"
                max="5"
                value={weightDaily}
                onChange={(e) => setWeightDaily(parseInt(e.target.value) || 1)}
                className="w-12 text-center py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Bobot PTS:</span>
              <input
                type="number"
                min="0"
                max="5"
                value={weightPts}
                onChange={(e) => setWeightPts(parseInt(e.target.value) || 1)}
                className="w-12 text-center py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Bobot PAS:</span>
              <input
                type="number"
                min="0"
                max="5"
                value={weightPas}
                onChange={(e) => setWeightPas(parseInt(e.target.value) || 1)}
                className="w-12 text-center py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold"
              />
            </div>
          </div>
        </div>

        {/* Stat Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Rata-rata Kelas</div>
            <div className="text-lg font-black text-indigo-400 mt-0.5">{classAvg}</div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Nilai Tertinggi</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">{maxScore}</div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Nilai Terendah</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">{minScore}</div>
          </div>

          <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Ketuntasan Klasikal</div>
            <div className="text-lg font-black text-teal-400 mt-0.5">{passPercentage}%</div>
          </div>
        </div>
      </div>

      {/* Rekap Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-3 w-24">NIS</th>
                <th className="py-3 px-3">Nama Siswa</th>
                <th className="py-3 px-2 w-16 text-center">NRH</th>
                <th className="py-3 px-2 w-16 text-center">PTS</th>
                <th className="py-3 px-2 w-16 text-center">PAS</th>
                <th className="py-3 px-3 w-20 text-center bg-indigo-950/40 text-indigo-300 font-bold">NA</th>
                <th className="py-3 px-2 w-16 text-center">Predikat</th>
                <th className="py-3 px-2 w-20 text-center">Status</th>
                <th className="py-3 px-3">Deskripsi Capaian Kompetensi Otomatis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl inline-block text-emerald-400">
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
                filteredList.map((item, idx) => (
                  <tr key={item.student.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 text-center text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{item.student.nis}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{item.student.name}</td>
                    <td className="py-2.5 px-2 text-center text-slate-300 font-mono">{item.nrh}</td>
                    <td className="py-2.5 px-2 text-center text-slate-300 font-mono">{item.npts}</td>
                    <td className="py-2.5 px-2 text-center text-slate-300 font-mono">{item.npas}</td>
                    <td className="py-2.5 px-3 text-center font-black font-mono bg-indigo-950/20 text-indigo-300 text-sm">
                      {item.finalScore}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          item.predicate === 'A'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : item.predicate === 'B'
                            ? 'bg-blue-500/20 text-blue-300'
                            : item.predicate === 'C'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {item.predicate}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.isPassed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {item.isPassed ? 'Tuntas' : 'Remedial'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 text-[11px] leading-relaxed">
                      {item.description}
                    </td>
                  </tr>
                ))
              )}
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
