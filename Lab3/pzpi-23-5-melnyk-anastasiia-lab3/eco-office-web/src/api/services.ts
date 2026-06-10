import { apiClient } from './client';
import type {
  WorkerUser,
  Plant,
  Location,
  Sensor,
  CareLog,
  PlantSpecies,
  SensorReading,
  Task
} from '../types/index';

export const userService = {
  getAll: () => apiClient.get<WorkerUser[]>('/users'),
  getById: (id: string) => apiClient.get<WorkerUser>(`/users/${id}`),
  update: (id: string, data: { email: string; fullName: string; role: string }) => 
    apiClient.put<WorkerUser>(`/users/${id}`, data),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
};

export const plantService = {
  getAll: () => apiClient.get<Plant[]>('/plants'),
  getById: (id: string) => apiClient.get<Plant>(`/plants/${id}`),
  create: (data: Partial<Plant>) => apiClient.post<Plant>('/plants', data),
  update: (id: string, data: Partial<Plant>) => 
    apiClient.put<Plant>(`/plants/${id}`, data).catch(() => apiClient.patch<Plant>(`/plants/${id}`, data)),
  delete: (id: string) => apiClient.delete(`/plants/${id}`),
};

export const locationService = {
  getAll: () => apiClient.get<Location[]>('/locations'),
  create: (data: Partial<Location>) => apiClient.post<Location>('/locations', data),
  update: (id: string, data: Partial<Location>) => apiClient.put<Location>(`/locations/${id}`, data),
  delete: (id: string) => apiClient.delete(`/locations/${id}`),
};

export const sensorService = {
  getAll: () => apiClient.get<Sensor[]>('/sensors'),
  getById: (id: string) => apiClient.get<Sensor>(`/sensors/${id}`),
  create: (data: Partial<Sensor>) => apiClient.post<Sensor>('/sensors', data),
  update: (id: string, data: Partial<Sensor>) => apiClient.put<Sensor>(`/sensors/${id}`, data),
  delete: (id: string) => apiClient.delete(`/sensors/${id}`),
};

export const readingService = {
  getAll: () => apiClient.get<SensorReading[]>('/readings')
    .catch(() => apiClient.get<SensorReading[]>('/readings/iot')),
};

export const taskService = {
  getAll: () => apiClient.get<Task[]>('/tasks'),
  create: (data: Partial<Task>) => apiClient.post<Task>('/tasks', data),
  updateStatus: (id: string, status: string) => apiClient.patch<Task>(`/tasks/${id}`, { status }),
};

export const logService = {
  getAll: () => apiClient.get<CareLog[]>('/logs'),
  create: (data: Partial<CareLog>) => apiClient.post<CareLog>('/logs', data),
};

export const speciesService = {
  getAll: () => apiClient.get<PlantSpecies[]>('/species'),
  getById: (id: string) => apiClient.get<PlantSpecies>(`/species/${id}`),
  create: (data: Partial<PlantSpecies>) => apiClient.post<PlantSpecies>('/species', data),
  update: (id: string, data: Partial<PlantSpecies>) => apiClient.put<PlantSpecies>(`/species/${id}`, data),
  delete: (id: string) => apiClient.delete(`/species/${id}`),
};

export const adminService = {
  getBackup: () => apiClient.get('/admin/backup', { responseType: 'blob' })
    .catch(() => apiClient.get('/backup', { responseType: 'blob' })),
};