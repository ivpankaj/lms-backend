import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";


class Teacher extends Model {
  public id!: number;
  public fullName!: string;
  public contactNumber!: string;
  public email!: string;
  public password!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public token!: string;
  public isDeleted!: boolean;
}

Teacher.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    contactNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(128),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    isDeleted: {
      type: new DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "teacher",
    sequelize,
    timestamps: true,
  }
);

sequelize.sync({ alter: false }).then(() => {
  console.log('Teacher table created.');
});

export { Teacher };