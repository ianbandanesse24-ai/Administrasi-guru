import React, { useState, useEffect, useRef } from 'react';
import { School, X, Save, CheckCircle2, CloudCheck } from 'lucide-react';
import { SchoolProfile, StorageService } from '../lib/storage';

interface SchoolProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const SchoolProfileModal: React.FC<SchoolProfileModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [profile, setProfile] = useState<SchoolProfile>(() => StorageService.getSchoolProfile());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [autoSavedTime, setAutoSavedTime] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  // Auto-save on change with 600ms debounce
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      StorageService.saveSchoolProfile(profile);
      const now = new Date();
      setAutoSavedTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`);
      onSaved();
    }, 600);

    return () => clearTimeout(timer);
  }, [profile]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSchoolProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onSaved();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <School className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Profil Satuan Pendidikan & Kop Dokumen</h3>
          </div>
          <div className="flex items-center space-x-2">
            {autoSavedTime && (
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Auto-save ({autoSavedTime})</span>
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          {savedSuccess && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Profil sekolah & kop dokumen berhasil disimpan otomatis ke seluruh modul!</span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nama Satuan Pendidikan (Sekolah)</label>
            <input
              type="text"
              required
              value={profile.schoolName}
              onChange={(e) => setProfile({ ...profile, schoolName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">NPSN</label>
              <input
                type="text"
                value={profile.npsn}
                onChange={(e) => setProfile({ ...profile, npsn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kota / Kabupaten</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Alamat Lengkap Sekolah</label>
            <input
              type="text"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tahun Ajaran</label>
              <input
                type="text"
                value={profile.academicYear}
                onChange={(e) => setProfile({ ...profile, academicYear: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Semester Aktif</label>
              <select
                value={profile.semester}
                onChange={(e) => setProfile({ ...profile, semester: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-3">
            <p className="text-[11px] font-bold text-indigo-300">Bidang Studi & Pengajaran (Acuan Kurikulum):</p>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mata Pelajaran / Bidang Studi</label>
                <input
                  type="text"
                  value={profile.subject || 'Fisika'}
                  onChange={(e) => setProfile({ ...profile, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-bold"
                  placeholder="Contoh: Fisika, Matematika..."
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Jenjang Pendidikan</label>
                <select
                  value={profile.level || 'SMA'}
                  onChange={(e) => {
                    const newLvl = e.target.value as any;
                    const defaultGrade = newLvl === 'SD' ? 4 : newLvl === 'SMP' ? 7 : 10;
                    const defaultPhase = newLvl === 'SD' ? 'Fase B' : newLvl === 'SMP' ? 'Fase D' : 'Fase E';
                    setProfile({ ...profile, level: newLvl, grade: defaultGrade, phase: defaultPhase });
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="SD">SD (Sekolah Dasar)</option>
                  <option value="SMP">SMP (Menengah Pertama)</option>
                  <option value="SMA">SMA (Menengah Atas)</option>
                  <option value="SMK">SMK (Kejuruan)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kelas Pengampu</label>
                <select
                  value={profile.grade || 10}
                  onChange={(e) => {
                    const g = Number(e.target.value);
                    const lvl = profile.level || 'SMA';
                    let ph = 'Fase E';
                    if (lvl === 'SD') ph = g <= 2 ? 'Fase A' : g <= 4 ? 'Fase B' : 'Fase C';
                    else if (lvl === 'SMP') ph = 'Fase D';
                    else ph = g === 10 ? 'Fase E' : 'Fase F';
                    setProfile({ ...profile, grade: g, phase: ph });
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-bold"
                >
                  {(profile.level === 'SD'
                    ? [1, 2, 3, 4, 5, 6]
                    : profile.level === 'SMP'
                    ? [7, 8, 9]
                    : [10, 11, 12]
                  ).map((g) => (
                    <option key={g} value={g}>
                      Kelas {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Fase Kurikulum</label>
                <input
                  type="text"
                  value={profile.phase || 'Fase E'}
                  onChange={(e) => setProfile({ ...profile, phase: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-indigo-300 focus:outline-none focus:border-indigo-500 font-bold"
                  placeholder="Contoh: Fase E, Fase F..."
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-3">
            <p className="text-[11px] font-bold text-indigo-300">Pejabat & Penandatangan Dokumen:</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Kepala Sekolah</label>
                <input
                  type="text"
                  value={profile.headmasterName}
                  onChange={(e) => setProfile({ ...profile, headmasterName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">NIP Kepala Sekolah</label>
                <input
                  type="text"
                  value={profile.headmasterNip}
                  onChange={(e) => setProfile({ ...profile, headmasterNip: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Guru Pengampu</label>
                <input
                  type="text"
                  value={profile.teacherName}
                  onChange={(e) => setProfile({ ...profile, teacherName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">NIP Guru</label>
                <input
                  type="text"
                  value={profile.teacherNip}
                  onChange={(e) => setProfile({ ...profile, teacherNip: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Profil</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
