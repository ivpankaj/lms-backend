// models/SignUpEntry.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class ContactUsForm extends Model {
  public id!: number;
  public fullName!: string;
  public contactNumber!: string;
  public email!: string;
  public query!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

// Initialize the model
ContactUsForm.init(
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
    emailId: {
      type: DataTypes.STRING(128),
      allowNull: false,
      validate: {
        isEmail: true, // Validate that it's an email
      },
    },
    query: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
  },
  {
    tableName: 'contactus',
    sequelize,
    timestamps: true, // Automatically handle createdAt and updatedAt
  }
);

export default ContactUsForm;
