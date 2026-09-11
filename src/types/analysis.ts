import type { DetectionResult } from '../services/buildingDetection/types';

export interface SatelliteImageFile {
  file?: File;
  previewUrl: string;
  name: string;
  sizeBytes: number;
  formattedSize: string;
  type: string;
  width?: number;
  height?: number;
  uploadedAt: Date;
  status: 'idle' | 'uploading' | 'ready' | 'error';
  errorMessage?: string;
  isSample?: boolean;
}

export type DomainType = 'building_detection';

export type ScreenState = 'upload_and_ask' | 'processing' | 'results';

export interface ProcessingStepItem {
  id: string;
  label: string;
  description?: string;
  status: 'completed' | 'current' | 'pending';
}

export interface QueryOption {
  id: string;
  title: string;
  description: string;
  prompt: string;
  iconName: 'building' | 'count' | 'area' | 'density';
  badge?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

export interface AnalysisState {
  domain: DomainType;
  currentScreen: ScreenState;
  image: SatelliteImageFile | null;
  query: string;
  selectedPresetId?: string;
  isAnalyzing: boolean;
  activeNav: 'home' | 'new-analysis' | 'my-analyses' | 'profile';
  showNotifications: boolean;
  notifications: AppNotification[];
  detectionResult?: DetectionResult | null;
}
