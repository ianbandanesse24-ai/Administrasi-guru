import React, { useState } from 'react';
import {
  Printer,
  FileText,
  FileSpreadsheet,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Code,
  Sparkles,
  Download,
  School,
  FileCheck,
  Layers,
  ArrowDownToLine,
  FileDown,
  LayoutGrid,
} from 'lucide-react';
import { StorageService, SchoolProfile } from '../lib/storage';
import { ExportService } from '../lib/exportUtils';

interface DocumentPdfPreviewProps {
  title: string;
  markdownContent?: string;
  content?: string;
  subject?: string;
  grade?: number | string;
  level?: string;
  semester?: string;
  docType?: string;
  teacherName?: string;
  fileNamePrefix?: string;
}

export const DocumentPdfPreview: React.FC<DocumentPdfPreviewProps> = ({
  title,
  markdownContent,
  content,
  subject = 'Fisika',
  grade = 10,
  level = 'SMA',
  semester = 'Ganjil',
  docType = 'modul_ajar',
  teacherName,
  fileNamePrefix,
}) => {
  const [viewMode, setViewMode] = useState<'pdf' | 'raw'>('pdf');
  const [widthMode, setWidthMode] = useState<'standard' | 'full'>('full');
  const [zoom, setZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const rawMarkdown = markdownContent || content || '';
  const schoolProfile = StorageService.getSchoolProfile();
  const effectiveTeacher = teacherName || schoolProfile.teacherName;
  const fileName = fileNamePrefix || `Perangkat_Ajar_${docType}_${subject}_Kls${grade}`;

  const exportOptions = {
    ...schoolProfile,
    teacherName: effectiveTeacher,
    semester: semester as any,
    subject,
    grade,
    level: level as any,
    docType,
  };

  const showNotification = (msg: string) => {
    setDownloadNotice(msg);
    setTimeout(() => {
      setDownloadNotice(null);
    }, 4000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawMarkdown);
    setCopied(true);
    showNotification('Teks dokumen berhasil disalin ke clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintPdf = () => {
    showNotification('Membuka dokumen PDF siap cetak / simpan...');
    ExportService.printPdfPreview(title, rawMarkdown, exportOptions);
  };

  const handleExportWord = () => {
    showNotification(`Mengunduh berkas Word: ${fileName}.doc`);
    ExportService.exportToWord(title, rawMarkdown, exportOptions, fileName);
  };

  const handleExportExcel = () => {
    showNotification(`Mengunduh berkas Excel: ${fileName}.xlsx`);
    ExportService.exportCurriculumToExcel(rawMarkdown, title, exportOptions, fileName);
  };

  const handleExportAll = () => {
    showNotification('Mengunduh paket dokumen lengkap (Word & Excel)...');
    ExportService.exportToWord(title, rawMarkdown, exportOptions, `${fileName}_Word`);
    setTimeout(() => {
      ExportService.exportCurriculumToExcel(rawMarkdown, title, exportOptions, `${fileName}_Excel`);
    }, 500);
  };

  const renderedHtml = ExportService.markdownToHtml(rawMarkdown);
  const phase = String(grade) === '10' ? 'E' : Number(grade) > 10 ? 'F' : 'D';

  const contentComponent = (
    <div className="flex flex-col h-full">
      {/* Hero Direct Download Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 border-b border-indigo-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <h3 className="text-sm font-black text-white tracking-wide">
                Dokumen Selesai Disusun & Siap Diunduh Langsung
              </h3>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Pilih format dokumen untuk langsung mengunduh ke perangkat Anda tanpa perlu melalui pratinjau cetak:
            </p>
          </div>

          {/* Direct Download Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Download Word */}
            <button
              type="button"
              onClick={handleExportWord}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-blue-600/30 transition active:scale-95"
              title="Download langsung ke format Microsoft Word (.doc) yang dapat diedit"
            >
              <FileText className="w-4 h-4 text-blue-200" />
              <span>Download Word (.doc)</span>
            </button>

            {/* Download PDF */}
            <button
              type="button"
              onClick={handlePrintPdf}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-rose-600/30 transition active:scale-95"
              title="Download / Simpan berkas PDF resmi ber-Kop Sekolah"
            >
              <Printer className="w-4 h-4 text-rose-200" />
              <span>Download PDF</span>
            </button>

            {/* Download Excel */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-600/30 transition active:scale-95"
              title="Download langsung ke format Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Download Excel (.xlsx)</span>
            </button>

            {/* Download All Package */}
            <button
              type="button"
              onClick={handleExportAll}
              className="px-3 py-2 rounded-xl bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-500/40 font-bold text-xs flex items-center space-x-1.5 transition active:scale-95"
              title="Unduh sekaligus format Word dan Excel"
            >
              <ArrowDownToLine className="w-4 h-4 text-indigo-300" />
              <span className="hidden sm:inline">Unduh Semua Format</span>
            </button>
          </div>
        </div>

        {/* Download notification feedback */}
        {downloadNotice && (
          <div className="mt-2.5 p-2 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadNotice}</span>
          </div>
        )}
      </div>

      {/* Secondary Controls & View Mode Selector */}
      <div className="bg-slate-900 border-b border-slate-800 p-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
        {/* Left: View Mode Tabs */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center">
            <button
              onClick={() => setViewMode('pdf')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                viewMode === 'pdf'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span>Tata Letak Cetak A4</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                viewMode === 'raw'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Teks Mentah</span>
            </button>
          </div>

          {viewMode === 'pdf' && (
            <div className="hidden sm:flex items-center space-x-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs text-slate-300">
              <button
                onClick={() => setZoom((z) => Math.max(70, z - 10))}
                className="p-1 hover:text-white disabled:opacity-30"
                title="Zoom Out"
                disabled={zoom <= 70}
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] px-1 font-bold">{zoom}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(140, z + 10))}
                className="p-1 hover:text-white disabled:opacity-30"
                title="Zoom In"
                disabled={zoom >= 140}
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(100)}
                className="text-[10px] text-slate-400 hover:text-white ml-1 px-1 border-l border-slate-800"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center space-x-2 text-xs">
          {viewMode === 'pdf' && (
            <button
              onClick={() => setWidthMode((w) => (w === 'full' ? 'standard' : 'full'))}
              className={`px-2.5 py-1.5 rounded-lg border transition flex items-center space-x-1 font-semibold ${
                widthMode === 'full'
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50 hover:bg-indigo-600/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title={widthMode === 'full' ? 'Beralih ke Lebar A4 Standar' : 'Beralih ke Tampilan Lebar Penuh (100% Layar)'}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{widthMode === 'full' ? 'Lebar Penuh' : 'A4 Standar'}</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center space-x-1 font-semibold"
            title="Salin Seluruh Teks Dokumen"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Lihat Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Document Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-6 bg-slate-950/80">
        {viewMode === 'pdf' ? (
          /* A4 Sheet Print Preview Container */
          <div className="flex justify-center">
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
              className={`pdf-document-sheet w-full ${widthMode === 'full' ? 'max-w-6xl' : 'max-w-4xl'} bg-white text-slate-900 shadow-2xl rounded-sm p-6 sm:p-10 md:p-12 border border-slate-300 text-left relative my-2 transition-all duration-200`}
            >
              <style>{`
                .pdf-document-sheet {
                  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                  font-size: 9.5pt;
                  line-height: 1.6;
                  color: #0f172a;
                }
                .pdf-document-sheet .kop {
                  text-align: center;
                  border-bottom: 4px double #020617;
                  padding-bottom: 10px;
                  margin-bottom: 16px;
                }
                .pdf-document-sheet .kop h3 {
                  margin: 0;
                  font-size: 10.5pt;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.8px;
                  color: #1e293b;
                }
                .pdf-document-sheet .kop h1 {
                  margin: 4px 0 2px 0;
                  font-size: 16pt;
                  font-weight: 900;
                  text-transform: uppercase;
                  color: #020617;
                  letter-spacing: 0.5px;
                }
                .pdf-document-sheet .kop p {
                  margin: 2px 0;
                  font-size: 8.5pt;
                  color: #475569;
                }
                .pdf-document-sheet .title-box {
                  text-align: center;
                  margin: 16px 0 18px 0;
                }
                .pdf-document-sheet .title {
                  font-size: 13pt;
                  font-weight: 900;
                  color: #020617;
                  margin: 0;
                  text-transform: uppercase;
                  text-decoration: underline;
                  letter-spacing: 0.5px;
                }
                .pdf-document-sheet .fase-badge {
                  display: inline-block;
                  margin-top: 6px;
                  padding: 3px 12px;
                  background-color: #eef2ff;
                  color: #312e81;
                  border: 1px solid #c7d2fe;
                  border-radius: 9999px;
                  font-size: 8pt;
                  font-weight: 700;
                  letter-spacing: 0.3px;
                }
                .pdf-document-sheet .meta-table {
                  width: 100%;
                  border-collapse: separate;
                  border-spacing: 0;
                  font-size: 8.5pt;
                  margin-bottom: 20px;
                  background-color: #f8fafc;
                  border: 1px solid #e2e8f0;
                  border-radius: 8px;
                  overflow: hidden;
                }
                .pdf-document-sheet .meta-table td {
                  padding: 7px 12px;
                  border: none;
                  color: #1e293b;
                  vertical-align: middle;
                  border-bottom: 1px solid #f1f5f9;
                }
                .pdf-document-sheet .meta-table tr:last-child td {
                  border-bottom: none;
                }
                .pdf-document-sheet .content {
                  font-size: 9.5pt;
                  line-height: 1.65;
                  color: #0f172a;
                }
                .pdf-document-sheet .content p {
                  margin: 8px 0;
                  text-align: justify;
                }
                .pdf-document-sheet table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 14px 0;
                  font-size: 8.5pt;
                  border: 1px solid #334155;
                }
                .pdf-document-sheet tr {
                  page-break-inside: avoid;
                }
                .pdf-document-sheet th, .pdf-document-sheet td {
                  border: 1px solid #cbd5e1;
                  padding: 6px 8px;
                  vertical-align: top;
                }
                .pdf-document-sheet th {
                  background-color: #1e3a8a;
                  color: #ffffff;
                  font-weight: bold;
                  text-align: center;
                  border: 1px solid #1e3a8a;
                }
                .pdf-document-sheet .katex {
                  font-size: 1.05em;
                }
                .pdf-document-sheet .katex-block {
                  margin: 12px 0;
                  padding: 8px;
                  background: #f8fafc;
                  border-radius: 6px;
                  border: 1px solid #cbd5e1;
                }
                .pdf-document-sheet .ttd-box {
                  margin-top: 36px;
                  padding-top: 16px;
                  border-top: 1px solid #e2e8f0;
                  display: flex;
                  justify-content: space-between;
                  page-break-inside: avoid;
                  break-inside: avoid;
                }
                .pdf-document-sheet .ttd-col {
                  text-align: center;
                  width: 45%;
                  font-size: 9pt;
                  color: #0f172a;
                  line-height: 1.4;
                }
                .pdf-document-sheet .ttd-col p {
                  margin: 2px 0;
                }
                .pdf-document-sheet .ttd-space {
                  height: 60px;
                }
              `}</style>

              {/* Official Kop Surat */}
              <div className="kop">
                <h3>PEMERINTAH DAERAH PROVINSI / KABUPATEN</h3>
                <h3>DINAS PENDIDIKAN DAN KEBUDAYAAN</h3>
                <h1>{schoolProfile.schoolName}</h1>
                <p>NPSN: {schoolProfile.npsn} | Alamat: {schoolProfile.address} | Email: {schoolProfile.email || 'info@sekolah.sch.id'}</p>
              </div>

              {/* Document Title */}
              <div className="title-box">
                <div className="title">{title}</div>
                <div className="fase-badge">Kurikulum Deep Learning & Merdeka Belajar (Fase {phase})</div>
              </div>

              {/* Metadata Identitas Table */}
              <table className="meta-table">
                <tbody>
                  <tr>
                    <td style={{ width: '20%' }}><strong>Satuan Pendidikan:</strong></td>
                    <td style={{ width: '30%', fontWeight: 'bold', color: '#0f172a' }}>{schoolProfile.schoolName}</td>
                    <td style={{ width: '20%' }}><strong>Tahun Pelajaran:</strong></td>
                    <td style={{ width: '30%', fontWeight: 'bold', color: '#0f172a' }}>{schoolProfile.academicYear}</td>
                  </tr>
                  <tr>
                    <td><strong>Mata Pelajaran:</strong></td>
                    <td style={{ fontWeight: 'bold', color: '#1e3a8a' }}>{subject}</td>
                    <td><strong>Semester:</strong></td>
                    <td style={{ fontWeight: 'bold' }}>{semester}</td>
                  </tr>
                  <tr>
                    <td><strong>Fase / Jenjang:</strong></td>
                    <td style={{ fontWeight: 'bold' }}>{level} - Kelas {grade}</td>
                    <td><strong>Guru Pengampu:</strong></td>
                    <td style={{ fontWeight: 'bold', color: '#0f172a' }}>{effectiveTeacher}</td>
                  </tr>
                </tbody>
              </table>

              {/* Rendered HTML Document Content */}
              <div
                className="content"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />

              {/* Official Signature Lembar Pengesahan */}
              <div className="ttd-box">
                <div className="ttd-col">
                  <p>Mengetahui,</p>
                  <p><strong>Kepala {schoolProfile.schoolName}</strong></p>
                  <div className="ttd-space"></div>
                  <p><strong><u>{schoolProfile.headmasterName}</u></strong></p>
                  <p>NIP. {schoolProfile.headmasterNip}</p>
                </div>

                <div className="ttd-col">
                  <p>
                    {schoolProfile.city}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p><strong>Guru Mata Pelajaran</strong></p>
                  <div className="ttd-space"></div>
                  <p><strong><u>{effectiveTeacher}</u></strong></p>
                  <p>NIP. {schoolProfile.teacherNip}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Raw Markdown View */
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
            {rawMarkdown}
          </div>
        )}
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex flex-col p-2 sm:p-4">
        <div className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
          {contentComponent}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
      {contentComponent}
    </div>
  );
};

