import { PlantSpeciesRepository } from '../repositories/plant-species.repository';
import { CreatePlantSpeciesDto, UpdatePlantSpeciesDto } from '../schemas/plant-species.schema';

export class PlantSpeciesService {
  private repo = new PlantSpeciesRepository();

  async getAll() {
    return await this.repo.findAll();
  }

  async getById(id: string) {
    const species = await this.repo.findById(id);
    if (!species) throw new Error('Plant species not found');
    return species;
  }

  async create(data: CreatePlantSpeciesDto) {
    return await this.repo.create(data);
  }

  async update(id: string, data: UpdatePlantSpeciesDto) {
    await this.getById(id);
    return await this.repo.update(id, data);
  }

  async delete(id: string) {
    await this.getById(id);
    return await this.repo.delete(id);
  }
}