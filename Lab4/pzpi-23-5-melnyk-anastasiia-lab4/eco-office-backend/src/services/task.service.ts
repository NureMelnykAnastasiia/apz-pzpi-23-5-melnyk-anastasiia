import { TaskRepository } from '../repositories/task.repository';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto } from '../schemas/task.schema';

export class TaskService {
  private repo = new TaskRepository();

  async getAll(userRole: string) {
    if (userRole === 'ADMIN' || userRole === 'FLORIST') {
      return await this.repo.findAll();
    }
    
    const role = userRole as 'OFFICE_MANAGER' | 'CLEANER'; 
    return await this.repo.findByRole(role);
  }

  async getById(id: string) {
    const task = await this.repo.findById(id);
    if (!task) throw new Error('Task not found');
    return task;
  }

  async create(data: CreateTaskDto) {
    return await this.repo.create(data);
  }

  async update(id: string, data: UpdateTaskDto) {
    await this.getById(id);
    return await this.repo.update(id, data);
  }

  async updateStatus(id: string, status: string, userRole: string) {
    const task = await this.getById(id);

    const isGlobalManager = userRole === 'ADMIN' || userRole === 'FLORIST';
    const isAssignedWorker = userRole === task.requiredRole;

    if (!isGlobalManager && !isAssignedWorker) {
      throw new Error('Access denied: You cannot change status of this task');
    }

    
    return await this.repo.updateStatus(id, status);
  }

  async delete(id: string) {
    await this.getById(id);
    return await this.repo.delete(id);
  }
}