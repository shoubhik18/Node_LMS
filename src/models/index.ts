import bcrypt from 'bcrypt';
import sequelize from '../database';
import Course from './course.model';
import Chapter from './chapter.model';
import Session from './session.model';
import { User } from './user.model';

// Define associations
Course.hasMany(Chapter, { 
  foreignKey: 'courseId',
  onDelete: 'CASCADE'
});
Chapter.belongsTo(Course, { 
  foreignKey: 'courseId'
});

Chapter.hasMany(Session, { 
  foreignKey: 'chapterId',
  onDelete: 'CASCADE'
});
Session.belongsTo(Chapter, { 
  foreignKey: 'chapterId'
});

// Function to initialize database
async function initializeDatabase() {
  try {
    // Sync all models with force: false and alter: false for production
    await sequelize.sync({ force: false, alter: false });
    console.log('Database synchronized');

    // Check for default admin user
    const defaultAdmin = await User.findOne({ where: { email: 'admin@gmail.com' } });

    if (!defaultAdmin) {
      await User.create({
        username: 'admin',
        email: 'admin@gmail.com',
        password: await bcrypt.hash('admin', 10),
        role: 'Admin',
      });
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

export {
  Course,
  Chapter,
  Session,
  User,
  initializeDatabase
}; 