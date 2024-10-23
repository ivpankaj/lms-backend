import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class FullStackWebDevelopment extends Model {
  public id!: number;
  public heading!: string;
  public title!: string;
  public description!: string;
  public isDeleted!: boolean;
  public status!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

FullStackWebDevelopment.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    heading: {
      type: DataTypes.STRING(),
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING(),
      allowNull: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '1 => activated or 0 => deactivated',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'fullstackwebdevelopment',
    sequelize,
  }
);

export { FullStackWebDevelopment };
