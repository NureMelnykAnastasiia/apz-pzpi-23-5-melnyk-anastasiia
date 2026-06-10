import { db } from '../db';
import { plants, careTasks, iotSensors, users, careLogs, plantSpecies, sensorReadings } from '../db/schema';
import { eq, sql, and, lt, desc, gte, ne } from 'drizzle-orm';

export class StatsRepository {

  async getCounts() {
    const [plantsCount] = await db.select({ count: sql<number>`count(*)` }).from(plants);
    const [sensorsCount] = await db.select({ count: sql<number>`count(*)` }).from(iotSensors);
    const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    
    return {
      plants: Number(plantsCount.count),
      sensors: Number(sensorsCount.count),
      users: Number(usersCount.count),
    };
  }

  async getPlantHealthStats() {
    return await db.select({
      status: plants.healthStatus,
      count: sql<number>`count(*)`
    })
    .from(plants)
    .groupBy(plants.healthStatus);
  }

  async getTaskStats() {
    return await db.select({
      status: careTasks.status,
      count: sql<number>`count(*)`
    })
    .from(careTasks)
    .groupBy(careTasks.status);
  }

  async getOverdueTasksCount() {
    const [result] = await db.select({ count: sql<number>`count(*)` })
      .from(careTasks)
      .where(and(
        sql`${careTasks.status} IN ('PENDING', 'IN_PROGRESS')`,
        lt(careTasks.dueDate, new Date())
      ));
    return Number(result.count);
  }

  async getTopUsers(limit: number = 5) {
    return await db.select({
      userId: users.id,
      fullName: users.fullName,
      role: users.role,
      tasksCompleted: sql<number>`count(${careLogs.id})`
    })
    .from(users)
    .leftJoin(careLogs, eq(users.id, careLogs.performedByUserId))
    .groupBy(users.id, users.fullName, users.role)
    .orderBy(desc(sql`count(${careLogs.id})`))
    .limit(limit);
  }

  async getProblematicSpecies() {
    return await db.select({
      speciesName: plantSpecies.commonName,
      unhealthyCount: sql<number>`count(${plants.id})`
    })
    .from(plants)
    .innerJoin(plantSpecies, eq(plants.speciesId, plantSpecies.id))
    .where(ne(plants.healthStatus, 'HEALTHY'))
    .groupBy(plantSpecies.commonName)
    .orderBy(desc(sql`count(${plants.id})`))
    .limit(5);
  }

  async getEnvironmentalStats() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return await db.select({
      type: sensorReadings.type,
      avgValue: sql<number>`avg(cast(${sensorReadings.value} as decimal))`
    })
    .from(sensorReadings)
    .where(gte(sensorReadings.recordedAt, oneDayAgo))
    .groupBy(sensorReadings.type);
  }

  async getLowBatterySensorsCount() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const [lowBatteryEvents] = await db.select({ count: sql<number>`count(DISTINCT ${sensorReadings.sensorId})` })
      .from(sensorReadings)
      .where(and(
        eq(sensorReadings.type, 'BATTERY_LEVEL'),
        sql`cast(${sensorReadings.value} as decimal) < 15`,
        gte(sensorReadings.recordedAt, oneDayAgo)
      ));
      
    return Number(lowBatteryEvents.count);
  }
}