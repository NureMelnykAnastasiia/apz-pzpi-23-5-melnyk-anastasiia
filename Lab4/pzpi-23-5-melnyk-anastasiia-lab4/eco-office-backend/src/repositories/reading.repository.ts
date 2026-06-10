import { db } from '../db';
import { sensorReadings } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { CreateReadingDto, UpdateReadingDto } from '../schemas/reading.schema';

export class ReadingRepository {
  async findAll() {
    return await db.query.sensorReadings.findMany({
      limit: 100,
      orderBy: [desc(sensorReadings.recordedAt)],
      with: {
        sensor: true,
      },
    });
  }

  async findById(id: string) {
    return await db.query.sensorReadings.findFirst({
      where: eq(sensorReadings.id, id),
      with: {
        sensor: true,
      },
    });
  }


  async findBySensorId(sensorId: string) {
    return await db.query.sensorReadings.findMany({
      where: eq(sensorReadings.sensorId, sensorId),
      orderBy: [desc(sensorReadings.recordedAt)],
      limit: 50,
    });
  }

  async create(data: CreateReadingDto) {
    const [newReading] = await db.insert(sensorReadings).values({
      ...data,
      value: data.value.toString(), 
      recordedAt: data.recordedAt ? new Date(data.recordedAt) : new Date(),
    }).returning();
    return newReading;
  }

  async update(id: string, data: UpdateReadingDto) {
    const updateData: any = { ...data };
    if (data.value !== undefined) updateData.value = data.value.toString();
    if (data.recordedAt) updateData.recordedAt = new Date(data.recordedAt);

    const [updatedReading] = await db
      .update(sensorReadings)
      .set(updateData)
      .where(eq(sensorReadings.id, id))
      .returning();
    return updatedReading;
  }

  async delete(id: string) {
    const [deletedReading] = await db
      .delete(sensorReadings)
      .where(eq(sensorReadings.id, id))
      .returning();
    return deletedReading;
  }
}