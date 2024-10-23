
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class PdfModel extends Model {
  public id!: number;
  public title!: string;
  public filePath!: string;
  public topicId!: string;
  public description!: string;
  public courseId!: string;
  public isDeleted!: string;
}

PdfModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    description: {
      type: new DataTypes.STRING(250),
      allowNull: false,
    },
    topicId: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    courseId: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    filePath: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    isDeleted: {
      type: new DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
  },
  {
    tableName: 'pdfmodel',
    sequelize,
  }
);

export default PdfModel;
