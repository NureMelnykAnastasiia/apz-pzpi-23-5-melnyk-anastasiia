import { db } from '../db';
import { iotSensors } from '../db/schema';
import { eq } from 'drizzle-orm';
import { CreateSensorDto, UpdateSensorDto } from '../schemas/sensor.schema';

export class SensorRepository {
  async findAll() {
    return await db.query.iotSensors.findMany({
      with: {
        plant: true, 
      },
    });
  }

  async findById(id: string) {
    return await db.query.iotSensors.findFirst({
      where: eq(iotSensors.id, id),
      with: {
        plant: true,
        readings: {
          limit: 10,
          orderBy: (readings, { desc }) => [desc(readings.recordedAt)],
        },
      },
    });
  }

  async findByMac(macAddress: string) {
    return await db.query.iotSensors.findFirst({
      where: eq(iotSensors.macAddress, macAddress),
    });
  }

  async create(data: CreateSensorDto) {
    const [newSensor] = await db.insert(iotSensors).values(data).returning();
    return newSensor;
  }

  async update(id: string, data: UpdateSensorDto) {
    const [updatedSensor] = await db
      .update(iotSensors)
      .set(data)
      .where(eq(iotSensors.id, id))
      .returning();
    return updatedSensor;
  }

  async delete(id: string) {
    const [deletedSensor] = await db
      .delete(iotSensors)
      .where(eq(iotSensors.id, id))
      .returning();
    return deletedSensor;
  }
}