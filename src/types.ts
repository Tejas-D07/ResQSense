export enum AppState {
  SPLASH               = 'SPLASH',
  PERMISSIONS          = 'PERMISSIONS',
  USER_SETUP           = 'USER_SETUP',
  MONITORING_INACTIVE  = 'MONITORING_INACTIVE',
  MONITORING_ACTIVE    = 'MONITORING_ACTIVE',
  PRE_DANGER_VALIDATION= 'PRE_DANGER_VALIDATION',
  DANGER_DETECTED      = 'DANGER_DETECTED',
  EMERGENCY_ACTIVATED  = 'EMERGENCY_ACTIVATED',
  POST_EMERGENCY       = 'POST_EMERGENCY',
}

export interface UserProfile {
  name:              string;
  phone:             string;
  email:             string;
  emergencyContacts: string[];
}

export interface SafetyPermissions {
  microphone: boolean;
  location:   boolean;
}

export interface AudioDetection {
  sound:      string;
  confidence: number;
  danger:     boolean;
  top3?:      { sound: string; score: number }[];
  audioClip?: string;
  error?:     string;
}

export interface AlertPayload {
  status:     'ALERT_TRIGGERED' | 'SAFE';
  sound?:     string;
  confidence?: number;
  location?:  { lat: number; lng: number } | null;
  timestamp?: string;
}

export interface AuthCredentials {
  name: string;
  email: string;
  phone: string;
  password: string;
  contacts: string[];
}

export type ViewMode = 'landing' | 'login' | 'signup' | 'dashboard';

export interface AlertEntry {
  id: string;
  title: string;
  message: string;
  severity: 'safe' | 'warning' | 'critical';
  timestamp: string;
  source: string;
}
