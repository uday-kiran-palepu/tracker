export type ProjectStatus = 'Active' | 'In Design' | 'In Execution' | 'Handover' | 'Completed';
export type ProjectHealth = 'On Track' | 'At Risk' | 'Delayed';

/**
 * Projects Sheet Schema:
 * id, name, city, state, areaSft, status, health, progress, startDate, targetDate, heroImageUrl, lat, lng, civilProgress, mepProgress, furnitureProgress, brandingProgress
 */
export interface Project {
  id: string;
  name: string;
  city: string;
  state: string;
  areaSft: number;
  status: ProjectStatus;
  health: ProjectHealth;
  progress: number; // 0-100
  startDate: string;
  targetDate: string; // Exact Sheet Column
  heroImageUrl: string; // Exact Sheet Column
  lat: number;
  lng: number;
  civilProgress: number; // Exact Sheet Column
  mepProgress: number; // Exact Sheet Column
  furnitureProgress: number; // Exact Sheet Column
  brandingProgress: number; // Exact Sheet Column

  // Upgraded schema fields
  labCode?: string;
  mapsUrl?: string;
  budgetAllocated?: number | string;
  budgetSpent?: number | string;
  pocName?: string; // NxtWave Executive POC Name
  pocPhone?: string | number; // NxtWave Executive POC Phone Number

  // UI helper / backward-compatibility aliases
  code?: string;
  targetHandover?: string;
  heroImage?: string;
  description?: string;
  coordinatorName?: string;
  budget?: string;
  spent?: string;
  workPackages?: {
    civilInterior: number;
    mep: number;
    furnitureAv: number;
    brandingSignage: number;
  };
}

/**
 * DayWiseReports Sheet Schema:
 * id, projectId, dayNumber, date, workSummary, workersCount, materialsUsed, updatedBy
 */
export interface DayWiseReport {
  id: string;
  projectId: string;
  dayNumber: number;
  date: string;
  workSummary: string;
  workersCount: number;
  materialsUsed: string;
  updatedBy: string;
}

/**
 * DayWisePhotos Sheet Schema:
 * id, projectId, dayNumber, date, caption, driveFileId, imageUrl
 */
export interface DayWisePhoto {
  id: string;
  projectId: string;
  dayNumber: number;
  date: string;
  caption: string;
  driveFileId: string;
  imageUrl: string;
}

export type StageType = 'Initial Stage' | 'Current Stage' | 'Final Stage';

/**
 * StagePhotos Sheet Schema:
 * id, projectId, stageType, caption, date, driveFileId, imageUrl, createdAt
 */
export interface StagePhoto {
  id: string;
  projectId: string;
  stageType: StageType;
  stageCategory?: string;
  caption?: string;
  date?: string;
  driveFileId?: string;
  imageUrl: string;
  createdAt?: string;
}

export interface ExecutionSubTask {
  id: string;
  name: string;
  completed: boolean;
}

/**
 * ExecutionStages Sheet Schema:
 * id, projectId, phase, stageNumber, stageName, status, progress, subTasksJson
 */
export interface ExecutionStageItem {
  id: string;
  projectId: string;
  phase: string;
  stageNumber: number;
  stageName: string;
  description?: string; // Scope of Work for this stage
  status: 'Pending' | 'In Progress' | 'Completed';
  progress: number;
  subTasksJson: string; // JSON string of ExecutionSubTask[]

  // Runtime helper
  subTasks?: ExecutionSubTask[];
}

/**
 * Materials Sheet Schema:
 * id, projectId, itemName, category, requiredQty, deliveredQty, unit, status
 */
export interface MaterialItem {
  id: string;
  projectId: string;
  itemName: string;
  category: 'Civil' | 'Electrical' | 'HVAC' | 'Furniture' | 'IT & AV' | 'Branding' | string;
  requiredQty: string | number;
  deliveredQty: string | number;
  unit: string;
  status: 'In Stock' | 'Low Stock' | 'Pending Delivery' | 'Ordered' | string;

  // UI aliases
  name?: string;
  balance?: string;
}

/**
 * Manpower Sheet Schema:
 * id, projectId, date, trade, workerCount, supervisor
 */
export interface ManpowerItem {
  id: string;
  projectId: string;
  date: string;
  trade: string;
  workerCount: number;
  supervisor: string;

  // UI alias
  count?: number;
}

/**
 * Approvals Sheet Schema:
 * id, projectId, approvalName, requestedDate, approver, status, documentUrl
 */
export interface ApprovalItem {
  id: string;
  projectId: string;
  approvalName: string;
  requestedDate: string;
  approver: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Under Review' | string;
  documentUrl: string;

  // UI aliases
  name?: string;
  projectName?: string;
  link?: string;
}

/**
 * Documents Sheet Schema:
 * id, projectId, title, category, uploadDate, documentUrl
 */
export interface DocumentItem {
  id: string;
  projectId: string;
  title: string;
  category: 'Drawings' | 'BOQ' | 'Contracts' | 'Permits' | 'Reports' | 'NOC' | string;
  uploadDate: string;
  documentUrl: string;

  // UI aliases
  projectName?: string;
  url?: string;
}

// Retained for backward-compat
export interface PhotoItem {
  id: string;
  projectId: string;
  caption: string;
  date: string;
  url: string;
}

export interface SiteUpdateItem {
  id: string;
  projectId: string;
  projectName: string;
  note: string;
  timestamp: string;
  imageUrl: string;
  healthBadge: ProjectHealth;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Project Coordinator' | 'Viewer';
  avatar: string;
  username?: string;
}

export interface AppSettings {
  appName?: string;
  whatsappNumber?: string | number;
  heroVideoUrl?: string;
}

export interface DatabaseMeta {
  name?: string;
  id?: string;
  sheetUrl?: string;
  lastSwitched?: string;
}

export interface AllDataResponse {
  Projects: Project[];
  DayWiseReports: DayWiseReport[];
  DayWisePhotos: DayWisePhoto[];
  ExecutionStages: ExecutionStageItem[];
  Materials: MaterialItem[];
  Manpower: ManpowerItem[];
  Approvals: ApprovalItem[];
  Documents: DocumentItem[];
  StagePhotos?: StagePhoto[];
  AppSettings?: AppSettings;
  DatabaseMeta?: DatabaseMeta;
}
