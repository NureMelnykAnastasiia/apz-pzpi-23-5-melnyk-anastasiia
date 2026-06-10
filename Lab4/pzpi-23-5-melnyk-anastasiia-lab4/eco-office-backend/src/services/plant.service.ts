import { PlantRepository } from '../repositories/plant.repository';
import { CreatePlantDto, UpdatePlantDto } from '../schemas/plant.schema';

export class PlantService {
  private repo = new PlantRepository();

  async getAll() {
    return await this.repo.findAll();
  }

  async getById(id: string) {
    const plant = await this.repo.findById(id);
    if (!plant) throw new Error('Plant not found');
    return plant;
  }

  async create(data: CreatePlantDto) {

    const existingQr = await this.repo.findByQrCode(data.qrCodeId);
    if (existingQr) {
      throw new Error(`Plant with QR code ${data.qrCodeId} already exists`);
    }

    return await this.repo.create(data);
  }

  async update(id: string, data: UpdatePlantDto) {
    await this.getById(id); 
    return await this.repo.update(id, data);
  }

  async delete(id: string) {
    await this.getById(id);
    return await this.repo.delete(id);
  }

  async getByLocation(locationId: string) {
    return await this.repo.findByLocationId(locationId);
  }

  async getByFloor(floor: number) {
    return await this.repo.findByFloor(floor);
  }

  async getSensors(plantId: string) {
    await this.getById(plantId);
    return await this.repo.findSensorsByPlantId(plantId);
  }

  async getReadings(plantId: string) {
    await this.getById(plantId); 
    return await this.repo.findLatestReadingsByPlantId(plantId);
  }
}