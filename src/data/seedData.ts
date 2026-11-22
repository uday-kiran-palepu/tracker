import {
  Project, DayWiseReport, DayWisePhoto, ExecutionStageItem,
  MaterialItem, ManpowerItem, ApprovalItem, DocumentItem, SiteUpdateItem, User
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    email: 'coordinator@unitracker.com',
    username: 'coordinator',
    name: 'Charan Sai',
    role: 'Project Coordinator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'u2',
    email: 'viewer@unitracker.com',
    username: 'viewer',
    name: 'Public Viewer',
    role: 'Viewer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
];

// All initial project data arrays are strictly empty. Real data is loaded live from the permanent Cloud Database.
export const INITIAL_PROJECTS: Project[] = [];
export const INITIAL_DAY_WISE_REPORTS: DayWiseReport[] = [];
export const INITIAL_DAY_WISE_PHOTOS: DayWisePhoto[] = [];
export const INITIAL_EXECUTION_STAGES: ExecutionStageItem[] = [];
export const INITIAL_MATERIALS: MaterialItem[] = [];
export const INITIAL_MANPOWER: ManpowerItem[] = [];
export const INITIAL_APPROVALS: ApprovalItem[] = [];
export const INITIAL_DOCUMENTS: DocumentItem[] = [];
export const INITIAL_PHOTOS: DayWisePhoto[] = [];
export const INITIAL_SITE_UPDATES: SiteUpdateItem[] = [];
