import { db } from '../db';
import { careTasks, plants, plantSpecies, sensorReadings, careLogs, iotSensors } from '../db/schema';
import { eq, and, desc, gte, or, inArray, lt } from 'drizzle-orm';

export class AnalysisService {

  async analyzePlantHealth(plantId: string) {
    const plant = await db.query.plants.findFirst({
      where: eq(plants.id, plantId),
      with: { species: true },
    });

    if (!plant || !plant.species) return;

    const sensors = await db.query.iotSensors.findMany({
      where: eq(iotSensors.plantId, plantId)
    });
    if (sensors.length === 0) return;

    const sensorIds = sensors.map(s => s.id);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const readings = await db.query.sensorReadings.findMany({
      where: and(
        inArray(sensorReadings.sensorId, sensorIds),
        gte(sensorReadings.recordedAt, sevenDaysAgo)
      ),
      orderBy: [desc(sensorReadings.recordedAt)],
    });

    if (readings.length === 0) return;

    const recentReadings = readings.filter(r => r.recordedAt.getTime() > Date.now() - 24 * 60 * 60 * 1000);

    await this.checkTemperatureLimits(plant, plant.species, recentReadings);
  
    await this.checkLightLimits(plant, plant.species, recentReadings);
    
    await this.checkSoilLimits(plant, plant.species, recentReadings);

    await this.analyzeWateringTrend(plant, plant.species, readings);
  
    await this.analyzePestRisksVPD(plant, recentReadings);
    
    await this.analyzeLightIntegral(plant, plant.species, readings);
    
    await this.analyzeFertilizing(plant, plant.species, readings);
  
    await this.analyzeDustAccumulation(plant, readings);

    for (const sensor of sensors) {
      const sensorSpecificReadings = readings.filter(r => r.sensorId === sensor.id);
      await this.analyzeBattery(plant, sensor, sensorSpecificReadings);
    }
  }

  private async checkTemperatureLimits(plant: any, species: any, readings: any[]) {
    const tempReading = readings.find(r => r.type === 'AIR_TEMPERATURE');
    if (!tempReading) return;

    const currentTemp = Number(tempReading.value);
  
    if (species.minTemperature && currentTemp < species.minTemperature) {
      await this.createTaskIfNotExists(plant.id, 'LIGHT_ADJUSTMENT', { 
        priority: 3,
        requiredRole: 'OFFICE_MANAGER',
        description: `COLD STRESS! Temperature ${currentTemp}°C is below the norm (${species.minTemperature}°C). Check windows/AC or relocate the plant.`,
      });
    } else {
      if (species.minTemperature && currentTemp >= species.minTemperature) {
        await this.resolveTaskIfConditionMet(plant.id, 'LIGHT_ADJUSTMENT', 'COLD STRESS');
      }
    }

    if (species.maxTemperature && currentTemp > species.maxTemperature) {
      await this.createTaskIfNotExists(plant.id, 'WATERING', { 
        priority: 3,
        description: `HEAT STRESS! Temperature ${currentTemp}°C is above the norm (${species.maxTemperature}°C). The plant is overheating.`,
      });
    } else {

      if (species.maxTemperature && currentTemp <= species.maxTemperature) {
        await this.resolveTaskIfConditionMet(plant.id, 'WATERING', 'HEAT STRESS');
      }
    }
  }

  private async checkLightLimits(plant: any, species: any, readings: any[]) {
    const lightReading = readings.find(r => r.type === 'LIGHT_INTENSITY');
    if (!lightReading) return;

    const currentLux = Number(lightReading.value);

    if (currentLux > 100 && species.maxLightLux && currentLux > species.maxLightLux) {
      await this.createTaskIfNotExists(plant.id, 'LIGHT_ADJUSTMENT', {
        priority: 2,
        description: `BURN RISK! Current light ${currentLux} lux exceeds the species maximum (${species.maxLightLux} lux). Provide shading.`,
      });
    } else {
      if (species.maxLightLux && currentLux <= species.maxLightLux) {
        await this.resolveTaskIfConditionMet(plant.id, 'LIGHT_ADJUSTMENT', 'BURN RISK');
      }
    }

    const hour = new Date().getHours();
    const isDayTime = hour > 9 && hour < 17;
    
    if (isDayTime && species.minLightLux && currentLux < species.minLightLux * 0.5) {
      await this.createTaskIfNotExists(plant.id, 'LIGHT_ADJUSTMENT', {
        priority: 2,
        description: `TOO DARK! During daytime only ${currentLux} lux (Min: ${species.minLightLux} lux). The plant lacks energy.`,
      });
    } else if (isDayTime && species.minLightLux && currentLux >= species.minLightLux) {
      await this.resolveTaskIfConditionMet(plant.id, 'LIGHT_ADJUSTMENT', 'TOO DARK');
    }
  }


  private async checkSoilLimits(plant: any, species: any, readings: any[]) {
    const soilReading = readings.find(r => r.type === 'SOIL_MOISTURE');
    if (!soilReading) return;

    const currentMoisture = Number(soilReading.value);

    if (species.maxSoilMoisture && currentMoisture > species.maxSoilMoisture + 10) {
      await this.createTaskIfNotExists(plant.id, 'CLEANING', {
        priority: 2,
        requiredRole: 'FLORIST',
        description: `ROOT DAMAGE RISK! Moisture ${currentMoisture}% exceeds the norm (${species.maxSoilMoisture}%). Check drainage and remove excess water.`,
      });
    } else {
  
      if (species.maxSoilMoisture && currentMoisture <= species.maxSoilMoisture) {
        await this.resolveTaskIfConditionMet(plant.id, 'CLEANING', 'ROOT DAMAGE RISK');
      }
    }

    if (currentMoisture <= species.minSoilMoisture) {
      await this.createTaskIfNotExists(plant.id, 'WATERING', {
        priority: 3,
        description: `CRITICALLY DRY! Moisture ${currentMoisture}% (Min: ${species.minSoilMoisture}%). Water immediately.`,
      });
    } else {
      if (currentMoisture > species.minSoilMoisture + 5) {
        await this.resolveTaskIfConditionMet(plant.id, 'WATERING', 'CRITICALLY DRY');

        await this.resolveTaskIfConditionMet(plant.id, 'WATERING', 'Moisture will reach the minimum');
      }
    }
  }

  private async analyzeWateringTrend(plant: any, species: any, readings: any[]) {
    const moistureData = readings
      .filter(r => r.type === 'SOIL_MOISTURE' && r.recordedAt.getTime() > Date.now() - 48 * 60 * 60 * 1000)
      .map(r => [r.recordedAt.getTime(), Number(r.value)]);

    if (moistureData.length < 5) return;

    const currentVal = moistureData[0][1];
    if (currentVal <= species.minSoilMoisture) return;

    const { slope, intercept } = this.linearRegression(moistureData);

    if (slope < 0) {
      const targetTime = (species.minSoilMoisture - intercept) / slope;
      const hoursLeft = (targetTime - Date.now()) / (3600 * 1000);

      if (hoursLeft <= 24 && hoursLeft > 0) {
        await this.createTaskIfNotExists(plant.id, 'WATERING', {
          priority: 2,
          dueDate: new Date(targetTime),
          description: `Moisture will reach the minimum (${species.minSoilMoisture}%) in ${hoursLeft.toFixed(1)} hours.`,
        });
      }
    }
  }

  private async analyzePestRisksVPD(plant: any, readings: any[]) {
    const tempReading = readings.find(r => r.type === 'AIR_TEMPERATURE');
    const humReading = readings.find(r => r.type === 'AIR_HUMIDITY');

    if (!tempReading || !humReading) return;

    const T = Number(tempReading.value);
    const RH = Number(humReading.value);

    const SVP = 0.6108 * Math.exp((17.27 * T) / (T + 237.3));
    const VPD = SVP * (1 - RH / 100);

    if (VPD > 2.0) {
      await this.createTaskIfNotExists(plant.id, 'PEST_CONTROL', {
        priority: 1,
        description: `High VPD (${VPD.toFixed(2)} kPa). Air is too dry. High risk of spider mites. Increase humidity.`,
      });
    } else {
      if (VPD <= 1.5) { 
        await this.resolveTaskIfConditionMet(plant.id, 'PEST_CONTROL', 'High VPD');
      }
    }

    if (VPD < 0.2) {
      await this.createTaskIfNotExists(plant.id, 'PEST_CONTROL', {
        priority: 2,
        description: `Low VPD (${VPD.toFixed(2)} kPa). Risk of fungal diseases. Improve ventilation.`,
      });
    } else {

      if (VPD >= 0.5) {
        await this.resolveTaskIfConditionMet(plant.id, 'PEST_CONTROL', 'Low VPD');
      }
    }
  }

  private async analyzeLightIntegral(plant: any, species: any, readings: any[]) {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const lightReadings = readings
      .filter(r => r.type === 'LIGHT_INTENSITY' && r.recordedAt.getTime() > oneDayAgo)
      .sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime());

    if (lightReadings.length < 5) return;

    let luxHours = 0;
    for (let i = 1; i < lightReadings.length; i++) {
      const dt = (lightReadings[i].recordedAt.getTime() - lightReadings[i - 1].recordedAt.getTime()) / (3600 * 1000);
      const avgLux = (Number(lightReadings[i].value) + Number(lightReadings[i - 1].value)) / 2;
      luxHours += avgLux * dt;
    }

    const requiredLuxHours = (species.minLightLux || 500) * 12;

    if (luxHours < requiredLuxHours * 0.6) {
      await this.createTaskIfNotExists(plant.id, 'LIGHT_ADJUSTMENT', {
        priority: 1,
        description: `DLI deficit: Collected ${luxHours.toFixed(0)} lux·h per day (Required ~${requiredLuxHours}). The plant lacks light.`,
      });
    } 
  
    else if (luxHours >= requiredLuxHours) {
        await this.resolveTaskIfConditionMet(plant.id, 'LIGHT_ADJUSTMENT', 'DLI deficit');
    }
  }

  private async analyzeFertilizing(plant: any, species: any, readings: any[]) {
    if (!species.fertilizingFrequencyDays) return;

    const lastFert = await db.query.careLogs.findFirst({
      where: and(eq(careLogs.plantId, plant.id), eq(careLogs.type, 'FERTILIZING')),
      orderBy: [desc(careLogs.performedAt)]
    });

    const lastDate = lastFert ? lastFert.performedAt : plant.createdAt;
    const daysSince = (Date.now() - lastDate.getTime()) / (1000 * 3600 * 24);

    if (daysSince >= species.fertilizingFrequencyDays) {
      await this.createTaskIfNotExists(plant.id, 'FERTILIZING', {
        priority: 1,
        description: `Scheduled fertilizing (last applied ${daysSince.toFixed(0)} days ago).`,
      });
    } else {
     
        await this.resolveTaskIfConditionMet(plant.id, 'FERTILIZING', 'Scheduled fertilizing');
    }
  }

  private async analyzeDustAccumulation(plant: any, readings: any[]) {
    const dryReadings = readings.filter(r => r.type === 'AIR_HUMIDITY' && Number(r.value) < 35);
    if (readings.length > 20 && (dryReadings.length / readings.length) > 0.5) {
      await this.createTaskIfNotExists(plant.id, 'CLEANING', {
        priority: 1,
        dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000),
        description: `High dust accumulation due to dry air. Wipe the leaves.`,
      });
    }
  }

  private async analyzeBattery(plant: any, sensor: any, readings: any[]) {
    const batReading = readings.find(r => r.type === 'BATTERY_LEVEL');
    if (!batReading) return;

    const level = Number(batReading.value);
    if (level < 15) {
      await this.createGenericTask(
        'OFFICE_MANAGER',
        'CLEANING', 
        `BATTERY REPLACEMENT REQUIRED! Sensor ${sensor.macAddress} on plant "${plant.name}". Level: ${level}%`
      );
    } 
  }

  private linearRegression(data: number[][]) {
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (const [x, y] of data) {
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
  }

  private async createTaskIfNotExists(plantId: string, type: string, details: any) {
    const existing = await db.query.careTasks.findFirst({
      where: and(
        eq(careTasks.plantId, plantId),
        eq(careTasks.type, type as any),
        or(eq(careTasks.status, 'PENDING'), eq(careTasks.status, 'IN_PROGRESS'))
      ),
    });

    if (!existing) {
      await db.insert(careTasks).values({
        plantId,
        type: type as any,
        requiredRole: details.requiredRole || (type === 'WATERING' || type === 'CLEANING' ? 'CLEANER' : 'FLORIST'),
        status: 'PENDING',
        priority: details.priority || 1,
        dueDate: details.dueDate || new Date(),
        description: details.description,
      });
      console.log(`[Analysis] Created ${type} task for plant ${plantId}`);
    }
  }

  private async resolveTaskIfConditionMet(plantId: string, type: string, descriptionKeyword: string) {
    const tasks = await db.query.careTasks.findMany({
      where: and(
        eq(careTasks.plantId, plantId),
        eq(careTasks.type, type as any),
        or(eq(careTasks.status, 'PENDING'), eq(careTasks.status, 'IN_PROGRESS'))
      ),
    });

    for (const task of tasks) {
      if (task.description && task.description.includes(descriptionKeyword)) {
        await db.update(careTasks)
          .set({ 
            status: 'COMPLETED',
            updatedAt: new Date()
          })
          .where(eq(careTasks.id, task.id));
        
        console.log(`[Analysis]  Resolved task ${task.id} (${descriptionKeyword}) for plant ${plantId} - condition met.`);
        
      }
    }
  }

  private async createGenericTask(role: string, type: string, description: string) {
    console.log(`[Generic Task] ${type} for ${role}: ${description}`);
  }
}