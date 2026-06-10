import { Request, Response } from 'express';
import { ReadingService } from '../services/reading.service';
import { createReadingSchema, updateReadingSchema, createIoTReadingSchema } from '../schemas/reading.schema';
import { ZodError } from 'zod';

export class ReadingController {
  private service = new ReadingService();

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

  getBySensor = async (req: Request, res: Response) => {
    try {
      const result = await this.service.getBySensorId(req.params.sensorId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  // Для адмінки
  create = async (req: Request, res: Response) => {
    try {
      const data = createReadingSchema.parse(req.body);
      const result = await this.service.create(data);
      res.status(201).json(result);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  // --- НОВИЙ МЕТОД ДЛЯ IoT ---
  createFromIoT = async (req: Request, res: Response) => {
    try {
        // Валідуємо за схемою з MAC-адресою
        const data = createIoTReadingSchema.parse(req.body);
        const result = await this.service.createFromIoT(data);
        res.status(201).json(result);
    } catch (error: any) {
        this.handleError(res, error);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const data = updateReadingSchema.parse(req.body);
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
    const status = error.message.includes('not found') || error.message.includes('not registered') ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
}