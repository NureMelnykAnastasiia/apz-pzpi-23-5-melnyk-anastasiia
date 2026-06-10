import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from '../schemas/task.schema';
import { ZodError } from 'zod';

export class TaskController {
  private service = new TaskService();

  getAll = async (req: Request, res: Response) => {
    try {
      const userRole = req.user!.role;
      const result = await this.service.getAll(userRole);
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
      const data = createTaskSchema.parse(req.body);
      const result = await this.service.create(data);
      res.status(201).json(result);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const data = updateTaskSchema.parse(req.body);
      const result = await this.service.update(req.params.id, data);
      res.json(result);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };


  updateStatus = async (req: Request, res: Response) => {
    try {
      const { status } = updateTaskStatusSchema.parse(req.body);
      const userRole = req.user!.role;
      
      const result = await this.service.updateStatus(req.params.id, status, userRole);
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
    const status = error.message.includes('not found') ? 404 : 
                   error.message.includes('Access denied') ? 403 : 500;
    res.status(status).json({ message: error.message });
  }
}