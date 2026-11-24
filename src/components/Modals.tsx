import React, { useState, useEffect } from 'react';
import {
  X, Copy, Check, Plus, Code, Building2, ExternalLink, Save,
  Upload, Image as ImageIcon, Loader2, Trash2, ShieldCheck, AlertCircle, FileText, Lock
} from 'lucide-react';
import {
  User, Project, ApprovalItem, MaterialItem, DocumentItem,
  DayWiseReport, DayWisePhoto, ProjectStatus, ProjectHealth, ManpowerItem, ExecutionStageItem
} from '../types';
import { APPS_SCRIPT_CODE } from '../data/appsScriptCode';
import { compressImageToBase64 } from '../utils/image';
import { formatDateInput } from '../utils/date';
import { api } from '../services/api';
import { resolveProjectCoordinates, extractCoordsFromMapsUrl, geocodeCity } from '../utils/location';

interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const ModalBase: React.FC<ModalBaseProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full ${maxWidth} overflow-hidden animate-in fade-in zoom-in duration-200 my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[82vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// 1. Coordinator Login Modal
export const CoordinatorLoginModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}> = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.loginCoordinator(username, password);
      if (res.status === 'success' && res.user) {
        onLogin(res.user);
        onClose();
      } else {
        setErrorMsg(res.message || 'Authentication failed. Please check credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection error during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Project Coordinator Authentication">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900">
          <span className="font-bold block mb-1">Coordinator Access Required</span>
          Log in with your coordinator credentials to unlock full CRUD permissions, cloud document uploads, and day-wise photos across all campuses.
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Username or Email</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter username"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter password"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all mt-4 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{loading ? 'Authenticating...' : 'Sign In as Coordinator'}</span>
        </button>
      </form>
    </ModalBase>
  );
};

// 2. Apps Script / Database Code Modal
export const AppsScriptModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Database Web App Code (Code.gs)" maxWidth="max-w-2xl">
      <div className="space-y-4">
        <p className="text-xs text-slate-600 leading-relaxed">
          Copy this code into your Google Apps Script editor (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono">Extensions &gt; Apps Script</code>). Deploy as a Web App with access set to <strong className="text-slate-900">&quot;Anyone&quot;</strong> and copy the URL into Settings.
        </p>

        <div className="relative">
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-[11px] font-semibold hover:bg-slate-700 transition-all shadow"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
          <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-80">
            {APPS_SCRIPT_CODE}
          </pre>
        </div>
      </div>
    </ModalBase>
  );
};

// 3. Password Prompt Modal for Sensitive Settings Changes
export const PasswordPromptModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  currentUser: User;
}> = ({ isOpen, onClose, onVerified, currentUser }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const isOk = await api.verifyPassword(currentUser.username || 'coordinator', password);
      if (isOk) {
        setPassword('');
        onVerified();
        onClose();
      } else {
        setErrorMsg('Invalid password. Please check your credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Security Verification Required" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Password-Protected Action</span>
            <p className="mt-0.5 leading-relaxed text-slate-700">
              Please enter your Coordinator password to confirm changing the Database Web App connection.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Coordinator Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            placeholder="Enter password..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-md shadow-blue-600/30"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Confirm & Proceed</span>
          </button>
        </div>
      </form>
    </ModalBase>
  );
};

// 4. Add Project Modal (Complete All Fields)
export const AddProjectModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAdd: (proj: Project) => void;
}> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [labCode, setLabCode] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [state, setState] = useState('Telangana');
  const [areaSft, setAreaSft] = useState(25000);
  const [status, setStatus] = useState<ProjectStatus>('In Execution');
  const [health, setHealth] = useState<ProjectHealth>('On Track');
  const [progress, setProgress] = useState(20);
  const [startDate, setStartDate] = useState(formatDateInput(new Date()));
  const [targetDate, setTargetDate] = useState('2026-11-30');
  const [heroImageUrl, setHeroImageUrl] = useState('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80');
  const [lat, setLat] = useState(17.3850);
  const [lng, setLng] = useState(78.4867);
  const [mapsUrl, setMapsUrl] = useState('');
  const [pocName, setPocName] = useState('Charan Sai');
  const [pocPhone, setPocPhone] = useState('+91 98765 43210');
  const [budgetAllocated, setBudgetAllocated] = useState(25000000);
  const [budgetSpent, setBudgetSpent] = useState(5000000);
  const [civilProgress, setCivilProgress] = useState(30);
  const [mepProgress, setMepProgress] = useState(20);
  const [furnitureProgress, setFurnitureProgress] = useState(10);
  const [brandingProgress, setBrandingProgress] = useState(15);

  // Priority-based location synchronization
  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    if (!mapsUrl.trim()) {
      const coords = geocodeCity(newCity, state);
      if (coords) {
        setLat(coords.lat);
        setLng(coords.lng);
      }
    }
  };

  const handleStateChange = (newState: string) => {
    setState(newState);
    if (!mapsUrl.trim()) {
      const coords = geocodeCity(city, newState);
      if (coords) {
        setLat(coords.lat);
        setLng(coords.lng);
      }
    }
  };

  const handleMapsUrlChange = (newUrl: string) => {
    setMapsUrl(newUrl);
    // Priority 1: Extract coordinates from Maps link if valid
    const extracted = extractCoordsFromMapsUrl(newUrl);
    if (extracted) {
      setLat(extracted.lat);
      setLng(extracted.lng);
    } else if (!newUrl.trim()) {
      // Fallback to Priority 2: City geocoding if mapsUrl is cleared
      const coords = geocodeCity(city, state);
      if (coords) {
        setLat(coords.lat);
        setLng(coords.lng);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = labCode.trim() || name.slice(0, 3).toUpperCase() + '-' + Math.floor(Math.random() * 90 + 10);
    const resolvedCoords = resolveProjectCoordinates({
      mapsUrl,
      city,
      state,
      currentLat: Number(lat),
      currentLng: Number(lng)
    });

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name,
      labCode: cleanCode,
      code: cleanCode,
      city,
      state,
      areaSft: Number(areaSft),
      status,
      health,
      progress: Number(progress),
      startDate: formatDateInput(startDate),
      targetDate: formatDateInput(targetDate),
      targetHandover: formatDateInput(targetDate),
      heroImageUrl,
      heroImage: heroImageUrl,
      lat: resolvedCoords.lat,
      lng: resolvedCoords.lng,
      mapsUrl: resolvedCoords.mapsUrl,
      pocName,
      pocPhone,
      budgetAllocated: Number(budgetAllocated),
      budgetSpent: Number(budgetSpent),
      civilProgress: Number(civilProgress),
      mepProgress: Number(mepProgress),
      furnitureProgress: Number(furnitureProgress),
      brandingProgress: Number(brandingProgress),
      description: `Modern learning campus in ${city}, ${state}. Built-up area: ${Number(areaSft).toLocaleString()} sft.`,
      coordinatorName: 'Charan Sai',
      budget: `₹${(Number(budgetAllocated) / 10000000).toFixed(2)} Cr`,
      spent: `₹${(Number(budgetSpent) / 10000000).toFixed(2)} Cr`,
      workPackages: {
        civilInterior: Number(civilProgress),
        mep: Number(mepProgress),
        furnitureAv: Number(furnitureProgress),
        brandingSignage: Number(brandingProgress)
      }
    };
    onAdd(newProj);
    onClose();
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Add New Campus / Lab Project" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Campus / Project Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. NxtWave Tech Center" className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lab / Center Code</label>
            <input type="text" value={labCode} onChange={e => setLabCode(e.target.value)} placeholder="e.g. HYD-01" className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">City</label>
            <input type="text" value={city} onChange={e => handleCityChange(e.target.value)} required className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">State</label>
            <input type="text" value={state} onChange={e => handleStateChange(e.target.value)} required className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Built-up Area (sft)</label>
            <input type="number" value={areaSft} onChange={e => setAreaSft(Number(e.target.value))} required className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as ProjectStatus)} className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
              <option value="Active">Active</option>
              <option value="In Execution">In Execution</option>
              <option value="In Design">In Design</option>
              <option value="Handover">Handover</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Health</label>
            <select value={health} onChange={e => setHealth(e.target.value as ProjectHealth)} className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
              <option value="On Track">On Track</option>
              <option value="At Risk">At Risk</option>
              <option value="Delayed">Delayed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Overall Progress (%)</label>
            <input type="number" min={0} max={100} value={progress} onChange={e => setProgress(Number(e.target.value))} required className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Date</label>
            <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} required className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
        </div>

        {/* Budget Fields */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Budget Allocated (₹)</label>
            <input type="number" min={0} value={budgetAllocated} onChange={e => setBudgetAllocated(Number(e.target.value))} required className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-semibold" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Budget Spent (₹)</label>
            <input type="number" min={0} value={budgetSpent} onChange={e => setBudgetSpent(Number(e.target.value))} required className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-semibold" />
          </div>
        </div>

        {/* NxtWave Executive POC Details */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">NxtWave Executive POC Name</label>
            <input type="text" value={pocName} onChange={e => setPocName(e.target.value)} required placeholder="e.g. Charan Sai" className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">POC Phone Number</label>
            <input type="text" value={pocPhone} onChange={e => setPocPhone(e.target.value)} required placeholder="e.g. +91 98765 43210" className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200" />
          </div>
        </div>

        {/* Geographic Coordinates & Google Maps Link */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Latitude</label>
            <input type="number" step="any" value={lat} onChange={e => setLat(Number(e.target.value))} required className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px]" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Longitude</label>
            <input type="number" step="any" value={lng} onChange={e => setLng(Number(e.target.value))} required className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px]" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Google Maps URL</label>
            <input type="url" value={mapsUrl} onChange={e => handleMapsUrlChange(e.target.value)} placeholder="https://maps.google.com/?q=..." className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
        </div>

        {/* Work Package Progress */}
        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Civil (%)</label>
            <input type="number" min={0} max={100} value={civilProgress} onChange={e => setCivilProgress(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">MEP (%)</label>
            <input type="number" min={0} max={100} value={mepProgress} onChange={e => setMepProgress(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Furn. (%)</label>
            <input type="number" min={0} max={100} value={furnitureProgress} onChange={e => setFurnitureProgress(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Brand (%)</label>
            <input type="number" min={0} max={100} value={brandingProgress} onChange={e => setBrandingProgress(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Hero Image URL</label>
          <input type="url" value={heroImageUrl} onChange={e => setHeroImageUrl(e.target.value)} required className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200" />
        </div>

        <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30 transition-all mt-4">
          Save Project & Sync to Database
        </button>
      </form>
    </ModalBase>
  );
};

// 5. Edit Project Modal (Complete All Fields)
export const EditProjectModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onUpdate: (updated: Project) => void;
}> = ({ isOpen, onClose, project, onUpdate }) => {
  if (!project) return null;

  const [name, setName] = useState(project.name);
  const [labCode, setLabCode] = useState(project.labCode || project.code || '');
  const [city, setCity] = useState(project.city);
  const [state, setState] = useState(project.state);
  const [areaSft, setAreaSft] = useState(project.areaSft);
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [health, setHealth] = useState<ProjectHealth>(project.health);
  const [progress, setProgress] = useState(project.progress);
  const [startDate, setStartDate] = useState(formatDateInput(project.startDate));
  const [targetDate, setTargetDate] = useState(formatDateInput(project.targetDate || project.targetHandover));
  const [budgetAllocated, setBudgetAllocated] = useState(project.budgetAllocated ?? 25000000);
  const [budgetSpent, setBudgetSpent] = useState(project.budgetSpent ?? 5000000);
  const [lat, setLat] = useState(project.lat);
  const [lng, setLng] = useState(project.lng);
  const [mapsUrl, setMapsUrl] = useState(project.mapsUrl || '');
  const [pocName, setPocName] = useState(project.pocName || '');
  const [pocPhone, setPocPhone] = useState(String(project.pocPhone || ''));
  const [civilProgress, setCivilProgress] = useState(project.civilProgress ?? 0);
  const [mepProgress, setMepProgress] = useState(project.mepProgress ?? 0);
  const [furnitureProgress, setFurnitureProgress] = useState(project.furnitureProgress ?? 0);
  const [brandingProgress, setBrandingProgress] = useState(project.brandingProgress ?? 0);
  const [heroImageUrl, setHeroImageUrl] = useState(project.heroImageUrl || project.heroImage || '');

  // Priority-based location synchronization
  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    if (!mapsUrl.trim()) {
      const coords = geocodeCity(newCity, state);
      if (coords) {
        setLat(coords.lat);
        setLng(coords.lng);
      }
    }
  };

  const handleStateChange = (newState: string) => {
    setState(newState);
    if (!mapsUrl.trim()) {
      const coords = geocodeCity(city, newState);
      if (coords) {
        setLat(coords.lat);
        setLng(coords.lng);
      }
    }
  };

  const handleMapsUrlChange = (newUrl: string) => {
    setMapsUrl(newUrl);
    // Priority 1: Extract coordinates from Maps link if valid
    const extracted = extractCoordsFromMapsUrl(newUrl);
    if (extracted) {
      setLat(extracted.lat);
      setLng(extracted.lng);
    } else if (!newUrl.trim()) {
      // Fallback to Priority 2: City geocoding if mapsUrl is cleared
      const coords = geocodeCity(city, state);
      if (coords) {
        setLat(coords.lat);
        setLng(coords.lng);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = labCode.trim() || project.code || project.id;
    const resolvedCoords = resolveProjectCoordinates({
      mapsUrl,
      city,
      state,
      currentLat: Number(lat),
      currentLng: Number(lng)
    });

    const updated: Project = {
      ...project,
      name,
      labCode: cleanCode,
      code: cleanCode,
      city,
      state,
      areaSft: Number(areaSft),
      status,
      health,
      progress: Number(progress),
      startDate: formatDateInput(startDate),
      targetDate: formatDateInput(targetDate),
      targetHandover: formatDateInput(targetDate),
      budgetAllocated: Number(budgetAllocated),
      budgetSpent: Number(budgetSpent),
      lat: resolvedCoords.lat,
      lng: resolvedCoords.lng,
      mapsUrl: resolvedCoords.mapsUrl,
      pocName,
      pocPhone,
      heroImageUrl,
      heroImage: heroImageUrl,
      civilProgress: Number(civilProgress),
      mepProgress: Number(mepProgress),
      furnitureProgress: Number(furnitureProgress),
      brandingProgress: Number(brandingProgress),
      budget: `₹${(Number(budgetAllocated) / 10000000).toFixed(2)} Cr`,
      spent: `₹${(Number(budgetSpent) / 10000000).toFixed(2)} Cr`,
      workPackages: {
        civilInterior: Number(civilProgress),
        mep: Number(mepProgress),
        furnitureAv: Number(furnitureProgress),
        brandingSignage: Number(brandingProgress)
      }
    };
    onUpdate(updated);
    onClose();
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={`Edit Project: ${project.name}`} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Campus / Project Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lab / Center Code</label>
            <input type="text" value={labCode} onChange={e => setLabCode(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">City</label>
            <input type="text" value={city} onChange={e => handleCityChange(e.target.value)} required className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">State</label>
            <input type="text" value={state} onChange={e => handleStateChange(e.target.value)} required className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Built-up Area (sft)</label>
            <input type="number" value={areaSft} onChange={e => setAreaSft(Number(e.target.value))} required className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as ProjectStatus)} className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
              <option value="Active">Active</option>
              <option value="In Execution">In Execution</option>
              <option value="In Design">In Design</option>
              <option value="Handover">Handover</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Health</label>
            <select value={health} onChange={e => setHealth(e.target.value as ProjectHealth)} className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
              <option value="On Track">On Track</option>
              <option value="At Risk">At Risk</option>
              <option value="Delayed">Delayed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Overall Progress (%)</label>
            <input type="number" min={0} max={100} value={progress} onChange={e => setProgress(Number(e.target.value))} required className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Date</label>
            <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} required className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
        </div>

        {/* Budget Fields */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Budget Allocated (₹)</label>
            <input type="number" min={0} value={budgetAllocated} onChange={e => setBudgetAllocated(Number(e.target.value))} required className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-semibold" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Budget Spent (₹)</label>
            <input type="number" min={0} value={budgetSpent} onChange={e => setBudgetSpent(Number(e.target.value))} required className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-semibold" />
          </div>
        </div>

        {/* NxtWave Executive POC Details */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">NxtWave Executive POC Name</label>
            <input type="text" value={pocName} onChange={e => setPocName(e.target.value)} required placeholder="e.g. Charan Sai" className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">POC Phone Number</label>
            <input type="text" value={pocPhone} onChange={e => setPocPhone(e.target.value)} required placeholder="e.g. +91 98765 43210" className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200" />
          </div>
        </div>

        {/* Lat, Lng & Maps URL */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Latitude</label>
            <input type="number" step="any" value={lat} onChange={e => setLat(Number(e.target.value))} required className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px]" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Longitude</label>
            <input type="number" step="any" value={lng} onChange={e => setLng(Number(e.target.value))} required className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px]" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Google Maps URL</label>
            <input type="url" value={mapsUrl} onChange={e => handleMapsUrlChange(e.target.value)} placeholder="https://maps.google.com/?q=..." className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
        </div>

        {/* Work Package Progress */}
        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Civil (%)</label>
            <input type="number" min={0} max={100} value={civilProgress} onChange={e => setCivilProgress(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">MEP (%)</label>
            <input type="number" min={0} max={100} value={mepProgress} onChange={e => setMepProgress(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Furn. (%)</label>
            <input type="number" min={0} max={100} value={furnitureProgress} onChange={e => setFurnitureProgress(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Brand (%)</label>
            <input type="number" min={0} max={100} value={brandingProgress} onChange={e => setBrandingProgress(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Hero Image URL</label>
          <input type="url" value={heroImageUrl} onChange={e => setHeroImageUrl(e.target.value)} required className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200" />
        </div>

        <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30 transition-all mt-4">
          Save Changes & Sync to Database
        </button>
      </form>
    </ModalBase>
  );
};

// 6. Add Day-Wise Report and Photos Modal
export const AddDayWiseReportAndPhotosModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  currentUser: User;
  onSuccess: (newReport: DayWiseReport, newPhotos: DayWisePhoto[]) => void;
}> = ({ isOpen, onClose, project, currentUser, onSuccess }) => {
  const [dayNumber, setDayNumber] = useState<number>(1);
  const [date, setDate] = useState<string>(formatDateInput(new Date()));
  const [workSummary, setWorkSummary] = useState('');
  const [workersCount, setWorkersCount] = useState<number>(35);
  const [materialsUsed, setMaterialsUsed] = useState('');

  const [selectedFiles, setSelectedFiles] = useState<{ file: File; previewUrl: string; caption: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; message: string }>({
    current: 0,
    total: 0,
    message: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    const newItems = filesArray.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      caption: ''
    }));
    setSelectedFiles(prev => [...prev, ...newItems]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].previewUrl);
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleCaptionChange = (index: number, val: string) => {
    setSelectedFiles(prev => {
      const copy = [...prev];
      copy[index].caption = val;
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workSummary.trim()) {
      alert('Please enter a daily work summary.');
      return;
    }

    setUploading(true);
    const uploadedPhotos: DayWisePhoto[] = [];
    const totalPhotos = selectedFiles.length;

    try {
      for (let i = 0; i < totalPhotos; i++) {
        const item = selectedFiles[i];
        setUploadProgress({
          current: i + 1,
          total: totalPhotos,
          message: `Compressing & uploading photo ${i + 1} of ${totalPhotos}...`
        });

        const compressed = await compressImageToBase64(item.file);

        const photoRes = await api.uploadDayWisePhoto({
          projectId: project.id,
          projectName: project.name,
          dayNumber: Number(dayNumber),
          date: formatDateInput(date),
          caption: item.caption.trim() || `Day ${dayNumber} Photo`,
          fileName: compressed.fileName,
          mimeType: compressed.mimeType,
          base64Data: compressed.base64Data
        });

        if (photoRes.status === 'success' && photoRes.data) {
          uploadedPhotos.push(photoRes.data);
        }
      }

      setUploadProgress({
        current: totalPhotos,
        total: totalPhotos,
        message: 'Saving Daily Report to Database...'
      });

      const reportRecord: DayWiseReport = {
        id: `dwr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        projectId: project.id,
        dayNumber: Number(dayNumber),
        date: formatDateInput(date),
        workSummary,
        workersCount: Number(workersCount),
        materialsUsed,
        updatedBy: currentUser.name || 'Coordinator'
      };

      await api.createRecord('DayWiseReports', reportRecord);

      onSuccess(reportRecord, uploadedPhotos);
      onClose();
    } catch (err: any) {
      alert('Upload failed: ' + (err.message || 'Unknown error occurred'));
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0, message: '' });
    }
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={`+ Add Day-Wise Report & Photos: ${project.name}`} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {uploading && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-900">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>{uploadProgress.message}</span>
              </span>
              <span>
                {uploadProgress.total > 0 ? `${Math.round((uploadProgress.current / uploadProgress.total) * 100)}%` : ''}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-blue-200 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${uploadProgress.total > 0 ? (uploadProgress.current / uploadProgress.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Day Number</label>
            <input
              type="number"
              min={1}
              value={dayNumber}
              onChange={e => setDayNumber(Number(e.target.value))}
              required
              disabled={uploading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Log Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              disabled={uploading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Daily Work Summary</label>
          <textarea
            rows={3}
            value={workSummary}
            onChange={e => setWorkSummary(e.target.value)}
            required
            disabled={uploading}
            placeholder="Key milestones accomplished today (e.g. false ceiling grid framing completed, wiring pulled)..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Workers Onsite Count</label>
            <input
              type="number"
              min={0}
              value={workersCount}
              onChange={e => setWorkersCount(Number(e.target.value))}
              required
              disabled={uploading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Materials Used / Staged</label>
            <input
              type="text"
              value={materialsUsed}
              onChange={e => setMaterialsUsed(e.target.value)}
              disabled={uploading}
              placeholder="e.g. 50 LED panels, 20 bags adhesive"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
            />
          </div>
        </div>

        {/* Multi-Photo File Picker */}
        <div className="pt-2">
          <label className="block font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span>Day-Wise Site Photos (Supports 8–10+ Photos)</span>
            </span>
            <span className="text-[11px] text-slate-400">Auto-compressed to 1200px max</span>
          </label>

          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all text-center">
            <Upload className="w-8 h-8 text-blue-500 mb-2" />
            <span className="text-xs font-bold text-slate-800">Click or Drag photos to select</span>
            <span className="text-[11px] text-slate-400 mt-0.5">JPEG, PNG, WebP • Multi-select supported</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <span className="text-[11px] font-bold text-slate-600 block">
                Selected Photos ({selectedFiles.length}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto p-1">
                {selectedFiles.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <img src={item.previewUrl} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 truncate">{item.file.name}</p>
                      <input
                        type="text"
                        placeholder="Caption (optional)"
                        value={item.caption}
                        onChange={e => handleCaptionChange(idx, e.target.value)}
                        disabled={uploading}
                        className="mt-1 w-full px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px]"
                      />
                    </div>
                    {!uploading && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all mt-4 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading to Cloud Storage & Database...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload Day {dayNumber} Report & {selectedFiles.length} Photos</span>
            </>
          )}
        </button>
      </form>
    </ModalBase>
  );
};

// 7. Edit Day-Wise Report Modal
export const EditDayWiseReportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  report: DayWiseReport | null;
  onUpdate: (updated: DayWiseReport) => void;
}> = ({ isOpen, onClose, report, onUpdate }) => {
  if (!report) return null;

  const [dayNumber, setDayNumber] = useState(report.dayNumber);
  const [date, setDate] = useState(formatDateInput(report.date));
  const [workSummary, setWorkSummary] = useState(report.workSummary);
  const [workersCount, setWorkersCount] = useState(report.workersCount);
  const [materialsUsed, setMaterialsUsed] = useState(report.materialsUsed);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...report,
      dayNumber: Number(dayNumber),
      date: formatDateInput(date),
      workSummary,
      workersCount: Number(workersCount),
      materialsUsed
    });
    onClose();
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={`Edit Daily Report: Day ${report.dayNumber}`}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Day Number</label>
            <input type="number" min={1} value={dayNumber} onChange={e => setDayNumber(Number(e.target.value))} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Log Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Daily Work Accomplished</label>
          <textarea rows={4} value={workSummary} onChange={e => setWorkSummary(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Workers Count</label>
            <input type="number" min={0} value={workersCount} onChange={e => setWorkersCount(Number(e.target.value))} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Materials Used</label>
            <input type="text" value={materialsUsed} onChange={e => setMaterialsUsed(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
        </div>

        <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30 transition-all mt-4">
          Save Daily Report
        </button>
      </form>
    </ModalBase>
  );
};

// 8. Add Manpower Modal
export const AddManpowerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onAdd: (mp: ManpowerItem) => void;
}> = ({ isOpen, onClose, projectId, onAdd }) => {
  const [trade, setTrade] = useState('Civil & Masonry');
  const [workerCount, setWorkerCount] = useState<number>(25);
  const [supervisor, setSupervisor] = useState('');
  const [date, setDate] = useState(formatDateInput(new Date()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: `mp-${Date.now()}`,
      projectId,
      trade,
      workerCount: Number(workerCount),
      count: Number(workerCount),
      supervisor: supervisor.trim() || 'Site Supervisor',
      date: formatDateInput(date)
    });
    onClose();
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Log Manpower Deployment">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Trade / Skill Category</label>
          <select value={trade} onChange={e => setTrade(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
            <option value="Civil & Masonry">Civil & Masonry</option>
            <option value="Electrical & Cabling">Electrical & Cabling</option>
            <option value="HVAC Technicians">HVAC Technicians</option>
            <option value="Carpenters & Furniture">Carpenters & Furniture</option>
            <option value="Painters & Finishers">Painters & Finishers</option>
            <option value="IT, AV & Security">IT, AV & Security</option>
            <option value="General Helpers">General Helpers</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Worker Count</label>
            <input type="number" min={1} value={workerCount} onChange={e => setWorkerCount(Number(e.target.value))} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Supervisor Name</label>
          <input type="text" value={supervisor} onChange={e => setSupervisor(e.target.value)} placeholder="e.g. Ramesh Naidu" required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200" />
        </div>

        <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30 transition-all mt-4">
          Add Manpower Entry
        </button>
      </form>
    </ModalBase>
  );
};

// 9. Edit Manpower Modal
export const EditManpowerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  manpowerItem: ManpowerItem | null;
  onUpdate: (updated: ManpowerItem) => void;
}> = ({ isOpen, onClose, manpowerItem, onUpdate }) => {
  if (!manpowerItem) return null;

  const [trade, setTrade] = useState(manpowerItem.trade);
  const [workerCount, setWorkerCount] = useState(manpowerItem.workerCount ?? manpowerItem.count ?? 1);
  const [supervisor, setSupervisor] = useState(manpowerItem.supervisor);
  const [date, setDate] = useState(formatDateInput(manpowerItem.date));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...manpowerItem,
      trade,
      workerCount: Number(workerCount),
      count: Number(workerCount),
      supervisor,
      date: formatDateInput(date)
    });
    onClose();
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Edit Manpower Entry">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Trade / Skill Category</label>
          <input type="text" value={trade} onChange={e => setTrade(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Worker Count</label>
            <input type="number" min={1} value={workerCount} onChange={e => setWorkerCount(Number(e.target.value))} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Supervisor Name</label>
          <input type="text" value={supervisor} onChange={e => setSupervisor(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200" />
        </div>

        <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30 transition-all mt-4">
          Save Manpower Entry
        </button>
      </form>
    </ModalBase>
  );
};

// 10. Add Execution Stage Modal
export const AddExecutionStageModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onAdd: (stage: ExecutionStageItem) => void;
}> = ({ isOpen, onClose, projectId, onAdd }) => {
  const [phase, setPhase] = useState('Execution');
  const [stageNumber, setStageNumber] = useState<number>(1);
  const [stageName, setStageName] = useState('');
  const [status, setStatus] = useState<'Pending' | 'In Progress' | 'Completed'>('Pending');
  const [progress, setProgress] = useState<number>(0);
  const [subTaskNames, setSubTaskNames] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tasks = subTaskNames
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .map((name, idx) => ({ id: `st-${Date.now()}-${idx}`, name, completed: false }));

    const newStage: ExecutionStageItem = {
      id: `stage-${Date.now()}`,
      projectId,
      phase,
      stageNumber: Number(stageNumber),
      stageName,
      status,
      progress: Number(progress),
      subTasksJson: JSON.stringify(tasks),
      subTasks: tasks
    };

    onAdd(newStage);
    onClose();
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Add Execution Stage">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Stage Number</label>
            <input type="number" min={1} value={stageNumber} onChange={e => setStageNumber(Number(e.target.value))} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phase</label>
            <select value={phase} onChange={e => setPhase(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
              <option value="Site Audit">Site Audit</option>
              <option value="Design">Design</option>
              <option value="Procurement">Procurement</option>
              <option value="Execution">Execution</option>
              <option value="Inspection">Inspection</option>
              <option value="Handover">Handover</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Stage Name</label>
          <input type="text" value={stageName} onChange={e => setStageName(e.target.value)} required placeholder="e.g. Wall Partition Framing" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Progress (%)</label>
            <input type="number" min={0} max={100} value={progress} onChange={e => setProgress(Number(e.target.value))} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Sub-tasks (one per line)</label>
          <textarea rows={3} value={subTaskNames} onChange={e => setSubTaskNames(e.target.value)} placeholder="Stud channel fixing&#10;Rockwool acoustic infill&#10;Gypsum board covering" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px]" />
        </div>

        <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30 transition-all mt-4">
          Add Execution Stage
        </button>
      </form>
    </ModalBase>
  );
};

// 11. Edit Execution Stage Modal
export const EditExecutionStageModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  stage: ExecutionStageItem | null;
  onUpdate: (updated: ExecutionStageItem) => void;
}> = ({ isOpen, onClose, stage, onUpdate }) => {
  if (!stage) return null;

  const [phase, setPhase] = useState(stage.phase);
  const [stageNumber, setStageNumber] = useState(stage.stageNumber);
  const [stageName, setStageName] = useState(stage.stageName);
  const [status, setStatus] = useState(stage.status);
  const [progress, setProgress] = useState(stage.progress);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...stage,
      phase,
      stageNumber: Number(stageNumber),
      stageName,
      status,
      progress: Number(progress)
    });
    onClose();
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={`Edit Stage ${stage.stageNumber}: ${stage.stageName}`}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Stage Number</label>
            <input type="number" min={1} value={stageNumber} onChange={e => setStageNumber(Number(e.target.value))} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phase</label>
            <select value={phase} onChange={e => setPhase(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
              <option value="Site Audit">Site Audit</option>
              <option value="Design">Design</option>
              <option value="Procurement">Procurement</option>
              <option value="Execution">Execution</option>
              <option value="Inspection">Inspection</option>
              <option value="Handover">Handover</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Stage Name</label>
          <input type="text" value={stageName} onChange={e => setStageName(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Progress (%)</label>
            <input type="number" min={0} max={100} value={progress} onChange={e => setProgress(Number(e.target.value))} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
        </div>

        <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30 transition-all mt-4">
          Save Stage Changes
        </button>
      </form>
    </ModalBase>
  );
};

// 12. Add Document Modal (Direct File Upload & Base64 Sync)
export const AddDocumentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  preselectedProjectId?: string;
  onAdd: (doc: DocumentItem) => void;
}> = ({ isOpen, onClose, projects, preselectedProjectId, onAdd }) => {
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(preselectedProjectId || projects[0]?.id || '');
  const [category, setCategory] = useState<DocumentItem['category']>('Drawings');
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
  const [documentUrl, setDocumentUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setSelectedFile(f);
      if (!title) {
        setTitle(f.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === projectId) || projects[0];
    const todayStr = formatDateInput(new Date());

    if (uploadMode === 'file' && selectedFile) {
      setUploading(true);
      try {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            const commaIdx = result.indexOf(',');
            resolve(commaIdx > -1 ? result.substring(commaIdx + 1) : result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });

        const base64Data = await base64Promise;

        const res = await api.uploadDocument({
          projectId: proj.id,
          projectName: proj.name,
          title: title.trim() || selectedFile.name,
          category,
          uploadDate: todayStr,
          fileName: selectedFile.name,
          mimeType: selectedFile.type || 'application/pdf',
          base64Data
        });

        if (res.status === 'success' && res.data) {
          onAdd(res.data);
          onClose();
        }
      } catch (err: any) {
        alert('Document upload failed: ' + (err.message || 'Error occurred'));
      } finally {
        setUploading(false);
      }
    } else {
      // Direct Link mode
      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        projectId: proj.id,
        projectName: proj.name,
        title: title.trim() || 'Document Link',
        category,
        uploadDate: todayStr,
        documentUrl: documentUrl.trim() || 'https://drive.google.com',
        url: documentUrl.trim() || 'https://drive.google.com'
      };
      onAdd(newDoc);
      onClose();
    }
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Upload Document / Drawing / BOQ" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Campus / Project</label>
          <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
            <option value="Drawings">Drawings (CAD/Architectural)</option>
            <option value="BOQ">BOQ (Bill of Quantities)</option>
            <option value="Contracts">Contracts & Vendor Agreements</option>
            <option value="Permits">Permits & Sanctions</option>
            <option value="Reports">Reports & Audits</option>
            <option value="NOC">NOC & Clearances</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Document Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Master Floor Layout Plan v2" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200" />
        </div>

        {/* Upload Mode Selector */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <button
            type="button"
            onClick={() => setUploadMode('file')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${uploadMode === 'file' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
              }`}
          >
            Direct File Upload
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('link')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${uploadMode === 'link' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
              }`}
          >
            External Cloud Link
          </button>
        </div>

        {uploadMode === 'file' ? (
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select File (PDF, DOCX, XLSX, Images)</label>
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all text-center">
              <Upload className="w-8 h-8 text-blue-500 mb-2" />
              <span className="text-xs font-bold text-slate-800">
                {selectedFile ? selectedFile.name : 'Click to select document'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'PDF, Word, Excel, PNG, JPG up to 25MB'}
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        ) : (
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Document URL</label>
            <input
              type="url"
              value={documentUrl}
              onChange={e => setDocumentUrl(e.target.value)}
              required
              placeholder="https://drive.google.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || (uploadMode === 'file' && !selectedFile)}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-bold shadow-md shadow-blue-600/30 transition-all mt-4 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading Document to Cloud Storage...</span>
            </>
          ) : (
            <span>Upload & Save to Database</span>
          )}
        </button>
      </form>
    </ModalBase>
  );
};

// 13. Add Material Modal
export const AddMaterialModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onAdd: (mat: MaterialItem) => void;
}> = ({ isOpen, onClose, projectId, onAdd }) => {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<string>('Civil');
  const [requiredQty, setRequiredQty] = useState<string | number>('100');
  const [deliveredQty, setDeliveredQty] = useState<string | number>('0');
  const [unit, setUnit] = useState('units');
  const [status, setStatus] = useState<string>('Pending Delivery');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMaterial: MaterialItem = {
      id: `mat-${Date.now()}`,
      projectId,
      itemName,
      name: itemName,
      category,
      requiredQty,
      deliveredQty,
      unit,
      status,
      balance: `${Number(requiredQty) - Number(deliveredQty)} ${unit}`
    };
    onAdd(newMaterial);
    onClose();
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Add Material & Stock Item">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Item Name</label>
          <input type="text" value={itemName} onChange={e => setItemName(e.target.value)} required placeholder="e.g. Acoustic Wall Panels" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200" />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
            <option value="Civil">Civil</option>
            <option value="Electrical">Electrical</option>
            <option value="HVAC">HVAC</option>
            <option value="Furniture">Furniture</option>
            <option value="IT & AV">IT & AV</option>
            <option value="Branding">Branding</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Required Qty</label>
            <input type="number" value={requiredQty} onChange={e => setRequiredQty(e.target.value)} required className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Delivered Qty</label>
            <input type="number" value={deliveredQty} onChange={e => setDeliveredQty(e.target.value)} required className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Unit</label>
            <input type="text" value={unit} onChange={e => setUnit(e.target.value)} required placeholder="pcs, units, sqft" className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Stock Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Pending Delivery">Pending Delivery</option>
            <option value="Ordered">Ordered</option>
          </select>
        </div>

        <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30 transition-all mt-4">
          Add Material to Database
        </button>
      </form>
    </ModalBase>
  );
};

// 14. Add Approval Modal
export const AddApprovalModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onAdd: (app: ApprovalItem) => void;
}> = ({ isOpen, onClose, projects, onAdd }) => {
  const [approvalName, setApprovalName] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [approver, setApprover] = useState('Municipal Corporation');
  const [status, setStatus] = useState<string>('Pending');
  const [documentUrl, setDocumentUrl] = useState('https://drive.google.com');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === projectId) || projects[0];
    const newApproval: ApprovalItem = {
      id: `app-${Date.now()}`,
      projectId: proj.id,
      projectName: proj.name,
      approvalName,
      name: approvalName,
      approver,
      requestedDate: formatDateInput(new Date()),
      status,
      documentUrl,
      link: documentUrl
    };
    onAdd(newApproval);
    onClose();
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Add Regulatory Approval / NOC">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Approval Name</label>
          <input type="text" value={approvalName} onChange={e => setApprovalName(e.target.value)} required placeholder="e.g. Fire Safety NOC" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200" />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Campus / Project</label>
          <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Approving Authority</label>
            <input type="text" value={approver} onChange={e => setApprover(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30 transition-all mt-4">
          Save Approval to Database
        </button>
      </form>
    </ModalBase>
  );
};
