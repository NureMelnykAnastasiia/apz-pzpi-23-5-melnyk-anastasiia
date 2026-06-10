import { LocationRepository } from '../repositories/location.repository';
import { CreateLocationDto, UpdateLocationDto } from '../schemas/location.schema';

export class LocationService {
  private repo = new LocationRepository();

  async getAll() {
    return await this.repo.findAll();
  }

  async getById(id: string) {
    const location = await this.repo.findById(id);
    if (!location) throw new Error('Location not found');
    return location;
  }

  async create(data: CreateLocationDto) {
    return await this.repo.create(data);
  }

  async update(id: string, data: UpdateLocationDto) {
    await this.getById(id); 
    return await this.repo.update(id, data);
  }

  async delete(id: string) {
    await this.getById(id);

    return await this.repo.delete(id);
  }
}