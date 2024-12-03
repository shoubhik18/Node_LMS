import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import Chapter from './chapter.model';

class Course extends Model {
  public id!: number;
  public courseName!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public trainerName!: string;
  public noOfChapters!: number;
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
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    trainerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    noOfChapters: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Course',
    timestamps: true,
  }
);

// Define associations
Course.hasMany(Chapter, { foreignKey: 'courseId' });
Chapter.belongsTo(Course, { foreignKey: 'courseId' });

export default Course;