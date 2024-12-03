import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';

class Session extends Model {
  public id!: number;
  public sessionName!: string;
  public sessionLink!: string;
  public chapterId!: number;
}

Session.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sessionName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sessionLink: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    chapterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Session',
    timestamps: true,
  }
);

export default Session;