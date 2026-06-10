import { db } from '../db';
import { locations } from '../db/schema';
import { eq } from 'drizzle-orm';
import { CreateLocationDto, UpdateLocationDto } from '../schemas/location.schema';

export class LocationRepository {
  async findAll() {
    return await db.query.locations.findMany({
      with: {
        plants: true,
      },
    });
  }

  async findById(id: string) {
    return await db.query.locations.findFirst({
      where: eq(locations.id, id),
      with: {
        plants: true,
      },
    });
  }

  async create(data: CreateLocationDto) {
    const [newLocation] = await db.insert(locations).values(data).returning();
    return newLocation;
  }

  async update(id: string, data: UpdateLocationDto) {
    const [updatedLocation] = await db
      .update(locations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(locations.id, id))
      .returning();
    return updatedLocation;
  }

  async delete(id: string) {
    const [deletedLocation] = await db
      .delete(locations)
      .where(eq(locations.id, id))
      .returning();
    return deletedLocation;
  }
}