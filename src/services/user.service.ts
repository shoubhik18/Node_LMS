import bcrypt from "bcrypt";
import { User, AdminProfile, TrainerProfile, StudentProfile } from "../models/user.model";
import { Batch } from "../models/batch.model";
import sequelize from "../database";
import { Op } from "sequelize";
import { Course } from "../models/course.model";

interface UserData {
  name: string;
  email: string;
  password: string;
  mobile: number;
  category: 'Admin' | 'Trainer' | 'Student';
  role?: string;
  courseId?: number;
  learningMode?: 'Online' | 'Offline' | 'Hybrid';
  feeDetail?: string;
  paymentMode?: string;
}

export class UserService {
  static async createUser(userData: UserData): Promise<User> {
    const transaction = await sequelize.transaction();
    try {
      // Check if user with email already exists
      const existingUser = await User.findOne({ 
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        mobile: userData.mobile,
        category: userData.category,
      }, { transaction });

      switch (userData.category) {
        case 'Admin':
          await AdminProfile.create({
            userId: user.id,
            role: userData.role,
          }, { transaction });
          break;
        case 'Trainer':
          await TrainerProfile.create({
            userId: user.id,
            role: userData.role,
          }, { transaction });
          break;
        case 'Student':
          await StudentProfile.create({
            userId: user.id,
            courseId: userData.courseId,
            learningMode: userData.learningMode,
            feeDetail: userData.feeDetail,
            paymentMode: userData.paymentMode,
          }, { transaction });
          break;
      }

      await transaction.commit();
      
      // Fetch the created user without password
      const createdUser = await this.getUserById(user.id);
      if (!createdUser) {
        throw new Error('Failed to create user');
      }
      
      return createdUser;
    } catch (error) {
      // Rollback transaction only if it hasn't been committed
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        // Ignore rollback error if transaction is already committed
      }
      throw error;
    }
  }

  static async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await User.findOne({
      where: { email },
      include: [
        { model: AdminProfile, as: 'adminProfile' },
        { model: TrainerProfile, as: 'trainerProfile' },
        { model: StudentProfile, as: 'studentProfile' }
      ]
    });

    if (!user) return null;

    const isValidPassword = await bcrypt.compare(password, user.password);
    return isValidPassword ? user : null;
  }

  static async getUsers(filter?: { category?: string }): Promise<User[]> {
    const whereClause = filter?.category ? { category: filter.category } : {};
    
    return User.findAll({
      where: whereClause,
      include: [
        {
          model: AdminProfile,
          as: 'adminProfile',
        },
        {
          model: TrainerProfile,
          as: 'trainerProfile',
        },
        {
          model: StudentProfile,
          as: 'studentProfile',
        },
        {
          model: Batch,
          as: filter?.category === 'Trainer' ? 'trainerBatches' : 'enrolledBatches',
          attributes: ['id', 'batchStartDate', 'batchEndDate', 'batchTimings', 'courseId', 'trainerId'],
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['id', 'courseName']
            },
            {
              model: User,
              as: 'trainer',
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });
  }

  static async getUserById(id: number): Promise<User | null> {
    return User.findByPk(id, {
      include: [
        { 
          model: AdminProfile, 
          as: 'adminProfile' 
        },
        { 
          model: TrainerProfile, 
          as: 'trainerProfile' 
        },
        { 
          model: StudentProfile, 
          as: 'studentProfile' 
        },
        {
          model: Batch,
          as: await this.getUserCategory(id) === 'Trainer' ? 'trainerBatches' : 'enrolledBatches',
          attributes: ['id', 'batchStartDate', 'batchEndDate', 'batchTimings', 'courseId', 'trainerId'],
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['id', 'courseName']
            },
            {
              model: User,
              as: 'trainer',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      attributes: { exclude: ['password'] }
    });
  }

  static async updateUser(id: number, userData: any): Promise<User | null> {
    const transaction = await sequelize.transaction();
    try {
      const user = await User.findByPk(id);
      if (!user) {
        await transaction.rollback();
        return null;
      }

      // Update base user data
      await user.update({
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        ...(userData.password && {
          password: await bcrypt.hash(userData.password, 10)
        })
      }, { transaction });

      // Update profile data based on category
      switch (user.category) {
        case 'Admin':
          await AdminProfile.update(
            { role: userData.role },
            { where: { userId: id }, transaction }
          );
          break;
        case 'Trainer':
          await TrainerProfile.update(
            { role: userData.role },
            { where: { userId: id }, transaction }
          );
          break;
        case 'Student':
          await StudentProfile.update(
            {
              courseId: userData.courseId,
              learningMode: userData.learningMode,
              feeDetail: userData.feeDetail,
              paymentMode: userData.paymentMode
            },
            { where: { userId: id }, transaction }
          );
          break;
      }

      await transaction.commit();
      return this.getUserById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async deleteUser(id: number): Promise<boolean> {
    const transaction = await sequelize.transaction();
    try {
      // First, find the user to get their category
      const user = await User.findByPk(id);
      if (!user) {
        await transaction.rollback();
        return false;
      }

      // Delete the corresponding profile based on user category
      switch (user.category) {
        case 'Admin':
          await AdminProfile.destroy({
            where: { userId: id },
            transaction
          });
          break;
        case 'Trainer':
          await TrainerProfile.destroy({
            where: { userId: id },
            transaction
          });
          break;
        case 'Student':
          await StudentProfile.destroy({
            where: { userId: id },
            transaction
          });
          break;
      }

      // Then delete the user
      const deleted = await User.destroy({
        where: { id },
        transaction
      });

      await transaction.commit();
      return deleted > 0;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async searchUsers(query: string): Promise<User[]> {
    return User.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } }
        ]
      },
      include: [
        { 
          model: AdminProfile,
          as: 'adminProfile',
          required: false
        },
        { 
          model: TrainerProfile,
          as: 'trainerProfile',
          required: false
        },
        { 
          model: StudentProfile,
          as: 'studentProfile',
          required: false
        }
      ],
      attributes: { exclude: ['password'] }
    });
  }

  static async assignBatches(userId: number, batchIds: number[]): Promise<void> {
    const transaction = await sequelize.transaction();
    try {
      const user = await User.findByPk(userId);
      if (!user || user.category !== 'Student') {
        throw new Error('Student not found');
      }

      const batches = await Batch.findAll({
        where: {
          id: batchIds
        }
      });

      // @ts-ignore - TypeScript doesn't recognize the association method
      await user.setBatches(batches, { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async getStudentBatches(userId: number): Promise<Batch[]> {
    const user = await User.findByPk(userId, {
      include: [{
        model: Batch,
        as: 'enrolledBatches',
        through: { attributes: [] },
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'courseName']
          },
          {
            model: User,
            as: 'trainer',
            attributes: ['id', 'name']
          }
        ]
      }]
    });

    if (!user || user.category !== 'Student') {
      throw new Error('Student not found');
    }

    return user.enrolledBatches || [];
  }

  // Helper method to get user category
  private static async getUserCategory(id: number): Promise<string | null> {
    const user = await User.findByPk(id, { attributes: ['category'] });
    return user ? user.category : null;
  }
}
