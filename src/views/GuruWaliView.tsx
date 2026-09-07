import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  Award,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  FileSpreadsheet,
  FileText,
  Printer,
  HeartHandshake,
  CheckCircle2,
  Calendar,
  Save,
  Search,
  Download,
  Upload,
} from 'lucide-react';
import { Student, ClassRoom } from '../types';
import { StorageService } from '../lib/storage';
import { ExportService } from '../lib/exportUtils';
import { StudentExcelImportModal } from '../components/StudentExcelImportModal';
import { StudentExcelUtils } from '../lib/studentExcelUtils';

interface StudentIncident {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  category: 'Prestasi' | 'Pelanggaran' | 'Bimbingan Konseling' | 'Kesehatan' | 'Keluarga';
  description: string;
  followUp: string;
  handledBy: string;
}

export const GuruWaliView: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>(() => StorageService.getClasses());
  const [students, setStudents] = useState<Student[]>(() => StorageService.getStudents());
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'c1');
  const [activeTab, setActiveTab] = useState<'siswa' | 'catatan_bk' | 'rekap'>('siswa');
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((s) => s.classId === selectedClassId || s.className === selectedClass?.name);

  // Incidents / Guidance notes
  const [incidents, setIncidents] = useState<StudentIncident[]>([
    {
      id: 'inc-1',
      studentId: 'std-1',
      studentName: 'Ahmad Faiz Pratama',
      date: '2025-08-15',
      category: 'Prestasi',
      description: 'Juara 1 Lomba Debat Bahasa Indonesia Tingkat Kota',
      followUp: 'Diusulkan reward piagam dan pembinaan tingkat provinsi',
      handledBy: 'Wali Kelas',
    },
    {
      id: 'inc-2',
      studentId: 'std-3',
      studentName: 'Bagas Aditya',
      date: '2025-08-18',
      category: 'Bimbingan Konseling',
      description: 'Terlambat 3 kali berturut-turut karena membantu orang tua di pasar',
      followUp: 'Konseling individual & koordinasi dengan orang tua via telepon',
      handledBy: 'Guru BK & Wali Kelas',
    },
  ]);

  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incStudentName, setIncStudentName] = useState(classStudents[0]?.name || '');
  const [incDate, setIncDate] = useState(new Date().toISOString().substring(0, 10));
  const [incCat, setIncCat] = useState<StudentIncident['category']>('Prestasi');
  const [incDesc, setIncDesc] = useState('');
  const [incFollowUp, setIncFollowUp] = useState('');

  useEffect(() => {
    if (classStudents.length > 0) {
      setIncStudentName(classStudents[0].name);
    }
  }, [selectedClassId, students.length]);

  const handleSaveIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const newInc: StudentIncident = {
      id: `inc-${Date.now()}`,
      studentId: 'std-custom',
      studentName: incStudentName,
      date: incDate,
      category: incCat,
      description: incDesc,
      followUp: incFollowUp,
      handledBy: 'Wali Kelas',
    };
    setIncidents([newInc, ...incidents]);
    setShowIncidentModal(false);
    setIncDesc('');
    setIncFollowUp('');
  };

  const handleDeleteIncident = (id: string) => {
    setIncidents(incidents.filter((i) => i.id !== id));
  };

  // Exports
  const handleExportExcel = () => {
    const data = classStudents.map((s, idx) => ({
      No: idx + 1,
      NIS: s.nis,
      'Nama Siswa': s.name,
      'L/P': s.gender,
      'Nama Orang Tua / Wali': s.parentName || '-',
      'No. Kontak / WA': s.parentPhone || '-',
      Alamat: s.address || '-',
    }));
    ExportService.exportToExcel(data, `Data_Binaan_WaliKelas_${selectedClass?.name}`);
  };

  const handleExportWord = () => {
    const schoolProfile = StorageService.getSchoolProfile();
    let rows = '';
    classStudents.forEach((s, idx) => {
      rows += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td>${s.nis}</td>
          <td><strong>${s.name}</strong></td>
          <td style="text-align:center;">${s.gender}</td>
          <td>${s.parentName || '-'}</td>
          <td>${s.parentPhone || '-'}</td>
          <td>${s.address || '-'}</td>
        </tr>
      `;
    });

    const bodyHtml = `
      <div style="margin-bottom:15px;">
        <strong>Kelas Binaan:</strong> ${selectedClass?.name} | <strong>Jumlah Siswa:</strong> ${classStudents.length} Orang
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:35px;">No</th>
            <th>NIS</th>
            <th>Nama Lengkap Siswa</th>
            <th>L/P</th>
            <th>Nama Orang Tua/Wali</th>
            <th>Kontak / WA</th>
            <th>Alamat</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    ExportService.exportToWord(`BUKU INDUK WALI KELAS - ${selectedClass?.name}`, bodyHtml, schoolProfile, `Wali_Kelas_${selectedClass?.name}`);
  };

  const handlePrintPdf = () => {
    const schoolProfile = StorageService.getSchoolProfile();
    let rows = '';
    classStudents.forEach((s, idx) => {
      rows += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td>${s.nis}</td>
          <td><strong>${s.name}</strong></td>
          <td style="text-align:center;">${s.gender}</td>
          <td>${s.parentName || '-'}</td>
          <td>${s.parentPhone || '-'}</td>
        </tr>
      `;
    });

    const bodyHtml = `
      <div style="margin-bottom:10px;">
        <strong>Daftar Anggota Kelas Binaan:</strong> ${selectedClass?.name} (${classStudents.length} Siswa)
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:30px;">No</th>
            <th>NIS</th>
            <th>Nama Siswa</th>
            <th>L/P</th>
            <th>Orang Tua/Wali</th>
            <th>No. Telepon / WA</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    ExportService.printPdfPreview(`LAPORAN WALI KELAS - ${selectedClass?.name}`, bodyHtml, schoolProfile);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">5. Buku Catatan Guru Wali (Wali Kelas)</h1>
            <p className="text-xs text-slate-400">
              Pengelolaan siswa binaan, pemantauan karakter profil pelajar Pancasila, catatan konseling, dan prestasi.
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

      {/* Class Selector & Tab Nav */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-semibold">Kelas Binaan:</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('siswa')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'siswa' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Data Siswa ({classStudents.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('catatan_bk')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'catatan_bk' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Catatan BK & Prestasi ({incidents.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DATA SISWA */}
      {activeTab === 'siswa' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-white">Daftar Anggota Kelas Binaan</span>
            <span className="text-slate-400">Total: {classStudents.length} Siswa</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 w-28">NIS</th>
                  <th className="py-3 px-4">Nama Lengkap Siswa</th>
                  <th className="py-3 px-4 w-16 text-center">L/P</th>
                  <th className="py-3 px-4">Orang Tua / Wali</th>
                  <th className="py-3 px-4">Kontak / No. WA</th>
                  <th className="py-3 px-4">Alamat Rumah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {classStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-2xl inline-block text-indigo-400">
                          <Users className="w-8 h-8 mx-auto" />
                        </div>
                        <h4 className="text-sm font-bold text-white">Belum Ada Data Siswa pada {selectedClass?.name || 'Kelas Ini'}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Anda dapat mengimpor data siswa binaan secara instan menggunakan file Excel template (NO, NISN/NIS, Nama Siswa, Kelas).
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
                  classStudents.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 text-center text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{s.nis}</td>
                      <td className="py-3 px-4 font-bold text-white">{s.name}</td>
                      <td className="py-3 px-4 text-center text-slate-400">{s.gender}</td>
                      <td className="py-3 px-4 text-slate-300">{s.parentName || '-'}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono">{s.parentPhone || '-'}</td>
                      <td className="py-3 px-4 text-slate-400 truncate max-w-xs">{s.address || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CATATAN BK & PRESTASI */}
      {activeTab === 'catatan_bk' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowIncidentModal(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Catatan Khusus Siswa</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                        inc.category === 'Prestasi'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : inc.category === 'Bimbingan Konseling'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {inc.category}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-2">{inc.studentName}</h3>
                  </div>
                  <button
                    onClick={() => handleDeleteIncident(inc.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-white">{inc.description}</p>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300">
                    <strong className="text-indigo-300">Tindak Lanjut:</strong> {inc.followUp}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Tanggal: {inc.date}</span>
                    <span>Penangan: {inc.handledBy}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add Incident */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Catat Prestasi / Bimbingan Siswa</h3>
            <form onSubmit={handleSaveIncident} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Pilih Siswa</label>
                <select
                  value={incStudentName}
                  onChange={(e) => setIncStudentName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  {classStudents.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.nis})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={incDate}
                    onChange={(e) => setIncDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Kategori</label>
                  <select
                    value={incCat}
                    onChange={(e) => setIncCat(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Prestasi">Prestasi Siswa</option>
                    <option value="Bimbingan Konseling">Bimbingan Konseling</option>
                    <option value="Pelanggaran">Pelanggaran Tata Tertib</option>
                    <option value="Kesehatan">Kesehatan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Deskripsi Kejadian / Uraian</label>
                <textarea
                  rows={3}
                  required
                  value={incDesc}
                  onChange={(e) => setIncDesc(e.target.value)}
                  placeholder="Jelaskan secara detail peristiwa atau prestasi yang diraih..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tindak Lanjut / Solusi</label>
                <textarea
                  rows={2}
                  required
                  value={incFollowUp}
                  onChange={(e) => setIncFollowUp(e.target.value)}
                  placeholder="Langkah pendampingan, penghargaan, atau mediasi..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowIncidentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Catatan</span>
                </button>
              </div>
            </form>
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
