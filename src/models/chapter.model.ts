import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import Session from './session.model';

class Chapter extends Model {
  public id!: number;
  public chapterName!: string;
  public noOfSessions!: number;
  public courseId!: number;
}

Chapter.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    chapterName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    noOfSessions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Chapter',
    timestamps: true,
  }
);

// Define associations
Chapter.hasMany(Session, { foreignKey: 'chapterId' });
Session.belongsTo(Chapter, { foreignKey: 'chapterId' });

export default Chapter;