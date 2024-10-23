// models/SignUpEntry.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class QueryForm extends Model {
  public id!: number;
  public fullName!: string;
  public contactNumber!: string;
  public email!: string;
  public profession!: string;
  public state!: string;
  public dateOfBirth!: Date;
  public course!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

// Initialize the model
QueryForm.init(
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
    contactNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    profession: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(128),
      allowNull: false,
      validate: {
        isEmail: true, // Validate that it's an email
      },
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    course: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
  },
  {
    tableName: 'queryform',
    sequelize,
    timestamps: true, // Automatically handle createdAt and updatedAt
  }
);

export default QueryForm;
