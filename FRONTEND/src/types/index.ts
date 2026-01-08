export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface Equipment {
  id: string;
  name: string;
  modelNumber?: string;
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
  frontendPath: string;
  backendPath: string;
  runCommand: string;
  envCommand?: string;
  status: HealthStatus;
  depreciation: number;
  image?: string;
}

export type TabType = 'equipment' | 'software' | 'pocs';
