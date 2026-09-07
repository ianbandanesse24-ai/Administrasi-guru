import React, { useState } from 'react';
import {
  Bell,
  LogOut,
  Sparkles,
  Database,
  RefreshCw,
  School,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  ChevronDown,
} from 'lucide-react';
import { UserAccount, NotificationItem } from '../types';
import { StorageService, SchoolProfile } from '../lib/storage';

interface NavbarProps {
  currentUser: UserAccount;
  onLogout: () => void;
  notifications: NotificationItem[];
  onNotificationClick: (notif: NotificationItem) => void;
  onOpenSchoolProfile: () => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  notifications,
  onNotificationClick,
  onOpenSchoolProfile,
  onTriggerSync,
  isSyncing,
  setActiveView,
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const schoolProfile: SchoolProfile = StorageService.getSchoolProfile();

  const handleMarkAllRead = () => {
    StorageService.markNotificationsRead();
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Branding & School Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-teal-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-lg tracking-wider">
            AGK
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-white">
                ADMINISTRASI GURU KREATIF
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                <Sparkles className="w-3 h-3 mr-1 text-indigo-400" /> Deep Learning 2025
              </span>
            </div>
            <div className="flex items-center text-xs text-slate-400">
              <School className="w-3 h-3 mr-1 text-slate-400" />
              <span className="truncate max-w-[200px] sm:max-w-xs">{schoolProfile.schoolName}</span>
              <span className="mx-1.5">•</span>
              <span>TA {schoolProfile.academicYear} ({schoolProfile.semester})</span>
            </div>
          </div>
        </div>

        {/* Right: Actions & User Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Supabase Sync Button (Admin Only) */}
          {currentUser.role === 'admin' && (
            <button
              id="btn-sync-supabase"
              onClick={onTriggerSync}
              disabled={isSyncing}
              title="Sinkronisasi Data ke Supabase / Cloud (Admin)"
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
              <span>{isSyncing ? 'Sinkronisasi...' : 'Supabase Sync'}</span>
            </button>
          )}

          {/* School Profile Settings button */}
          <button
            id="btn-school-profile"
            onClick={onOpenSchoolProfile}
            title="Identitas Sekolah & Guru"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <School className="w-4 h-4" />
          </button>

          {/* Real-time Notifications Bell */}
          <div className="relative">
            <button
              id="btn-notifications-dropdown"
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Notifikasi & Log Real-time"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Box */}
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-bold text-white">Notifikasi Real-time</span>
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 rounded">
                      {unreadCount} Baru
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Tandai Dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-700/50">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Tidak ada notifikasi baru
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          onNotificationClick(n);
                          setShowNotifs(false);
                        }}
                        className={`p-3 text-xs hover:bg-slate-700/50 transition cursor-pointer ${
                          !n.isRead ? 'bg-indigo-950/30' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-1.5">
                            {n.type === 'access_request' ? (
                              <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            ) : n.type === 'user_login' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            )}
                            <span className="font-semibold text-slate-200">{n.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                        </div>
                        <p className="text-slate-300 mt-1 pl-5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>

                {currentUser.role === 'admin' && (
                  <div className="p-2 bg-slate-900 border-t border-slate-700 text-center">
                    <button
                      onClick={() => {
                        setActiveView('admin_logs');
                        setShowNotifs(false);
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Lihat Semua Log Audit Aktivitas →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile Badge & Dropdown */}
          <div className="relative">
            <button
              id="btn-user-profile-menu"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center font-bold text-xs text-white uppercase overflow-hidden">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden lg:block text-left pr-1">
                <div className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                  {currentUser.role === 'admin' ? 'Administrator' : 'Guru / Client'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in duration-150">
                <div className="p-3 bg-slate-900 border-b border-slate-700">
                  <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Status: {currentUser.status === 'approved' ? 'Terverifikasi' : 'Pending'}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                <div className="p-1 text-xs">
                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => {
                        setActiveView('admin_dashboard');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 text-slate-200 flex items-center space-x-2"
                    >
                      <UserCheck className="w-4 h-4 text-indigo-400" />
                      <span>Panel Admin & Otorisasi</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onOpenSchoolProfile();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 text-slate-200 flex items-center space-x-2"
                  >
                    <School className="w-4 h-4 text-blue-400" />
                    <span>Profil & Kop Surat Sekolah</span>
                  </button>
                </div>

                <div className="p-1 border-t border-slate-700/60">
                  <button
                    id="btn-logout-confirm"
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 flex items-center space-x-2 transition font-medium text-xs"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
