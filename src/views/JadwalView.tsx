import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Clock,
  MapPin,
  FileSpreadsheet,
  FileText,
  Printer,
  Save,
  BookOpen,
} from 'lucide-react';
import { ScheduleItem, ClassRoom } from '../types';
import { StorageService } from '../lib/storage';
import { ExportService } from '../lib/exportUtils';
import { SUBJECT_LIST } from '../lib/curriculumData';
import { OfflineAdminNotice } from '../components/OfflineSyncIndicator';

export const JadwalView: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => StorageService.getSchedule());
  const [classes, setClasses] = useState<ClassRoom[]>(() => StorageService.getClasses());
  const [selectedDay, setSelectedDay] = useState<string>('Semua');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  // Form states
  const [day, setDay] = useState<ScheduleItem['day']>('Senin');
  const [period, setPeriod] = useState('1 - 2');
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('08:50');
  const [className, setClassName] = useState(classes[0]?.name || 'X SMA 1 (Fase E)');
  const [subject, setSubject] = useState('Bahasa Indonesia');
  const [room, setRoom] = useState('R. 101');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setClasses(StorageService.getClasses());
  }, [showModal]);

  const days: ScheduleItem['day'][] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const handleOpenAdd = () => {
    setEditingItem(null);
    setDay('Senin');
    setPeriod('1 - 2');
    setStartTime('07:30');
    setEndTime('08:50');
    setClassName('X SMA 1 (Fase E)');
    setSubject('Bahasa Indonesia');
    setRoom('R. 101');
    setNotes('');
    setShowModal(true);
  };

  const handleOpenEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setDay(item.day);
    setPeriod(item.period);
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setClassName(item.className);
    setSubject(item.subject);
    setRoom(item.room);
    setNotes(item.notes || '');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: ScheduleItem[];
    if (editingItem) {
      updated = schedules.map((s) =>
        s.id === editingItem.id
          ? {
              ...s,
              day,
              period,
              startTime,
              endTime,
              className,
              subject,
              room,
              notes,
            }
          : s
      );
    } else {
      const newItem: ScheduleItem = {
        id: `sch-${Date.now()}`,
        day,
        period,
        startTime,
        endTime,
        className,
        subject,
        room,
        notes,
      };
      updated = [...schedules, newItem];
    }

    setSchedules(updated);
    StorageService.saveSchedule(updated);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus jadwal mengajar ini?')) {
      const updated = schedules.filter((s) => s.id !== id);
      setSchedules(updated);
      StorageService.saveSchedule(updated);
    }
  };

  const filteredSchedules =
    selectedDay === 'Semua' ? schedules : schedules.filter((s) => s.day === selectedDay);

  // Exports
  const handleExportExcel = () => {
    const exportData = schedules.map((s, idx) => ({
      No: idx + 1,
      Hari: s.day,
      'Jam Ke': s.period,
      Waktu: `${s.startTime} - ${s.endTime}`,
      'Kelas / Fase': s.className,
      'Mata Pelajaran': s.subject,
      Ruangan: s.room,
      Keterangan: s.notes || '-',
    }));
    ExportService.exportToExcel(exportData, 'Jadwal_Mengajar_Guru');
  };

  const handleExportWord = () => {
    const schoolProfile = StorageService.getSchoolProfile();
    let rows = '';
    schedules.forEach((s, idx) => {
      rows += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td><strong>${s.day}</strong></td>
          <td style="text-align:center;">${s.period}</td>
          <td style="text-align:center;">${s.startTime} - ${s.endTime}</td>
          <td><strong>${s.className}</strong></td>
          <td>${s.subject}</td>
          <td>${s.room}</td>
          <td>${s.notes || '-'}</td>
        </tr>
      `;
    });

    const bodyHtml = `
      <table>
        <thead>
          <tr>
            <th style="width:35px;">No</th>
            <th>Hari</th>
            <th>Jam Ke</th>
            <th>Waktu</th>
            <th>Kelas</th>
            <th>Mata Pelajaran</th>
            <th>Ruangan</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    ExportService.exportToWord('JADWAL MENGAJAR GURU', bodyHtml, schoolProfile, 'Jadwal_Mengajar');
  };

  const handlePrintPdf = () => {
    const schoolProfile = StorageService.getSchoolProfile();
    let rows = '';
    schedules.forEach((s, idx) => {
      rows += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td><strong>${s.day}</strong></td>
          <td style="text-align:center;">${s.period}</td>
          <td style="text-align:center;">${s.startTime} - ${s.endTime}</td>
          <td><strong>${s.className}</strong></td>
          <td>${s.subject}</td>
          <td>${s.room}</td>
          <td>${s.notes || '-'}</td>
        </tr>
      `;
    });

    const bodyHtml = `
      <table>
        <thead>
          <tr>
            <th style="width:35px;">No</th>
            <th>Hari</th>
            <th>Jam Ke</th>
            <th>Waktu</th>
            <th>Kelas</th>
            <th>Mata Pelajaran</th>
            <th>Ruangan</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    ExportService.printPdfPreview('JADWAL MENGAJAR MINGGUAN', bodyHtml, schoolProfile);
  };

  return (
    <div className="space-y-6">
      {/* Offline Storage & Cloud Sync Notice */}
      <OfflineAdminNotice menuTitle="Jadwal Mengajar Guru" />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">2. Jadwal Mengajar Guru</h1>
            <p className="text-xs text-slate-400">
              Penataan jam pelajaran mingguan, alokasi kelas, ruangan, dan pembagian beban mengajar tatap muka.
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
            id="btn-add-schedule"
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {/* Day Filter Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
        {['Semua', ...days].map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-4 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              selectedDay === d
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Schedule Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSchedules.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-500 text-xs">
            Belum ada jadwal mengajar yang terdaftar pada hari ini.
          </div>
        ) : (
          filteredSchedules.map((s) => (
            <div
              key={s.id}
              className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-3 relative group shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {s.day} • Jam {s.period}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-2">{s.subject}</h3>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center text-slate-400">
                  <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                  <span>{s.startTime} - {s.endTime} WITA</span>
                </div>
                <div className="flex items-center text-slate-300 font-semibold">
                  <BookOpen className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                  <span>Kelas: {s.className}</span>
                </div>
                <div className="flex items-center text-slate-400">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  <span>Ruangan: {s.room}</span>
                </div>
              </div>

              {s.notes && (
                <p className="text-[11px] text-slate-400 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                  "{s.notes}"
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">
              {editingItem ? 'Edit Jadwal Mengajar' : 'Tambah Jadwal Mengajar Baru'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Hari</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Jam Ke-</label>
                  <input
                    type="text"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    placeholder="1 - 2"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Waktu Mulai</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Waktu Selesai</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

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

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Ruangan / Tempat</label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="R. 101 / Lab Komputer"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Materi pokok atau catatan..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
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
                  <span>Simpan Jadwal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
