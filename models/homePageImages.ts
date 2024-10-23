// models/SignUpEntry.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
//counsellor contact form
class HomePageImages extends Model {
  public id!: number;
  public ImageId!: number;
  public title!: string;
  public imageUrl!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

// Initialize the model
HomePageImages.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    imageUrl: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    ImageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
  },
  {
    tableName: 'homepageimage',
    sequelize,
    timestamps: true, // Automatically handle createdAt and updatedAt
  }
);

export default HomePageImages;
