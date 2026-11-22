import React, { useState } from 'react';
import { 
  Settings, Link as LinkIcon, CheckCircle2, AlertCircle, RefreshCw, 
  Code, ShieldCheck, UserCircle, ExternalLink, Copy, Check, Database, 
  Sparkles, Lock, Trash2, Smartphone, Save, Eye 
} from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';
import { PasswordPromptModal } from './Modals';

interface SettingsViewProps {
  currentUser: User;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenAppsScriptModal: () => void;
  onSaveAndSync: (url: string) => Promise<boolean>;
  isSyncing: boolean;
  isConnected: boolean;
  lastSyncTime: string;
  appName: string;
  onUpdateAppName: (name: string) => void;
  onUpdateCurrentUser: (user: User) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenAppsScriptModal,
  onSaveAndSync,
  isSyncing,
  isConnected,
  lastSyncTime,
  appName,
  onUpdateAppName,
  onUpdateCurrentUser
}) => {
  const [urlInput, setUrlInput] = useState(api.getWebAppUrl());
  const [syncFeedback, setSyncFeedback] = useState<{ status: 'success' | 'error'; message: string } | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  // App Name state
  const [appNameInput, setAppNameInput] = useState(appName);
  const [appNameFeedback, setAppNameFeedback] = useState<string | null>(null);

  // Profile fields state
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileUsername, setProfileUsername] = useState(currentUser.username || 'coordinator');
  const [profileRole, setProfileRole] = useState<User['role']>(currentUser.role);
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);

  const isCoordinator = currentUser.role === 'Project Coordinator';

  const executeSync = async (targetUrl: string) => {
    setSyncFeedback(null);
    const trimmed = targetUrl.trim();
    if (!trimmed) {
      api.setWebAppUrl('');
      setSyncFeedback({
        status: 'error',
        message: 'Database Web App URL cleared. Running in Offline Local Demo Mode.'
      });
      return;
    }

    try {
      const ok = await onSaveAndSync(trimmed);
      if (ok) {
        setSyncFeedback({
          status: 'success',
          message: 'Successfully connected and live synced with Cloud Database!'
        });
      } else {
        setSyncFeedback({
          status: 'error',
          message: 'Failed to connect. Please verify the Web App is deployed with access set to "Anyone".'
        });
      }
    } catch (err: any) {
      setSyncFeedback({
        status: 'error',
        message: err.message || 'Connection failed'
      });
    }
  };

  const handleSyncClick = () => {
    const trimmed = urlInput.trim();
    // If URL is changed and user is logged in as Coordinator, ask for security confirmation
    if (trimmed !== api.getWebAppUrl() && isCoordinator) {
      setPendingUrl(trimmed);
      setPasswordModalOpen(true);
    } else {
      executeSync(trimmed);
    }
  };

  const handlePasswordVerified = () => {
    if (pendingUrl !== null) {
      executeSync(pendingUrl);
      setPendingUrl(null);
    }
  };

  const handleSaveAppName = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = appNameInput.trim() || 'Uni Tracker';
    setAppNameFeedback(null);
    await api.updateAppSettings({ appName: clean });
    onUpdateAppName(clean);
    setAppNameFeedback('Application branding updated successfully!');
    setTimeout(() => setAppNameFeedback(null), 3500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileFeedback(null);
    try {
      const updated = await api.updateUser({
        id: currentUser.id,
        currentUsername: currentUser.username,
        username: profileUsername.trim() || 'coordinator',
        name: profileName.trim() || 'Coordinator',
        role: profileRole
      });
      onUpdateCurrentUser(updated);
      setProfileFeedback('User profile saved and synced!');
      setTimeout(() => setProfileFeedback(null), 3500);
    } catch (err: any) {
      setProfileFeedback('Failed to update profile: ' + (err.message || 'Error'));
    }
  };

  const handleClearCacheAndResync = async () => {
    if (confirm('Clear local database cache and perform a clean re-sync from your connected Cloud Database?')) {
      api.clearCache();
      const currentUrl = api.getWebAppUrl();
      if (currentUrl) {
        await executeSync(currentUrl);
      } else {
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Settings & Cloud Database</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage live Cloud Database synchronization, app branding, and role permissions</p>
        </div>

        {/* Live Status Badge */}
        <div>
          {isConnected ? (
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm whitespace-nowrap shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live • Connected to Cloud Database</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm whitespace-nowrap shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Offline • Demo Mode (Local Storage)</span>
            </span>
          )}
        </div>
      </div>

      {/* Cloud Database Backend Configuration */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              <span>Cloud Database Web App URL</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Connect your deployed backend Web App to sync live projects, daily execution reports, and cloud document storage.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAppsScriptModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition-all shrink-0 self-start sm:self-auto"
          >
            <Code className="w-4 h-4" />
            <span>View Apps Script Code & Schema</span>
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={handleSyncClick}
              disabled={isSyncing}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all shrink-0 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Save & Sync Now'}</span>
            </button>
          </div>

          {/* Sync Status Banner */}
          {syncFeedback && (
            <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 border ${
              syncFeedback.status === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {syncFeedback.status === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{syncFeedback.message}</span>
            </div>
          )}

          {lastSyncTime && (
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>Last synced with Database:</span>
              <span className="font-semibold text-slate-600">{lastSyncTime}</span>
            </p>
          )}
        </div>

        {/* Database Tables Reference */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Connected Database Tables</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-800 block">Projects</span>
              <span className="text-slate-500 text-[10px]">Campus metadata & progress</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-800 block">DayWiseReports</span>
              <span className="text-slate-500 text-[10px]">Daily logs & manpower</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-800 block">DayWisePhotos</span>
              <span className="text-slate-500 text-[10px]">Cloud Drive linked images</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-800 block">ExecutionStages</span>
              <span className="text-slate-500 text-[10px]">15-stage subtask lifecycle</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-800 block">Materials</span>
              <span className="text-slate-500 text-[10px]">Stock & deliveries</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-800 block">Manpower</span>
              <span className="text-slate-500 text-[10px]">Daily workforce counts</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-800 block">Approvals</span>
              <span className="text-slate-500 text-[10px]">Permits & NOC status</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-800 block">Documents</span>
              <span className="text-slate-500 text-[10px]">Drawings & BOQ files</span>
            </div>
          </div>
        </div>

        {/* Cache Management & Plug-and-Play */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-0.5">Plug & Play Database Cache</h4>
            <p className="text-xs text-slate-500">Connecting to a brand-new database? Clear local cached records to immediately pull fresh schema tables.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleClearCacheAndResync}
              className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition-all border border-blue-200/60 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear Cache & Resync</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset local cache to initial sample demo data? (Does not delete rows from connected cloud database).')) {
                  api.resetToSeedData();
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-semibold transition-all border border-slate-200"
            >
              Reset to Sample Data
            </button>
          </div>
        </div>
      </div>

      {/* App Branding & Customization */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <span>App Branding & Customization</span>
        </h3>
        <p className="text-xs text-slate-500">Customize the application display name shown across the top navigation, landing homepage, and browser tab.</p>

        <form onSubmit={handleSaveAppName} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Application Name</label>
              <input
                type="text"
                value={appNameInput}
                onChange={(e) => setAppNameInput(e.target.value)}
                placeholder="Uni Tracker"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="self-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save App Name</span>
              </button>
            </div>
          </div>

          {appNameFeedback && (
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>{appNameFeedback}</span>
            </p>
          )}
        </form>
      </div>

      {/* Role-Based Access Control & User Profile */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <span>User Profile & Role-Based Access</span>
        </h3>

        {/* Current Session Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 gap-4">
          <div className="flex items-center gap-3">
            <img src={currentUser.avatar} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-slate-300" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">{currentUser.name}</h4>
              <p className="text-xs text-slate-500">@{currentUser.username || 'coordinator'} • {currentUser.email}</p>
              <div className="mt-1">
                {isCoordinator ? (
                  <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" /> Project Coordinator (Full Live CRUD)
                  </span>
                ) : (
                  <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <UserCircle className="w-3 h-3" /> Viewer Mode (Read-Only)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            {isCoordinator ? (
              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 text-xs font-semibold transition-all"
              >
                Logout Session
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                Coordinator Login
              </button>
            )}
          </div>
        </div>

        {/* Edit Profile Form */}
        <form onSubmit={handleSaveProfile} className="pt-3 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Edit Account Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Display Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
              <input
                type="text"
                value={profileUsername}
                onChange={(e) => setProfileUsername(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Active Role</label>
              <select
                value={profileRole}
                onChange={(e) => setProfileRole(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="Project Coordinator">Project Coordinator (CRUD Enabled)</option>
                <option value="Viewer">Viewer Mode (Read-Only)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            {profileFeedback ? (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>{profileFeedback}</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Password Prompt Modal for Protected Settings Changes */}
      <PasswordPromptModal
        isOpen={passwordModalOpen}
        onClose={() => {
          setPasswordModalOpen(false);
          setPendingUrl(null);
        }}
        onVerified={handlePasswordVerified}
        currentUser={currentUser}
      />
    </div>
  );
};
