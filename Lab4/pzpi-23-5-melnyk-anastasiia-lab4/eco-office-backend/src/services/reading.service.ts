import { ReadingRepository } from '../repositories/reading.repository';
import { SensorRepository } from '../repositories/sensor.repository'; 
import { CreateReadingDto, UpdateReadingDto, CreateIoTReadingDto } from '../schemas/reading.schema';
import { db } from '../db';
import { iotSensors } from '../db/schema';
import { eq } from 'drizzle-orm';
import { AnalysisService } from './analysis.service';

export class ReadingService {
  private repo = new ReadingRepository();
  private sensorRepo = new SensorRepository(); 
  private analysisService = new AnalysisService();
  
  async getAll() {
    return await this.repo.findAll();
  }

  async getById(id: string) {
    const reading = await this.repo.findById(id);
    if (!reading) throw new Error('Reading not found');
    return reading;
  }

  async getBySensorId(sensorId: string) {
    return await this.repo.findBySensorId(sensorId);
  }

  // Створення для Адмінки (через ID)
  async create(data: CreateReadingDto) 
  {
    const sensor = await db.query.iotSensors.findFirst({
        where: eq(iotSensors.id, data.sensorId)
    });
    
    if (!sensor) {
        throw new Error('Sensor not found');
    }

    const newReading = await this.repo.create(data);
    this.triggerAnalysis(sensor.plantId); // Виніс в окремий метод
    return newReading;
  }

  // --- НОВИЙ МЕТОД ДЛЯ IoT ---
  async createFromIoT(data: CreateIoTReadingDto) {
    // 1. Шукаємо сенсор за MAC-адресою
    const sensor = await this.sensorRepo.findByMac(data.macAddress);
    
    if (!sensor) {
        throw new Error(`Device with MAC ${data.macAddress} not registered`);
    }

    // 2. Формуємо об'єкт для репозиторія (підставляємо ID)
    const readingData: CreateReadingDto = {
        sensorId: sensor.id,
        type: data.type,
        value: data.value,
        recordedAt: data.recordedAt
    };

    // 3. Зберігаємо
    const newReading = await this.repo.create(readingData);
    
    // 4. Запускаємо аналіз
    this.triggerAnalysis(sensor.plantId);

    return newReading;
  }

  // Допоміжний метод для аналізу
  private triggerAnalysis(plantId: string | null) {
      if (plantId) {
        this.analysisService.analyzePlantHealth(plantId)
            .then(() => console.log(`Analysis completed for plant ${plantId}`))
            .catch(err => console.error('Analysis error:', err));
    }
  }

  async update(id: string, data: UpdateReadingDto) {
    await this.getById(id);
    return await this.repo.update(id, data);
  }

  async delete(id: string) {
    await this.getById(id);
    return await this.repo.delete(id);
  }
}