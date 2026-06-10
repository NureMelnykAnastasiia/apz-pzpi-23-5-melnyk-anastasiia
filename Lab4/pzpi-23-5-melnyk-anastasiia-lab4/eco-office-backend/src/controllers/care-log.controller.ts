import { Request, Response } from 'express';
import { CareLogService } from '../services/care-log.service';
import { createCareLogSchema, updateCareLogSchema } from '../schemas/care-log.schema';
import { ZodError } from 'zod';

export class CareLogController {
  private service = new CareLogService();

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

  getByPlant = async (req: Request, res: Response) => {
    try {
      const result = await this.service.getByPlantId(req.params.plantId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

   create = async (req: Request, res: Response) => {
    try {
      const data = createCareLogSchema.parse(req.body);
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const result = await this.service.create(data, userId, userRole);
      
      res.status(201).json(result);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const data = updateCareLogSchema.parse(req.body);
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