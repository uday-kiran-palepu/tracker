import { api } from './api';
import {
  Project, ExecutionStageItem, MaterialItem, ManpowerItem, ApprovalItem, DocumentItem, PhotoItem, SiteUpdateItem, User, DayWisePhoto, DayWiseReport
} from '../types';
import { INITIAL_USERS } from '../data/seedData';

/**
 * Backward compatibility adapter that connects to the new unified API service.
 */
export const sheetService = {
  getWebAppUrl(): string {
    return api.getWebAppUrl();
  },

  setWebAppUrl(url: string) {
    api.setWebAppUrl(url);
  },

  isConfigured(): boolean {
    return api.isConfigured();
  },

  getCurrentUser(): User {
    return api.getCurrentUser();
  },

  setCurrentUser(user: User) {
    api.setCurrentUser(user);
  },

  getProjects(): Project[] {
    return api.getLocalCachedData().Projects;
  },

  saveProjects(projects: Project[]) {
    const data = api.getLocalCachedData();
    data.Projects = projects;
    api.cacheLocalData(data);
  },

  getExecutionStages(): ExecutionStageItem[] {
    return api.getLocalCachedData().ExecutionStages;
  },

  saveExecutionStages(stages: ExecutionStageItem[]) {
    const data = api.getLocalCachedData();
    data.ExecutionStages = stages;
    api.cacheLocalData(data);
  },

  getMaterials(): MaterialItem[] {
    return api.getLocalCachedData().Materials;
  },

  saveMaterials(materials: MaterialItem[]) {
    const data = api.getLocalCachedData();
    data.Materials = materials;
    api.cacheLocalData(data);
  },

  getManpower(): ManpowerItem[] {
    return api.getLocalCachedData().Manpower;
  },

  saveManpower(manpower: ManpowerItem[]) {
    const data = api.getLocalCachedData();
    data.Manpower = manpower;
    api.cacheLocalData(data);
  },

  getApprovals(): ApprovalItem[] {
    return api.getLocalCachedData().Approvals;
  },

  saveApprovals(approvals: ApprovalItem[]) {
    const data = api.getLocalCachedData();
    data.Approvals = approvals;
    api.cacheLocalData(data);
  },

  getDocuments(): DocumentItem[] {
    return api.getLocalCachedData().Documents;
  },

  saveDocuments(docs: DocumentItem[]) {
    const data = api.getLocalCachedData();
    data.Documents = docs;
    api.cacheLocalData(data);
  },

  getDayWiseReports(): DayWiseReport[] {
    return api.getLocalCachedData().DayWiseReports;
  },

  saveDayWiseReports(reports: DayWiseReport[]) {
    const data = api.getLocalCachedData();
    data.DayWiseReports = reports;
    api.cacheLocalData(data);
  },

  getDayWisePhotos(): DayWisePhoto[] {
    return api.getLocalCachedData().DayWisePhotos;
  },

  saveDayWisePhotos(photos: DayWisePhoto[]) {
    const data = api.getLocalCachedData();
    data.DayWisePhotos = photos;
    api.cacheLocalData(data);
  },

  getPhotos(): PhotoItem[] {
    return api.getLocalCachedData().DayWisePhotos.map(p => ({
      id: p.id,
      projectId: p.projectId,
      caption: p.caption,
      date: p.date,
      url: p.imageUrl
    }));
  },

  savePhotos(photos: PhotoItem[]) {
    // mapped to DayWisePhotos if needed
  },

  getSiteUpdates(): SiteUpdateItem[] {
    const stored = localStorage.getItem('unitracker_site_updates');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { /* ignore */ }
    }
    return [];
  },

  saveSiteUpdates(updates: SiteUpdateItem[]) {
    localStorage.setItem('unitracker_site_updates', JSON.stringify(updates));
  },

  async testConnection(url: string): Promise<boolean> {
    if (!url) return false;
    try {
      const res = await fetch(url, { method: 'GET' });
      const json = await res.json();
      return json.status === 'success';
    } catch (e) {
      console.error('Connection test failed:', e);
      return false;
    }
  },

  async syncToServer(sheetName: string, action: 'add' | 'update' | 'delete', item: any, idField = 'id', idValue = '') {
    if (!api.isConfigured()) return;
    try {
      if (action === 'add') {
        await api.createRecord(sheetName, item);
      } else if (action === 'update') {
        await api.updateRecord(sheetName, item[idField] || idValue, item);
      } else if (action === 'delete') {
        await api.deleteRecord(sheetName, idValue || item[idField]);
      }
    } catch (e) {
      console.error(`Failed to sync ${sheetName} to Google Sheet:`, e);
    }
  },

  resetToSeedData() {
    api.resetToSeedData();
  }
};
