import { Request, Response } from 'express';
import { PlantSpeciesService } from '../services/plant-species.service';
import { createPlantSpeciesSchema, updatePlantSpeciesSchema } from '../schemas/plant-species.schema';
import { ZodError } from 'zod';

export class PlantSpeciesController {
  private service = new PlantSpeciesService();

  getAll = async (req: Request, res: Response) => {
    try {
      const result = await this.service.getAll();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const result = await this.service.getById(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const data = createPlantSpeciesSchema.parse(req.body);
      const result = await this.service.create(data);
      res.status(201).json(result);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const data = updatePlantSpeciesSchema.parse(req.body);
      const result = await this.service.update(req.params.id, data);
      res.json(result);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await this.service.delete(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  private handleError(res: Response, error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    const status = error.message.includes('not found') ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
}