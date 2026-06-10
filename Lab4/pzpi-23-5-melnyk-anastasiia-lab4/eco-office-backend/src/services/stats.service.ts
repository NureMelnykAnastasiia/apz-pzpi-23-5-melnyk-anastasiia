import { StatsRepository } from '../repositories/stats.repository';

export class StatsService {
  private repo = new StatsRepository();

  async getDashboardStats() {
    const counts = await this.repo.getCounts();
    const health = await this.repo.getPlantHealthStats();
    const tasks = await this.repo.getTaskStats();
  
    const healthSummary = {
      HEALTHY: 0,
      NEEDS_ATTENTION: 0,
      CRITICAL: 0
    };
    health.forEach(h => {
      healthSummary[h.status] = Number(h.count);
    });

    const tasksSummary = {
      PENDING: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      SKIPPED: 0
    };
    tasks.forEach(t => {
      tasksSummary[t.status] = Number(t.count);
    });

    return {
      overview: counts,
      plantHealth: healthSummary,
      tasks: tasksSummary,
      attentionRequired: healthSummary.NEEDS_ATTENTION + healthSummary.CRITICAL,
      pendingTasks: tasksSummary.PENDING + tasksSummary.IN_PROGRESS
    };
  }
}