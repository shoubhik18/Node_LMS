import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, AdminProfile, TrainerProfile, StudentProfile } from '../models/user.model';

// Define interfaces for the profile types
interface IAdminProfile {
  id: number;
  userId: number;
  role: 'SuperAdmin' | 'SubAdmin';
}

interface ITrainerProfile {
  id: number;
  userId: number;
  role: 'SrTrainer' | 'JrTrainer';
}

// Extend the User type to include profiles
interface IUser extends User {
  adminProfile?: AdminProfile;
  trainerProfile?: TrainerProfile; 
  studentProfile?: StudentProfile;
}

// Extend the Request type
interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const user = await User.findByPk(decoded.userId, {
      include: [
        { model: AdminProfile, as: 'adminProfile' },
        { model: TrainerProfile, as: 'trainerProfile' },
        { model: StudentProfile, as: 'studentProfile' }
      ]
    }) as IUser;

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const isSuperAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.category !== 'Admin' || req.user.adminProfile?.role !== 'SuperAdmin') {
      return res.status(403).json({ message: 'Super Admin access required' });
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const isSubAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.category !== 'Admin' || !req.user.adminProfile?.role) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const isSrTrainer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.category !== 'Trainer' || req.user.trainerProfile?.role !== 'SrTrainer') {
      return res.status(403).json({ message: 'Senior Trainer access required' });
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const isJrTrainer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.category !== 'Trainer' || req.user.trainerProfile?.role !== 'JrTrainer') {
      return res.status(403).json({ message: 'Junior Trainer access required' });
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const isTrainer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.category !== 'Trainer') {
      return res.status(403).json({ message: 'Trainer access required' });
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const isStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.category !== 'Student') {
      return res.status(403).json({ message: 'Student access required' });
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Utility middleware to check multiple roles
export const hasAnyRole = (roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userRole = req.user.category;
      const specificRole = req.user.adminProfile?.role || req.user.trainerProfile?.role;

      if (!roles.includes(userRole) && !roles.includes(specificRole || '')) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};