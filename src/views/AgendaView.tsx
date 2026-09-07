import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  FileSpreadsheet,
  FileText,
  Printer,
  CheckCircle2,
  Clock,
  Save,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { AgendaItem, ClassRoom, CPDistributionPlan } from '../types';
import { StorageService } from '../lib/storage';
import { ExportService } from '../lib/exportUtils';
import { SUBJECT_LIST } from '../lib/curriculumData';
import { OfflineAdminNotice } from '../components/OfflineSyncIndicator';

export const AgendaView: React.FC = () => {
  const [agendas, setAgendas] = useState<AgendaItem[]>(() => StorageService.getAgenda());
  const [classes, setClasses] = useState<ClassRoom[]>(() => StorageService.getClasses());
  const [cpPlans, setCpPlans] = useState<CPDistributionPlan[]>(() => StorageService.getCPDistributions());
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null);

  // Form states
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [time, setTime] = useState('07:30 - 08:50');
  const [className, setClassName] = useState(classes[0]?.name || 'X SMA 1 (Fase E)');
  const [subject, setSubject] = useState('Bahasa Indonesia');
  const [meetingNumber, setMeetingNumber] = useState(1);
  const [topic, setTopic] = useState('');
  const [activities, setActivities] = useState('');
  const [studentAttendanceSummary, setStudentAttendanceSummary] = useState('Hadir 12, Sakit 0, Izin 0, Alpa 0 (100%)');
  const [reflection, setReflection] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [status, setStatus] = useState<AgendaItem['status']>('Selesai');

  useEffect(() => {
    setClasses(StorageService.getClasses());
    setCpPlans(StorageService.getCPDistributions());
  }, [showModal]);

  // Extract all available TPs from master CP plans
  const availableTPs = cpPlans.flatMap((plan) => [
    ...plan.materialsSem1.map((m) => ({
      subject: plan.subject,
      tpCode: m.tpCode,
      tpName: m.tpName,
      essentialMaterial: m.essentialMaterial,
      deepLearning: m.deepLearningMethod,
    })),
    ...plan.materialsSem2.map((m) => ({
      subject: plan.subject,
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
      setTopic(`${found.tpCode}: ${found.essentialMaterial}`);
      if (found.subject && !subject) {
        setSubject(found.subject);
      }
      if (!activities) {
        setActivities(`Pembelajaran berbasis ${found.deepLearning || 'Deep Learning'}. Pendahuluan: apersepsi & pertanyaan pemantik. Inti: eksplorasi materi ${found.essentialMaterial} dan diskusi kolaboratif. Penutup: simpulan & refleksi.`);
      }
      if (!reflection) {
        setReflection(`Peserta didik mampu memahami esensi materi ${found.essentialMaterial} dengan antusias.`);
      }
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setDate(new Date().toISOString().substring(0, 10));
    setTime('07:30 - 08:50');
    setClassName('X SMA 1 (Fase E)');
    setSubject('Bahasa Indonesia');
    setMeetingNumber(agendas.length + 1);
    setTopic('');
    setActivities('');
    setStudentAttendanceSummary('Hadir 12, Sakit 0, Izin 0, Alpa 0 (100%)');
    setReflection('');
    setFollowUp('');
    setStatus('Selesai');
    setShowModal(true);
  };

  const handleOpenEdit = (item: AgendaItem) => {
    setEditingItem(item);
    setDate(item.date);
    setTime(item.time);
    setClassName(item.className);
    setSubject(item.subject);
    setMeetingNumber(item.meetingNumber);
    setTopic(item.topic);
    setActivities(item.activities);
    setStudentAttendanceSummary(item.studentAttendanceSummary);
    setReflection(item.reflection);
    setFollowUp(item.followUp);
    setStatus(item.status);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: AgendaItem[];
    if (editingItem) {
      updated = agendas.map((a) =>
        a.id === editingItem.id
          ? {
              ...a,
              date,
              time,
              className,
              subject,
              meetingNumber,
              topic,
              activities,
              studentAttendanceSummary,
              reflection,
              followUp,
              status,
            }
          : a
      );
    } else {
      const newItem: AgendaItem = {
        id: `ag-${Date.now()}`,
        date,
        time,
        className,
        subject,
        meetingNumber,
        topic,
        activities,
        studentAttendanceSummary,
        reflection,
        followUp,
        status,
      };
      updated = [newItem, ...agendas];
    }

    setAgendas(updated);
    StorageService.saveAgenda(updated);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus catatan agenda ini?')) {
      const updated = agendas.filter((a) => a.id !== id);
      setAgendas(updated);
      StorageService.saveAgenda(updated);
    }
  };

  // Exports
  const handleExportExcel = () => {
    const exportData = agendas.map((a, idx) => ({
      No: idx + 1,
      Tanggal: a.date,
      Waktu: a.time,
      Kelas: a.className,
      'Mata Pelajaran': a.subject,
      'Pertemuan Ke': a.meetingNumber,
      'Materi Pokok / Topik': a.topic,
      'Kegiatan Pembelajaran': a.activities,
      'Rekap Kehadiran': a.studentAttendanceSummary,
      'Refleksi Guru': a.reflection,
      'Tindak Lanjut': a.followUp,
      Status: a.status,
    }));
    ExportService.exportToExcel(exportData, 'Buku_Agenda_Mengajar_Guru');
  };

  const handleExportWord = () => {
    const schoolProfile = StorageService.getSchoolProfile();
    let rows = '';
    agendas.forEach((a, idx) => {
      rows += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td style="text-align:center;">${a.date}<br><small>${a.time}</small></td>
          <td><strong>${a.className}</strong><br><small>${a.subject} (Ke-${a.meetingNumber})</small></td>
          <td><strong>${a.topic}</strong><br>${a.activities}</td>
          <td><small>${a.studentAttendanceSummary}</small></td>
          <td><em>${a.reflection}</em><br><strong>TL:</strong> ${a.followUp}</td>
          <td style="text-align:center;"><strong>${a.status}</strong></td>
        </tr>
      `;
    });

    const bodyHtml = `
      <table>
        <thead>
          <tr>
            <th style="width:35px;">No</th>
            <th style="width:90px;">Tanggal/Jam</th>
            <th style="width:120px;">Kelas & Mapel</th>
            <th>Materi & Kegiatan Pembelajaran</th>
            <th style="width:110px;">Presensi</th>
            <th>Refleksi & Tindak Lanjut</th>
            <th style="width:70px;">Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    ExportService.exportToWord('BUKU AGENDA HARIAN MENGAJAR GURU', bodyHtml, schoolProfile, 'Agenda_Mengajar_Guru');
  };

  const handlePrintPdf = () => {
    const schoolProfile = StorageService.getSchoolProfile();
    let rows = '';
    agendas.forEach((a, idx) => {
      rows += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td style="text-align:center;">${a.date}<br><small>${a.time}</small></td>
          <td><strong>${a.className}</strong><br><small>${a.subject} (P-${a.meetingNumber})</small></td>
          <td><strong>${a.topic}</strong><br>${a.activities}</td>
          <td><small>${a.studentAttendanceSummary}</small></td>
          <td><em>${a.reflection}</em></td>
          <td style="text-align:center;">${a.status}</td>
        </tr>
      `;
    });

    const bodyHtml = `
      <table>
        <thead>
          <tr>
            <th style="width:30px;">No</th>
            <th style="width:85px;">Tanggal</th>
            <th style="width:110px;">Kelas/Mapel</th>
            <th>Materi & Aktivitas</th>
            <th style="width:100px;">Presensi</th>
            <th>Refleksi Guru</th>
            <th style="width:60px;">Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    ExportService.printPdfPreview('AGENDA MENGAJAR GURU', bodyHtml, schoolProfile);
  };

  return (
    <div className="space-y-6">
      {/* Offline Storage & Cloud Sync Notice */}
      <OfflineAdminNotice menuTitle="Agenda Mengajar Guru" />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">3. Agenda Mengajar Guru</h1>
            <p className="text-xs text-slate-400">
              Dokumentasi aktivitas pembelajaran harian, materi pokok, refleksi kelas, dan catatan tindak lanjut.
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
            id="btn-add-agenda"
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Agenda Baru</span>
          </button>
        </div>
      </div>

      {/* Agenda Items List */}
      <div className="space-y-4">
        {agendas.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-500 text-xs">
            Belum ada catatan agenda mengajar. Klik "Catat Agenda Baru" untuk menambahkan.
          </div>
        ) : (
          agendas.map((a) => (
            <div
              key={a.id}
              className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Pertemuan ke-{a.meetingNumber}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-300">
                    {a.className} • {a.subject}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      a.status === 'Selesai'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{a.date} ({a.time})</span>
                  <div className="flex space-x-1 pl-2">
                    <button
                      onClick={() => handleOpenEdit(a)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">{a.topic}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{a.activities}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
                    <MessageSquare className="w-3 h-3 mr-1 text-indigo-400" /> Refleksi Guru:
                  </span>
                  <p className="text-slate-300 italic">{a.reflection || 'Tidak ada catatan refleksi.'}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" /> Tindak Lanjut:
                  </span>
                  <p className="text-slate-300">{a.followUp || 'Tidak ada catatan tindak lanjut.'}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Add/Edit Agenda */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-white">
              {editingItem ? 'Edit Agenda Mengajar' : 'Catat Agenda Mengajar Baru'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Jam Mengajar</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="07:30 - 08:50"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Pilih Kelas / Rombel</label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
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
                  <label className="block text-slate-400 font-semibold mb-1">Pertemuan Ke-</label>
                  <input
                    type="number"
                    min="0"
                    value={meetingNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMeetingNumber(val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0));
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
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

              {availableTPs.length > 0 && (
                <div className="bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-500/30 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-indigo-300 font-bold text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Pilih Cepat Topik / TP dari Master CP:</span>
                  </div>
                  <select
                    defaultValue=""
                    onChange={handleSelectQuickTP}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-indigo-500/40 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-400"
                  >
                    <option value="">-- Pilih Topik dari Bank Materi CP --</option>
                    {availableTPs.map((tp, idx) => (
                      <option key={`${tp.tpCode}-${idx}`} value={tp.tpCode}>
                        [{tp.tpCode}] {tp.subject} - {tp.essentialMaterial}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Topik / Materi Pokok</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Analisis Teks Laporan Hasil Observasi"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Kegiatan Pembelajaran yang Dilaksanakan</label>
                <textarea
                  rows={3}
                  required
                  value={activities}
                  onChange={(e) => setActivities(e.target.value)}
                  placeholder="Uraikan aktivitas pendahuluan, inti, dan penutup..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Refleksi Pembelajaran</label>
                  <textarea
                    rows={2}
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Catatan respon siswa & kendala..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tindak Lanjut</label>
                  <textarea
                    rows={2}
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    placeholder="Tugas mandiri / pengayaan..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Agenda</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
