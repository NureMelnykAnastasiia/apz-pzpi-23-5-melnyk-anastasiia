import { db } from '../db';
import { plants, locations, iotSensors, sensorReadings } from '../db/schema';
import { eq, inArray, desc } from 'drizzle-orm';
import { CreatePlantDto, UpdatePlantDto } from '../schemas/plant.schema';

export class PlantRepository {
  async findAll() {
    return await db.query.plants.findMany({
      with: {
        species: true,
        location: true,
      },
    });
  }

  async findById(id: string) {
    return await db.query.plants.findFirst({
      where: eq(plants.id, id),
      with: {
        species: true,
        location: true,
        sensors: true, 
      },
    });
  }

  async findByQrCode(qrCodeId: string) {
    return await db.query.plants.findFirst({
      where: eq(plants.qrCodeId, qrCodeId),
    });
  }

  async create(data: CreatePlantDto) {
    const [newPlant] = await db.insert(plants).values(data).returning();
    return newPlant;
  }

  async update(id: string, data: UpdatePlantDto) {
    const [updatedPlant] = await db
      .update(plants)
      .set({ ...data })
      .where(eq(plants.id, id))
      .returning();
    return updatedPlant;
  }

  async delete(id: string) {
    const [deletedPlant] = await db
      .delete(plants)
      .where(eq(plants.id, id))
      .returning();
    return deletedPlant;
  }

   async findByLocationId(locationId: string) {
    return await db.query.plants.findMany({
      where: eq(plants.locationId, locationId),
      with: {
        species: true,
      },
    });
  }

 
  async findByFloor(floorNumber: number) 
  {
    const locationsOnFloor = await db.query.locations.findMany({
      where: eq(locations.floorNumber, floorNumber),
    });

    const locationIds = locationsOnFloor.map((l) => l.id);

    if (locationIds.length === 0) {
      return [];
    }

    return await db.query.plants.findMany({
      where: inArray(plants.locationId, locationIds),
      with: {
        species: true,
        location: true,
      },
    });
  }

  async findSensorsByPlantId(plantId: string) {
    return await db.query.iotSensors.findMany({
      where: eq(iotSensors.plantId, plantId),
    });
  }

  async findLatestReadingsByPlantId(plantId: string) 
  {
    return await db.query.iotSensors.findMany({
      where: eq(iotSensors.plantId, plantId),
      with: {
        readings: {
          limit: 5,
          orderBy: [desc(sensorReadings.recordedAt)],
        },
      },
    });
  }
}