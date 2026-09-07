import React, { useState } from 'react';
import {
  MessageSquareHeart,
  Send,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  User,
} from 'lucide-react';
import { UserAccount } from '../types';
import { StorageService } from '../lib/storage';

interface UserFeedback {
  id: string;
  senderName: string;
  senderEmail: string;
  school: string;
  category: 'Fitur Baru' | 'Kurikulum Deep Learning' | 'Format Cetak Laporan' | 'Asisten AI' | 'Lainnya';
  message: string;
  createdAt: string;
  likes: number;
}

interface SaranViewProps {
  currentUser: UserAccount;
}

export const SaranView: React.FC<SaranViewProps> = ({ currentUser }) => {
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([
    {
      id: 'fb-1',
      senderName: 'Aspian Madimu, S.Pd., M.Pd.',
      senderEmail: 'aspianmadimu22@guru.sma.belajar.id',
      school: 'SMA Negeri 1',
      category: 'Kurikulum Deep Learning',
      message: 'Perangkat ajar AI sangat membantu penyusunan modul mindful dan meaningful. Mohon pertahankan format cetak Word & PDF yang rapi dengan kop dinas.',
      createdAt: '2025-08-20 14:30',
      likes: 12,
    },
    {
      id: 'fb-2',
      senderName: 'Yuliana Sari, S.Pd.',
      senderEmail: 'yuliana.sari@guru.sma.belajar.id',
      school: 'SMA Negeri 2',
      category: 'Format Cetak Laporan',
      message: 'Opsi ekspor 3 format (Excel, Word, PDF) sangat fleksibel untuk pelaporan ke pengawas sekolah dan kepala dinas.',
      createdAt: '2025-08-21 09:15',
      likes: 8,
    },
  ]);

  const [category, setCategory] = useState<UserFeedback['category']>('Kurikulum Deep Learning');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newFb: UserFeedback = {
      id: `fb-${Date.now()}`,
      senderName: currentUser.name,
      senderEmail: currentUser.email,
      school: currentUser.school || 'Sekolah',
      category,
      message: message.trim(),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      likes: 0,
    };

    setFeedbacks([newFb, ...feedbacks]);

    // Add log
    StorageService.addAccessLog({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Pengiriman Saran & Masukan',
      details: `Kategori: ${category} - "${message.substring(0, 40)}..."`,
      status: 'info',
    });

    // Send Real-time notification to admin
    StorageService.addNotification({
      title: 'Masukan & Saran Baru',
      message: `${currentUser.name} (${currentUser.school || 'Guru'}) mengirim masukan kategori ${category}.`,
      type: 'user_login',
    });

    setMessage('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleLike = (id: string) => {
    setFeedbacks(
      feedbacks.map((f) => (f.id === id ? { ...f, likes: f.likes + 1 } : f))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <MessageSquareHeart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Kotak Saran & Masukan Guru Kreatif</h1>
            <p className="text-xs text-slate-400">
              Sampaikan ide pengembangan aplikasi, request fitur kurikulum, atau masukan pengalaman penggunaan.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Left */}
        <div className="lg:col-span-5 bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
          <h3 className="font-bold text-white flex items-center">
            <Send className="w-4 h-4 mr-1.5 text-rose-400" />
            Tuliskan Saran & Aspirasi Anda:
          </h3>

          {submitted && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Terima kasih! Saran Anda telah diteruskan langsung ke Administrator.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Kategori Masukan</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="Kurikulum Deep Learning">Kurikulum Deep Learning</option>
                <option value="Format Cetak Laporan">Format Cetak Laporan (Excel/Word/PDF)</option>
                <option value="Asisten AI">Asisten AI Generator</option>
                <option value="Fitur Baru">Usulan Fitur Baru</option>
                <option value="Lainnya">Lain-lain</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Pesan / Saran Masukan</label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tuliskan aspirasi Anda untuk memajukan pendidikan kreatif..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition flex items-center justify-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirimkan Saran</span>
            </button>
          </form>
        </div>

        {/* Feedback List Right */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-white flex items-center">
              <MessageSquare className="w-4 h-4 mr-1 text-indigo-400" />
              Aspirasi Komunitas Guru ({feedbacks.length})
            </span>
          </div>

          <div className="space-y-3">
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/40 text-indigo-300 font-bold flex items-center justify-center text-xs">
                      {fb.senderName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{fb.senderName}</div>
                      <div className="text-[10px] text-slate-400">{fb.school} • {fb.createdAt}</div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-indigo-300 border border-slate-700">
                    {fb.category}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  "{fb.message}"
                </p>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleLike(fb.id)}
                    className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-rose-400 transition"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Dukung ({fb.likes})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
