import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import jwt from 'jsonwebtoken';

export class UserController {
  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, role } = req.body;
      const user = await UserService.createUser(username, email, role);
      res.status(201).json(user);
    } catch (error) {
      console.error('Error in createUser:', error);
      res.status(500).json({ error: 'Error creating user' });
    }
  }

  static async loginUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await UserService.authenticateUser(email, password);
      if (user) {
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '3h' }
        );
        console.log('Generated token:', token);

        const userWithoutPassword = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        };

        res.json({
          user: userWithoutPassword,
          token
        });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Error in loginUser:', error);
      res.status(500).json({ error: 'Error logging in' });
    }
  }

  static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await UserService.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching users' });
    }
  }

  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const user = await UserService.getUserById(id);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error fetching user' });
    }
  }

  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { username, email, role } = req.body;
      const user = await UserService.updateUser(id, username, email, role);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error updating user' });
    }
  }

  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const success = await UserService.deleteUser(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error deleting user' });
    }
  }
}