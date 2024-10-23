// models/SignUpEntry.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
//counsellor contact form
class Counsellor_registration extends Model {
  public id!: number;
  public fullName!: string;
  public contactNumber!: string;
  public email!: string;
  public password!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public token!: string;
  public address!: string;
  public isDeleted!: boolean;
}

// Initialize the model
Counsellor_registration.init(
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
        isEmail: true, // Validate that it's an email
      },
    },
    isDeleted: {
      type: new DataTypes.BOOLEAN,
      defaultValue: false,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
       
      },
    },
  
  },
  {
    tableName: "counselorregistration",
    sequelize,
    timestamps: true, // Automatically handle createdAt and updatedAt
  }
);

export default Counsellor_registration;