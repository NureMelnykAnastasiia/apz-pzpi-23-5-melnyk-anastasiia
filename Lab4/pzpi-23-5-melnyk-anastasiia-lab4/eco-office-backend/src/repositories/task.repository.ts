import { db } from '../db';
import { careTasks } from '../db/schema';
import { eq, desc, and, or } from 'drizzle-orm';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto } from '../schemas/task.schema';

export class TaskRepository {
  async findAll() {
    return await db.query.careTasks.findMany({
      orderBy: [desc(careTasks.createdAt)],
      with: {
        plant: true,
      },
    });
  }

  async findByRole(role: 'ADMIN' | 'OFFICE_MANAGER' | 'FLORIST' | 'CLEANER') {
    return await db.query.careTasks.findMany({
      where: eq(careTasks.requiredRole, role),
      orderBy: [desc(careTasks.createdAt)],
      with: {
        plant: true,
      },
    });
  }

  async findById(id: string) {
    return await db.query.careTasks.findFirst({
      where: eq(careTasks.id, id),
      with: {
        plant: true,
      },
    });
  }

  async create(data: CreateTaskDto) {
    const [newTask] = await db.insert(careTasks).values({
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    }).returning();
    return newTask;
  }

  async update(id: string, data: UpdateTaskDto) {
    const updateData: any = { ...data };
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);

    const [updatedTask] = await db
      .update(careTasks)
      .set(updateData)
      .where(eq(careTasks.id, id))
      .returning();
    return updatedTask;
  }

  async updateStatus(id: string, status: string) {
    const [updatedTask] = await db
      .update(careTasks)
      .set({ 
        status: status as any,
        updatedAt: new Date() 
      })
      .where(eq(careTasks.id, id))
      .returning();
    return updatedTask;
  }

  async delete(id: string) {
    const [deletedTask] = await db
      .delete(careTasks)
      .where(eq(careTasks.id, id))
      .returning();
    return deletedTask;
  }
}