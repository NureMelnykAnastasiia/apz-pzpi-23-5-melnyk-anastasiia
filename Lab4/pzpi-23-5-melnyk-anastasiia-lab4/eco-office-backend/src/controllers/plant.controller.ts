import { Request, Response } from 'express';
import { PlantService } from '../services/plant.service';
import { createPlantSchema, updatePlantSchema } from '../schemas/plant.schema';
import { ZodError } from 'zod';

export class PlantController {
  private service = new PlantService();

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
      const data = createPlantSchema.parse(req.body);
      const result = await this.service.create(data);
      res.status(201).json(result);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const data = updatePlantSchema.parse(req.body);
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

  getByLocation = async (req: Request, res: Response) => {
    try {
      const result = await this.service.getByLocation(req.params.locationId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getByFloor = async (req: Request, res: Response) => {
    try {
      const floor = parseInt(req.params.floorNumber);
      if (isNaN(floor)) {
        return res.status(400).json({ message: 'Floor number must be an integer' });
      }
      const result = await this.service.getByFloor(floor);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getSensors = async (req: Request, res: Response) => {
    try {
      const result = await this.service.getSensors(req.params.id);
      res.json(result);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  getReadings = async (req: Request, res: Response) => {
    try {
      const result = await this.service.getReadings(req.params.id);
      res.json(result);
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