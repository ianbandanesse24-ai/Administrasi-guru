import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  Users,
  Layers,
  Sparkles,
  Info,
  Check,
  ChevronRight,
  RefreshCw,
  FolderPlus,
} from 'lucide-react';
import { StudentExcelUtils, ParseExcelResult, ParsedStudentItem } from '../lib/studentExcelUtils';
import { StorageService } from '../lib/storage';

interface StudentExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultClassId?: string;
  defaultClassName?: string;
}

export const StudentExcelImportModal: React.FC<StudentExcelImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultClassId,
  defaultClassName,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseExcelResult | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace_by_class' | 'replace_all'>('merge');
  const [activeSheetFilter, setActiveSheetFilter] = useState<string>('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = (mode: 'all' | 'single' = 'all') => {
    if (mode === 'single' && defaultClassId) {
      StudentExcelUtils.downloadTemplate(defaultClassId);
    } else {
      StudentExcelUtils.downloadTemplate();
    }
  };

  const handleFileProcess = async (file: File) => {
    if (!file) return;
    setSelectedFile(file);
    setIsProcessing(true);
    setParseResult(null);
    setSuccessMessage(null);

    const result = await StudentExcelUtils.parseExcelFile(file);
    setParseResult(result);
    setIsProcessing(false);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleCommitImport = () => {
    if (!parseResult || !parseResult.success || parseResult.students.length === 0) return;

    setIsProcessing(true);
    try {
      const summary = StudentExcelUtils.commitImport(parseResult.students, importMode);

      setSuccessMessage(
        `Sukses! Berhasil mengimpor ${summary.createdStudents} siswa ke dalam sistem${
          summary.newClassesCreated > 0 ? ` dan membuat ${summary.newClassesCreated} rombel kelas baru` : ''
        }.`
      );

      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err) {
      alert('Gagal mengimpor siswa: ' + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setParseResult(null);
    setSuccessMessage(null);
    onClose();
  };

  const filteredStudents =
    parseResult?.students.filter((s) => {
      if (activeSheetFilter === 'all') return true;
      return s.sheetName === activeSheetFilter || s.className === activeSheetFilter;
    }) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-indigo-900/60 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-900/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Import Template Data Siswa (Excel)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Multi-Sheet per Kelas
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Format kolom: <strong className="text-emerald-300">NO</strong>, <strong className="text-emerald-300">NISN/NIS (Opsional)</strong>, <strong className="text-emerald-300">Nama Siswa</strong>, dan <strong className="text-emerald-300">Kelas</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Success Banner */}
          {successMessage && (
            <div className="p-4 bg-emerald-950/90 border border-emerald-500 rounded-xl text-emerald-200 text-xs flex items-center space-x-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="font-bold text-sm">{successMessage}</div>
            </div>
          )}

          {/* Guidelines & Download Template Box */}
          <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-bold text-indigo-200 flex items-center space-x-1.5">
                <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Format Standar Template Excel Multi-Sheet:</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Tabel terdiri dari kolom <strong>NO</strong>, <strong>NISN/NIS</strong> (opsional), <strong>Nama Siswa</strong>, dan <strong>Kelas</strong>. Jika mengelola lebih dari 1 kelas, Anda dapat membuat sheet berbeda untuk masing-masing kelas (contoh sheet: <em>Kelas 10-A, Kelas 10-B, Kelas 11-A</em>).
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => handleDownloadTemplate('all')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow"
                title="Download file template Excel multi-sheet"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Template Multi-Sheet (.xlsx)</span>
              </button>

              {defaultClassId && (
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate('single')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                  title="Unduh template khusus kelas aktif"
                >
                  <Download className="w-3 h-3 text-indigo-300" />
                  <span>Kelas Ini</span>
                </button>
              )}
            </div>
          </div>

          {/* Upload Dropzone */}
          {!parseResult && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 ${
                isDragging
                  ? 'border-emerald-400 bg-emerald-950/20 scale-[0.99]'
                  : 'border-slate-700 hover:border-indigo-500 bg-slate-950/60 hover:bg-slate-900/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="p-4 bg-indigo-600/20 text-indigo-300 rounded-2xl border border-indigo-500/30">
                <Upload className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-white">
                  Tarik & Letakkan File Excel Template Siswa di Sini
                </p>
                <p className="text-xs text-slate-400">
                  atau <span className="text-indigo-400 font-bold underline">klik untuk memilih file</span> dari komputer (.xlsx, .xls, .csv)
                </p>
              </div>

              <div className="flex items-center space-x-2 text-[10px] text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                <span>Mendukung Single Sheet maupun Multi-Sheet per Kelas</span>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isProcessing && !successMessage && (
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
              <p className="text-xs font-bold text-slate-300">Memproses & membaca lembar kerja Excel...</p>
            </div>
          )}

          {/* Error Message if Parsing Failed */}
          {parseResult && !parseResult.success && (
            <div className="p-4 bg-rose-950/80 border border-rose-600 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-rose-300 text-xs font-bold">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Gagal Mengimpor File Excel:</span>
              </div>
              <ul className="list-disc list-inside text-xs text-rose-200 space-y-1 ml-2">
                {parseResult.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setParseResult(null);
                    setSelectedFile(null);
                  }}
                  className="px-3 py-1.5 bg-rose-900 hover:bg-rose-800 text-white rounded-lg text-xs font-bold"
                >
                  Pilih File Lain
                </button>
              </div>
            </div>
          )}

          {/* Parse Result & Preview */}
          {parseResult && parseResult.success && (
            <div className="space-y-4">
              {/* Summary Header */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400">Total Siswa Terbaca</div>
                  <div className="text-lg font-black text-emerald-400">
                    {parseResult.totalStudents} <span className="text-xs font-normal text-slate-300">Siswa</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400">Jumlah Sheet Excel</div>
                  <div className="text-lg font-black text-indigo-300">
                    {parseResult.sheetCount} <span className="text-xs font-normal text-slate-300">Sheet</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400">Rombel Kelas Terdeteksi</div>
                  <div className="text-lg font-black text-amber-300">
                    {parseResult.classesDetected.length} <span className="text-xs font-normal text-slate-300">Kelas</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400">Rombel Kelas Baru</div>
                  <div className="text-lg font-black text-blue-300">
                    {parseResult.classesDetected.filter((c) => c.isNew).length}{' '}
                    <span className="text-xs font-normal text-slate-300">Akan Dibuat</span>
                  </div>
                </div>
              </div>

              {/* Detected Classes Chips */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs">
                <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5">Filter Sheet/Kelas:</span>
                <button
                  type="button"
                  onClick={() => setActiveSheetFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    activeSheetFilter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  Semua ({parseResult.totalStudents})
                </button>
                {parseResult.classesDetected.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setActiveSheetFilter(c.name)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                      activeSheetFilter === c.name
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 rounded-full">
                      {c.studentCount}
                    </span>
                    {c.isNew && (
                      <span className="text-[9px] bg-amber-500/30 text-amber-300 px-1 rounded">Baru</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Preview Table */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px] sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3 text-center w-10">No</th>
                      <th className="py-2 px-3">Nama Siswa</th>
                      <th className="py-2 px-3">NISN / NIS</th>
                      <th className="py-2 px-3 text-center">L/P</th>
                      <th className="py-2 px-3">Kelas</th>
                      <th className="py-2 px-3">Sheet Asal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredStudents.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        <td className="py-2 px-3 text-center font-mono text-slate-500">{s.no || idx + 1}</td>
                        <td className="py-2 px-3 font-bold text-white">{s.name}</td>
                        <td className="py-2 px-3 font-mono text-slate-300 text-[11px]">
                          {s.nisn} / {s.nis}
                        </td>
                        <td className="py-2 px-3 text-center font-bold">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              s.gender === 'L' ? 'text-blue-300 bg-blue-900/40' : 'text-pink-300 bg-pink-900/40'
                            }`}
                          >
                            {s.gender}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 font-medium text-[11px]">
                            {s.className}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-400 text-[10px] font-mono">{s.sheetName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Import Mode Options */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-200">Metode Penyimpanan Data Siswa:</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <label
                    className={`p-2.5 rounded-xl border cursor-pointer transition text-xs flex items-start space-x-2 ${
                      importMode === 'merge'
                        ? 'bg-indigo-950/80 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-bold text-indigo-200">Tambahkan (Merge)</div>
                      <div className="text-[10px] opacity-75">
                        Menambahkan siswa baru tanpa menghapus data siswa yang ada saat ini.
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-2.5 rounded-xl border cursor-pointer transition text-xs flex items-start space-x-2 ${
                      importMode === 'replace_by_class'
                        ? 'bg-amber-950/80 border-amber-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace_by_class'}
                      onChange={() => setImportMode('replace_by_class')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-bold text-amber-200">Gantikan per Rombel</div>
                      <div className="text-[10px] opacity-75">
                        Memperbarui siswa hanya untuk kelas-kelas yang ada dalam file Excel ini.
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-2.5 rounded-xl border cursor-pointer transition text-xs flex items-start space-x-2 ${
                      importMode === 'replace_all'
                        ? 'bg-rose-950/80 border-rose-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace_all'}
                      onChange={() => setImportMode('replace_all')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-bold text-rose-200">Gantikan Semua</div>
                      <div className="text-[10px] opacity-75">
                        Mengosongkan semua data siswa lama dan mengganti dengan isi file ini.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div>
            {parseResult && (
              <button
                type="button"
                onClick={() => {
                  setParseResult(null);
                  setSelectedFile(null);
                }}
                className="px-3 py-2 text-xs text-slate-400 hover:text-white transition"
              >
                Pilih Ulang File
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              Tutup / Batal
            </button>

            {parseResult && parseResult.success && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCommitImport}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition shadow-lg flex items-center space-x-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Simpan & Import {parseResult.totalStudents} Siswa</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
