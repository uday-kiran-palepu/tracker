import { 
  Project, DayWiseReport, DayWisePhoto, ExecutionStageItem, 
  MaterialItem, ManpowerItem, ApprovalItem, DocumentItem, User, AllDataResponse, AppSettings 
} from '../types';
import { 
  INITIAL_PROJECTS, INITIAL_DAY_WISE_REPORTS, INITIAL_DAY_WISE_PHOTOS,
  INITIAL_EXECUTION_STAGES, INITIAL_MATERIALS, INITIAL_MANPOWER,
  INITIAL_APPROVALS, INITIAL_DOCUMENTS, INITIAL_USERS 
} from '../data/seedData';
import { formatDate } from '../utils/date';

const STORAGE_KEYS = {
  DB_URL: 'uni_tracker_db_url',
  WEB_APP_URL: 'unitracker_webapp_url',
  PROJECTS: 'unitracker_projects',
  DAY_WISE_REPORTS: 'unitracker_day_wise_reports',
  DAY_WISE_PHOTOS: 'unitracker_day_wise_photos',
  EXECUTION_STAGES: 'unitracker_execution_stages',
  MATERIALS: 'unitracker_materials',
  MANPOWER: 'unitracker_manpower',
  APPROVALS: 'unitracker_approvals',
  DOCUMENTS: 'unitracker_documents',
  CURRENT_USER: 'unitracker_current_user',
  LAST_SYNC_TIME: 'unitracker_last_sync_time',
  APP_NAME: 'unitracker_app_name'
};

const DEFAULT_DB_URL = import.meta.env.VITE_APPS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbyZvYQnOg0eMvh8PUgCI2vCUL8kmfvb8rSlu0ASMtdwiDa7e5YNcFomf4vadDP8HNMfCg/exec";

export interface UploadPhotoPayload {
  projectId: string;
  projectName?: string;
  dayNumber: number;
  date: string;
  caption: string;
  fileName: string;
  mimeType: string;
  base64Data: string;
}

export interface UploadDocumentPayload {
  projectId: string;
  projectName?: string;
  title: string;
  category: string;
  uploadDate: string;
  fileName: string;
  mimeType: string;
  base64Data: string;
}

export const api = {
  /**
   * Dynamic App Name management
   */
  getAppName(): string {
    return localStorage.getItem(STORAGE_KEYS.APP_NAME) || 'Uni Tracker';
  },

  setAppName(name: string) {
    if (name && name.trim()) {
      localStorage.setItem(STORAGE_KEYS.APP_NAME, name.trim());
      document.title = `${name.trim()} - India Campus Expansion Tracker`;
    }
  },

  /**
   * Get the saved Database Web App URL from localStorage or permanent default
   */
  getScriptUrl(): string {
    return localStorage.getItem("uni_tracker_db_url") || localStorage.getItem(STORAGE_KEYS.WEB_APP_URL) || DEFAULT_DB_URL;
  },

  getWebAppUrl(): string {
    return this.getScriptUrl();
  },

  /**
   * Set and persist the Database Web App URL
   */
  setWebAppUrl(url: string) {
    if (url && url.trim()) {
      localStorage.setItem("uni_tracker_db_url", url.trim());
      localStorage.setItem(STORAGE_KEYS.WEB_APP_URL, url.trim());
    } else {
      localStorage.removeItem("uni_tracker_db_url");
      localStorage.removeItem(STORAGE_KEYS.WEB_APP_URL);
    }
  },

  setScriptUrl(url: string) {
    this.setWebAppUrl(url);
  },

  /**
   * Reset to permanent default database URL and wipe custom override
   */
  resetToDefaultDbUrl(): string {
    localStorage.removeItem("uni_tracker_db_url");
    localStorage.removeItem(STORAGE_KEYS.WEB_APP_URL);
    this.clearCache();
    return DEFAULT_DB_URL;
  },

  getDefaultDbUrl(): string {
    return DEFAULT_DB_URL;
  },

  /**
   * Clear all cached table data when connecting to a new database
   */
  clearCache() {
    const tableKeys = [
      STORAGE_KEYS.PROJECTS,
      STORAGE_KEYS.DAY_WISE_REPORTS,
      STORAGE_KEYS.DAY_WISE_PHOTOS,
      STORAGE_KEYS.EXECUTION_STAGES,
      STORAGE_KEYS.MATERIALS,
      STORAGE_KEYS.MANPOWER,
      STORAGE_KEYS.APPROVALS,
      STORAGE_KEYS.DOCUMENTS
    ];
    tableKeys.forEach(k => localStorage.removeItem(k));
  },

  /**
   * Whether a custom Web App URL is configured
   */
  isConfigured(): boolean {
    return Boolean(this.getWebAppUrl());
  },

  /**
   * Get last sync timestamp
   */
  getLastSyncTime(): string {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME) || '';
  },

  setLastSyncTime(timestamp: string) {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, timestamp);
  },

  /**
   * Current user session management
   */
  getCurrentUser(): User {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { /* ignore */ }
    }
    return INITIAL_USERS[1]; // default viewer
  },

  setCurrentUser(user: User) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  logoutUser() {
    this.setCurrentUser(INITIAL_USERS[1]);
  },

  /**
   * Helper to make CORS-safe POST requests to the Database backend.
   * Sending 'text/plain;charset=utf-8' prevents browsers from issuing
   * an OPTIONS preflight request.
   */
  async postToScript<T>(payload: any): Promise<T> {
    const url = this.getWebAppUrl();
    if (!url) {
      throw new Error('No Database Web App URL configured.');
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    return json as T;
  },

  /**
   * 1. fetchAllData() (GET to Script URL):
   * returns { status: "success", data: { Projects, DayWiseReports, DayWisePhotos, ExecutionStages, Materials, Manpower, Approvals, Documents, AppSettings } }
   */
  async fetchAllData(): Promise<AllDataResponse> {
    const url = this.getWebAppUrl();

    // If live URL is set, fetch directly from live Database
    if (url) {
      try {
        const response = await fetch(url, { method: 'GET' });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const result = await response.json();

        if (result.status === 'success' && result.data) {
          const d = result.data;
          const parsedStages: ExecutionStageItem[] = (d.ExecutionStages || []).map((stage: any) => {
            let subTasks = stage.subTasks;
            if (!subTasks && stage.subTasksJson) {
              try { subTasks = JSON.parse(stage.subTasksJson); } catch (e) { subTasks = []; }
            }
            return {
              ...stage,
              stageNumber: Number(stage.stageNumber) || 1,
              progress: Number(stage.progress) || 0,
              subTasks: subTasks || []
            };
          });

          const normalizedData: AllDataResponse = {
            Projects: (d.Projects || []).map((p: any) => {
              const bAlloc = p.budgetAllocated !== undefined && p.budgetAllocated !== '' 
                ? Number(p.budgetAllocated) 
                : (p.budget ? (parseFloat(String(p.budget).replace(/[^0-9.]/g, '')) * 10000000 || 24000000) : 25000000);
              const bSpent = p.budgetSpent !== undefined && p.budgetSpent !== '' 
                ? Number(p.budgetSpent) 
                : (p.spent ? (parseFloat(String(p.spent).replace(/[^0-9.]/g, '')) * 10000000 || 17200000) : 15000000);

              const formattedStart = formatDate(p.startDate, 'input') || '2026-01-15';
              const formattedTarget = formatDate(p.targetDate || p.targetHandover, 'input') || '2026-12-31';

              return {
                ...p,
                code: p.labCode || p.code || p.id,
                labCode: p.labCode || p.code || p.id,
                areaSft: Number(p.areaSft) || 0,
                progress: Number(p.progress) || 0,
                lat: Number(p.lat) || 17.3850,
                lng: Number(p.lng) || 78.4867,
                mapsUrl: p.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${Number(p.lat) || 17.3850},${Number(p.lng) || 78.4867}`,
                budgetAllocated: bAlloc,
                budgetSpent: bSpent,
                civilProgress: Number(p.civilProgress) || 0,
                mepProgress: Number(p.mepProgress) || 0,
                furnitureProgress: Number(p.furnitureProgress) || 0,
                brandingProgress: Number(p.brandingProgress) || 0,
                heroImageUrl: p.heroImageUrl || p.heroImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
                heroImage: p.heroImageUrl || p.heroImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
                startDate: formattedStart,
                targetDate: formattedTarget,
                targetHandover: formattedTarget
              };
            }),
            DayWiseReports: (d.DayWiseReports || []).map((r: any) => ({
              ...r,
              dayNumber: Number(r.dayNumber) || 1,
              date: formatDate(r.date, 'input') || r.date,
              workersCount: Number(r.workersCount) || 0
            })),
            DayWisePhotos: (d.DayWisePhotos || []).map((ph: any) => ({
              ...ph,
              dayNumber: Number(ph.dayNumber) || 1,
              date: formatDate(ph.date, 'input') || ph.date
            })),
            ExecutionStages: parsedStages,
            Materials: (d.Materials || []).map((m: any) => ({
              ...m,
              itemName: m.itemName || m.name || '',
              name: m.itemName || m.name || '',
              requiredQty: m.requiredQty ?? '',
              deliveredQty: m.deliveredQty ?? '',
              unit: m.unit || 'units'
            })),
            Manpower: (d.Manpower || []).map((mp: any) => ({
              ...mp,
              date: formatDate(mp.date, 'input') || mp.date,
              workerCount: Number(mp.workerCount ?? mp.count) || 0,
              count: Number(mp.workerCount ?? mp.count) || 0
            })),
            Approvals: (d.Approvals || []).map((a: any) => ({
              ...a,
              requestedDate: formatDate(a.requestedDate, 'input') || a.requestedDate,
              approvalName: a.approvalName || a.name || '',
              name: a.approvalName || a.name || '',
              documentUrl: a.documentUrl || a.link || '',
              link: a.documentUrl || a.link || ''
            })),
            Documents: (d.Documents || []).map((doc: any) => ({
              ...doc,
              uploadDate: formatDate(doc.uploadDate, 'input') || doc.uploadDate,
              documentUrl: doc.documentUrl || doc.url || '',
              url: doc.documentUrl || doc.url || ''
            }))
          };

          if (d.AppSettings?.appName) {
            this.setAppName(d.AppSettings.appName);
          }

          // Cache in local storage for fast startup / offline availability
          this.cacheLocalData(normalizedData);
          this.setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

          return normalizedData;
        } else {
          throw new Error(result.message || 'Failed to parse data from Database');
        }
      } catch (err) {
        console.warn('Live fetch failed, falling back to local cached storage / seed data:', err);
      }
    }

    // Demo Mode / Offline Fallback
    return this.getLocalCachedData();
  },

  /**
   * 2. createRecord(sheetName, data) (POST):
   * { action: "create", sheetName, data }
   */
  async createRecord(sheetName: string, data: any): Promise<{ status: string; message?: string; data?: any }> {
    if (this.isConfigured()) {
      try {
        const res = await this.postToScript<{ status: string; message?: string; data?: any }>({
          action: 'create',
          sheetName,
          data
        });
        return res;
      } catch (e: any) {
        console.error(`Failed to create record in ${sheetName}:`, e);
        throw e;
      }
    }

    // Fallback: local simulation
    return { status: 'success', message: 'Saved locally in Demo Mode', data };
  },

  /**
   * 3. updateRecord(sheetName, id, data) (POST):
   * { action: "update", sheetName, id, data }
   */
  async updateRecord(sheetName: string, id: string, data: any): Promise<{ status: string; message?: string }> {
    if (this.isConfigured()) {
      try {
        const res = await this.postToScript<{ status: string; message?: string }>({
          action: 'update',
          sheetName,
          id,
          data
        });
        return res;
      } catch (e: any) {
        console.error(`Failed to update record in ${sheetName}:`, e);
        throw e;
      }
    }

    // Fallback: local simulation
    return { status: 'success', message: 'Updated locally in Demo Mode' };
  },

  /**
   * 4. deleteRecord(sheetName, id) (POST):
   * { action: "delete", sheetName, id }
   */
  async deleteRecord(sheetName: string, id: string): Promise<{ status: string; message?: string }> {
    if (this.isConfigured()) {
      try {
        const res = await this.postToScript<{ status: string; message?: string }>({
          action: 'delete',
          sheetName,
          id
        });
        return res;
      } catch (e: any) {
        console.error(`Failed to delete record in ${sheetName}:`, e);
        throw e;
      }
    }

    // Fallback: local simulation
    return { status: 'success', message: 'Deleted locally in Demo Mode' };
  },

  /**
   * 5. loginCoordinator(username, password) (POST):
   * { action: "login", username, password } -> returns { status: "success", user: { username, name, role } }
   */
  async loginCoordinator(username: string, password: string): Promise<{ status: string; user?: User; message?: string }> {
    if (this.isConfigured()) {
      try {
        const res = await this.postToScript<{ status: string; user?: any; message?: string }>({
          action: 'login',
          username,
          password
        });

        if (res.status === 'success' && res.user) {
          const userObj: User = {
            id: res.user.id || 'u-coord',
            email: res.user.email || `${res.user.username || 'coordinator'}@unitracker.com`,
            name: res.user.name || 'Charan Sai',
            role: (res.user.role as any) || 'Project Coordinator',
            username: res.user.username || username,
            avatar: res.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          };
          this.setCurrentUser(userObj);
          return { status: 'success', user: userObj };
        } else {
          return { status: 'error', message: res.message || 'Invalid username or password' };
        }
      } catch (err: any) {
        console.warn('Remote login failed, trying fallback check:', err);
      }
    }

    // Fallback when no Script URL or script login not configured:
    // Accept coordinator / admin123
    if (
      (username === 'coordinator' || username === 'coordinator@unitracker.com') &&
      (password === 'admin123' || password === 'admin')
    ) {
      const fallbackUser: User = {
        id: 'u1',
        email: 'coordinator@unitracker.com',
        username: 'coordinator',
        name: 'Charan Sai',
        role: 'Project Coordinator',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };
      this.setCurrentUser(fallbackUser);
      return { status: 'success', user: fallbackUser };
    }

    return { status: 'error', message: 'Invalid credentials. Use coordinator / admin123' };
  },

  /**
   * Verify password before sensitive operations (e.g. changing Database URL)
   */
  async verifyPassword(username: string, password: string): Promise<boolean> {
    if (this.isConfigured()) {
      try {
        const res = await this.postToScript<{ status: string; message?: string }>({
          action: 'verifyPassword',
          username,
          password
        });
        if (res && res.status === 'success') return true;
      } catch (e) {
        console.warn('Remote verifyPassword failed, falling back to local check:', e);
      }
    }

    // Demo Mode / fallback verification
    if (password === 'admin123' || password === 'admin') {
      return true;
    }
    return false;
  },

  /**
   * Update App Settings (e.g. App Name)
   */
  async updateAppSettings(settings: { appName: string }): Promise<void> {
    this.setAppName(settings.appName);
    if (this.isConfigured()) {
      try {
        await this.postToScript({
          action: 'updateAppSettings',
          settings
        });
      } catch (e) {
        console.warn('Failed to sync app settings to database:', e);
      }
    }
  },

  /**
   * Update User Profile (Username, Display Name, Role)
   */
  async updateUser(payload: { id?: string; currentUsername?: string; username: string; name: string; role: 'Project Coordinator' | 'Viewer' }): Promise<User> {
    const current = this.getCurrentUser();
    const updatedUser: User = {
      ...current,
      id: payload.id || current.id,
      username: payload.username,
      name: payload.name,
      role: payload.role,
      email: `${payload.username}@unitracker.com`
    };

    this.setCurrentUser(updatedUser);

    if (this.isConfigured()) {
      try {
        await this.postToScript({
          action: 'updateUser',
          ...payload
        });
      } catch (e) {
        console.warn('Failed to sync user updates to database:', e);
      }
    }

    return updatedUser;
  },

  /**
   * 6. uploadDayWisePhoto(payload) (POST):
   * { action: "uploadPhoto", projectId, projectName, dayNumber, date, caption, fileName, mimeType, base64Data }
   * -> returns { status: "success", data: { id, projectId, dayNumber, date, caption, driveFileId, imageUrl } }
   */
  async uploadDayWisePhoto(payload: UploadPhotoPayload): Promise<{ status: string; data?: DayWisePhoto; message?: string }> {
    if (this.isConfigured()) {
      try {
        const res = await this.postToScript<{ status: string; data?: any; message?: string }>({
          action: 'uploadPhoto',
          ...payload
        });

        if (res.status === 'success' && res.data) {
          return {
            status: 'success',
            data: {
              id: res.data.id || `photo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              projectId: payload.projectId,
              dayNumber: payload.dayNumber,
              date: formatDate(payload.date, 'input') || payload.date,
              caption: payload.caption || '',
              driveFileId: res.data.driveFileId || '',
              imageUrl: res.data.imageUrl || ''
            }
          };
        } else {
          throw new Error(res.message || 'Upload failed on Database Apps Script');
        }
      } catch (err: any) {
        console.error('Remote photo upload error:', err);
        throw err;
      }
    }

    // Demo Mode Fallback:
    // Create local photo with base64 data URL
    const demoPhoto: DayWisePhoto = {
      id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      projectId: payload.projectId,
      dayNumber: payload.dayNumber,
      date: formatDate(payload.date, 'input') || payload.date,
      caption: payload.caption || '',
      driveFileId: 'demo-local-file',
      imageUrl: payload.base64Data.startsWith('data:') 
        ? payload.base64Data 
        : `data:${payload.mimeType || 'image/jpeg'};base64,${payload.base64Data}`
    };

    return { status: 'success', data: demoPhoto };
  },

  /**
   * 7. uploadDocument(payload) (POST):
   * Direct document upload without requiring manual link entry
   */
  async uploadDocument(payload: UploadDocumentPayload): Promise<{ status: string; data?: DocumentItem; message?: string }> {
    const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const formattedDate = formatDate(payload.uploadDate, 'input') || formatDate(new Date(), 'input');

    if (this.isConfigured()) {
      try {
        const res = await this.postToScript<{ status: string; data?: any; message?: string }>({
          action: 'uploadDocument',
          ...payload,
          uploadDate: formattedDate
        });

        if (res.status === 'success' && res.data) {
          return {
            status: 'success',
            data: {
              id: res.data.id || docId,
              projectId: payload.projectId,
              projectName: payload.projectName,
              title: payload.title,
              category: payload.category,
              uploadDate: formattedDate,
              documentUrl: res.data.documentUrl || res.data.url || ''
            }
          };
        } else {
          throw new Error(res.message || 'Document upload failed on Database Apps Script');
        }
      } catch (err: any) {
        console.error('Remote document upload error:', err);
        throw err;
      }
    }

    // Demo Mode Fallback:
    const dataUrl = payload.base64Data.startsWith('data:')
      ? payload.base64Data
      : `data:${payload.mimeType || 'application/pdf'};base64,${payload.base64Data}`;

    const demoDoc: DocumentItem = {
      id: docId,
      projectId: payload.projectId,
      projectName: payload.projectName,
      title: payload.title,
      category: payload.category,
      uploadDate: formattedDate,
      documentUrl: dataUrl,
      url: dataUrl
    };

    return { status: 'success', data: demoDoc };
  },

  /**
   * Cache full data in localStorage
   */
  cacheLocalData(data: AllDataResponse) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data.Projects));
      localStorage.setItem(STORAGE_KEYS.DAY_WISE_REPORTS, JSON.stringify(data.DayWiseReports));
      localStorage.setItem(STORAGE_KEYS.DAY_WISE_PHOTOS, JSON.stringify(data.DayWisePhotos));
      localStorage.setItem(STORAGE_KEYS.EXECUTION_STAGES, JSON.stringify(data.ExecutionStages));
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(data.Materials));
      localStorage.setItem(STORAGE_KEYS.MANPOWER, JSON.stringify(data.Manpower));
      localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(data.Approvals));
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(data.Documents));
    } catch (e) {
      console.warn('LocalStorage quota or write error:', e);
    }
  },

  /**
   * Retrieve cached data from localStorage or seed fallback
   */
  getLocalCachedData(): AllDataResponse {
    const getCached = <T>(key: string, initial: T): T => {
      const stored = localStorage.getItem(key);
      if (stored) {
        try { return JSON.parse(stored); } catch (e) { /* ignore */ }
      }
      return initial;
    };

    return {
      Projects: getCached(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS),
      DayWiseReports: getCached(STORAGE_KEYS.DAY_WISE_REPORTS, INITIAL_DAY_WISE_REPORTS),
      DayWisePhotos: getCached(STORAGE_KEYS.DAY_WISE_PHOTOS, INITIAL_DAY_WISE_PHOTOS),
      ExecutionStages: getCached(STORAGE_KEYS.EXECUTION_STAGES, INITIAL_EXECUTION_STAGES),
      Materials: getCached(STORAGE_KEYS.MATERIALS, INITIAL_MATERIALS),
      Manpower: getCached(STORAGE_KEYS.MANPOWER, INITIAL_MANPOWER),
      Approvals: getCached(STORAGE_KEYS.APPROVALS, INITIAL_APPROVALS),
      Documents: getCached(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS)
    };
  },

  /**
   * Factory reset all local storage back to seed defaults
   */
  resetToSeedData() {
    Object.values(STORAGE_KEYS).forEach(k => {
      if (k !== STORAGE_KEYS.WEB_APP_URL) {
        localStorage.removeItem(k);
      }
    });
    window.location.reload();
  }
};
