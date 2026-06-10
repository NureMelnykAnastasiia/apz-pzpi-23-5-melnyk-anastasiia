import { Request, Response } from 'express';
import { StatsService } from '../services/stats.service';

export class StatsController {
  private service = new StatsService();

  getDashboard = async (req: Request, res: Response) => {
    try {
      const stats = await this.service.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}