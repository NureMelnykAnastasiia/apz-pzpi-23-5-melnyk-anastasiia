export type UserRole = 'ADMIN' | 'OFFICE_MANAGER' | 'FLORIST' | 'CLEANER';

export interface WorkerUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface Location {
  id: string;
  name: string;
  floorNumber?: number;
  description?: string;
}

export interface Plant {
  id: string;
  name?: string;
  qrCodeId: string;
  locationId?: string | null;
  speciesId?: string | null;
  healthStatus: 'HEALTHY' | 'NEEDS_ATTENTION' | 'CRITICAL';
}

export interface Sensor {
  id: string;
  macAddress: string;
  plantId?: string | null;
  sensorModel?: string;
  firmwareVersion?: string;
  isActive: boolean;
}

export interface SensorReading {
  id: string;
  sensorId: string;
  type: 'SOIL_MOISTURE' | 'AIR_TEMPERATURE' | 'AIR_HUMIDITY' | 'LIGHT_INTENSITY' | 'BATTERY_LEVEL';
  value: number;
  recordedAt?: string;
}

export interface CareLog {
  id: string;
  plantId?: string;
  taskId?: string;
  type: string;
  notes?: string;
  verifiedByScan: boolean;
  createdAt?: string;
}

export interface Task {
  id: string;
  plantId: string;
  requiredRole: UserRole;
  type: 'WATERING' | 'FERTILIZING' | 'LIGHT_ADJUSTMENT' | 'PEST_CONTROL' | 'CLEANING' | string;
  priority: number; // 1-3
  description?: string;
  dueDate?: string;
  status: 'PENDING' | 'COMPLETED' | string;
}

export interface PlantSpecies {
  id: string;
  scientificName: string;
  commonName: string;
  description?: string;
  minSoilMoisture: number;
  maxSoilMoisture: number;
  minTemperature?: number;
  maxTemperature?: number;
  minLightLux?: number;
  maxLightLux?: number;
  wateringFrequencyDays?: number;
  fertilizingFrequencyDays?: number;
}