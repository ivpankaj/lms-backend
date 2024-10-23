import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Project extends Model {
  public id!: number;
  public title!: string;
  public description!: string;
  public created_at!: Date;
  public projects!: Array<{}>;
}

Project.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    projects: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'projecttable',
    sequelize,
  }
);



sequelize.sync({ alter: false }).then(() => {
  console.log('mcqtable table created.');
});


export { Project };
