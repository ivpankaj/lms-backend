import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { StudentCourseTable } from './studentCourseModel'; // Import the related model
class StudentCoursePurchased extends Model {
  public id!: number;
  public studentId!: string;
  public order_id!: string;
  public order_amount!: number;
  public course_id!: number;
  public mobile!: string;
  public isDeleted!: boolean;
  public isPaymentDone!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}
StudentCoursePurchased.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    studentId: {
      type: DataTypes.STRING(),
      allowNull: true,
    //   unique: true,
    },
    order_id: {
      type: DataTypes.STRING(),
      allowNull: true,
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isPaymentDone: {
      type: new DataTypes.STRING(128),
      allowNull: true,
    },
    order_amount: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      defaultValue : 0
    },
    mobile: {
      type: DataTypes.STRING(13),
      allowNull: false,
    },
    isDeleted: {
      type: new DataTypes.BOOLEAN,
      defaultValue: false,
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
    tableName: 'studentcoursepurchased',
    sequelize,
  }
);

sequelize.sync({ alter: false }).then(() => {
  console.log('Students table created.');
});

export { StudentCoursePurchased };





