export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface Equipment {
  id: string;
  name: string; // "Display name"
  description: string;
  status: 'active' | 'maintenance' | 'retired' | 'in_repair'; // "Current Status" / "Life Cycle Stage Status" logic
  healthStatus: HealthStatus;
  location: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  } | null;
  image?: string;
  serialNumber: string;
  modelNumber: string; // "Model category" or specific? Maybe use Model Category for this or separate.
  manufacturer: string;
  purchaseDate: string;
  warrantyExpiration: string; // "Warranty expiration"
  lastCalibrated: string;
  nextCalibration: string;
  notes: string; // "Notes"
  assetTag: string; // "Asset tag"

  // New Fields from Excel
  lifecycleStage: string; // "Life Cycle Stage"
  lifecycleStageStatus: string; // "Life Cycle Stage Status"
  modelCategory: string; // "Model category"
  ownedBy: string; // "Owned by"
  costCenter: string; // "Cost center"
  costCenterDisplay: string; // "Cost center Display"
  department: string; // "Department"
  assignedToDisplayName: string; // "Assigned to Display Name" (if different from assignedTo.name)

  depreciation: number;
  category?: string;
}

export interface Software {
  id: string;
  name: string;
  healthStatus: HealthStatus;
  depreciation: number;
  assignedTo: {
    name: string;
    avatar: string;
  };
  lastCalibrated: string;
  nextCalibration: string;
  image?: string;
}

export interface POC {
  id: string;
  name: string;
  description: string;
  laptop: string;
  frontendPath: string; // "Frontend Path"
  backendPath: string; // "Backend Path"
  runCommand: string; // "Run Command"
  envCommand?: string; // "Env Command"
  status: HealthStatus;
  depreciation: number;
  image?: string;
  primaryPOC?: string; // "Primary POC"
  secondaryPOC?: string; // "Secondary POC"
  category?: string; // "Category"

  // New Fields
  planogramCompliance?: string; // "Planogram compliance"
}

export type TabType = 'equipment' | 'software' | 'pocs';
