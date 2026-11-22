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
    name: 'NxtWave Stakeholder',
    role: 'Viewer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'NxtWave Tech Park Campus',
    code: 'HYD-01',
    city: 'Hyderabad',
    state: 'Telangana',
    areaSft: 28000,
    status: 'In Execution',
    health: 'On Track',
    progress: 72,
    startDate: '2026-01-15',
    targetDate: '2026-06-30',
    targetHandover: '2026-06-30',
    heroImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
    lat: 17.3850,
    lng: 78.4867,
    civilProgress: 85,
    mepProgress: 70,
    furnitureProgress: 60,
    brandingProgress: 75,
    description: 'State-of-the-art flagship campus with 1200 seating capacity, modern AV labs, and collaboration hubs.',
    coordinatorName: 'Charan Sai',
    budget: '₹2.4 Cr',
    spent: '₹1.72 Cr',
    workPackages: { civilInterior: 85, mep: 70, furnitureAv: 60, brandingSignage: 75 }
  },
  {
    id: 'p2',
    name: 'NxtWave Vizag Innovation Hub',
    code: 'VIZ-02',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    areaSft: 15000,
    status: 'In Design',
    health: 'On Track',
    progress: 35,
    startDate: '2026-02-10',
    targetDate: '2026-08-15',
    targetHandover: '2026-08-15',
    heroImageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format&fit=crop&q=80',
    lat: 17.6868,
    lng: 83.2185,
    civilProgress: 40,
    mepProgress: 30,
    furnitureProgress: 25,
    brandingProgress: 45,
    description: 'Coastal tech training center equipped with high-speed fiber infrastructure and smart classrooms.',
    coordinatorName: 'Rajesh Varma',
    budget: '₹1.2 Cr',
    spent: '₹0.42 Cr',
    workPackages: { civilInterior: 40, mep: 30, furnitureAv: 25, brandingSignage: 45 }
  },
  {
    id: 'p3',
    name: 'NxtWave Bangalore Koramangala Center',
    code: 'BLR-01',
    city: 'Bangalore',
    state: 'Karnataka',
    areaSft: 22000,
    status: 'Active',
    health: 'At Risk',
    progress: 88,
    startDate: '2025-11-01',
    targetDate: '2026-04-30',
    targetHandover: '2026-04-30',
    heroImageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
    lat: 12.9716,
    lng: 77.5946,
    civilProgress: 95,
    mepProgress: 90,
    furnitureProgress: 85,
    brandingProgress: 80,
    description: 'Prime hub in Silicon Valley of India with specialized coding bootcamps and incubators.',
    coordinatorName: 'Priya Sharma',
    budget: '₹1.9 Cr',
    spent: '₹1.68 Cr',
    workPackages: { civilInterior: 95, mep: 90, furnitureAv: 85, brandingSignage: 80 }
  },
  {
    id: 'p4',
    name: 'NxtWave Delhi Connaught Place',
    code: 'DEL-01',
    city: 'Delhi',
    state: 'Delhi',
    areaSft: 18500,
    status: 'In Execution',
    health: 'Delayed',
    progress: 58,
    startDate: '2025-12-01',
    targetDate: '2026-07-15',
    targetHandover: '2026-07-15',
    heroImageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=1200&auto=format&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=1200&auto=format&fit=crop&q=80',
    lat: 28.6139,
    lng: 77.2090,
    civilProgress: 65,
    mepProgress: 55,
    furnitureProgress: 50,
    brandingProgress: 60,
    description: 'Heritage architectural integration with modern acoustic recording booths and large seminar halls.',
    coordinatorName: 'Amit Kumar',
    budget: '₹1.8 Cr',
    spent: '₹1.15 Cr',
    workPackages: { civilInterior: 65, mep: 55, furnitureAv: 50, brandingSignage: 60 }
  },
  {
    id: 'p5',
    name: 'NxtWave Chennai OMR Campus',
    code: 'CHE-01',
    city: 'Chennai',
    state: 'Tamil Nadu',
    areaSft: 25000,
    status: 'Handover',
    health: 'On Track',
    progress: 96,
    startDate: '2025-10-15',
    targetDate: '2026-03-31',
    targetHandover: '2026-03-31',
    heroImageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&auto=format&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&auto=format&fit=crop&q=80',
    lat: 13.0827,
    lng: 80.2707,
    civilProgress: 100,
    mepProgress: 98,
    furnitureProgress: 95,
    brandingProgress: 90,
    description: 'Sprawling OMR campus nearing final snagging and electrical safety sign-offs.',
    coordinatorName: 'Karthik Raja',
    budget: '₹2.1 Cr',
    spent: '₹2.02 Cr',
    workPackages: { civilInterior: 100, mep: 98, furnitureAv: 95, brandingSignage: 90 }
  },
  {
    id: 'p6',
    name: 'NxtWave Pune Hinjawadi Center',
    code: 'PUN-01',
    city: 'Pune',
    state: 'Maharashtra',
    areaSft: 19000,
    status: 'In Design',
    health: 'On Track',
    progress: 20,
    startDate: '2026-03-01',
    targetDate: '2026-09-30',
    targetHandover: '2026-09-30',
    heroImageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1200&auto=format&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1200&auto=format&fit=crop&q=80',
    lat: 18.5204,
    lng: 73.8567,
    civilProgress: 25,
    mepProgress: 20,
    furnitureProgress: 15,
    brandingProgress: 20,
    description: 'Next-gen learning facility inside Hinjawadi IT Park phase 3.',
    coordinatorName: 'Sneha Deshmukh',
    budget: '₹1.5 Cr',
    spent: '₹0.30 Cr',
    workPackages: { civilInterior: 25, mep: 20, furnitureAv: 15, brandingSignage: 20 }
  },
  {
    id: 'p7',
    name: 'NxtWave Vijayawada MG Road',
    code: 'VIJ-01',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    areaSft: 12000,
    status: 'Completed',
    health: 'On Track',
    progress: 100,
    startDate: '2025-08-01',
    targetDate: '2026-01-15',
    targetHandover: '2026-01-15',
    heroImageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f76e7?w=1200&auto=format&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f76e7?w=1200&auto=format&fit=crop&q=80',
    lat: 16.5062,
    lng: 80.6480,
    civilProgress: 100,
    mepProgress: 100,
    furnitureProgress: 100,
    brandingProgress: 100,
    description: 'Fully operational flagship learning center in downtown Vijayawada.',
    coordinatorName: 'Rajesh Varma',
    budget: '₹95 Lakhs',
    spent: '₹94 Lakhs',
    workPackages: { civilInterior: 100, mep: 100, furnitureAv: 100, brandingSignage: 100 }
  },
  {
    id: 'p8',
    name: 'NxtWave Gachibowli Expansion',
    code: 'HYD-02',
    city: 'Hyderabad',
    state: 'Telangana',
    areaSft: 32000,
    status: 'In Execution',
    health: 'On Track',
    progress: 64,
    startDate: '2025-12-15',
    targetDate: '2026-06-15',
    targetHandover: '2026-06-15',
    heroImageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    lat: 17.4401,
    lng: 78.3489,
    civilProgress: 70,
    mepProgress: 65,
    furnitureProgress: 60,
    brandingProgress: 60,
    description: 'Massive multi-floor expansion with state of the art server rooms and simulation studios.',
    coordinatorName: 'Charan Sai',
    budget: '₹2.8 Cr',
    spent: '₹1.80 Cr',
    workPackages: { civilInterior: 70, mep: 65, furnitureAv: 60, brandingSignage: 60 }
  }
];

export const INITIAL_DAY_WISE_REPORTS: DayWiseReport[] = [
  {
    id: 'dwr-1',
    projectId: 'p1',
    dayNumber: 3,
    date: '2026-11-20',
    workSummary: 'Completed false ceiling grid framing on 2nd floor lab zone. Installed 80 LED recessed fixtures and began HVAC duct insulated wrapping.',
    workersCount: 38,
    materialsUsed: '80 LED Panels, 350 Rmt GI Framework, 4 rolls glasswool insulation',
    updatedBy: 'Charan Sai'
  },
  {
    id: 'dwr-2',
    projectId: 'p1',
    dayNumber: 2,
    date: '2026-11-19',
    workSummary: 'Conducted electrical cable routing across Server Room and primary classroom pod A. Applied second coat primer on common lobby partition walls.',
    workersCount: 32,
    materialsUsed: '25 boxes Cat6 cable, 6 buckets acrylic primer, 40 conduit pipes',
    updatedBy: 'Charan Sai'
  },
  {
    id: 'dwr-3',
    projectId: 'p1',
    dayNumber: 1,
    date: '2026-11-18',
    workSummary: 'Site mobilization initiated. Delivered acoustic wall panelling materials and verified initial line-and-level benchmarks with structural surveyor.',
    workersCount: 24,
    materialsUsed: '400 Acoustic Panels, 12 bags adhesive, survey benchmark markers',
    updatedBy: 'Charan Sai'
  },
  {
    id: 'dwr-4',
    projectId: 'p3',
    dayNumber: 2,
    date: '2026-11-19',
    workSummary: 'Pod workstation final assembly underway. Connected 60 ethernet drop points and completed ergonomic desk alignments.',
    workersCount: 22,
    materialsUsed: '60 ergonomic desk tops, cable management trays, patch panels',
    updatedBy: 'Priya Sharma'
  },
  {
    id: 'dwr-5',
    projectId: 'p3',
    dayNumber: 1,
    date: '2026-11-18',
    workSummary: 'Main hallway flooring polishing completed. Cleaned and prepped coding incubator space for AV rack mounting.',
    workersCount: 18,
    materialsUsed: 'Floor sealant, AV mounting brackets, power distribution boxes',
    updatedBy: 'Priya Sharma'
  }
];

export const INITIAL_DAY_WISE_PHOTOS: DayWisePhoto[] = [
  // Project 1 - Day 3
  {
    id: 'dwp-1',
    projectId: 'p1',
    dayNumber: 3,
    date: '2026-11-20',
    caption: 'False ceiling grid installation in main lab',
    driveFileId: 'drive-p1-d3-1',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'dwp-2',
    projectId: 'p1',
    dayNumber: 3,
    date: '2026-11-20',
    caption: 'Recessed LED fixtures aligned and wired',
    driveFileId: 'drive-p1-d3-2',
    imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'dwp-3',
    projectId: 'p1',
    dayNumber: 3,
    date: '2026-11-20',
    caption: 'HVAC branch duct acoustic wrapping',
    driveFileId: 'drive-p1-d3-3',
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=1000&auto=format&fit=crop&q=80'
  },
  // Project 1 - Day 2
  {
    id: 'dwp-4',
    projectId: 'p1',
    dayNumber: 2,
    date: '2026-11-19',
    caption: 'Server Room raised floor cable containment',
    driveFileId: 'drive-p1-d2-1',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'dwp-5',
    projectId: 'p1',
    dayNumber: 2,
    date: '2026-11-19',
    caption: 'Lobby partition wall second coat primer check',
    driveFileId: 'drive-p1-d2-2',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f76e7?w=1000&auto=format&fit=crop&q=80'
  },
  // Project 1 - Day 1
  {
    id: 'dwp-6',
    projectId: 'p1',
    dayNumber: 1,
    date: '2026-11-18',
    caption: 'Material unloading and staging in basement bay',
    driveFileId: 'drive-p1-d1-1',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'dwp-7',
    projectId: 'p1',
    dayNumber: 1,
    date: '2026-11-18',
    caption: 'Quality inspection of delivered acoustic wall panels',
    driveFileId: 'drive-p1-d1-2',
    imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1000&auto=format&fit=crop&q=80'
  },
  // Project 3 - Day 2
  {
    id: 'dwp-8',
    projectId: 'p3',
    dayNumber: 2,
    date: '2026-11-19',
    caption: 'Coding pods workstation assembly',
    driveFileId: 'drive-p3-d2-1',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'dwp-9',
    projectId: 'p3',
    dayNumber: 2,
    date: '2026-11-19',
    caption: 'AV projector mount and screen testing',
    driveFileId: 'drive-p3-d2-2',
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1000&auto=format&fit=crop&q=80'
  }
];

export const EXECUTION_STAGE_NAMES = [
  'Site Audit & Survey',
  'Design & BOQ Finalization',
  'Approvals & Permissions',
  'Material Procurement',
  'Site Mobilization',
  'Civil Works',
  'Electrical & MEP',
  'HVAC & Fire Safety',
  'False Ceiling & Flooring',
  'Painting & Finishing',
  'Furniture Installation',
  'IT & AV Setup',
  'Branding & Signage',
  'Snagging & Inspection',
  'Final Handover'
];

export const INITIAL_EXECUTION_STAGES: ExecutionStageItem[] = INITIAL_PROJECTS.flatMap((proj) => {
  return EXECUTION_STAGE_NAMES.map((name, idx) => {
    const stageNum = idx + 1;
    let status: 'Pending' | 'In Progress' | 'Completed' = 'Pending';
    let prog = 0;

    if (proj.progress >= 95) {
      status = 'Completed';
      prog = 100;
    } else if (proj.progress <= 30) {
      if (stageNum <= 3) {
        status = stageNum === 3 ? 'In Progress' : 'Completed';
        prog = stageNum === 3 ? 60 : 100;
      }
    } else {
      const threshold = Math.floor((proj.progress / 100) * 15);
      if (stageNum < threshold) {
        status = 'Completed';
        prog = 100;
      } else if (stageNum === threshold) {
        status = 'In Progress';
        prog = 50;
      }
    }

    const subTasks = [
      { id: `${proj.id}-${stageNum}-1`, name: 'Core Materials & Prep', completed: prog === 100 },
      { id: `${proj.id}-${stageNum}-2`, name: 'Execution & Quality Check', completed: prog === 100 },
      { id: `${proj.id}-${stageNum}-3`, name: 'Supervisor Sign-off', completed: prog === 100 || prog >= 50 }
    ];

    const phase = stageNum <= 3 ? 'Planning' : stageNum <= 5 ? 'Procurement' : stageNum <= 12 ? 'Execution' : 'Handover';

    return {
      id: `${proj.id}-st-${stageNum}`,
      projectId: proj.id,
      phase,
      stageNumber: stageNum,
      stageName: name,
      status,
      progress: prog,
      subTasksJson: JSON.stringify(subTasks),
      subTasks
    };
  });
});

export const INITIAL_MATERIALS: MaterialItem[] = [
  { id: 'm1', projectId: 'p1', itemName: 'Acoustic Wall Panels', category: 'Civil', requiredQty: 450, deliveredQty: 400, unit: 'pcs', status: 'Low Stock', name: 'Acoustic Wall Panels', balance: '50 pcs' },
  { id: 'm2', projectId: 'p1', itemName: 'Cat6 Shielded Cables', category: 'IT & AV', requiredQty: 50, deliveredQty: 50, unit: 'boxes', status: 'In Stock', name: 'Cat6 Shielded Cables', balance: '0 boxes' },
  { id: 'm3', projectId: 'p1', itemName: 'LED Flat Panel Lights', category: 'Electrical', requiredQty: 200, deliveredQty: 180, unit: 'units', status: 'Pending Delivery', name: 'LED Flat Panel Lights', balance: '20 units' },
  { id: 'm4', projectId: 'p1', itemName: 'Ergonomic Study Desks', category: 'Furniture', requiredQty: 300, deliveredQty: 250, unit: 'units', status: 'In Stock', name: 'Ergonomic Study Desks', balance: '50 units' },
  { id: 'm5', projectId: 'p3', itemName: 'VRV HVAC Outdoor Units', category: 'HVAC', requiredQty: 6, deliveredQty: 6, unit: 'units', status: 'In Stock', name: 'VRV HVAC Outdoor Units', balance: '0 units' },
  { id: 'm6', projectId: 'p4', itemName: 'Glass Partition Frames', category: 'Civil', requiredQty: 120, deliveredQty: 80, unit: 'sets', status: 'Pending Delivery', name: 'Glass Partition Frames', balance: '40 sets' }
];

export const INITIAL_MANPOWER: ManpowerItem[] = [
  { id: 'mp1', projectId: 'p1', trade: 'Civil & Masonry', workerCount: 42, count: 42, supervisor: 'Ramesh Naidu', date: '2026-11-18' },
  { id: 'mp2', projectId: 'p1', trade: 'Electrical & Cabling', workerCount: 28, count: 28, supervisor: 'Suresh Kumar', date: '2026-11-18' },
  { id: 'mp3', projectId: 'p1', trade: 'HVAC Technicians', workerCount: 16, count: 16, supervisor: 'Anil Reddy', date: '2026-11-18' },
  { id: 'mp4', projectId: 'p1', trade: 'Carpenters & Furniture', workerCount: 35, count: 35, supervisor: 'Venkat Rao', date: '2026-11-18' },
  { id: 'mp5', projectId: 'p3', trade: 'Painters & Finishers', workerCount: 20, count: 20, supervisor: 'Mohan Das', date: '2026-11-18' }
];

export const INITIAL_APPROVALS: ApprovalItem[] = [
  { id: 'ap1', projectId: 'p1', projectName: 'NxtWave Tech Park Campus', approvalName: 'Municipal Building Permit', name: 'Municipal Building Permit', approver: 'GHMC Zonal Commissioner', requestedDate: '2026-01-20', status: 'Approved', documentUrl: 'https://drive.google.com/file/d/sample-permit-1', link: 'https://drive.google.com/file/d/sample-permit-1' },
  { id: 'ap2', projectId: 'p1', projectName: 'NxtWave Tech Park Campus', approvalName: 'Fire Safety NOC', name: 'Fire Safety NOC', approver: 'Telangana Fire Services', requestedDate: '2026-02-10', status: 'Approved', documentUrl: 'https://drive.google.com/file/d/sample-fire-noc', link: 'https://drive.google.com/file/d/sample-fire-noc' },
  { id: 'ap3', projectId: 'p4', projectName: 'NxtWave Delhi Connaught Place', approvalName: 'Heritage Committee Clearance', name: 'Heritage Committee Clearance', approver: 'NDMC Planning Wing', requestedDate: '2025-12-10', status: 'Under Review', documentUrl: 'https://drive.google.com/file/d/sample-ndmc', link: 'https://drive.google.com/file/d/sample-ndmc' },
  { id: 'ap4', projectId: 'p2', projectName: 'NxtWave Vizag Innovation Hub', approvalName: 'Commercial Electrical Load Sanction', name: 'Commercial Electrical Load Sanction', approver: 'APSPDCL', requestedDate: '2026-02-28', status: 'Approved', documentUrl: 'https://drive.google.com/file/d/sample-apspdcl', link: 'https://drive.google.com/file/d/sample-apspdcl' },
  { id: 'ap5', projectId: 'p5', projectName: 'NxtWave Chennai OMR Campus', approvalName: 'Final Occupancy Certificate', name: 'Final Occupancy Certificate', approver: 'CMDA Chennai', requestedDate: '2026-03-10', status: 'Pending', documentUrl: 'https://drive.google.com/file/d/sample-cmda', link: 'https://drive.google.com/file/d/sample-cmda' }
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  { id: 'doc1', projectId: 'p1', projectName: 'NxtWave Tech Park Campus', title: 'Master Architectural Floor Plan v3', category: 'Drawings', uploadDate: '2026-01-10', documentUrl: 'https://drive.google.com/file/d/sample-floor-plan', url: 'https://drive.google.com/file/d/sample-floor-plan' },
  { id: 'doc2', projectId: 'p1', projectName: 'NxtWave Tech Park Campus', title: 'Comprehensive Bill of Quantities (BOQ)', category: 'BOQ', uploadDate: '2026-01-12', documentUrl: 'https://drive.google.com/file/d/sample-boq', url: 'https://drive.google.com/file/d/sample-boq' },
  { id: 'doc3', projectId: 'p3', projectName: 'NxtWave Bangalore Koramangala Center', title: 'Lease Agreement & Landlord Covenants', category: 'Contracts', uploadDate: '2025-10-20', documentUrl: 'https://drive.google.com/file/d/sample-lease', url: 'https://drive.google.com/file/d/sample-lease' },
  { id: 'doc4', projectId: 'p4', projectName: 'NxtWave Delhi Connaught Place', title: 'HVAC & MEP Schematic Diagrams', category: 'Drawings', uploadDate: '2025-12-05', documentUrl: 'https://drive.google.com/file/d/sample-mep', url: 'https://drive.google.com/file/d/sample-mep' }
];

export const INITIAL_PHOTOS: DayWisePhoto[] = INITIAL_DAY_WISE_PHOTOS;

export const INITIAL_SITE_UPDATES: SiteUpdateItem[] = [
  {
    id: 'su1',
    projectId: 'p1',
    projectName: 'NxtWave Tech Park Campus',
    note: 'Interior Acoustic Paneling 3rd Floor Completed (Day 3)',
    timestamp: '2 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80',
    healthBadge: 'On Track'
  },
  {
    id: 'su2',
    projectId: 'p3',
    projectName: 'NxtWave Bangalore Koramangala Center',
    note: 'High-speed fiber backbone testing successful across all pods',
    timestamp: '5 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
    healthBadge: 'At Risk'
  },
  {
    id: 'su3',
    projectId: 'p4',
    projectName: 'NxtWave Delhi Connaught Place',
    note: 'Material delivery delayed by 3 days due to municipal transit restrictions',
    timestamp: 'Yesterday',
    imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=600&auto=format&fit=crop&q=80',
    healthBadge: 'Delayed'
  },
  {
    id: 'su4',
    projectId: 'p5',
    projectName: 'NxtWave Chennai OMR Campus',
    note: 'Final safety inspection cleared by regional fire marshal',
    timestamp: '2 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&auto=format&fit=crop&q=80',
    healthBadge: 'On Track'
  }
];
