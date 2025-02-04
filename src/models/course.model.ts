import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import { User } from './user.model';

export class Course extends Model {
  public id!: number;
  public courseName!: string;
  public trainerId!: number;
  public totalPrice!: number;
  public discountPrice?: number;
  public courseCover?: string;
  public availabilityType!: 'always' | 'timebound';
  public availableFrom?: Date;
  public availableTo?: Date;
  public itemType?: 'pdf' | 'image' | 'video';
  public itemUrl?: string;

  // Add association methods
  public getTrainer!: () => Promise<User>;
  public setTrainer!: (trainer: User) => Promise<void>;
}

Course.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    courseName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    trainerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discountPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    courseCover: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    availabilityType: {
      type: DataTypes.ENUM('always', 'timebound'),
      allowNull: false,
      defaultValue: 'always',
    },
    availableFrom: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    availableTo: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    itemType: {
      type: DataTypes.ENUM('pdf', 'image', 'video'),
      allowNull: true,
    },
    itemUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Course',
  }
);

export default Course; 