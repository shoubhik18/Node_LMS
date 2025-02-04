import { User, AdminProfile, TrainerProfile, StudentProfile } from './user.model';
import { Batch, BatchStudent } from './batch.model';
import { Course } from './course.model';

// Set up many-to-many relationship
export const setupAssociations = () => {
  // User-Profile associations
  User.hasOne(AdminProfile, { 
    as: 'adminProfile',
    foreignKey: 'userId'
  });

  User.hasOne(TrainerProfile, { 
    as: 'trainerProfile',
    foreignKey: 'userId'
  });

  User.hasOne(StudentProfile, { 
    as: 'studentProfile',
    foreignKey: 'userId'
  });

  AdminProfile.belongsTo(User, {
    foreignKey: 'userId'
  });

  TrainerProfile.belongsTo(User, {
    foreignKey: 'userId'
  });

  StudentProfile.belongsTo(User, {
    foreignKey: 'userId'
  });

  // Batch-Course association
  Batch.belongsTo(Course, {
    foreignKey: 'courseId',
    as: 'course'
  });

  Course.hasMany(Batch, {
    foreignKey: 'courseId',
    as: 'batches'
  });

  // Batch-User (Trainer) association
  Batch.belongsTo(User, {
    foreignKey: 'trainerId',
    as: 'trainer'
  });

  // Batch-User (Students) association
  Batch.belongsToMany(User, {
    through: BatchStudent,
    foreignKey: 'batchId',
    otherKey: 'studentId',
    as: 'enrolledStudents'
  });

  User.belongsToMany(Batch, {
    through: BatchStudent,
    foreignKey: 'studentId',
    otherKey: 'batchId',
    as: 'batches'
  });

  // Course-Trainer association
  Course.belongsTo(User, {
    as: 'trainer',
    foreignKey: 'trainerId',
    constraints: true,
    onDelete: 'CASCADE'
  });

  User.hasMany(Course, {
    as: 'courses',
    foreignKey: 'trainerId'
  });
}; 