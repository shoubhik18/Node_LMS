import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  logging: false,
  define: {
    // Add these options to ensure consistent table creation
    freezeTableName: true,
    timestamps: true
  }
});

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Successfully connected to the database.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

export { testConnection };
export default sequelize;