
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class NotesModel extends Model {
  public id!: number;
  public title!: string;
  public filePath!: string;
  public courseId!: string;
  public topicId!: string;
  public description!: string;
  public isDeleted!: string;
}

NotesModel.init(
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
    courseId: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    topicId:{
      type: new DataTypes.STRING(128),
      allowNull: true,
    },
    description :{
      type: new DataTypes.STRING,
      allowNull: true,
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
    tableName: 'notes',
    sequelize,
  }
);

export {NotesModel};