import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, MapPin, Calendar, Users, FileText, ImageIcon, 
  Layers, Package, CheckCircle2, Clock, Plus, ExternalLink, Trash2, 
  ShieldCheck, AlertCircle, Building2, ChevronLeft, ChevronRight, X, Sparkles, 
  AlertTriangle, DollarSign, Wallet, TrendingUp, Edit3, Upload, Phone, PhoneCall,
  UserCheck, Camera
} from 'lucide-react';
import { 
  Project, User, ExecutionStageItem, MaterialItem, ManpowerItem, DocumentItem, 
  PhotoItem, SiteUpdateItem, DayWiseReport, DayWisePhoto, StagePhoto, StageType 
} from '../types';
import { formatDate } from '../utils/date';
import { getReliableImageUrl, handleImageFallback } from '../utils/image';
import { StagePhotosSection } from './StagePhotosSection';

interface ProjectDetailViewProps {
  project: Project;
  currentUser: User;
  onBack: () => void;
  executionStages: ExecutionStageItem[];
  materials: MaterialItem[];
  manpower: ManpowerItem[];
  documents: DocumentItem[];
  photos: PhotoItem[];
  dayWiseReports: DayWiseReport[];
  dayWisePhotos: DayWisePhoto[];
  stagePhotos?: StagePhoto[];
  siteUpdates: SiteUpdateItem[];
  onOpenAddMaterial: () => void;
  onOpenAddDoc: () => void;
  onOpenAddDayWise: () => void;
  onOpenAddUpdate: () => void;
  onUpdateStageStatus: (stageId: string, status: 'Pending' | 'In Progress' | 'Completed') => void;
  onToggleSubTask?: (stageId: string, subTaskId: string) => void;
  onOpenEditProject?: (proj: Project) => void;
  onDeleteMaterial?: (id: string) => void;
  onDeleteDocument?: (id: string) => void;
  onDeleteDayWiseReport?: (id: string) => void;
  onDeleteDayWisePhoto?: (id: string) => void;
  onOpenEditDayWiseReport?: (report: DayWiseReport) => void;
  onOpenAddStage?: () => void;
  onOpenEditStage?: (stage: ExecutionStageItem) => void;
  onDeleteStage?: (id: string) => void;
  onOpenAddManpower?: () => void;
  onOpenEditManpower?: (mp: ManpowerItem) => void;
  onDeleteManpower?: (id: string) => void;
  onUploadStagePhoto?: (payload: {
    projectId: string;
    stageType: StageType;
    stageCategory?: string;
    caption?: string;
    date?: string;
    fileName: string;
    mimeType: string;
    base64Data: string;
  }) => Promise<void>;
  onDeleteStagePhoto?: (id: string) => Promise<void>;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  currentUser,
  onBack,
  executionStages,
  materials,
  manpower,
  documents,
  photos,
  dayWiseReports,
  dayWisePhotos,
  stagePhotos = [],
  siteUpdates,
  onOpenAddMaterial,
  onOpenAddDoc,
  onOpenAddDayWise,
  onOpenAddUpdate,
  onUpdateStageStatus,
  onToggleSubTask,
  onOpenEditProject,
  onDeleteMaterial,
  onDeleteDocument,
  onDeleteDayWiseReport,
  onDeleteDayWisePhoto,
  onOpenEditDayWiseReport,
  onOpenAddStage,
  onOpenEditStage,
  onDeleteStage,
  onOpenAddManpower,
  onOpenEditManpower,
  onDeleteManpower,
  onUploadStagePhoto,
  onDeleteStagePhoto
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'progress' | 'execution' | 'materials' | 'manpower' | 'photos'>('overview');
  const [expandedStageId, setExpandedStageId] = useState<string | null>(null);

  const isCoordinator = currentUser.role === 'Project Coordinator';
  const projStages = executionStages.filter(s => String(s.projectId || '').trim() === String(project.id || '').trim());
  const projMaterials = materials.filter(m => String(m.projectId || '').trim() === String(project.id || '').trim());
  const projManpower = manpower.filter(mp => String(mp.projectId || '').trim() === String(project.id || '').trim());
  const projDocs = documents.filter(d => String(d.projectId || '').trim() === String(project.id || '').trim());
  const projUpdates = siteUpdates.filter(su => String(su.projectId || '').trim() === String(project.id || '').trim());

  // Filter Day-Wise Reports & Photos for this project with normalized IDs
  const projReports = dayWiseReports.filter(r => String(r.projectId || '').trim() === String(project.id || '').trim());
  const projDayPhotos = dayWisePhotos.filter(p => String(p.projectId || '').trim() === String(project.id || '').trim());

  // Group days: get all unique day numbers from reports and photos
  const allDaysSet = new Set<number>();
  projReports.forEach(r => allDaysSet.add(Number(r.dayNumber)));
  projDayPhotos.forEach(p => allDaysSet.add(Number(p.dayNumber)));
  
  // Sort days descending (Day 3, Day 2, Day 1)
  const sortedDays = Array.from(allDaysSet).sort((a, b) => b - a);

  // Selected Day state (defaults to the latest day or 1)
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(sortedDays[0] ?? 1);

  // Lightbox State
  const [lightboxPhoto, setLightboxPhoto] = useState<{ index: number; list: DayWisePhoto[] } | null>(null);

  // Close lightbox on Escape key
  useEffect(() => {
    if (!lightboxPhoto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxPhoto(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxPhoto]);

  const activeDay = selectedDayNumber !== null ? selectedDayNumber : sortedDays[0];
  const activeDayReport = projReports.find(r => Number(r.dayNumber) === activeDay);
  const activeDayPhotos = projDayPhotos.filter(p => Number(p.dayNumber) === activeDay);

  const totalWorkers = projManpower.reduce((sum, item) => sum + (Number(item.workerCount ?? item.count) || 0), 0);

  // Days calculation
  const start = new Date(project.startDate).getTime();
  const targetDateStr = project.targetDate || project.targetHandover || '2026-12-31';
  const target = new Date(targetDateStr).getTime();
  const now = new Date().getTime();
  const elapsedDays = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
  const remainingDays = Math.max(0, Math.floor((target - now) / (1000 * 60 * 60 * 24)));

  // Budget calculations
  const budgetAllocated = Number(project.budgetAllocated) || 25000000;
  const budgetSpent = Number(project.budgetSpent) || 5000000;
  const remainingBudget = Math.max(0, budgetAllocated - budgetSpent);
  const budgetPercent = budgetAllocated > 0 ? Math.min(100, Math.round((budgetSpent / budgetAllocated) * 100)) : 0;

  const heroImg = project.heroImageUrl || project.heroImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80';

  // Lightbox navigation
  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lightboxPhoto) return;
    const newIdx = (lightboxPhoto.index - 1 + lightboxPhoto.list.length) % lightboxPhoto.list.length;
    setLightboxPhoto({ index: newIdx, list: lightboxPhoto.list });
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lightboxPhoto) return;
    const newIdx = (lightboxPhoto.index + 1) % lightboxPhoto.list.length;
    setLightboxPhoto({ index: newIdx, list: lightboxPhoto.list });
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Top Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects Directory</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-mono">
                {project.labCode || project.code || project.id.toUpperCase()}
              </span>
              <span className={`whitespace-nowrap shrink-0 inline-flex items-center text-xs font-bold px-3 py-1 rounded-full text-white ${
                project.status === 'Active' ? 'bg-blue-600' :
                project.status === 'In Design' ? 'bg-purple-600' :
                project.status === 'In Execution' ? 'bg-amber-600' : 'bg-emerald-600'
              }`}>
                {project.status}
              </span>
              <span className={`whitespace-nowrap shrink-0 inline-flex items-center text-xs font-bold px-3 py-1 rounded-full ${
                project.health === 'On Track' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                project.health === 'At Risk' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                'bg-rose-50 text-rose-600 border border-rose-200'
              }`}>
                {project.health}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2">{project.name}</h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-blue-600" /> {project.city}, {project.state}</span>
              <span>•</span>
              <span>{Number(project.areaSft || 0).toLocaleString()} sft Built-up Area</span>
              <span>•</span>
              <span>Coordinator: {project.coordinatorName || 'Charan Sai'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isCoordinator && (
              <button
                onClick={() => onOpenEditProject?.(project)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Project</span>
              </button>
            )}
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 font-medium block">Allocated Budget</span>
              <span className="text-sm font-bold text-slate-900">₹{(budgetAllocated / 10000000).toFixed(2)} Cr</span>
            </div>
            <div className="text-right hidden sm:block pl-4 border-l border-slate-200">
              <span className="text-[10px] text-slate-400 font-medium block">Spent To Date</span>
              <span className="text-sm font-bold text-blue-600">₹{(budgetSpent / 10000000).toFixed(2)} Cr</span>
            </div>
          </div>
        </div>

        {/* Sub-Tabs navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 mt-6 border-t border-slate-100 no-scrollbar">
          {[
            { id: 'overview', label: 'Overview & Budget', icon: Building2 },
            { id: 'progress', label: `Daily Reports (${projReports.length})`, icon: Clock },
            { id: 'execution', label: 'Execution Stages', icon: Layers },
            { id: 'materials', label: 'Materials & Stock', icon: Package },
            { id: 'manpower', label: 'Manpower', icon: Users },
            { id: 'photos', label: `Day-Wise Photos (${projDayPhotos.length})`, icon: ImageIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: OVERVIEW & BUDGET */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 cols: Hero Image, Work Packages & Budget Progress */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              <div className="h-64 sm:h-80 relative">
                <img 
                  src={getReliableImageUrl(heroImg)} 
                  alt="" 
                  className="w-full h-full object-cover" 
                  loading="lazy" 
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={(e) => handleImageFallback(e, heroImg)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs font-medium text-blue-300">NxtWave Campus Infrastructure</p>
                  <h3 className="text-lg font-bold">{project.description || `${project.name} - Built-up Area: ${Number(project.areaSft || 0).toLocaleString()} sft.`}</h3>
                </div>
              </div>
            </div>

            {/* Budget Utilization Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-blue-600" />
                    <span>Project Financials & Budget Tracking</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Approved capital expenditure and field deployment tracking</p>
                </div>
                {isCoordinator && (
                  <button
                    onClick={() => onOpenEditProject?.(project)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Update Budget</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-400 font-semibold block">Budget Allocated</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">
                    ₹{(budgetAllocated / 10000000).toFixed(2)} Cr
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Approved CapEx</span>
                </div>
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                  <span className="text-[11px] text-blue-700 font-semibold block">Budget Spent</span>
                  <span className="text-xl font-black text-blue-600 mt-1 block">
                    ₹{(budgetSpent / 10000000).toFixed(2)} Cr
                  </span>
                  <span className="text-[10px] text-blue-500 mt-0.5 block">{budgetPercent}% Utilized</span>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <span className="text-[11px] text-emerald-700 font-semibold block">Remaining Balance</span>
                  <span className="text-xl font-black text-emerald-600 mt-1 block">
                    ₹{(remainingBudget / 10000000).toFixed(2)} Cr
                  </span>
                  <span className="text-[10px] text-emerald-500 mt-0.5 block">Available runway</span>
                </div>
              </div>

              {/* Budget Progress Bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-600">Fund Utilization</span>
                  <span className="text-blue-600">{budgetPercent}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${budgetPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Work Package Progress */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4">Work Package Breakdown</h3>
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span className="text-slate-700">Civil & Interior Works</span>
                    <span className="text-blue-600">{project.civilProgress ?? project.workPackages?.civilInterior ?? 0}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${project.civilProgress ?? project.workPackages?.civilInterior ?? 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span className="text-slate-700">MEP (HVAC, Electrical, IT Cabling)</span>
                    <span className="text-emerald-600">{project.mepProgress ?? project.workPackages?.mep ?? 0}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${project.mepProgress ?? project.workPackages?.mep ?? 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span className="text-slate-700">Furniture & AV Setup</span>
                    <span className="text-amber-600">{project.furnitureProgress ?? project.workPackages?.furnitureAv ?? 0}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${project.furnitureProgress ?? project.workPackages?.furnitureAv ?? 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span className="text-slate-700">Branding & Signage</span>
                    <span className="text-purple-600">{project.brandingProgress ?? project.workPackages?.brandingSignage ?? 0}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: `${project.brandingProgress ?? project.workPackages?.brandingSignage ?? 0}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right col: Project Progress Card & Key Dates */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4">Project Progress Card</h3>
              <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-4xl font-black text-blue-600">{project.progress}%</span>
                <span className="text-xs font-semibold text-slate-500 block mt-1">Overall Milestone Completion</span>
              </div>

              <div className="space-y-3 mt-6 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Start Date</span>
                  <span className="font-bold text-slate-800">{formatDate(project.startDate)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Target Handover</span>
                  <span className="font-bold text-slate-800">{formatDate(targetDateStr)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Elapsed Execution Time</span>
                  <span className="font-bold text-blue-600">{elapsedDays} Days</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-500">Remaining to Handover</span>
                  <span className="font-bold text-emerald-600">{remainingDays} Days</span>
                </div>
              </div>
            </div>

            {/* NxtWave Executive POC Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-900">NxtWave Executive POC</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                  Assigned Lead
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                    {(project.pocName || 'NW').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{project.pocName || 'Not Assigned'}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{String(project.pocPhone || 'Not Provided')}</span>
                    </p>
                  </div>
                </div>
                {project.pocPhone && (
                  <a
                    href={`tel:${String(project.pocPhone).replace(/[^\d+]/g, '')}`}
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center shrink-0"
                    title={`Call ${project.pocName || 'Executive POC'}`}
                  >
                    <PhoneCall className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

          {/* Reusable Stage Photos Section */}
          <StagePhotosSection
            projectId={project.id}
            projectName={project.name}
            stagePhotos={stagePhotos}
            isCoordinator={isCoordinator}
            onUploadStagePhoto={onUploadStagePhoto || (async () => {})}
            onDeleteStagePhoto={onDeleteStagePhoto || (async () => {})}
          />
        </div>
      )}

      {/* SUB-TAB 2: PROGRESS & DAILY REPORTS */}
      {activeSubTab === 'progress' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Daily Execution Reports ({projReports.length})</h3>
              <p className="text-xs text-slate-500 mt-0.5">Chronological site logs, workforce presence, and material usage</p>
            </div>
            {isCoordinator && (
              <button
                onClick={onOpenAddDayWise}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Log New Daily Report & Photos</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {projReports.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No Daily Reports Logged Yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Click the button above to log your first day-wise site progress report.
                </p>
              </div>
            ) : (
              projReports.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg font-mono">
                          Day {r.dayNumber}
                        </span>
                        <h4 className="text-base font-bold text-slate-900">Site Execution Log</h4>
                        <span className="text-xs text-slate-400 font-medium">• {formatDate(r.date)}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Logged by: <strong className="text-slate-800">{r.updatedBy}</strong></p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <span className="text-slate-400 text-[10px] block">Workers Onsite</span>
                        <span className="font-bold text-blue-600">{r.workersCount} Workers</span>
                      </div>
                      {isCoordinator && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onOpenEditDayWiseReport?.(r)}
                            className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
                            title="Edit Daily Report"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete Day ${r.dayNumber} Daily Report?`)) {
                                onDeleteDayWiseReport?.(r.id);
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                            title="Delete Daily Report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
                      <span className="font-bold text-slate-700 block mb-1">Work Accomplished:</span>
                      <p className="text-slate-800 leading-relaxed">{r.workSummary}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
                      <span className="font-bold text-slate-700 block mb-1">Materials Used / Staged:</span>
                      <p className="text-slate-800 leading-relaxed">{r.materialsUsed || 'Standard site materials and inventory.'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: EXECUTION STAGES */}
      {activeSubTab === 'execution' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Execution Stages ({projStages.length})</h3>
              <p className="text-xs text-slate-500">Granular milestone progress and quality checklists</p>
            </div>
            {isCoordinator && (
              <button
                onClick={onOpenAddStage}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Stage</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {projStages.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No execution stages configured for this campus.</p>
            ) : (
              [...projStages].sort((a, b) => (Number(a.stageNumber) || 0) - (Number(b.stageNumber) || 0)).map((stage) => {
                const isExpanded = expandedStageId === stage.id;
                const subTasks = stage.subTasks || [];
                return (
                  <div key={stage.id} className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden transition-all">
                    <div 
                      onClick={() => setExpandedStageId(isExpanded ? null : stage.id)}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/60"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                          stage.status === 'Completed' ? 'bg-emerald-600' :
                          stage.status === 'In Progress' ? 'bg-blue-600' : 'bg-slate-400'
                        }`}>
                          {stage.stageNumber}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{stage.stageName}</h4>
                          {stage.description && (
                            <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{stage.description}</p>
                          )}
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {stage.phase} • {subTasks.filter(t => t.completed).length}/{subTasks.length} Sub-tasks verified • Click to {isExpanded ? 'collapse' : 'expand'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                        <span className={`whitespace-nowrap shrink-0 inline-flex items-center text-[10px] font-bold px-3 py-1 rounded-full ${
                          stage.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                          stage.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {stage.status} ({stage.progress}%)
                        </span>

                        {isCoordinator && (
                          <>
                            <select
                              value={stage.status}
                              onChange={(e) => onUpdateStageStatus(stage.id, e.target.value as any)}
                              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700"
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                            <button
                              onClick={() => onOpenEditStage?.(stage)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                              title="Edit Stage"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete stage "${stage.stageName}"?`)) {
                                  onDeleteStage?.(stage.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                              title="Delete Stage"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 bg-white border-t border-slate-200/80 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Stage Checklist</span>
                        {subTasks.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No checklist sub-tasks assigned.</p>
                        ) : (
                          subTasks.map(sub => (
                            <div 
                              key={sub.id}
                              onClick={() => isCoordinator && onToggleSubTask?.(stage.id, sub.id)}
                              className={`p-3 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                                isCoordinator ? 'cursor-pointer hover:bg-slate-50' : ''
                              } ${sub.completed ? 'bg-emerald-50/40 border-emerald-200/70 text-emerald-950' : 'bg-slate-50/50 border-slate-200 text-slate-700'}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <input 
                                  type="checkbox" 
                                  checked={sub.completed}
                                  onChange={() => {}}
                                  disabled={!isCoordinator}
                                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <span className={sub.completed ? 'line-through text-slate-500' : 'font-medium'}>{sub.name}</span>
                              </div>
                              <span className={`whitespace-nowrap shrink-0 inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded ${
                                sub.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {sub.completed ? 'Completed' : 'Pending'}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: MATERIALS */}
      {activeSubTab === 'materials' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Materials & Stock Inventory</h3>
              <p className="text-xs text-slate-500">Delivered vs required stock items</p>
            </div>
            {isCoordinator && (
              <button
                onClick={onOpenAddMaterial}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Material</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <th className="p-3">Material Item</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Required</th>
                  <th className="p-3">Delivered</th>
                  <th className="p-3">Status</th>
                  {isCoordinator && <th className="p-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {projMaterials.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{m.itemName || m.name}</td>
                    <td className="p-3 text-slate-600">{m.category}</td>
                    <td className="p-3">{m.requiredQty} {m.unit || ''}</td>
                    <td className="p-3 text-blue-600 font-semibold">{m.deliveredQty} {m.unit || ''}</td>
                    <td className="p-3">
                      <span className={`whitespace-nowrap shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        m.status === 'In Stock' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        m.status === 'Low Stock' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                        'bg-blue-50 text-blue-600 border border-blue-200'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    {isCoordinator && (
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Delete material ${m.itemName || m.name}?`)) {
                              onDeleteMaterial?.(m.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: MANPOWER */}
      {activeSubTab === 'manpower' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Workforce & Manpower Deployment</h3>
              <p className="text-xs text-slate-500">Active workers across trades: <span className="font-bold text-blue-600">{totalWorkers}</span></p>
            </div>
            {isCoordinator && (
              <button
                onClick={onOpenAddManpower}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Manpower Log</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projManpower.length === 0 ? (
              <p className="text-xs text-slate-400 text-center col-span-2 py-8">No workforce logs recorded yet.</p>
            ) : (
              projManpower.map((mp) => (
                <div key={mp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{mp.trade}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Supervisor: {mp.supervisor} • {formatDate(mp.date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-lg font-black text-blue-600">{mp.workerCount ?? mp.count}</span>
                      <span className="text-[10px] text-slate-400 block">Workers</span>
                    </div>
                    {isCoordinator && (
                      <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                        <button
                          onClick={() => onOpenEditManpower?.(mp)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                          title="Edit Manpower"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete manpower log for ${mp.trade}?`)) {
                              onDeleteManpower?.(mp.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Delete Manpower"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: DAY-WISE PHOTOS & REPORTS */}
      {activeSubTab === 'photos' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Day-Wise Site Photos & Daily Reports</h3>
                <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                  Cloud Storage Integrated
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Browse chronological construction progression, daily manpower logs, and high-res site photos.
              </p>
            </div>

            {isCoordinator && (
              <button
                onClick={onOpenAddDayWise}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Day-Wise Report & Photos</span>
              </button>
            )}
          </div>

          {sortedDays.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <ImageIcon className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">No Day-Wise Logs Recorded Yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No reports or photos have been uploaded for {project.name} yet.
              </p>
              {isCoordinator && (
                <button
                  onClick={onOpenAddDayWise}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log First Daily Report & Photos</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Day Selection Tabs */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {sortedDays.map((dNum) => {
                  const rep = projReports.find(r => Number(r.dayNumber) === dNum);
                  const pCount = projDayPhotos.filter(p => Number(p.dayNumber) === dNum).length;
                  const isSelected = activeDay === dNum;
                  return (
                    <button
                      key={dNum}
                      onClick={() => setSelectedDayNumber(dNum)}
                      className={`flex flex-col items-start p-3.5 rounded-2xl border transition-all min-w-[150px] text-left shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/25 ring-2 ring-blue-600/20'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-black">Day {dNum}</span>
                        <span className={`whitespace-nowrap shrink-0 inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {pCount} Photos
                        </span>
                      </div>
                      <span className={`text-[11px] font-medium mt-1 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {formatDate(rep?.date) || 'Logged day'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Day Content: Daily Report Card */}
              {activeDayReport && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg font-mono">
                          Day {activeDayReport.dayNumber}
                        </span>
                        <h4 className="text-base font-bold text-slate-900">Daily Execution Report</h4>
                        <span className="text-xs text-slate-400 font-medium">• {formatDate(activeDayReport.date)}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Logged by: <strong className="text-slate-800">{activeDayReport.updatedBy}</strong></p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <span className="text-slate-400 text-[10px] block">Workers Onsite</span>
                        <span className="font-bold text-blue-600">{activeDayReport.workersCount} Workers</span>
                      </div>
                      {isCoordinator && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onOpenEditDayWiseReport?.(activeDayReport)}
                            className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
                            title="Edit Daily Report"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete Day ${activeDayReport.dayNumber} Daily Report?`)) {
                                onDeleteDayWiseReport?.(activeDayReport.id);
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                            title="Delete Daily Report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
                      <span className="font-bold text-slate-700 block mb-1">Work Accomplished:</span>
                      <p className="text-slate-800 leading-relaxed">{activeDayReport.workSummary}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
                      <span className="font-bold text-slate-700 block mb-1">Materials Staged / Consumed:</span>
                      <p className="text-slate-800 leading-relaxed">{activeDayReport.materialsUsed || 'Standard site materials and inventory.'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Photo Gallery Grid for Active Day */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-900">
                    Day {activeDay} Photo Gallery ({activeDayPhotos.length} {activeDayPhotos.length === 1 ? 'photo' : 'photos'})
                  </h4>
                  <span className="text-xs text-slate-400">Click any photo for full-screen lightbox</span>
                </div>

                {activeDayPhotos.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No photos uploaded for Day {activeDay}.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeDayPhotos.map((photo, pIdx) => (
                      <div 
                        key={photo.id}
                        onClick={() => setLightboxPhoto({ index: pIdx, list: activeDayPhotos })}
                        className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer h-56"
                      >
                        <img 
                          src={getReliableImageUrl(photo)} 
                          alt={photo.caption || `Day ${activeDay} site photo`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={(e) => handleImageFallback(e, photo)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <p className="text-xs font-bold leading-tight drop-shadow">{photo.caption || `Day ${activeDay} site photo`}</p>
                          <span className="text-[10px] text-slate-300 mt-0.5 block">{formatDate(photo.date)}</span>
                        </div>

                        {/* Coordinator Delete Button */}
                        {isCoordinator && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Delete this photo from storage and database?')) {
                                onDeleteDayWisePhoto?.(photo.id);
                              }
                            }}
                            className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-slate-900/60 hover:bg-rose-600 text-white backdrop-blur-md transition-colors"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Lightbox Modal Viewer with Click-Outside and Escape Support */}
      {lightboxPhoto && (
        <div 
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxPhoto(null)}
        >
          <div className="absolute top-5 right-5 flex items-center gap-3 z-50">
            {isCoordinator && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const photoToDelete = lightboxPhoto.list[lightboxPhoto.index];
                  if (confirm('Delete this photo from storage and database?')) {
                    setLightboxPhoto(null);
                    onDeleteDayWisePhoto?.(photoToDelete.id);
                  }
                }}
                className="px-3 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-lg"
                title="Delete photo from database"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Photo</span>
              </button>
            )}
            <button
              onClick={() => setLightboxPhoto(null)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {lightboxPhoto.list.length > 1 && (
            <>
              <button
                onClick={handlePrevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all z-50"
                aria-label="Previous Photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all z-50"
                aria-label="Next Photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img 
              src={getReliableImageUrl(lightboxPhoto.list[lightboxPhoto.index])} 
              alt="" 
              className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl" 
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={(e) => handleImageFallback(e, lightboxPhoto.list[lightboxPhoto.index])}
            />
            <div className="mt-4 text-center text-white">
              <h5 className="text-sm font-bold">{lightboxPhoto.list[lightboxPhoto.index].caption || `Day ${lightboxPhoto.list[lightboxPhoto.index].dayNumber} photo`}</h5>
              <p className="text-xs text-slate-400 mt-0.5">
                Day {lightboxPhoto.list[lightboxPhoto.index].dayNumber} • {formatDate(lightboxPhoto.list[lightboxPhoto.index].date)} • ({lightboxPhoto.index + 1} of {lightboxPhoto.list.length})
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
