import { SensorRepository } from '../repositories/sensor.repository';
import { CreateSensorDto, UpdateSensorDto } from '../schemas/sensor.schema';

export class SensorService {
  private repo = new SensorRepository();

  async getAll() {
    return await this.repo.findAll();
  }

  async getById(id: string) {
    const sensor = await this.repo.findById(id);
    if (!sensor) throw new Error('Sensor not found');
    return sensor;
  }

  async create(data: CreateSensorDto) {
    const existing = await this.repo.findByMac(data.macAddress);
    if (existing) {
      throw new Error(`Sensor with MAC address ${data.macAddress} already exists`);
    }

    return await this.repo.create(data);
  }

  async update(id: string, data: UpdateSensorDto) {
    await this.getById(id);

    if (data.macAddress) {
      const existing = await this.repo.findByMac(data.macAddress);
      if (existing && existing.id !== id) {
        throw new Error(`MAC address ${data.macAddress} is already in use`);
      }
    }

    return await this.repo.update(id, data);
  }

  async delete(id: string) {
    await this.getById(id);
    return await this.repo.delete(id);
  }
}