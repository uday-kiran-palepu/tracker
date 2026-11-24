import React, { useEffect } from 'react';
import {
  LayoutDashboard, FolderKanban, MapPin, Activity, BarChart3,
  FileCheck2, FolderOpen, Settings, LogOut, ShieldCheck, UserCircle, Menu, X, Home
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onOpenLogin: () => void;
  onLogout: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  appName?: string;
  onReturnHome?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenLogin,
  onLogout,
  mobileOpen,
  setMobileOpen,
  appName = 'Project Portal',
  onReturnHome
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'map', label: 'Map View', icon: MapPin },
    { id: 'execution', label: 'Execution', icon: Activity },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'approvals', label: 'Approvals & NOC', icon: FileCheck2 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const isCoordinator = currentUser.role === 'Project Coordinator';

  // Close mobile drawer on Escape key press
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, setMobileOpen]);

  const content = (
    <div className="flex flex-col h-full bg-[#0B1528] text-slate-300 w-64 select-none">
      {/* Brand Header (Clicking returns to landing homepage) */}
      <div
        onClick={onReturnHome}
        className="flex items-center gap-3 px-6 py-6 border-b border-slate-800 cursor-pointer hover:bg-slate-900/60 transition-colors group"
        title="Return to Landing Homepage"
      >
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
          U
        </div>
        <div className="min-w-0">
          <h1 className="text-white font-bold text-lg tracking-tight truncate group-hover:text-blue-400 transition-colors">
            {appName}
          </h1>
          <p className="text-[11px] text-blue-400 font-medium">NxtWave Campuses India</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {onReturnHome && (
          <button
            onClick={() => {
              onReturnHome();
              setMobileOpen(false);
            }}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all duration-200"
          >
            <Home className="w-5 h-5 text-blue-400" />
            <span>Landing Page</span>
          </button>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* User / Coordinator Profile Footer */}
      <div className="p-4 border-t border-slate-800 bg-[#070e1c]">
        {/* Mobile session banner */}
        <div className="mb-2.5">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
            Current Session
          </span>
          <p className="text-sm font-bold text-white mt-0.5">
            {isCoordinator ? `Hello, ${currentUser.name} 👋` : 'Guest Visitor'}
          </p>
        </div>

        <div className="flex items-center gap-3 mb-3 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {isCoordinator ? (
                <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" /> Project Coordinator
                </span>
              ) : (
                <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <UserCircle className="w-3 h-3" /> Viewer (Read-Only)
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
              {isCoordinator ? 'Full CRUD & Live DB Sync' : 'Public View-Only Access'}
            </p>
          </div>
        </div>

        {isCoordinator ? (
          <button
            onClick={() => {
              onLogout();
              setMobileOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 text-xs font-semibold border border-slate-700/60 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Coordinator</span>
          </button>
        ) : (
          <button
            onClick={() => {
              onOpenLogin();
              setMobileOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In as Coordinator</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0 border-r border-slate-800 h-screen sticky top-0 z-40">
        {content}
      </aside>

      {/* Mobile Sidebar Overlay with backdrop click-outside */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full relative animate-in slide-in-from-left duration-200 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-3.5 p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white cursor-pointer z-10"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            {content}
          </div>
        </div>
      )}
    </>
  );
};
