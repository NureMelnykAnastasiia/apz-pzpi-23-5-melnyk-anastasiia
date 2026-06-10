import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';

const userRepository = new UserRepository();

export class UserController {
  async getAll(req: Request, res: Response) {
    try {
      const users = await userRepository.findAll();

      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get users' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await userRepository.findById(id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const updateData: any = {};

      if (req.body.email) {
        updateData.email = req.body.email;
      }

      if (req.body.fullName) {
        updateData.fullName = req.body.fullName;
      }

      if (req.body.role) {
        updateData.role = req.body.role;
      }

      if (req.body.password) {
        updateData.passwordHash = await bcrypt.hash(req.body.password, 10);
      }

      const updatedUser = await userRepository.update(id, updateData);

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update user' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const deletedUser = await userRepository.delete(id);

      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        message: 'User deleted successfully',
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete user' });
    }
  }
}