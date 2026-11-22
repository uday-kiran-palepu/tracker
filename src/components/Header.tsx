import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, Building2, ShieldCheck, UserCircle, LogIn, ChevronDown, Database, RefreshCw, Home } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User;
  onOpenLogin: () => void;
  onLogout: () => void;
  setMobileOpen: (open: boolean) => void;
  orgName: string;
  setOrgName: (org: string) => void;
  isConnected?: boolean;
  isSyncing?: boolean;
  appName?: string;
  onReturnHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenLogin,
  onLogout,
  setMobileOpen,
  orgName,
  setOrgName,
  isConnected = false,
  isSyncing = false,
  appName = 'Uni Tracker',
  onReturnHome
}) => {
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const isCoordinator = currentUser.role === 'Project Coordinator';
  const orgs = ['NxtWave (Flagship)', 'NxtWave Academy East', 'NxtWave Skilling South'];

  // Click outside to close dropdowns & Escape key listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowOrgDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowOrgDropdown(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      {/* Left side: Hamburger + Greeting */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Open Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {isCoordinator ? `Hello, ${currentUser.name} 👋` : `${appName} Overview`}
            </h2>

            {/* Live / Offline Status Pill */}
            {isConnected ? (
              <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live</span>
              </span>
            ) : (
              <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>Offline</span>
              </span>
            )}

            {isSyncing && (
              <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-1 text-[10px] text-blue-600 font-semibold">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Syncing...</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {isCoordinator
              ? 'Project Coordinator Mode — Full CRUD permissions & live database sync enabled.'
              : 'Public View-Only Mode — Switch to Coordinator login to edit.'}
          </p>
        </div>
      </div>

      {/* Right side: Org Filter + Home Button + Notifications + Login/User profile */}
      <div className="flex items-center gap-3">
        {/* Return to Homepage Button */}
        {onReturnHome && (
          <button
            onClick={onReturnHome}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all"
            title="Return to Landing Homepage"
          >
            <Home className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Home</span>
          </button>
        )}

        {/* Organization Switcher Dropdown */}
        <div ref={dropdownRef} className="relative hidden md:block">
          <button
            onClick={() => setShowOrgDropdown(!showOrgDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all"
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>{orgName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showOrgDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              {orgs.map((o) => (
                <button
                  key={o}
                  onClick={() => {
                    setOrgName(o);
                    setShowOrgDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors ${orgName === o ? 'text-blue-600 bg-blue-50/50 font-semibold' : 'text-slate-700'
                    }`}
                >
                  {o}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon with Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 relative transition-all"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Live Site Alerts</h4>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">2 New</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto mt-2">
                <div className="py-2.5">
                  <p className="text-xs font-bold text-slate-800">New Daily Report Submitted</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Day 3 report & photos synced for Hyderabad campus.</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">15 minutes ago</span>
                </div>
                <div className="py-2.5">
                  <p className="text-xs font-bold text-slate-800">Regulatory Approval Updated</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Fire Safety NOC marked Approved by authority.</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">1 hour ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Auth profile avatar / Coordinator sign in button */}
        <div className="flex items-center pl-2 border-l border-slate-200">
          {isCoordinator ? (
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-xl object-cover border-2 border-blue-500/20 shadow-sm"
              />
              <button
                onClick={onLogout}
                className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-semibold transition-all border border-slate-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Coordinator Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
