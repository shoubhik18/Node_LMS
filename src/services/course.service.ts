import { Course } from '../models/course.model';
import { User, TrainerProfile, StudentProfile } from '../models/user.model';
import sequelize from '../database';

interface CourseData {
  courseName: string;
  trainerId: number;
  totalPrice: number;
  discountPrice?: number;
  courseCover?: string;
  availabilityType: 'always' | 'timebound';
  availableFrom?: Date;
  availableTo?: Date;
  itemType: 'pdf' | 'image' | 'video';
  itemUrl?: string;
}

export class CourseService {
  static async createCourse(courseData: CourseData): Promise<Course> {
    const transaction = await sequelize.transaction();
    try {
      // Check if trainer exists
      const trainer = await User.findOne({
        where: {
          id: courseData.trainerId,
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

      // Validate timebound availability
      if (courseData.availabilityType === 'timebound') {
        if (!courseData.availableFrom || !courseData.availableTo) {
          throw new Error('Available from and to dates are required for timebound courses');
        }
      }

      const course = await Course.create(courseData as any, { transaction });
      await transaction.commit();
      const createdCourse = await this.getCourseById(course.id);
      if (!createdCourse) {
        throw new Error('Failed to create course');
      }
      return createdCourse;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async getCourses(): Promise<Course[]> {
    return Course.findAll({
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
          model: StudentProfile,
          as: 'enrolledStudents',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'mobile']
          }]
        }
      ]
    });
  }

  static async getCourseById(id: number): Promise<Course | null> {
    return Course.findByPk(id, {
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
          model: StudentProfile,
          as: 'enrolledStudents',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'mobile']
          }]
        }
      ]
    });
  }

  static async updateCourse(id: number, courseData: Partial<CourseData>): Promise<Course | null> {
    const transaction = await sequelize.transaction();
    try {
      const course = await Course.findByPk(id);
      if (!course) {
        await transaction.rollback();
        return null;
      }

      if (courseData.trainerId) {
        const trainer = await User.findOne({
          where: {
            id: courseData.trainerId,
            category: 'Trainer'
          }
        });

        if (!trainer) {
          throw new Error('No trainer exists with this ID');
        }
      }

      await course.update(courseData, { transaction });
      await transaction.commit();
      return this.getCourseById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async deleteCourse(id: number): Promise<boolean> {
    const transaction = await sequelize.transaction();
    try {
      const deleted = await Course.destroy({
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

  static async getEnrolledStudents(courseId: number): Promise<number[]> {
    const course = await Course.findByPk(courseId, {
      include: [{
        model: StudentProfile,
        as: 'enrolledStudents',
        attributes: ['userId']
      }]
    });

    if (!course) {
      throw new Error('Course not found');
    }

    // Return array of user IDs
    return course.enrolledStudents?.map(sp => sp.userId) || [];
  }
}