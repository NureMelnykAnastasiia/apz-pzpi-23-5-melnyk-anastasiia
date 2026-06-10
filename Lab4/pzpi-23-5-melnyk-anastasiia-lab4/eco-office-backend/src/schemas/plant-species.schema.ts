import { z } from 'zod';

export const createPlantSpeciesSchema = z.object({
  scientificName: z.string().min(2),
  commonName: z.string().min(2),
  description: z.string().optional(),
  minSoilMoisture: z.number().min(0).max(100),
  maxSoilMoisture: z.number().min(0).max(100),
  minTemperature: z.number().optional(),
  maxTemperature: z.number().optional(),
  minLightLux: z.number().optional(),
  maxLightLux: z.number().optional(),
  wateringFrequencyDays: z.number().int().positive().optional(),
  fertilizingFrequencyDays: z.number().int().positive().optional(),
});


export const updatePlantSpeciesSchema = createPlantSpeciesSchema.partial();

export type CreatePlantSpeciesDto = z.infer<typeof createPlantSpeciesSchema>;
export type UpdatePlantSpeciesDto = z.infer<typeof updatePlantSpeciesSchema>;