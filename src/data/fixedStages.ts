import { ExecutionStageItem } from '../types';

export interface StageDefinition {
  stageNumber: number;
  stageName: string;
  phase: string;
  description: string;
}

export const FIXED_21_STAGES: StageDefinition[] = [
  {
    stageNumber: 1,
    stageName: 'Site Survey & Architectural Feasibility',
    phase: 'Planning',
    description: 'Laser site survey, structural load assessment, baseline CAD drawings, and architectural feasibility report.'
  },
  {
    stageNumber: 2,
    stageName: 'Concept Design & Layout Planning',
    phase: 'Planning',
    description: 'Zoning, workflow planning, 2D furniture and lab bench layout schematics approval.'
  },
  {
    stageNumber: 3,
    stageName: 'Detailed Drawings & 3D Renderings',
    phase: 'Planning',
    description: 'GFC electrical, plumbing, HVAC, interior elevation drawings and photorealistic 3D renders.'
  },
  {
    stageNumber: 4,
    stageName: 'Statutory Approvals & Landlord NOC',
    phase: 'Approvals',
    description: 'Campus management NOC, structural clearance, fire safety verification and regulatory permits.'
  },
  {
    stageNumber: 5,
    stageName: 'BOQ Finalization & Budget Approval',
    phase: 'Procurement',
    description: 'Bill of Quantities pricing, material specification sign-offs, and Capex budget lock.'
  },
  {
    stageNumber: 6,
    stageName: 'Vendor Tendering & Contractor Onboarding',
    phase: 'Procurement',
    description: 'Contractor bidding, SLA agreements, labor compliance checks, and PO issuances.'
  },
  {
    stageNumber: 7,
    stageName: 'Site Mobilization & Demolition',
    phase: 'Execution',
    description: 'Material drop setup, site fencing, debris clearing, and existing partition dismantling.'
  },
  {
    stageNumber: 8,
    stageName: 'Civil & Masonry Works',
    phase: 'Execution',
    description: 'Brickwork, partition walls, plastering, wall grooves, and floor screeding.'
  },
  {
    stageNumber: 9,
    stageName: 'Electrical Conduit & Primary Wiring',
    phase: 'Execution',
    description: 'Ceiling and wall conduit laying, primary DB dressing, earth pits, and heavy power feeders.'
  },
  {
    stageNumber: 10,
    stageName: 'HVAC Ducting & Refrigerant Piping',
    phase: 'Execution',
    description: 'VRV/VRF duct fabrication, high-side refrigerant line insulation, and inline damper installation.'
  },
  {
    stageNumber: 11,
    stageName: 'Plumbing & Fire Fighting Systems',
    phase: 'Execution',
    description: 'Drain lines, wet riser drops, smoke detector cabling, and sprinkler head positioning.'
  },
  {
    stageNumber: 12,
    stageName: 'IT Networking & Fiber Optic Backbone',
    phase: 'Execution',
    description: 'Cat6A cable trays, server rack positioning, patch panel dressing, and campus fiber interconnect.'
  },
  {
    stageNumber: 13,
    stageName: 'Gypsum & Grid False Ceiling',
    phase: 'Execution',
    description: 'GI framing suspension, acoustic board fixing, gypsum joint taping, and cutouts for lights/diffusers.'
  },
  {
    stageNumber: 14,
    stageName: 'Flooring & Skirting Works',
    phase: 'Execution',
    description: 'Vitrified tile / epoxy screed laying, anti-static lab flooring, leveling, and perimeter skirting.'
  },
  {
    stageNumber: 15,
    stageName: 'Painting, Priming & Wall Textures',
    phase: 'Execution',
    description: 'Putty application, double-coat primer, washable anti-microbial paint, and accent wall finishes.'
  },
  {
    stageNumber: 16,
    stageName: 'Doors, Glass Partitions & Glazing',
    phase: 'Execution',
    description: 'Toughened glass partition installation, acoustic door frames, handles, and patch fittings.'
  },
  {
    stageNumber: 17,
    stageName: 'Modular Furniture & Lab Workstation Setup',
    phase: 'Execution',
    description: 'Ergonomic lab desks, ESD matting, storage credenzas, and faculty seating assembly.'
  },
  {
    stageNumber: 18,
    stageName: 'AV, Smart Screens & Acoustic Paneling',
    phase: 'Execution',
    description: 'Interactive smart displays, ceiling-mounted projectors, mic arrays, and sound-dampening acoustic wall panels.'
  },
  {
    stageNumber: 19,
    stageName: 'Branding, Signage & Environmental Graphics',
    phase: 'Execution',
    description: 'NxtWave & partner 3D backlit acrylic logos, lab safety instruction graphics, and directional wayfinding.'
  },
  {
    stageNumber: 20,
    stageName: 'Deep Cleaning, Snagging & QA Audits',
    phase: 'Inspection',
    description: 'Industrial scrub, HVAC air balance testing, network throughput audits, and 100-point punch-list closure.'
  },
  {
    stageNumber: 21,
    stageName: 'Final Commissioning & Campus Handover',
    phase: 'Handover',
    description: 'Joint walkthrough with university deans, lab coordinator handover, key handover, and sign-off certificate.'
  }
];

export function createDefaultStagesForProject(projectId: string): ExecutionStageItem[] {
  return FIXED_21_STAGES.map((s) => ({
    id: `stage-${projectId}-${s.stageNumber}`,
    projectId,
    stageNumber: s.stageNumber,
    stageName: s.stageName,
    phase: s.phase,
    description: s.description,
    status: s.stageNumber === 1 ? 'In Progress' : 'Pending',
    progress: s.stageNumber === 1 ? 50 : 0,
    subTasksJson: JSON.stringify([
      { id: `st-${s.stageNumber}-1`, name: 'Initial checklist & site verification', completed: s.stageNumber === 1 },
      { id: `st-${s.stageNumber}-2`, name: 'Vendor / team mobilization & materials', completed: false },
      { id: `st-${s.stageNumber}-3`, name: 'Quality assurance & milestone sign-off', completed: false }
    ]),
    subTasks: [
      { id: `st-${s.stageNumber}-1`, name: 'Initial checklist & site verification', completed: s.stageNumber === 1 },
      { id: `st-${s.stageNumber}-2`, name: 'Vendor / team mobilization & materials', completed: false },
      { id: `st-${s.stageNumber}-3`, name: 'Quality assurance & milestone sign-off', completed: false }
    ]
  }));
}
