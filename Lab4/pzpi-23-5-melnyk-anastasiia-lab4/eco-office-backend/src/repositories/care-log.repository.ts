import { db } from '../db';
import { careLogs } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { CreateCareLogDto, UpdateCareLogDto } from '../schemas/care-log.schema';

export class CareLogRepository {
  async findAll() {
    return await db.query.careLogs.findMany({
      limit: 100,
      orderBy: [desc(careLogs.performedAt)],
      with: {
        plant: true,
        performedBy: true,
        task: true,
      },
    });
  }

  async findById(id: string) {
    return await db.query.careLogs.findFirst({
      where: eq(careLogs.id, id),
      with: {
        plant: true,
        performedBy: true,
        task: true,
      },
    });
  }

  async findByPlantId(plantId: string) {
    return await db.query.careLogs.findMany({
      where: eq(careLogs.plantId, plantId),
      orderBy: [desc(careLogs.performedAt)],
      with: {
        performedBy: true,
      },
    });
  }

  async create(data: CreateCareLogDto, tx: any = db) {
    const [newLog] = await tx.insert(careLogs).values({
      ...data,
      performedAt: data.performedAt ? new Date(data.performedAt) : new Date(),
    }).returning();
    
    return newLog;
  }

  async update(id: string, data: UpdateCareLogDto) {
    const updateData: any = { ...data };
    if (data.performedAt) updateData.performedAt = new Date(data.performedAt);

    const [updatedLog] = await db
      .update(careLogs)
      .set(updateData)
      .where(eq(careLogs.id, id))
      .returning();
    return updatedLog;
  }

  async delete(id: string) {
    const [deletedLog] = await db
      .delete(careLogs)
      .where(eq(careLogs.id, id))
      .returning();
    return deletedLog;
  }
}