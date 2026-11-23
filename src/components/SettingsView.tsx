import React, { useState, useEffect } from 'react';
import { 
  Settings, CheckCircle2, AlertCircle, RefreshCw, 
  Code, ShieldCheck, UserCircle, ExternalLink, Database, 
  Sparkles, Lock, Save, ArrowRight, Layers, Check, Phone, Video 
} from 'lucide-react';
import { User, DatabaseMeta, AppSettings } from '../types';

interface SettingsViewProps {
  currentUser: User;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenAppsScriptModal: () => void;
  isSyncing: boolean;
  isConnected: boolean;
  lastSyncTime: string;
  appName: string;
  appSettings?: AppSettings;
  onUpdateAppSettings?: (settings: { appName: string; whatsappNumber?: string; heroVideoUrl?: string }) => void;
  onUpdateAppName: (name: string) => void;
  onUpdateCurrentUser: (user: User) => void;
  databaseMeta: DatabaseMeta;
  onSwitchDatabase: (sheetUrl: string, password: string) => Promise<boolean>;
  onRefreshData: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenAppsScriptModal,
  isSyncing,
  isConnected,
  lastSyncTime,
  appName,
  appSettings,
  onUpdateAppSettings,
  onUpdateAppName,
  onUpdateCurrentUser,
  databaseMeta,
  onSwitchDatabase,
  onRefreshData
}) => {
  const isCoordinator = currentUser.role === 'Project Coordinator';

  // Switch Database form state (Coordinator only)
  const [sheetUrlInput, setSheetUrlInput] = useState('');
  const [switchPassword, setSwitchPassword] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchFeedback, setSwitchFeedback] = useState<{ status: 'success' | 'error'; message: string } | null>(null);

  // App Settings state (App Name, WhatsApp, Hero Video)
  const [appNameInput, setAppNameInput] = useState(appName || (appSettings?.appName ? String(appSettings.appName) : ''));
  const [whatsappInput, setWhatsappInput] = useState(appSettings?.whatsappNumber ? String(appSettings.whatsappNumber) : '');
  const [heroVideoUrlInput, setHeroVideoUrlInput] = useState(appSettings?.heroVideoUrl ? String(appSettings.heroVideoUrl) : '');
  const [appNameFeedback, setAppNameFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (appName) setAppNameInput(String(appName));
    if (appSettings?.whatsappNumber !== undefined && appSettings?.whatsappNumber !== null) {
      setWhatsappInput(String(appSettings.whatsappNumber));
    }
    if (appSettings?.heroVideoUrl !== undefined && appSettings?.heroVideoUrl !== null) {
      setHeroVideoUrlInput(String(appSettings.heroVideoUrl));
    }
  }, [appName, appSettings]);

  // Profile fields state
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileUsername, setProfileUsername] = useState(currentUser.username || 'coordinator');
  const [profileRole, setProfileRole] = useState<User['role']>(currentUser.role);
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);

  const handleSwitchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSwitchFeedback(null);

    const trimmedUrl = sheetUrlInput.trim();
    if (!trimmedUrl) {
      setSwitchFeedback({ status: 'error', message: 'Please enter a valid Database link or spreadsheet ID.' });
      return;
    }

    if (!switchPassword.trim()) {
      setSwitchFeedback({ status: 'error', message: 'Coordinator password is required to switch database globally.' });
      return;
    }

    setIsSwitching(true);
    try {
      const ok = await onSwitchDatabase(trimmedUrl, switchPassword);
      if (ok) {
        setSheetUrlInput('');
        setSwitchPassword('');
        setSwitchFeedback({
          status: 'success',
          message: 'Active database successfully switched globally. All devices are now synchronized!'
        });
      } else {
        setSwitchFeedback({
          status: 'error',
          message: 'Failed to switch database. Please verify the link, permissions ("Anyone with link"), and password.'
        });
      }
    } catch (err: any) {
      setSwitchFeedback({
        status: 'error',
        message: err.message || 'Connection error while switching database.'
      });
    } finally {
      setIsSwitching(false);
    }
  };

  const handleSaveAppSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = appNameInput.trim() || 'Project Portal';
    const cleanWhatsApp = whatsappInput.trim();
    const cleanVideo = heroVideoUrlInput.trim();
    setAppNameFeedback(null);
    if (onUpdateAppSettings) {
      onUpdateAppSettings({
        appName: clean,
        whatsappNumber: cleanWhatsApp,
        heroVideoUrl: cleanVideo
      });
    } else {
      onUpdateAppName(clean);
    }
    setAppNameFeedback('Application branding & global settings saved to live database!');
    setTimeout(() => setAppNameFeedback(null), 3500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileFeedback(null);
    const updated: User = {
      ...currentUser,
      username: profileUsername.trim() || 'coordinator',
      name: profileName.trim() || 'Coordinator',
      role: profileRole,
      email: `${profileUsername.trim() || 'coordinator'}@unitracker.com`
    };
    onUpdateCurrentUser(updated);
    setProfileFeedback('User profile saved and synced!');
    setTimeout(() => setProfileFeedback(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Settings & Database</h2>
          <p className="text-xs text-slate-500 mt-0.5">Global database synchronization, active cloud storage, and role permissions</p>
        </div>

        {/* Live Status Badge */}
        <div>
          {isConnected ? (
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm whitespace-nowrap shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live • Connected to Cloud Database</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm whitespace-nowrap shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Offline • Connection Error</span>
            </span>
          )}
        </div>
      </div>

      {/* Active Database Summary Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              <span>Active Connected Database</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Current central cloud database serving live campus execution and daily reports globally across all clients.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefreshData}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50 text-xs font-semibold transition-all shrink-0"
              title="Force sync latest database records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Refreshing...' : 'Force Refresh'}</span>
            </button>

            {isCoordinator && (
              <button
                type="button"
                onClick={onOpenAppsScriptModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-all shrink-0"
              >
                <Code className="w-3.5 h-3.5" />
                <span>Backend Schema</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Database Name</span>
            <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>{databaseMeta.name || 'Main Execution Database'}</span>
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Synchronization Mode</span>
            <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Global Live Auto-Sync</span>
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Last Live Sync</span>
            <span className="font-mono text-slate-700 font-semibold">{lastSyncTime || 'Just now'}</span>
          </div>
        </div>
      </div>

      {/* Global "Switch Active Database" Card (Visible only when logged in as Project Coordinator) */}
      {isCoordinator ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Switch Global Active Database</h3>
              <p className="text-xs text-slate-500">
                Point all connected campus dashboards and mobile devices to a new database without touching code or redeploying.
              </p>
            </div>
          </div>

          <form onSubmit={handleSwitchSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                New Database Link or Spreadsheet ID
              </label>
              <input
                type="text"
                placeholder="https://docs.google.com/spreadsheets/d/1V4KSeSh.../edit or spreadsheet ID"
                value={sheetUrlInput}
                onChange={(e) => setSheetUrlInput(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Ensure the target database has tabs: Projects, DayWiseReports, DayWisePhotos, ExecutionStages, Materials, Manpower, Approvals, Documents.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Coordinator Password (Security Verification)</span>
              </label>
              <input
                type="password"
                placeholder="Enter your coordinator password..."
                value={switchPassword}
                onChange={(e) => setSwitchPassword(e.target.value)}
                required
                className="w-full sm:w-80 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
              />
            </div>

            {switchFeedback && (
              <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 border ${
                switchFeedback.status === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {switchFeedback.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{switchFeedback.message}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSwitching}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isSwitching ? 'animate-spin' : ''}`} />
                <span>{isSwitching ? 'Switching Database Globally...' : 'Switch Global Database'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-950">Database Administration Locked</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Log in as Project Coordinator to switch the active database, modify project records, or manage system parameters.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenLogin}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap shrink-0"
          >
            Coordinator Login
          </button>
        </div>
      )}

      {/* App Branding & Customization */}
      {isCoordinator && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span>App Branding & Global Settings</span>
          </h3>
          <p className="text-xs text-slate-500">
            Customize the application branding, WhatsApp contact number, and landing page portrait hero video synced globally across all devices.
          </p>

          <form onSubmit={handleSaveAppSettings} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Application Name</label>
                <input
                  type="text"
                  value={appNameInput}
                  onChange={(e) => setAppNameInput(e.target.value)}
                  placeholder="Project Portal"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Contact Number</span>
                </label>
                <input
                  type="text"
                  value={whatsappInput}
                  onChange={(e) => setWhatsappInput(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-blue-600" />
                  <span>Hero Portrait Video URL</span>
                </label>
                <input
                  type="text"
                  value={heroVideoUrlInput}
                  onChange={(e) => setHeroVideoUrlInput(e.target.value)}
                  placeholder="/hero-video.mp4 or https://..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Application Settings</span>
              </button>

              {appNameFeedback && (
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{appNameFeedback}</span>
                </p>
              )}
            </div>
          </form>
        </div>
      )}

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
        {isCoordinator && (
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
        )}
      </div>
    </div>
  );
};
