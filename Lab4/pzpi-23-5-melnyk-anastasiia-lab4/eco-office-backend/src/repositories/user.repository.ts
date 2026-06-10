import { db } from '../db';
import { users } from '../db/schema';
import { eq, InferInsertModel } from 'drizzle-orm';
import { RegisterDto } from '../schemas/auth.schema';

type UserUpdate = Partial<
  Pick<
    InferInsertModel<typeof users>,
    'email' | 'fullName' | 'role' | 'passwordHash'
  >
>;

export class UserRepository {
  async findByEmail(email: string) {
    return await db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  async findById(id: string) {
    return await db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  async findAll() {
    return await db.select().from(users);
  }

  async create(data: RegisterDto, passwordHash: string) {
    const [newUser] = await db
      .insert(users)
      .values({
        email: data.email,
        fullName: data.fullName,
        passwordHash,
        role: data.role || 'CLEANER',
      })
      .returning();

    return newUser;
  }

  async update(id: string, data: UserUpdate) {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();

    return updatedUser;
  }

  async delete(id: string) {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    return deletedUser;
  }
}