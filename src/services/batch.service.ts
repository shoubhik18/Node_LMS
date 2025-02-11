import { Batch, BatchStudent } from '../models/batch.model';
import sequelize from '../database';
import { User, TrainerProfile } from '../models/user.model';
import { BelongsToManySetAssociationsMixin } from 'sequelize';
import { Course } from '../models/course.model';
import { Op } from 'sequelize';

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
      // Validate input data
      if (!batchData.trainerId || isNaN(batchData.trainerId)) {
        throw new Error('Invalid trainer ID');
      }

      if (!batchData.courseId || isNaN(batchData.courseId)) {
        throw new Error('Invalid course ID');
      }

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

        // Use BatchStudent model directly to create associations
        const batchStudentRecords = students.map(student => ({
          batchId: batch.id,
          studentId: student.id
        }));

        await BatchStudent.bulkCreate(batchStudentRecords, { transaction });
      }

      await transaction.commit();
      return this.getBatchById(batch.id);
    } catch (error) {
      await transaction.rollback();
      console.error('Error in createBatch:', error);
      throw error;
    }
  }

  static async getBatches(): Promise<Batch[]> {
    try {
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
            as: 'students',
            attributes: ['id', 'name', 'email', 'mobile'],
            through: { attributes: [] }
          }
        ],
        where: {
          trainerId: {
            [Op.not]: null
          },
          courseId: {
            [Op.not]: null
          }
        }
      });
    } catch (error) {
      console.error('Error in getBatches:', error);
      throw new Error('Failed to fetch batches');
    }
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
          as: 'students',
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