import { User, AdminProfile, TrainerProfile, StudentProfile } from './user.model';
import { Batch, BatchStudent } from './batch.model';
import { Course } from './course.model';

// Set up many-to-many relationship
export const setupAssociations = () => {
  // User-Profile associations
  User.hasOne(AdminProfile, { 
    foreignKey: 'userId',
    as: 'adminProfile'
  });

  AdminProfile.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  User.hasOne(TrainerProfile, { 
    foreignKey: 'userId',
    as: 'trainerProfile'
  });

  TrainerProfile.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  User.hasOne(StudentProfile, { 
    foreignKey: 'userId',
    as: 'studentProfile'
  });

  StudentProfile.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // Course-Trainer association
  User.hasMany(Course, {
    foreignKey: 'trainerId',
    as: 'courses'
  });

  Course.belongsTo(User, {
    foreignKey: 'trainerId',
    as: 'trainer'
  });

  // Batch associations
  User.hasMany(Batch, {
    foreignKey: 'trainerId',
    as: 'trainerBatches'
  });

  Batch.belongsTo(User, {
    foreignKey: 'trainerId',
    as: 'trainer'
  });

  Course.hasMany(Batch, {
    foreignKey: 'courseId',
    as: 'batches'
  });

  Batch.belongsTo(Course, {
    foreignKey: 'courseId',
    as: 'course'
  });

  // Many-to-Many: User (Students) to Batch
  User.belongsToMany(Batch, {
    through: BatchStudent,
    foreignKey: 'studentId',
    as: 'enrolledBatches'
  });

  Batch.belongsToMany(User, {
    through: BatchStudent,
    foreignKey: 'batchId',
    as: 'students'
  });

  // Course-Student association
  Course.hasMany(StudentProfile, {
    foreignKey: 'courseId',
    as: 'enrolledStudents'
  });

  StudentProfile.belongsTo(Course, {
    foreignKey: 'courseId',
    as: 'course'
  });
}; 