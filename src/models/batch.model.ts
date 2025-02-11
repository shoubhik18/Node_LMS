import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import { User } from './user.model';
import { Course } from './course.model';

export class Batch extends Model {
  public id!: number;
  public profileImage?: string; // Will store base64 string
  public trainerId!: number;  // Changed from trainerRole and trainerName
  public courseId!: number;  // Changed from courseTitle
  public studyMaterial?: string; // Made optional
  public batchStartDate!: Date;
  public batchEndDate!: Date;
  public batchTimings?: string; // Made optional

  // Add these declarations for TypeScript
  public getEnrolledStudents!: (options?: any) => Promise<User[]>;
  public readonly enrolledStudents?: User[];
  
  // Add these for TypeScript type safety
  public readonly trainer?: User;
  public readonly students?: User[];
  public readonly course?: Course;

  // Explicitly define association methods with correct aliases
  public getTrainer!: () => Promise<User>;
  public getStudents!: () => Promise<User[]>;
  public getCourse!: () => Promise<Course>;

  // Implement the method directly
  public async setEnrolledStudents(students: User[], options?: any): Promise<void> {
    if (!this.id) {
      throw new Error('Batch must be saved before setting students');
    }

    // Use BatchStudent model to create associations
    await BatchStudent.destroy({
      where: { batchId: this.id },
      ...(options && { transaction: options.transaction })
    });

    const batchStudentRecords = students.map(student => ({
      batchId: this.id,
      studentId: student.id
    }));

    await BatchStudent.bulkCreate(batchStudentRecords, options);
  }
}

Batch.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    profileImage: {
      type: DataTypes.TEXT, // Changed to TEXT to store base64 string
      allowNull: true,
    },
    trainerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    courseId: {  // Changed from courseTitle
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Course,
        key: 'id',
      },
    },
    studyMaterial: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    batchStartDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    batchEndDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    batchTimings: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Batch',
    timestamps: true,
  }
);

// Create junction table model
export const BatchStudent = sequelize.define('BatchStudent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }
}, {
  modelName: 'BatchStudent'
});

export default Batch;