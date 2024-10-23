import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class NotificationTable extends Model {
  public id!: number;
  public message!: string;
  public createdAt!: Date;
  public batchId!: number;
  public updatedAt!: Date;
  public isDeleted!: boolean;
}

NotificationTable.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    batchId:{
      type: DataTypes.INTEGER,
    },
    message: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    isDeleted: {
      type: new DataTypes.BOOLEAN,
      defaultValue: false,
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
    tableName: 'notificationtable',
    sequelize,
  }
);

export { NotificationTable };
