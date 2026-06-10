import { db } from '../db';
import { plantSpecies } from '../db/schema';
import { eq } from 'drizzle-orm';
import { CreatePlantSpeciesDto, UpdatePlantSpeciesDto } from '../schemas/plant-species.schema';

export class PlantSpeciesRepository {
  async findAll() {
    return await db.query.plantSpecies.findMany();
  }

  async findById(id: string) {
    return await db.query.plantSpecies.findFirst({
      where: eq(plantSpecies.id, id),
    });
  }

  async create(data: CreatePlantSpeciesDto) {
    const [newSpecies] = await db.insert(plantSpecies).values(data).returning();
    return newSpecies;
  }

  async update(id: string, data: UpdatePlantSpeciesDto) {
    const [updatedSpecies] = await db
      .update(plantSpecies)
      .set({ ...data })
      .where(eq(plantSpecies.id, id))
      .returning();
    return updatedSpecies;
  }

  async delete(id: string) {
    const [deletedSpecies] = await db
      .delete(plantSpecies)
      .where(eq(plantSpecies.id, id))
      .returning();
    return deletedSpecies;
  }
}