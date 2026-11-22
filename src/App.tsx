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

import { 
  Project, ExecutionStageItem, MaterialItem, ManpowerItem, ApprovalItem, 
  DocumentItem, PhotoItem, SiteUpdateItem, User, DayWiseReport, DayWisePhoto 
} from './types';
import { api } from './services/api';
import { INITIAL_SITE_UPDATES } from './data/seedData';

export default function App() {
  // Navigation & Landing View State
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [appName, setAppName] = useState<string>(() => api.getAppName());
  const [currentUser, setCurrentUser] = useState<User>(api.getCurrentUser());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [orgName, setOrgName] = useState('NxtWave (Flagship)');

  // Live Backend & Sync State
  const [isConnected, setIsConnected] = useState<boolean>(api.isConfigured());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(api.getLastSyncTime());

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((type: 'success' | 'error' | 'info', message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync document title with dynamic appName
  useEffect(() => {
    document.title = `${appName} - Real-Time Campus Execution Tracker`;
  }, [appName]);

  // Main 8 Database Tables State
  const cached = api.getLocalCachedData();
  const [projects, setProjects] = useState<Project[]>(cached.Projects);
  const [dayWiseReports, setDayWiseReports] = useState<DayWiseReport[]>(cached.DayWiseReports);
  const [dayWisePhotos, setDayWisePhotos] = useState<DayWisePhoto[]>(cached.DayWisePhotos);
  const [executionStages, setExecutionStages] = useState<ExecutionStageItem[]>(cached.ExecutionStages);
  const [materials, setMaterials] = useState<MaterialItem[]>(cached.Materials);
  const [manpower, setManpower] = useState<ManpowerItem[]>(cached.Manpower);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(cached.Approvals);
  const [documents, setDocuments] = useState<DocumentItem[]>(cached.Documents);

  // Retain siteUpdates feed
  const [siteUpdates, setSiteUpdates] = useState<SiteUpdateItem[]>(() => {
    const stored = localStorage.getItem('unitracker_site_updates');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { /* ignore */ }
    }
    return INITIAL_SITE_UPDATES;
  });

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

  // Startup: Load and sync live data from Cloud Database if configured
  useEffect(() => {
    const loadData = async () => {
      setIsSyncing(true);
      try {
        const result = await api.fetchAllData();
        setProjects(result.Projects);
        setDayWiseReports(result.DayWiseReports);
        setDayWisePhotos(result.DayWisePhotos);
        setExecutionStages(result.ExecutionStages);
        setMaterials(result.Materials);
        setManpower(result.Manpower);
        setApprovals(result.Approvals);
        setDocuments(result.Documents);

        setIsConnected(api.isConfigured());
        setLastSyncTime(api.getLastSyncTime());
        setAppName(api.getAppName());

        if (api.isConfigured()) {
          showToast('success', 'Connected and synced with Cloud Database.', 'Live Backend Active');
        }
      } catch (err: any) {
        console.warn('Initial live sync error:', err);
        showToast('info', 'Loaded from local cache. (Demo Mode)', 'System Ready');
      } finally {
        setIsSyncing(false);
      }
    };

    loadData();
  }, [showToast]);

  // Save changes to local storage when state updates
  useEffect(() => {
    api.cacheLocalData({
      Projects: projects,
      DayWiseReports: dayWiseReports,
      DayWisePhotos: dayWisePhotos,
      ExecutionStages: executionStages,
      Materials: materials,
      Manpower: manpower,
      Approvals: approvals,
      Documents: documents
    });
  }, [projects, dayWiseReports, dayWisePhotos, executionStages, materials, manpower, approvals, documents]);

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

  // Backend Save & Sync Now Handler (from Settings)
  const handleSaveAndSync = async (newUrl: string): Promise<boolean> => {
    setIsSyncing(true);
    api.setWebAppUrl(newUrl);

    try {
      const result = await api.fetchAllData();
      setProjects(result.Projects);
      setDayWiseReports(result.DayWiseReports);
      setDayWisePhotos(result.DayWisePhotos);
      setExecutionStages(result.ExecutionStages);
      setMaterials(result.Materials);
      setManpower(result.Manpower);
      setApprovals(result.Approvals);
      setDocuments(result.Documents);

      setIsConnected(true);
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(nowTime);

      showToast('success', 'Synced all campuses, reports, and files from Cloud Database!', 'Database Connected');
      return true;
    } catch (err: any) {
      showToast('error', err.message || 'Failed to connect to Database Web App', 'Connection Error');
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // CRUD: Projects
  const handleAddProject = async (newProj: Project) => {
    const updated = [newProj, ...projects];
    setProjects(updated);
    showToast('info', 'Saving campus to Database...', 'Adding Project');

    try {
      await api.createRecord('Projects', newProj);
      showToast('success', `Campus "${newProj.name}" created and synced to Database!`, 'Saved to Database');
    } catch (e: any) {
      showToast('error', `Failed to sync project to Database: ${e.message}`);
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
      await api.updateRecord('Projects', updatedProj.id, updatedProj);
      showToast('success', `Campus "${updatedProj.name}" updated successfully!`, 'Saved to Database');
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
    } catch (e: any) {
      showToast('error', `Failed to add material: ${e.message}`);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
    try {
      await api.deleteRecord('Materials', id);
      showToast('success', 'Material removed from Database.', 'Deleted');
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
    } catch (e: any) {
      showToast('error', `Failed to add document: ${e.message}`);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
    try {
      await api.deleteRecord('Documents', id);
      showToast('success', 'Document removed from Database.', 'Deleted');
    } catch (e: any) {
      showToast('error', `Failed to delete document: ${e.message}`);
    }
  };

  // CRUD: Day-Wise Reports & Photos
  const handleAddDayWiseSuccess = (newReport: DayWiseReport, newPhotos: DayWisePhoto[]) => {
    setDayWiseReports([newReport, ...dayWiseReports]);
    if (newPhotos.length > 0) {
      setDayWisePhotos([...newPhotos, ...dayWisePhotos]);
    }
    showToast('success', `Day ${newReport.dayNumber} report and ${newPhotos.length} photos uploaded to Cloud Storage & Database!`, 'Upload Complete');
  };

  const handleUpdateDayWiseReport = async (updatedReport: DayWiseReport) => {
    setDayWiseReports(dayWiseReports.map(r => r.id === updatedReport.id ? updatedReport : r));
    showToast('info', 'Saving daily report changes...', 'Updating Report');
    try {
      await api.updateRecord('DayWiseReports', updatedReport.id, updatedReport);
      showToast('success', `Day ${updatedReport.dayNumber} report updated!`, 'Saved to Database');
    } catch (e: any) {
      showToast('error', `Failed to update report: ${e.message}`);
    }
  };

  const handleDeleteDayWiseReport = async (id: string) => {
    setDayWiseReports(dayWiseReports.filter(r => r.id !== id));
    try {
      await api.deleteRecord('DayWiseReports', id);
      showToast('success', 'Daily Report removed from Database.', 'Deleted');
    } catch (e: any) {
      showToast('error', `Failed to delete report: ${e.message}`);
    }
  };

  const handleDeleteDayWisePhoto = async (id: string) => {
    setDayWisePhotos(dayWisePhotos.filter(p => p.id !== id));
    try {
      await api.deleteRecord('DayWisePhotos', id);
      showToast('success', 'Photo removed from Cloud Storage & Database.', 'Deleted');
    } catch (e: any) {
      showToast('error', `Failed to delete photo: ${e.message}`);
    }
  };

  // If initial landing screen is visible, render Full-Screen Landing Homepage
  if (showLanding) {
    return (
      <>
        <LandingPage
          appName={appName}
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
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
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

      {/* Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
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

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
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
              siteUpdates={siteUpdates}
              onOpenAddMaterial={() => setAddMaterialModalOpen(true)}
              onOpenAddDoc={() => setAddDocumentModalOpen(true)}
              onOpenAddDayWise={() => setAddDayWiseModalOpen(true)}
              onOpenAddUpdate={() => {}}
              onUpdateStageStatus={handleUpdateStageStatus}
              onToggleSubTask={handleToggleSubTask}
              onOpenEditProject={handleOpenEditProject}
              onDeleteMaterial={handleDeleteMaterial}
              onDeleteDocument={handleDeleteDocument}
              onDeleteDayWiseReport={handleDeleteDayWiseReport}
              onDeleteDayWisePhoto={handleDeleteDayWisePhoto}
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
                  onUpdateStageStatus={handleUpdateStageStatus}
                  onToggleSubTask={handleToggleSubTask}
                  onOpenAddStage={() => setAddStageModalOpen(true)}
                  onOpenEditStage={(stage) => {
                    setStageToEdit(stage);
                    setEditStageModalOpen(true);
                  }}
                  onDeleteStage={handleDeleteStage}
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
                  onSaveAndSync={handleSaveAndSync}
                  isSyncing={isSyncing}
                  isConnected={isConnected}
                  lastSyncTime={lastSyncTime}
                  appName={appName}
                  onUpdateAppName={(name) => setAppName(name)}
                  onUpdateCurrentUser={(u) => setCurrentUser(u)}
                />
              )}
            </>
          )}
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
    </div>
  );
}
