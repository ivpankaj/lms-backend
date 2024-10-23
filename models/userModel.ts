import { Sequelize, DataTypes, Model } from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from '../config/database';

class Student extends Model {
  public id!: number;
  public contactNumber!: number;
  public name!: string;
  public order_id!: string;
  public order_amount!: number;
  public studentId!: string;
  public studentName!: string;
  public wallet!: number;
  public userName!: string;
  public courseName!: string;
  public courseId!: number;
  public batchId!: number;
  public strongPassword!: string;
  public isDeleted!: boolean;
  public emailAddress!: string;
  public password!: string;
  public referbyId!: string;
  public status!: boolean;
  public otp!: number;
  public token!: string;
  public isPaymentDone!: string;
  public studentProfile!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Student.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    contactNumber: {
      type: new DataTypes.BIGINT,
      allowNull: false,
      // unique: true,
      validate: {
        isTenDigits(value: number) {
          if (!/^[6-9]\d{9}$/.test(String(value))) {
            throw new Error('Contact number must be a 10-digit number starting with a digit between 6 and 9.');
          }
        }
      },
    },
    studentId: {
      type: DataTypes.STRING(),
      allowNull: false,
      // unique: true,
    },
    order_id: {
      type: DataTypes.STRING(),
      allowNull: true,
    },
    studentName: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    isPaymentDone: {
      type: new DataTypes.STRING(128),
      allowNull: true,
    },
    wallet: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      defaultValue: 0
    },
    batchId: {
      type: DataTypes.INTEGER(),
      allowNull: true,
    },
    order_amount: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      defaultValue: 0
    },
    isDeleted: {
      type: new DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userName: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    name: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    emailAddress: {
      type: new DataTypes.STRING(128),
      allowNull: false,
      // unique: true,
      validate: {
        isEmail: true,
      },
    },
    courseName: {
      type: new DataTypes.STRING(128),
      // allowNull: false,
    },
    courseId: {
      type: new DataTypes.INTEGER(),
      // allowNull: false,
    },
    password: {
      type: new DataTypes.STRING(300),
      allowNull: false,
    },
    strongPassword: {
      type: new DataTypes.STRING(128),
      allowNull: true,
    },
    referbyId: {
      type: new DataTypes.STRING(128),
      allowNull: true,
    },
    otp: {
      type: DataTypes.INTEGER(),
      allowNull: true,
    },
    status: {
      type: new DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '1 => activated or 0 => deactivated',
    },
    studentProfile: {
      type: new DataTypes.STRING(128),
      allowNull: true,
    },
    token: {
      type: new DataTypes.STRING(250),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'students',
    sequelize,
  }
);

sequelize.sync({ alter: false }).then(() => {
  console.log('Students table created.');
});

export { Student };




class Otp extends Model {
  public id!: number;
  public contactNumber!: number;
  public otp!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Otp.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    contactNumber: {
      type: new DataTypes.BIGINT, // Using BIGINT to accommodate larger numbers
      allowNull: true,
      validate: {
        isTenDigits(value: number) {
          if (!/^[6-9]\d{9}$/.test(String(value))) {
            throw new Error('Contact number must be a 10-digit number starting with a digit between 6 and 9.');
          }
        }
      },
    },
    otp: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'otp',
    sequelize,
  }
);

sequelize.sync({ alter: false }).then(() => {
  console.log('Otp table created.');
});

// sequelize.sync({ force: true }).then(() => {
//   console.log('Database synced with force.');
// });


export { Otp };

