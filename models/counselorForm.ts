// models/SignUpEntry.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
//counsellor contact form
class CounselorForm extends Model {
  public id!: number;
  public fullName!: string;
  public contactNumber!: string;
  public email!: string;
  public course!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

// Initialize the model
CounselorForm.init(
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
    email: {
      type: DataTypes.STRING(128),
      allowNull: false,
      validate: {
        isEmail: true, // Validate that it's an email
      },
    },
    course: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
  },
  {
    tableName: 'counselorform',
    sequelize,
    timestamps: true, // Automatically handle createdAt and updatedAt
  }
);

export default CounselorForm;
