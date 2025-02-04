import bcrypt from 'bcrypt';
import sequelize from '../database';
import { User, AdminProfile, TrainerProfile, StudentProfile } from './user.model';
import { Batch, BatchStudent } from './batch.model';
import { setupAssociations } from './associations';

// Function to initialize database
async function initializeDatabase() {
  try {
    // Setup associations first
    setupAssociations();
    
    // Sync all models
    await sequelize.sync({ force: false, alter: false });
    console.log('Database synchronized');

    // Check for default admin user
    const defaultAdmin = await User.findOne({ where: { email: 'admin@gmail.com' } });

    if (!defaultAdmin) {
      const transaction = await sequelize.transaction();
      
      try {
        const user = await User.create({
          name: 'Default Admin',
          email: 'admin@gmail.com',
          password: await bcrypt.hash('admin', 10),
          mobile: 9876543210,
          category: 'Admin',
        }, { transaction });

        await AdminProfile.create({
          userId: user.id,
          role: 'SuperAdmin',
        }, { transaction });

        await transaction.commit();
        console.log('Default admin user created');
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

export {
  User,
  AdminProfile,
  TrainerProfile,
  StudentProfile,
  Batch,
  BatchStudent,
  initializeDatabase
}; 