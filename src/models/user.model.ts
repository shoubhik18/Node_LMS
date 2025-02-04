import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import { Batch, BatchStudent } from './batch.model';

// Define interfaces for profiles
interface AdminProfileAttributes {
  id: number;
  userId: number;
  role: 'SuperAdmin' | 'SubAdmin';
}

interface TrainerProfileAttributes {
  id: number;
  userId: number;
  role: 'SrTrainer' | 'JrTrainer';
}

interface StudentProfileAttributes {
  id: number;
  userId: number;
  courseTitle: string;
  learningMode: 'Online' | 'Offline';
  feeDetail: string;
  paymentMode: string;
}

// Base User Model
export class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public mobile!: number;
  public category!: 'Admin' | 'Trainer' | 'Student';

  // Add profile associations
  public adminProfile?: AdminProfile;
  public trainerProfile?: TrainerProfile;
  public studentProfile?: StudentProfile;
  public readonly batches?: any[];

  // Update the batches association
  static associate() {
    // Admin Profile Association
    User.hasOne(AdminProfile, {
      foreignKey: 'userId',
      as: 'adminProfile',
    });

    // Trainer Profile Association
    User.hasOne(TrainerProfile, {
      foreignKey: 'userId',
      as: 'trainerProfile',
    });

    // Student Profile Association
    User.hasOne(StudentProfile, {
      foreignKey: 'userId',
      as: 'studentProfile',
    });

    // Batch Association (for students)
    User.belongsToMany(Batch, {
      through: {
        model: BatchStudent
      },
      foreignKey: 'studentId',
      as: 'batches'
    });

    // Batch Association (for trainers) 
    User.hasMany(Batch, {
      foreignKey: 'trainerId',
      as: 'trainerBatches'
    });
  }
}

export class AdminProfile extends Model implements AdminProfileAttributes {
  public id!: number;
  public userId!: number;
  public role!: 'SuperAdmin' | 'SubAdmin';
}

export class TrainerProfile extends Model implements TrainerProfileAttributes {
  public id!: number;
  public userId!: number;
  public role!: 'SrTrainer' | 'JrTrainer';
}

export class StudentProfile extends Model implements StudentProfileAttributes {
  public id!: number;
  public userId!: number;
  public courseTitle!: string;
  public learningMode!: 'Online' | 'Offline';
  public feeDetail!: string;
  public paymentMode!: string;
}

// Initialize models
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
    mobile: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('Admin', 'Trainer', 'Student'),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
  }
);

AdminProfile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id',
      },
    },
    role: {
      type: DataTypes.ENUM('SuperAdmin', 'SubAdmin'),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'AdminProfile',
  }
);

TrainerProfile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id',
      },
    },
    role: {
      type: DataTypes.ENUM('SrTrainer', 'JrTrainer'),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'TrainerProfile',
  }
);

StudentProfile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id',
      },
    },
    courseTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    learningMode: {
      type: DataTypes.ENUM('Online', 'Offline'),
      allowNull: false,
    },
    feeDetail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentMode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'StudentProfile',
  }
);