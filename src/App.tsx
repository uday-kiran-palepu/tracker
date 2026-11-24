import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { ProjectsView } from './components/ProjectsView';
import { ProjectDetailView } from './components/ProjectDetailView';
import { MapView } from './components/MapView';
import { ExecutionView } from './components/ExecutionView';
import { ReportsView } from './components/ReportsView';
import { ApprovalsView } from './components/ApprovalsView';
import { DocumentsView } from './components/DocumentsView';
import { SettingsView } from './components/SettingsView';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  CoordinatorLoginModal, AppsScriptModal, AddProjectModal, EditProjectModal,
  AddApprovalModal, AddMaterialModal, AddDocumentModal, AddDayWiseReportAndPhotosModal,
  EditDayWiseReportModal, AddExecutionStageModal, EditExecutionStageModal,
  AddManpowerModal, EditManpowerModal
} from './components/Modals';
import { Building2, RefreshCw, MessageCircle } from 'lucide-react';
import { sanitizeWhatsAppUrl } from './utils/security';

import {
  Project, ExecutionStageItem, MaterialItem, ManpowerItem, ApprovalItem,
  DocumentItem, PhotoItem, SiteUpdateItem, User, DayWiseReport, DayWisePhoto, DatabaseMeta, AppSettings,
  StagePhoto, StageType
} from './types';
import { createDefaultStagesForProject } from './data/fixedStages';
import { api } from './services/api';

export default function App() {
  // Navigation & Landing View State
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [appSettings, setAppSettings] = useState<AppSettings>(() => api.getAppSettings());
  const [appName, setAppName] = useState<string>(() => api.getAppName());
  const [currentUser, setCurrentUser] = useState<User>(api.getCurrentUser());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [orgName, setOrgName] = useState('NxtWave (Flagship)');

  // Instant Startup via SWR Cache
  const initialCache = api.getLiveCache();

  // Live Backend & Loading State
  // Full-screen blocking loader removed: landing page opens immediately in 0ms
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(() => Boolean(initialCache && initialCache.Projects && initialCache.Projects.length > 0));
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(api.getLastSyncTime());
  const [databaseMeta, setDatabaseMeta] = useState<DatabaseMeta>(() => initialCache?.DatabaseMeta || { name: 'Main Execution Database' });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((type: 'success' | 'error' | 'info', message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync document title with dynamic appName
  useEffect(() => {
    if (appName) {
      document.title = appName;
    }
  }, [appName]);

  // Main 8 Database Tables State - hydrated immediately from SWR cache (0ms instant startup)
  const [projects, setProjects] = useState<Project[]>(() => initialCache?.Projects || []);
  const [dayWiseReports, setDayWiseReports] = useState<DayWiseReport[]>(() => initialCache?.DayWiseReports || []);
  const [dayWisePhotos, setDayWisePhotos] = useState<DayWisePhoto[]>(() => initialCache?.DayWisePhotos || []);
  const [executionStages, setExecutionStages] = useState<ExecutionStageItem[]>(() => initialCache?.ExecutionStages || []);
  const [materials, setMaterials] = useState<MaterialItem[]>(() => initialCache?.Materials || []);
  const [manpower, setManpower] = useState<ManpowerItem[]>(() => initialCache?.Manpower || []);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(() => initialCache?.Approvals || []);
  const [documents, setDocuments] = useState<DocumentItem[]>(() => initialCache?.Documents || []);
  const [stagePhotos, setStagePhotos] = useState<StagePhoto[]>(() => initialCache?.StagePhotos || api.getLocalStagePhotos());
  const [siteUpdates, setSiteUpdates] = useState<SiteUpdateItem[]>([]);

  // Selected project for detail view
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Filters
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedHealthFilter, setSelectedHealthFilter] = useState('All');

  // Modals state
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [appsScriptModalOpen, setAppsScriptModalOpen] = useState(false);
  const [addProjectModalOpen, setAddProjectModalOpen] = useState(false);
  const [editProjectModalOpen, setEditProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [addApprovalModalOpen, setAddApprovalModalOpen] = useState(false);
  const [addMaterialModalOpen, setAddMaterialModalOpen] = useState(false);
  const [addDocumentModalOpen, setAddDocumentModalOpen] = useState(false);
  const [addDayWiseModalOpen, setAddDayWiseModalOpen] = useState(false);

  // DayWiseReport Edit Modal State
  const [editDayWiseModalOpen, setEditDayWiseModalOpen] = useState(false);
  const [reportToEdit, setReportToEdit] = useState<DayWiseReport | null>(null);

  // ExecutionStage Modal State
  const [addStageModalOpen, setAddStageModalOpen] = useState(false);
  const [editStageModalOpen, setEditStageModalOpen] = useState(false);
  const [stageToEdit, setStageToEdit] = useState<ExecutionStageItem | null>(null);

  // Manpower Modal State
  const [addManpowerModalOpen, setAddManpowerModalOpen] = useState(false);
  const [editManpowerModalOpen, setEditManpowerModalOpen] = useState(false);
  const [manpowerToEdit, setManpowerToEdit] = useState<ManpowerItem | null>(null);

  // Core data sync function with silent background mode support
  const syncData = useCallback(async (options?: boolean | { isSilent?: boolean; fresh?: boolean }) => {
    const isSilent = typeof options === 'boolean' ? options : (options?.isSilent ?? false);
    const isFresh = typeof options === 'boolean' ? false : (options?.fresh ?? false);

    // Subtle non-blocking syncing indicator in header (never block screen with full-screen spinner)
    setIsSyncing(true);

    try {
      const result = await api.fetchAllData({ fresh: isFresh });
      if (result) {
        setProjects(result.Projects || []);
        setDayWiseReports(result.DayWiseReports || []);
        setDayWisePhotos(result.DayWisePhotos || []);
        setExecutionStages(result.ExecutionStages || []);
        setMaterials(result.Materials || []);
        setManpower(result.Manpower || []);
        setApprovals(result.Approvals || []);
        setDocuments(result.Documents || []);
        setStagePhotos(result.StagePhotos || api.getLocalStagePhotos());

        if (result.DatabaseMeta) {
          setDatabaseMeta(result.DatabaseMeta);
        }

        setIsConnected(true);
        setLastSyncTime(api.getLastSyncTime());

        if (result.AppSettings) {
          setAppSettings(result.AppSettings);
          if (result.AppSettings.appName) {
            setAppName(result.AppSettings.appName);
            document.title = result.AppSettings.appName;
          }
        }
      }
    } catch (err: any) {
      console.warn('Live database sync error:', err);
      if (!api.getLiveCache() && projects.length === 0) {
        setIsConnected(false);
      }
      if (!isSilent) {
        showToast('error', 'Could not sync with live database. Network offline.', 'Connection Error');
      }
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [showToast, projects.length]);

  // App Startup & Silent Background Auto-Sync
  useEffect(() => {
    // Landing page opens immediately in 0ms; silently fetch live database in background
    syncData({ isSilent: true, fresh: false });

    // Re-sync automatically when browser tab regains focus
    const handleFocus = () => {
      syncData({ isSilent: true, fresh: false });
    };
    window.addEventListener('focus', handleFocus);

    // Silent background auto-sync every 60 seconds
    const intervalId = setInterval(() => {
      syncData({ isSilent: true, fresh: false });
    }, 60000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, [syncData]);

  // Auth Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    api.setCurrentUser(user);
    showToast('success', `Welcome back, ${user.name}! Full CRUD unlocked.`, 'Coordinator Mode');
  };

  const handleLogout = () => {
    api.logoutUser();
    setCurrentUser(api.getCurrentUser());
    showToast('info', 'Switched to Public View-Only Mode.', 'Logged Out');
  };

  // Switch Global Database Handler (from Settings)
  const handleSwitchDatabase = async (sheetUrl: string, password: string): Promise<boolean> => {
    setIsSyncing(true);
    try {
      const res = await api.switchGlobalDatabase(sheetUrl, currentUser.username || 'coordinator', password);
      if (res && res.status === 'success') {
        // Clear state immediately
        setProjects([]);
        setDayWiseReports([]);
        setDayWisePhotos([]);
        setExecutionStages([]);
        setMaterials([]);
        setManpower([]);
        setApprovals([]);
        setDocuments([]);
        api.clearCache();

        // Fetch fresh data from newly switched database
        await syncData({ isSilent: false, fresh: true });

        showToast(
          'success',
          `Global database switched to ${res.databaseName || 'new database'}. All devices will now sync with this database.`,
          'Database Switched'
        );
        return true;
      } else {
        showToast('error', res?.message || 'Failed to switch database.', 'Switch Error');
        return false;
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error occurred while switching database.', 'Connection Error');
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Global App Settings Handler (App Name, WhatsApp, Hero Video)
  const handleUpdateAppSettings = async (newSettings: { appName: string; whatsappNumber?: string; heroVideoUrl?: string }) => {
    setAppName(newSettings.appName);
    setAppSettings(newSettings);
    document.title = newSettings.appName;

    // Optimistic UI update
    api.setAppSettings(newSettings);

    showToast('info', 'Saving settings globally to live database...', 'Saving Settings');
    try {
      await api.updateAppSettings(newSettings);
      showToast('success', 'Application settings saved to database and synced across all devices!', 'Saved Globally');
      syncData({ isSilent: true, fresh: true });
    } catch (err: any) {
      showToast('error', `Failed to update settings: ${err.message}`, 'Sync Error');
    }
  };

  // CRUD: Projects
  const handleAddProject = async (newProj: Project) => {
    const updated = [newProj, ...projects];
    setProjects(updated);

    // Auto-generate all 21 execution stages for the new campus project
    const defaultStages = createDefaultStagesForProject(newProj.id);
    setExecutionStages(prev => [...defaultStages, ...prev]);

    showToast('info', 'Saving campus & 21 execution stages to Database...', 'Adding Project');

    try {
      const res = await api.createRecord('Projects', newProj);
      // Immediately update with server's resolved coordinates and attributes
      if (res && res.data) {
        const serverData = res.data;
        setProjects(prev => prev.map(p => p.id === newProj.id ? {
          ...p,
          ...serverData,
          lat: Number(serverData.lat) || p.lat,
          lng: Number(serverData.lng) || p.lng,
          mapsUrl: serverData.mapsUrl || p.mapsUrl,
          city: serverData.city || p.city,
          state: serverData.state || p.state
        } : p));
      }

      // Asynchronously sync all 21 execution stages
      for (const st of defaultStages) {
        api.createRecord('ExecutionStages', st).catch(e => console.warn('Stage auto-sync error:', e));
      }
      showToast('success', `Campus "${newProj.name}" created with 21 execution stages!`, 'Saved to Database');
      syncData({ isSilent: true, fresh: true });
    } catch (e: any) {
      showToast('error', `Failed to sync project to Database: ${e.message}`);
    }
  };

  const handleUploadStagePhoto = async (payload: {
    projectId: string;
    stageType: StageType;
    stageCategory?: string;
    caption?: string;
    date?: string;
    fileName: string;
    mimeType: string;
    base64Data: string;
  }) => {
    try {
      const res = await api.uploadStagePhoto(payload);
      if (res.data) {
        setStagePhotos(prev => [res.data!, ...prev.filter(p => p.id !== res.data!.id)]);
        showToast('success', `${payload.stageType} photo uploaded successfully!`, 'Uploaded');
        syncData({ isSilent: true, fresh: true });
      }
    } catch (err: any) {
      showToast('error', `Failed to upload photo: ${err.message}`, 'Upload Failed');
      throw err;
    }
  };

  const handleDeleteStagePhoto = async (id: string) => {
    try {
      showToast('info', 'Deleting stage photo from Database...', 'Deleting');
      await api.deleteStagePhoto(id);
      setStagePhotos(prev => prev.filter(p => p.id !== id));
      showToast('success', 'Stage photo deleted from Database.', 'Deleted');
      syncData({ isSilent: true, fresh: true });
    } catch (err: any) {
      showToast('error', `Failed to delete stage photo: ${err.message}`, 'Delete Failed');
    }
  };

  const handleUpdateProject = async (updatedProj: Project) => {
    const updated = projects.map(p => p.id === updatedProj.id ? updatedProj : p);
    setProjects(updated);
    if (selectedProject?.id === updatedProj.id) {
      setSelectedProject(updatedProj);
    }
    showToast('info', 'Updating project in Database...', 'Saving Changes');

    try {
      const res = await api.updateRecord('Projects', updatedProj.id, updatedProj);
      // Immediately update state with server's returned data (including resolved lat, lng, mapsUrl)
      if (res && (res as any).data) {
        const serverData = (res as any).data;
        const mergedProj: Project = {
          ...updatedProj,
          ...serverData,
          lat: Number(serverData.lat) || updatedProj.lat,
          lng: Number(serverData.lng) || updatedProj.lng,
          mapsUrl: serverData.mapsUrl || updatedProj.mapsUrl,
          city: serverData.city || updatedProj.city,
          state: serverData.state || updatedProj.state
        };
        setProjects(prev => prev.map(p => p.id === updatedProj.id ? mergedProj : p));
        if (selectedProject?.id === updatedProj.id) {
          setSelectedProject(mergedProj);
        }
      }
      showToast('success', `Campus "${updatedProj.name}" updated successfully!`, 'Saved to Database');
      syncData({ isSilent: true, fresh: true });
    } catch (e: any) {
      showToast('error', `Failed to update project: ${e.message}`);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Are you sure you want to delete this project from the Database?')) {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      if (selectedProject?.id === id) setSelectedProject(null);
      showToast('info', 'Deleting project from Database...', 'Deleting');

      try {
        await api.deleteRecord('Projects', id);
        showToast('success', 'Project removed from Database.', 'Deleted');
        syncData({ isSilent: true, fresh: true });
      } catch (e: any) {
        showToast('error', `Failed to delete project: ${e.message}`);
      }
    }
  };

  const handleOpenEditProject = (proj: Project) => {
    setProjectToEdit(proj);
    setEditProjectModalOpen(true);
  };

  // CRUD: Execution Stages & SubTasks
  const handleUpdateStageStatus = async (stageId: string, status: 'Pending' | 'In Progress' | 'Completed') => {
    let targetStage: ExecutionStageItem | null = null;
    const updated = executionStages.map(s => {
      if (s.id === stageId) {
        const prog = status === 'Completed' ? 100 : status === 'In Progress' ? 50 : 0;
        const updatedSubTasks = (s.subTasks || []).map(st => ({
          ...st,
          completed: status === 'Completed'
        }));
        targetStage = {
          ...s,
          status,
          progress: prog,
          subTasks: updatedSubTasks,
          subTasksJson: JSON.stringify(updatedSubTasks)
        };
        return targetStage;
      }
      return s;
    });

    setExecutionStages(updated);

    if (targetStage) {
      try {
        await api.updateRecord('ExecutionStages', stageId, targetStage);
        showToast('success', `Stage status updated to "${status}"`, 'Saved to Database');
        syncData({ isSilent: true, fresh: true });
      } catch (e: any) {
        showToast('error', `Failed to update stage in Database: ${e.message}`);
      }
    }
  };

  const handleToggleSubTask = async (stageId: string, subTaskId: string) => {
    let targetStage: ExecutionStageItem | null = null;
    const updated = executionStages.map(s => {
      if (s.id === stageId) {
        const updatedSubTasks = (s.subTasks || []).map(st => st.id === subTaskId ? { ...st, completed: !st.completed } : st);
        const completedCount = updatedSubTasks.filter(st => st.completed).length;
        const progress = Math.round((completedCount / (updatedSubTasks.length || 1)) * 100);
        const status: 'Pending' | 'In Progress' | 'Completed' = progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Pending';
        targetStage = {
          ...s,
          subTasks: updatedSubTasks,
          subTasksJson: JSON.stringify(updatedSubTasks),
          progress,
          status
        };
        return targetStage;
      }
      return s;
    });

    setExecutionStages(updated);

    if (targetStage) {
      try {
        await api.updateRecord('ExecutionStages', stageId, targetStage);
        showToast('success', 'Subtask updated in Database', 'Checklist Synced');
        syncData({ isSilent: true, fresh: true });
      } catch (e: any) {
        showToast('error', `Failed to sync subtask: ${e.message}`);
      }
    }
  };

  const handleAddStage = async (newStage: ExecutionStageItem) => {
    setExecutionStages([newStage, ...executionStages]);
    showToast('info', 'Saving execution stage to Database...', 'Saving Stage');
    try {
      await api.createRecord('ExecutionStages', newStage);
      showToast('success', `Stage "${newStage.stageName}" saved to Database!`, 'Stage Added');
      syncData({ isSilent: true, fresh: true });
    } catch (e: any) {
      showToast('error', `Failed to save stage: ${e.message}`);
    }
  };

  const handleUpdateStage = async (updatedStage: ExecutionStageItem) => {
    setExecutionStages(executionStages.map(s => s.id === updatedStage.id ? updatedStage : s));
    showToast('info', 'Updating stage in Database...', 'Saving Changes');
    try {
      await api.updateRecord('ExecutionStages', updatedStage.id, updatedStage);
      showToast('success', `Stage "${updatedStage.stageName}" updated!`, 'Stage Updated');
      syncData({ isSilent: true, fresh: true });
    } catch (e: any) {
      showToast('error', `Failed to update stage: ${e.message}`);
    }
  };

  const handleDeleteStage = async (id: string) => {
    if (confirm('Delete this execution stage from Database?')) {
      setExecutionStages(executionStages.filter(s => s.id !== id));
      try {
        await api.deleteRecord('ExecutionStages', id);
        showToast('success', 'Execution stage removed from Database.', 'Deleted');
        syncData({ isSilent: true, fresh: true });
      } catch (e: any) {
        showToast('error', `Failed to delete stage: ${e.message}`);
      }
    }
  };

  // CRUD: Manpower
  const handleAddManpower = async (newMp: ManpowerItem) => {
    setManpower([newMp, ...manpower]);
    showToast('info', 'Logging manpower deployment...', 'Logging Workforce');
    try {
      await api.createRecord('Manpower', newMp);
      showToast('success', `${newMp.workerCount} workers logged for ${newMp.trade}`, 'Manpower Synced');
      syncData({ isSilent: true, fresh: true });
    } catch (e: any) {
      showToast('error', `Failed to log manpower: ${e.message}`);
    }
  };

  const handleUpdateManpower = async (updatedMp: ManpowerItem) => {
    setManpower(manpower.map(m => m.id === updatedMp.id ? updatedMp : m));
    showToast('info', 'Updating manpower entry...', 'Saving');
    try {
      await api.updateRecord('Manpower', updatedMp.id, updatedMp);
      showToast('success', 'Manpower record updated in Database.', 'Updated');
      syncData({ isSilent: true, fresh: true });
    } catch (e: any) {
      showToast('error', `Failed to update manpower: ${e.message}`);
    }
  };

  const handleDeleteManpower = async (id: string) => {
    if (confirm('Delete this manpower entry from Database?')) {
      setManpower(manpower.filter(m => m.id !== id));
      try {
        await api.deleteRecord('Manpower', id);
        showToast('success', 'Manpower entry removed from Database.', 'Deleted');
        syncData({ isSilent: true, fresh: true });
      } catch (e: any) {
        showToast('error', `Failed to delete manpower: ${e.message}`);
      }
    }
  };

  // CRUD: Materials
  const handleAddMaterial = async (newMat: MaterialItem) => {
    setMaterials([newMat, ...materials]);
    try {
      await api.createRecord('Materials', newMat);
      showToast('success', `Material "${newMat.itemName}" saved to Database.`, 'Saved to Database');
      syncData({ isSilent: true, fresh: true });
    } catch (e: any) {
      showToast('error', `Failed to add material: ${e.message}`);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
    try {
      await api.deleteRecord('Materials', id);
      showToast('success', 'Material removed from Database.', 'Deleted');
      syncData({ isSilent: true, fresh: true });
    } catch (e: any) {
      showToast('error', `Failed to delete material: ${e.message}`);
    }
  };

  // CRUD: Approvals
  const handleAddApproval = async (newApp: ApprovalItem) => {
    setApprovals([newApp, ...approvals]);
    try {
      await api.createRecord('Approvals', newApp);
      showToast('success', `Approval "${newApp.approvalName}" logged in Database.`, 'Saved to Database');
      syncData({ isSilent: true, fresh: true });
    } catch (e: any) {
      showToast('error', `Failed to add approval: ${e.message}`);
    }
  };

  const handleUpdateApprovalStatus = async (id: string, status: 'Pending' | 'Approved' | 'Rejected' | 'Under Review') => {
    let targetApp: ApprovalItem | null = null;
    const updated = approvals.map(a => {
      if (a.id === id) {
        targetApp = { ...a, status };
        return targetApp;
      }
      return a;
    });
    setApprovals(updated);

    if (targetApp) {
      try {
        await api.updateRecord('Approvals', id, targetApp);
        showToast('success', `Approval status changed to ${status}.`, 'Saved to Database');
        syncData({ isSilent: true, fresh: true });
      } catch (e: any) {
        showToast('error', `Failed to update approval: ${e.message}`);
      }
    }
  };

  const handleDeleteApproval = async (id: string) => {
    setApprovals(approvals.filter(a => a.id !== id));
    try {
      await api.deleteRecord('Approvals', id);
      showToast('success', 'Approval removed from Database.', 'Deleted');
      syncData({ isSilent: true, fresh: true });
    } catch (e: any) {
      showToast('error', `Failed to delete approval: ${e.message}`);
    }
  };

  // CRUD: Documents
  const handleAddDocument = async (newDoc: DocumentItem) => {
    setDocuments([newDoc, ...documents]);
    try {
      await api.createRecord('Documents', newDoc);
      showToast('success', `Document "${newDoc.title}" synced to Database.`, 'Saved to Database');
      syncData({ isSilent: true, fresh: true });
    } catch (e: any) {
      showToast('error', `Failed to add document: ${e.message}`);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
    try {
      await api.deleteRecord('Documents', id);
      showToast('success', 'Document removed from Database.', 'Deleted');
      syncData({ isSilent: true, fresh: true });
    } catch (e: any) {
      showToast('error', `Failed to delete document: ${e.message}`);
    }
  };

  // CRUD: Day-Wise Reports & Photos
  const handleAddDayWiseSuccess = (newReport: DayWiseReport, newPhotos: DayWisePhoto[]) => {
    setDayWiseReports(prev => [newReport, ...prev]);
    if (newPhotos.length > 0) {
      setDayWisePhotos(prev => [...newPhotos, ...prev.filter(p => !newPhotos.some(np => np.id === p.id))]);
    }
    showToast('success', `Day ${newReport.dayNumber} report and ${newPhotos.length} photos uploaded to Cloud Storage & Database!`, 'Upload Complete');
    syncData({ isSilent: true, fresh: true });
  };

  const handleUpdateDayWiseReport = async (updatedReport: DayWiseReport) => {
    setDayWiseReports(dayWiseReports.map(r => r.id === updatedReport.id ? updatedReport : r));
    showToast('info', 'Saving daily report changes...', 'Updating Report');
    try {
      await api.updateRecord('DayWiseReports', updatedReport.id, updatedReport);
      showToast('success', `Day ${updatedReport.dayNumber} report updated!`, 'Saved to Database');
      syncData({ isSilent: true, fresh: true });
    } catch (e: any) {
      showToast('error', `Failed to update report: ${e.message}`);
    }
  };

  const handleDeleteDayWiseReport = async (id: string) => {
    setDayWiseReports(dayWiseReports.filter(r => r.id !== id));
    try {
      await api.deleteRecord('DayWiseReports', id);
      showToast('success', 'Daily Report removed from Database.', 'Deleted');
      syncData({ isSilent: true, fresh: true });
    } catch (e: any) {
      showToast('error', `Failed to delete report: ${e.message}`);
    }
  };

  const handleDeleteDayWisePhoto = async (id: string) => {
    try {
      showToast('info', 'Deleting photo from Database...', 'Deleting');
      await api.deleteDayWisePhoto(id);
      setDayWisePhotos(prev => prev.filter(p => p.id !== id));
      showToast('success', 'Photo removed from Cloud Storage & Database.', 'Deleted');
      syncData({ isSilent: true, fresh: true });
    } catch (e: any) {
      showToast('error', `Failed to delete photo: ${e.message}`, 'Delete Failed');
    }
  };

  // Render Landing Page immediately on open (0ms startup with zero blocking splash)
  if (showLanding) {
    return (
      <>
        <LandingPage
          appName={appName}
          appSettings={appSettings}
          projects={projects}
          isConnected={isConnected}
          onEnterDashboard={() => setShowLanding(false)}
          onOpenLogin={() => setLoginModalOpen(true)}
          onOpenMap={() => {
            setShowLanding(false);
            setActiveTab('map');
          }}
        />

        {/* Modals on Landing */}
        <CoordinatorLoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onLogin={handleLogin}
        />

        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-blue-600 selection:text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedProject(null);
        }}
        currentUser={currentUser}
        onOpenLogin={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        appName={appName}
        onReturnHome={() => setShowLanding(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          currentUser={currentUser}
          onOpenLogin={() => setLoginModalOpen(true)}
          onLogout={handleLogout}
          setMobileOpen={setMobileOpen}
          orgName={orgName}
          setOrgName={setOrgName}
          isConnected={isConnected}
          isSyncing={isSyncing}
          appName={appName}
          onReturnHome={() => setShowLanding(true)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 md:p-6 lg:p-8">
          <div className="max-w-7xl w-full mx-auto min-w-0">
            {selectedProject ? (
              <ProjectDetailView
                project={selectedProject}
                currentUser={currentUser}
                onBack={() => setSelectedProject(null)}
                executionStages={executionStages}
                materials={materials}
                manpower={manpower}
                documents={documents}
                photos={[]}
                dayWiseReports={dayWiseReports}
                dayWisePhotos={dayWisePhotos}
                stagePhotos={stagePhotos}
                siteUpdates={siteUpdates}
                approvals={approvals}
                onOpenAddApproval={() => setAddApprovalModalOpen(true)}
                onDeleteApproval={handleDeleteApproval}
                onOpenAddMaterial={() => setAddMaterialModalOpen(true)}
                onOpenAddDoc={() => setAddDocumentModalOpen(true)}
                onOpenAddDayWise={() => setAddDayWiseModalOpen(true)}
                onOpenAddUpdate={() => { }}
                onUpdateStageStatus={handleUpdateStageStatus}
                onToggleSubTask={handleToggleSubTask}
                onOpenEditProject={handleOpenEditProject}
                onDeleteMaterial={handleDeleteMaterial}
                onDeleteDocument={handleDeleteDocument}
                onDeleteDayWiseReport={handleDeleteDayWiseReport}
                onDeleteDayWisePhoto={handleDeleteDayWisePhoto}
                onUploadStagePhoto={handleUploadStagePhoto}
                onDeleteStagePhoto={handleDeleteStagePhoto}
                onOpenEditDayWiseReport={(report) => {
                  setReportToEdit(report);
                  setEditDayWiseModalOpen(true);
                }}
                onOpenAddStage={() => setAddStageModalOpen(true)}
                onOpenEditStage={(stage) => {
                  setStageToEdit(stage);
                  setEditStageModalOpen(true);
                }}
                onDeleteStage={handleDeleteStage}
                onOpenAddManpower={() => setAddManpowerModalOpen(true)}
                onOpenEditManpower={(mp) => {
                  setManpowerToEdit(mp);
                  setEditManpowerModalOpen(true);
                }}
                onDeleteManpower={handleDeleteManpower}
              />
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <DashboardView
                    projects={projects}
                    siteUpdates={siteUpdates}
                    setActiveTab={setActiveTab}
                    setSelectedStatusFilter={setSelectedStatusFilter}
                    setSelectedHealthFilter={setSelectedHealthFilter}
                    onSelectProject={setSelectedProject}
                  />
                )}

                {activeTab === 'projects' && (
                  <ProjectsView
                    projects={projects}
                    currentUser={currentUser}
                    onSelectProject={setSelectedProject}
                    onOpenAddProject={() => setAddProjectModalOpen(true)}
                    onOpenEditProject={handleOpenEditProject}
                    onDeleteProject={handleDeleteProject}
                    selectedStatusFilter={selectedStatusFilter}
                    setSelectedStatusFilter={setSelectedStatusFilter}
                    selectedHealthFilter={selectedHealthFilter}
                    setSelectedHealthFilter={setSelectedHealthFilter}
                  />
                )}

                {activeTab === 'map' && (
                  <MapView
                    projects={projects}
                    onSelectProject={setSelectedProject}
                  />
                )}

                {activeTab === 'execution' && (
                  <ExecutionView
                    projects={projects}
                    executionStages={executionStages}
                    currentUser={currentUser}
                    stagePhotos={stagePhotos}
                    onUpdateStageStatus={handleUpdateStageStatus}
                    onToggleSubTask={handleToggleSubTask}
                    onOpenAddStage={() => setAddStageModalOpen(true)}
                    onOpenEditStage={(stage) => {
                      setStageToEdit(stage);
                      setEditStageModalOpen(true);
                    }}
                    onDeleteStage={handleDeleteStage}
                    onUploadStagePhoto={handleUploadStagePhoto}
                    onDeleteStagePhoto={handleDeleteStagePhoto}
                  />
                )}

                {activeTab === 'reports' && (
                  <ReportsView
                    projects={projects}
                    materials={materials}
                    manpower={manpower}
                    approvals={approvals}
                  />
                )}

                {activeTab === 'approvals' && (
                  <ApprovalsView
                    approvals={approvals}
                    currentUser={currentUser}
                    onOpenAddApproval={() => setAddApprovalModalOpen(true)}
                    onUpdateApprovalStatus={handleUpdateApprovalStatus}
                    onDeleteApproval={handleDeleteApproval}
                  />
                )}

                {activeTab === 'documents' && (
                  <DocumentsView
                    documents={documents}
                    currentUser={currentUser}
                    onOpenAddDoc={() => setAddDocumentModalOpen(true)}
                    onDeleteDocument={handleDeleteDocument}
                  />
                )}

                {activeTab === 'settings' && (
                  <SettingsView
                    currentUser={currentUser}
                    onOpenLogin={() => setLoginModalOpen(true)}
                    onLogout={handleLogout}
                    onOpenAppsScriptModal={() => setAppsScriptModalOpen(true)}
                    isSyncing={isSyncing}
                    isConnected={isConnected}
                    lastSyncTime={lastSyncTime}
                    appName={appName}
                    appSettings={appSettings}
                    onUpdateAppSettings={handleUpdateAppSettings}
                    onUpdateAppName={(name) => setAppName(name)}
                    onUpdateCurrentUser={(u) => setCurrentUser(u)}
                    databaseMeta={databaseMeta}
                    onSwitchDatabase={handleSwitchDatabase}
                    onRefreshData={() => syncData({ isSilent: false, fresh: true })}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Floating Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Modals */}
      <CoordinatorLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={handleLogin}
      />

      <AppsScriptModal
        isOpen={appsScriptModalOpen}
        onClose={() => setAppsScriptModalOpen(false)}
      />

      <AddProjectModal
        isOpen={addProjectModalOpen}
        onClose={() => setAddProjectModalOpen(false)}
        onAdd={handleAddProject}
      />

      <EditProjectModal
        isOpen={editProjectModalOpen}
        onClose={() => {
          setEditProjectModalOpen(false);
          setProjectToEdit(null);
        }}
        project={projectToEdit}
        onUpdate={handleUpdateProject}
      />

      <AddApprovalModal
        isOpen={addApprovalModalOpen}
        onClose={() => setAddApprovalModalOpen(false)}
        projects={projects}
        onAdd={handleAddApproval}
      />

      {selectedProject && (
        <>
          <AddMaterialModal
            isOpen={addMaterialModalOpen}
            onClose={() => setAddMaterialModalOpen(false)}
            projectId={selectedProject.id}
            onAdd={handleAddMaterial}
          />

          <AddDayWiseReportAndPhotosModal
            isOpen={addDayWiseModalOpen}
            onClose={() => setAddDayWiseModalOpen(false)}
            project={selectedProject}
            currentUser={currentUser}
            onSuccess={handleAddDayWiseSuccess}
          />

          <AddManpowerModal
            isOpen={addManpowerModalOpen}
            onClose={() => setAddManpowerModalOpen(false)}
            projectId={selectedProject.id}
            onAdd={handleAddManpower}
          />
        </>
      )}

      {/* Daily Report Edit Modal */}
      <EditDayWiseReportModal
        isOpen={editDayWiseModalOpen}
        onClose={() => {
          setEditDayWiseModalOpen(false);
          setReportToEdit(null);
        }}
        report={reportToEdit}
        onUpdate={handleUpdateDayWiseReport}
      />

      {/* Execution Stage Modals */}
      <AddExecutionStageModal
        isOpen={addStageModalOpen}
        onClose={() => setAddStageModalOpen(false)}
        projectId={selectedProject?.id || projects[0]?.id || ''}
        onAdd={handleAddStage}
      />

      <EditExecutionStageModal
        isOpen={editStageModalOpen}
        onClose={() => {
          setEditStageModalOpen(false);
          setStageToEdit(null);
        }}
        stage={stageToEdit}
        onUpdate={handleUpdateStage}
      />

      {/* Manpower Edit Modal */}
      <EditManpowerModal
        isOpen={editManpowerModalOpen}
        onClose={() => {
          setEditManpowerModalOpen(false);
          setManpowerToEdit(null);
        }}
        manpowerItem={manpowerToEdit}
        onUpdate={handleUpdateManpower}
      />

      {/* Direct Cloud Document Upload Modal */}
      <AddDocumentModal
        isOpen={addDocumentModalOpen}
        onClose={() => setAddDocumentModalOpen(false)}
        projects={projects}
        preselectedProjectId={selectedProject?.id}
        onAdd={handleAddDocument}
      />

      {/* Global Floating WhatsApp Support Button Across All Pages */}
      <a
        href={sanitizeWhatsAppUrl(appSettings?.whatsappNumber || '919876543210')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact support on WhatsApp"
        className="fixed bottom-5 right-5 z-50 p-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center group cursor-pointer border-2 border-white/20"
        title="Chat with Execution Support on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold pl-0 group-hover:pl-2">
          WhatsApp Support
        </span>
      </a>
    </div>
  );
}
