import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import jwt from 'jsonwebtoken';

export class UserController {
  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;
      
      // Validate required fields
      const requiredFields = ['name', 'email', 'mobile', 'category'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        res.status(400).json({ 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        });
        return;
      }

      // Set default password if not provided
      if (!userData.password) {
        switch (userData.category) {
          case 'Admin':
            userData.password = 'admin@123';
            break;
          case 'Trainer':
            userData.password = 'login@123';
            break;
          case 'Student':
            userData.password = 'welcome@123';
            break;
        }
      }

      // Validate category-specific fields
      switch (userData.category) {
        case 'Admin':
          if (!userData.role || !['SuperAdmin', 'SubAdmin'].includes(userData.role)) {
            res.status(400).json({ error: 'Invalid admin role' });
            return;
          }
          break;
        case 'Trainer':
          if (!userData.role || !['SrTrainer', 'JrTrainer'].includes(userData.role)) {
            res.status(400).json({ error: 'Invalid trainer role' });
            return;
          }
          break;
        case 'Student':
          const studentFields = ['courseTitle', 'learningMode', 'feeDetail', 'paymentMode'];
          const missingStudentFields = studentFields.filter(field => !userData[field]);
          if (missingStudentFields.length > 0) {
            res.status(400).json({ 
              error: `Missing student fields: ${missingStudentFields.join(', ')}` 
            });
            return;
          }
          break;
        default:
          res.status(400).json({ error: 'Invalid user category' });
          return;
      }

      const user = await UserService.createUser(userData);
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
          { userId: user.id, email: user.email, category: user.category },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '3h' }
        );

        const userResponse = {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          category: user.category,
          ...(user.adminProfile && { role: user.adminProfile.role }),
          ...(user.trainerProfile && { role: user.trainerProfile.role }),
          ...(user.studentProfile && {
            courseTitle: user.studentProfile.courseTitle,
            learningMode: user.studentProfile.learningMode
          })
        };

        res.json({
          user: userResponse,
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
      const { category } = req.query;
      const users = await UserService.getUsers(
        typeof category === 'string' ? { category } : undefined
      );
      res.json(users);
    } catch (error) {
      console.error('Error in getUsers:', error);
      res.status(500).json({ error: 'Error fetching users' });
    }
  }

  static async getUsersByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      if (!['Admin', 'Trainer', 'Student'].includes(category)) {
        res.status(400).json({ error: 'Invalid category' });
        return;
      }
      const users = await UserService.getUsers({ category });
      res.json(users);
    } catch (error) {
      console.error('Error in getUsersByCategory:', error);
      res.status(500).json({ error: 'Error fetching users by category' });
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
      const userData = req.body;
      
      // If updating a student and batch IDs are provided
      if (userData.category === 'Student' && userData.batchIds) {
        userData.batchIds = Array.isArray(userData.batchIds) 
          ? userData.batchIds 
          : JSON.parse(userData.batchIds);
      }
      
      const user = await UserService.updateUser(id, userData);
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

  static async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      if (!query) {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }
      const users = await UserService.searchUsers(query);
      res.json({
        user: users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          category: user.category,
          ...(user.adminProfile && { role: user.adminProfile.role }),
          ...(user.trainerProfile && { role: user.trainerProfile.role }),
          ...(user.studentProfile && {
            courseTitle: user.studentProfile.courseTitle,
            learningMode: user.studentProfile.learningMode
          })
        }))
      });
    } catch (error) {
      console.error('Error in searchUsers:', error);
      res.status(500).json({ error: 'Error searching users' });
    }
  }

  static async assignBatches(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const { batchIds } = req.body;

      // Validate input
      if (!Array.isArray(batchIds)) {
        res.status(400).json({ error: 'batchIds must be an array' });
        return;
      }

      const user = await UserService.getUserById(userId);
      if (!user || user.category !== 'Student') {
        res.status(404).json({ error: 'Student not found' });
        return;
      }

      await UserService.assignBatches(userId, batchIds);
      res.status(200).json({ message: 'Batches assigned successfully' });
    } catch (error) {
      console.error('Error in assignBatches:', error);
      res.status(500).json({ error: 'Error assigning batches' });
    }
  }

  static async getStudentBatches(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const user = await UserService.getUserById(userId);
      
      if (!user || user.category !== 'Student') {
        res.status(404).json({ error: 'Student not found' });
        return;
      }

      const batches = await UserService.getStudentBatches(userId);
      res.json(batches);
    } catch (error) {
      console.error('Error in getStudentBatches:', error);
      res.status(500).json({ error: 'Error fetching student batches' });
    }
  }
}