import { apiClient } from '../client';

export interface Location {
  id: string;
  name: string;
  floorNumber: number;
}

export interface PlantSpecies { 
  id: string; 
  commonName: string; 
  scientificName: string; 
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
export interface Plant {
  id: string;
  name: string;
  qrCodeId: string;
  healthStatus: 'HEALTHY' | 'NEEDS_ATTENTION' | 'CRITICAL';
  locationId: string | null;
}

export interface SensorReading {
  type: 'SOIL_MOISTURE' | 'AIR_TEMPERATURE' | 'AIR_HUMIDITY' | 'LIGHT_INTENSITY' | 'BATTERY_LEVEL';
  value: number;
  recordedAt: string;
}

export interface Task {
  id: string;
  plantId: string;
  type: string;
  requiredRole: string;
  priority: number;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'SKIPPED';
  dueDate?: string;
}

export const apiService = {
  getLocations: async (): Promise<Location[]> => {
    const response = await apiClient.get('/api/locations');
    return response.data;
  },
  
   getSpecies: async (): Promise<PlantSpecies[]> => {
    const response = await apiClient.get('/api/species');
    return response.data;
  },
  createSpecies: async (data: any) => {
    const response = await apiClient.post('/api/species', data);
    return response.data;
  },
  updateSpecies: async ({ id, data }: { id: string, data: any }) => {
    const response = await apiClient.put(`/api/species/${id}`, data);
    return response.data;
  },


  getPlants: async (): Promise<Plant[]> => {
    const response = await apiClient.get('/api/plants');
    return response.data;
  },

  getPlantReadings: async (plantId: string): Promise<SensorReading[]> => {
    const response = await apiClient.get(`/api/plants/${plantId}/readings`);
    return response.data; 
  },
  getTasks: async (): Promise<Task[]> => {
    const response = await apiClient.get('/api/tasks');
    return response.data;
  },

  updateTaskStatus: async (taskId: string, status: string) => {
    const response = await apiClient.patch(`/api/tasks/${taskId}/status`, { status });
    return response.data;
  },

  createCareLog: async (data: { taskId: string; verifiedByScan: boolean }) => {
    try {
      const response = await apiClient.post('/api/logs', data);
      return response.data;
    } catch (error) {
     
      return { success: true };
    }
  },

  
  createPlant: async (data: any) => {
    const response = await apiClient.post('/api/plants', data);
    return response.data;
  },

  createTask: async (data: any) => {
    const response = await apiClient.post('/api/tasks', data);
    return response.data;
  }
};