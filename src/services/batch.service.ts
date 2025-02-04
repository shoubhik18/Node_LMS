import { Batch, BatchStudent } from '../models/batch.model';
import sequelize from '../database';
import { User, TrainerProfile } from '../models/user.model';
import { BelongsToManySetAssociationsMixin } from 'sequelize';
import { Course } from '../models/course.model';

// Add this to the Batch class in batch.model.ts
declare module '../models/batch.model' {
  interface Batch {
    setEnrolledStudents: (students: User[], options?: any) => Promise<void>;
  }
}

interface BatchData {
  profileImage?: string;
  trainerId: number;
  courseId: number;
  studyMaterial?: string;
  batchStartDate: Date;
  batchEndDate: Date;
  batchTimings?: string;
  studentIds?: number[];
}

export class BatchService {
  static async createBatch(batchData: BatchData): Promise<Batch | null> {
    const transaction = await sequelize.transaction();
    try {
      // Check if trainer exists
      const trainer = await User.findOne({
        where: {
          id: batchData.trainerId,
          category: 'Trainer'
        },
        include: [{
          model: TrainerProfile,
          as: 'trainerProfile'
        }]
      });

      if (!trainer) {
        throw new Error('No trainer exists with this ID');
      }

      // Check if course exists
      const course = await Course.findByPk(batchData.courseId);
      if (!course) {
        throw new Error('No course exists with this ID');
      }

      const { studentIds, ...batchFields } = batchData;
      const batch = await Batch.create(batchFields, { transaction });

      if (studentIds && studentIds.length > 0) {
        const students = await User.findAll({
          where: {
            id: studentIds,
            category: 'Student'
          }
        });
        await batch.setEnrolledStudents(students, { transaction });
      }

      await transaction.commit();
      return this.getBatchById(batch.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async getBatches(): Promise<Batch[]> {
    return Batch.findAll({
      include: [
        {
          model: User,
          as: 'trainer',
          attributes: ['id', 'name', 'email'],
          include: [{
            model: TrainerProfile,
            as: 'trainerProfile',
            attributes: ['role']
          }]
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'courseName', 'totalPrice', 'discountPrice']
        },
        {
          model: User,
          as: 'enrolledStudents',
          attributes: ['id', 'name', 'email', 'mobile'],
          through: { attributes: [] }
        }
      ]
    });
  }

  static async getBatchById(id: number): Promise<Batch | null> {
    return Batch.findByPk(id, {
      include: [
        {
          model: User,
          as: 'trainer',
          attributes: ['id', 'name', 'email'],
          include: [{
            model: TrainerProfile,
            as: 'trainerProfile',
            attributes: ['role']
          }]
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'courseName', 'totalPrice', 'discountPrice']
        },
        {
          model: User,
          as: 'enrolledStudents',
          attributes: ['id', 'name', 'email', 'mobile'],
          through: { attributes: [] }
        }
      ]
    });
  }

  static async updateBatch(id: number, batchData: Partial<BatchData>): Promise<Batch | null> {
    const transaction = await sequelize.transaction();
    try {
      const batch = await Batch.findByPk(id);
      if (!batch) {
        await transaction.rollback();
        return null;
      }

      if (batchData.trainerId) {
        const trainer = await User.findOne({
          where: {
            id: batchData.trainerId,
            category: 'Trainer'
          }
        });

        if (!trainer) {
          throw new Error('No trainer exists with this ID');
        }
      }

      const { studentIds, ...updateFields } = batchData;
      await batch.update(updateFields, { transaction });

      if (studentIds) {
        const students = await User.findAll({
          where: {
            id: studentIds,
            category: 'Student'
          }
        });
        await batch.setEnrolledStudents(students, { transaction });
      }

      await transaction.commit();
      return this.getBatchById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async deleteBatch(id: number): Promise<boolean> {
    const transaction = await sequelize.transaction();
    try {
      const deleted = await Batch.destroy({
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
} 