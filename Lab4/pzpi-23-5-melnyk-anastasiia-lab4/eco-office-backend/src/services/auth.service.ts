import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { RegisterDto, LoginDto } from '../schemas/auth.schema';
import 'dotenv/config';

export class AuthService {
  private userRepo = new UserRepository();
  private readonly jwtSecret = process.env.JWT_SECRET || 'secret';

  async register(data: RegisterDto) 
  {
 
    const existingUser = await this.userRepo.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userRepo.create(data, hashedPassword);

    const token = this.generateToken(user.id, user.role);

    const { passwordHash: _, ...userDto } = user;

    
    return { user: userDto, token };
  }

  async login(data: LoginDto) {
    const user = await this.userRepo.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user.id, user.role);
    const { passwordHash: _, ...userDto } = user;
    
    return { user: userDto, token };
  }

  private generateToken(userId: string, role: string) {
    return jwt.sign({ id: userId, role }, this.jwtSecret, { expiresIn: '7d' });
  }
}