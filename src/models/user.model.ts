import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';
import bcrypt from 'bcrypt';

interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  role: 'Admin' | 'Trainer' | 'Learner';
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public role!: 'Admin' | 'Trainer' | 'Learner';
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('Admin', 'Trainer', 'Learner'),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
  }
);

// Add more models as needed

export const models = {
  User,
  // Add other models here
};

// Function to sync all models with the database
export async function syncDatabase() {
  await sequelize.sync({ alter: true });
  console.log('Database synced');

  // Check if the default admin user exists
  const defaultAdmin = await User.findOne({ where: { email: 'admin@gmail.com' } });

  if (!defaultAdmin) {
    // Create the default admin user
    await User.create({
      username: 'admin',
      email: 'admin@gmail.com',
      password: await bcrypt.hash('admin', 10), // Hash the password
      role: 'Admin',
    });
    console.log('Default admin user created');
  } else {
    console.log('Default admin user already exists');
  }
}