import { 
  Project, DayWiseReport, DayWisePhoto, ExecutionStageItem, 
  MaterialItem, ManpowerItem, ApprovalItem, DocumentItem, User, AllDataResponse, AppSettings, DatabaseMeta 
} from '../types';
import { formatDate } from '../utils/date';
import { INITIAL_USERS } from '../data/seedData';

export const PERMANENT_DB_URL = "https://script.google.com/macros/s/AKfycbyZvYQnOg0eMvh8PUgCI2vCUL8kmfvb8rSlu0ASMtdwiDa7e5YNcFomf4vadDP8HNMfCg/exec";

const SWR_CACHE_KEY = 'uni_tracker_live_cache';

const STORAGE_KEYS = {
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
  APP_NAME: 'unitracker_app_name',
  APP_SETTINGS: 'unitracker_app_settings',
  DATABASE_META: 'unitracker_db_meta'
};

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
   * Permanent backend endpoint
   */
  getPermanentDbUrl(): string {
    return PERMANENT_DB_URL;
  },

  getWebAppUrl(): string {
    return PERMANENT_DB_URL;
  },

  getScriptUrl(): string {
    return PERMANENT_DB_URL;
  },

  setWebAppUrl(_url: string) {
    // Permanent URL is locked to PERMANENT_DB_URL
  },

  setScriptUrl(_url: string) {
    // Permanent URL is locked to PERMANENT_DB_URL
  },

  isConfigured(): boolean {
    return true;
  },

  /**
   * Dynamic App Settings & Name management
   */
  getAppSettings(): AppSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed) {
          return {
            appName: parsed.appName != null ? String(parsed.appName) : 'Project Portal',
            whatsappNumber: parsed.whatsappNumber != null ? String(parsed.whatsappNumber) : '',
            heroVideoUrl: parsed.heroVideoUrl != null ? String(parsed.heroVideoUrl) : ''
          };
        }
      }
    } catch (e) {}
    const live = this.getLiveCache();
    if (live?.AppSettings) {
      return {
        appName: live.AppSettings.appName != null ? String(live.AppSettings.appName) : 'Project Portal',
        whatsappNumber: live.AppSettings.whatsappNumber != null ? String(live.AppSettings.whatsappNumber) : '',
        heroVideoUrl: live.AppSettings.heroVideoUrl != null ? String(live.AppSettings.heroVideoUrl) : ''
      };
    }
    return {
      appName: localStorage.getItem(STORAGE_KEYS.APP_NAME) || 'Project Portal',
      whatsappNumber: '',
      heroVideoUrl: ''
    };
  },

  setAppSettings(settings: AppSettings) {
    try {
      const normalized: AppSettings = {
        appName: settings?.appName != null ? String(settings.appName) : 'Project Portal',
        whatsappNumber: settings?.whatsappNumber != null ? String(settings.whatsappNumber) : '',
        heroVideoUrl: settings?.heroVideoUrl != null ? String(settings.heroVideoUrl) : ''
      };
      localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(normalized));
      if (normalized.appName) {
        this.setAppName(normalized.appName);
      }
    } catch (e) {}
  },

  getAppName(): string {
    const settings = this.getAppSettings();
    return settings.appName || localStorage.getItem(STORAGE_KEYS.APP_NAME) || 'Project Portal';
  },

  setAppName(name: string) {
    if (name && name.trim()) {
      localStorage.setItem(STORAGE_KEYS.APP_NAME, name.trim());
      document.title = name.trim();
    }
  },

  /**
   * SWR (Stale-While-Revalidate) Cache Access
   */
  getLiveCache(): AllDataResponse | null {
    try {
      const raw = localStorage.getItem(SWR_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.Projects) && parsed.Projects.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse SWR cache:', e);
    }
    return null;
  },

  setLiveCache(data: AllDataResponse) {
    try {
      localStorage.setItem(SWR_CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save SWR cache:', e);
    }
  },

  /**
   * Clear all cached table data
   */
  clearCache() {
    const tableKeys = [
      SWR_CACHE_KEY,
      STORAGE_KEYS.PROJECTS,
      STORAGE_KEYS.DAY_WISE_REPORTS,
      STORAGE_KEYS.DAY_WISE_PHOTOS,
      STORAGE_KEYS.EXECUTION_STAGES,
      STORAGE_KEYS.MATERIALS,
      STORAGE_KEYS.MANPOWER,
      STORAGE_KEYS.APPROVALS,
      STORAGE_KEYS.DOCUMENTS,
      STORAGE_KEYS.DATABASE_META
    ];
    tableKeys.forEach(k => localStorage.removeItem(k));
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
   * Helper to make CORS-safe POST requests to the permanent Database backend.
   * Sending 'text/plain;charset=utf-8' prevents browsers from issuing
   * an OPTIONS preflight request.
   */
  async postToScript<T>(payload: any): Promise<T> {
    const response = await fetch(PERMANENT_DB_URL, {
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
   * 1. fetchAllData() (GET to permanent endpoint):
   * Pass ?fresh=1 only on manual sync or after mutations; otherwise fetch directly
   * so backend cache responds in <1s.
   */
  async fetchAllData(options?: { fresh?: boolean }): Promise<AllDataResponse> {
    const fetchUrl = options?.fresh ? `${PERMANENT_DB_URL}?fresh=1` : PERMANENT_DB_URL;
    const response = await fetch(fetchUrl, { 
      method: 'GET',
      redirect: 'follow'
    });

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
        })),
        DatabaseMeta: d.DatabaseMeta || {
          name: d.DatabaseMeta?.name || 'Main Execution Database',
          sheetUrl: d.DatabaseMeta?.sheetUrl || ''
        },
        AppSettings: {
          appName: d.AppSettings?.appName != null ? String(d.AppSettings.appName) : this.getAppName(),
          whatsappNumber: d.AppSettings?.whatsappNumber != null ? String(d.AppSettings.whatsappNumber) : '',
          heroVideoUrl: d.AppSettings?.heroVideoUrl != null ? String(d.AppSettings.heroVideoUrl) : ''
        }
      };

      if (d.AppSettings) {
        this.setAppSettings(normalizedData.AppSettings);
      }

      // Cache in SWR storage and local state
      this.setLiveCache(normalizedData);
      this.cacheLocalData(normalizedData);
      this.setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      return normalizedData;
    } else {
      throw new Error(result.message || 'Failed to parse data from Database');
    }
  },

  /**
   * Switch Active Database globally (Coordinator only)
   */
  async switchGlobalDatabase(sheetUrl: string, username: string, password: string): Promise<{ status: string; message?: string; databaseName?: string }> {
    const res = await this.postToScript<{ status: string; message?: string; databaseName?: string }>({
      action: 'switchDatabase',
      sheetUrl: sheetUrl.trim(),
      username: username.trim(),
      password: password.trim()
    });
    return res;
  },

  /**
   * 2. createRecord(sheetName, data) (POST):
   * { action: "create", sheetName, data }
   */
  async createRecord(sheetName: string, data: any): Promise<{ status: string; message?: string; data?: any }> {
    return this.postToScript<{ status: string; message?: string; data?: any }>({
      action: 'create',
      sheetName,
      data
    });
  },

  /**
   * 3. updateRecord(sheetName, id, data) (POST):
   * { action: "update", sheetName, id, data }
   */
  async updateRecord(sheetName: string, id: string, data: any): Promise<{ status: string; message?: string }> {
    return this.postToScript<{ status: string; message?: string }>({
      action: 'update',
      sheetName,
      id,
      data
    });
  },

  /**
   * 4. deleteRecord(sheetName, id) (POST):
   * { action: "delete", sheetName, id }
   */
  async deleteRecord(sheetName: string, id: string): Promise<{ status: string; message?: string }> {
    return this.postToScript<{ status: string; message?: string }>({
      action: 'delete',
      sheetName,
      id
    });
  },

  /**
   * 5. loginCoordinator(username, password) (POST):
   * { action: "login", username, password }
   */
  async loginCoordinator(username: string, password: string): Promise<{ status: string; user?: User; message?: string }> {
    try {
      const res = await this.postToScript<{ status: string; user?: any; message?: string }>({
        action: 'login',
        username: username.trim(),
        password: password.trim()
      });

      if (res && res.status === 'success' && res.user) {
        const u: User = {
          id: res.user.id || 'u-coord',
          email: res.user.email || `${res.user.username || 'coordinator'}@unitracker.com`,
          username: res.user.username || 'coordinator',
          name: res.user.name || 'Coordinator',
          role: (res.user.role === 'Project Coordinator' || res.user.role === 'Coordinator') ? 'Project Coordinator' : 'Viewer',
          avatar: res.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        };
        this.setCurrentUser(u);
        return { status: 'success', user: u };
      }
      return { status: 'error', message: res.message || 'Invalid credentials' };
    } catch (e: any) {
      console.warn('Remote login call failed, trying fallback check:', e);
    }

    // Offline / Fallback check for coordinator credentials
    if ((username === 'coordinator' || username === 'coordinator@unitracker.com') && (password === 'admin123' || password === 'admin')) {
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
   * Verify password before sensitive operations
   */
  async verifyPassword(username: string, password: string): Promise<boolean> {
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

    if (password === 'admin123' || password === 'admin') {
      return true;
    }
    return false;
  },

  /**
   * Update App Settings (e.g. App Name, WhatsApp Number, Hero Video URL)
   */
  async updateAppSettings(settings: AppSettings): Promise<{ status: string; message?: string }> {
    this.setAppSettings(settings);
    if (settings.appName) {
      this.setAppName(settings.appName);
    }

    // Immediately update SWR cache in localStorage
    const currentCache = this.getLiveCache();
    if (currentCache) {
      currentCache.AppSettings = {
        ...(currentCache.AppSettings || {}),
        ...settings
      };
      this.setLiveCache(currentCache);
    }

    try {
      const res = await this.postToScript<{ status: string; message?: string }>({
        action: 'updateAppSettings',
        settings
      });
      return res;
    } catch (e) {
      console.warn('Failed to sync app settings to database:', e);
      throw e;
    }
  },

  /**
   * Update User Profile
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

    try {
      await this.postToScript({
        action: 'updateUser',
        ...payload
      });
    } catch (e) {
      console.warn('Failed to sync user updates to database:', e);
    }

    return updatedUser;
  },

  /**
   * 6. uploadDayWisePhoto(payload) (POST):
   */
  async uploadDayWisePhoto(payload: UploadPhotoPayload): Promise<{ status: string; data?: DayWisePhoto; message?: string }> {
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
  },

  /**
   * 7. uploadDocument(payload) (POST):
   */
  async uploadDocument(payload: UploadDocumentPayload): Promise<{ status: string; data?: DocumentItem; message?: string }> {
    const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const formattedDate = formatDate(payload.uploadDate, 'input') || formatDate(new Date(), 'input');

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
      if (data.DatabaseMeta) {
        localStorage.setItem(STORAGE_KEYS.DATABASE_META, JSON.stringify(data.DatabaseMeta));
      }
    } catch (e) {
      console.warn('LocalStorage quota or write error:', e);
    }
  },

  /**
   * Retrieve cached data from localStorage or empty fallback
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
      Projects: getCached(STORAGE_KEYS.PROJECTS, []),
      DayWiseReports: getCached(STORAGE_KEYS.DAY_WISE_REPORTS, []),
      DayWisePhotos: getCached(STORAGE_KEYS.DAY_WISE_PHOTOS, []),
      ExecutionStages: getCached(STORAGE_KEYS.EXECUTION_STAGES, []),
      Materials: getCached(STORAGE_KEYS.MATERIALS, []),
      Manpower: getCached(STORAGE_KEYS.MANPOWER, []),
      Approvals: getCached(STORAGE_KEYS.APPROVALS, []),
      Documents: getCached(STORAGE_KEYS.DOCUMENTS, []),
      DatabaseMeta: getCached(STORAGE_KEYS.DATABASE_META, { name: 'Main Execution Database' })
    };
  },

  /**
   * Clear local storage
   */
  resetToSeedData() {
    this.clearCache();
    window.location.reload();
  }
};
