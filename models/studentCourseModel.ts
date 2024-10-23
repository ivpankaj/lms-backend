// import { Sequelize, DataTypes, Model } from 'sequelize';
// import sequelize from '../config/database';

// class StudentCourseTable extends Model {
//   public id!: number;
//   public studentId!: number;
//   public courseId!: number;
//   public isDeleted!: boolean;
//   public status!: boolean;
//   public createdAt!: Date;
//   public updatedAt!: Date;
// }

// StudentCourseTable.init(
//   {
//     id: {
//       type: DataTypes.INTEGER.UNSIGNED,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     studentId: {
//       type: new DataTypes.STRING(128),
//       allowNull: true,
//     },
//     courseId: {
//         type: new DataTypes.STRING(128),
//         allowNull: true,
//       },
//     isDeleted: {
//       type: new DataTypes.BOOLEAN,
//       defaultValue: false,
//     },
//     status: {
//       type: new DataTypes.BOOLEAN,
//       allowNull: true,
//       defaultValue: true,
//       comment: '1 => activated or 0 => deactivated',
//     },
//     createdAt: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },
//     updatedAt: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },
//   },
//   {
//     tableName: 'studentcoursetable',
//     sequelize,
//   }
// );

// sequelize.sync({ alter: false }).then(() => {
//   console.log('course table created.');
// });


// export { StudentCourseTable };







import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class StudentCourseTable extends Model {
  public id!: number;
  public studentId!: number;
  public courseId!: number;
  public isDeleted!: boolean;
  public status!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

StudentCourseTable.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    studentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    courseId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    isDeleted: {
      type: new DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: new DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
      comment: '1 => activated or 0 => deactivated',
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
    tableName: 'studentcoursetable',
    sequelize,
  }
);

// Define associations
// StudentCourseTable.belongsTo(Student, { foreignKey: 'studentId' });
// StudentCourseTable.belongsTo(CourseTable, { foreignKey: 'courseId' });


sequelize.sync({ alter: false }).then(() => {
  console.log('StudentCourseTable created.');
});

export { StudentCourseTable };
