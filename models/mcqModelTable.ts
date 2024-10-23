import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class MCQ extends Model {
  public id!: number;
  public title!: string;
  public question_text!: string;
  public answer_key!: string[];
  public courseId: number | undefined;
  public topicId: number | undefined;
  public correct_option!: number;
  public created_at!: Date;
}

MCQ.init(
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
    question_text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    answer_key: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    topicId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    correct_option: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'mcqtable',
    sequelize,
  }
);



sequelize.sync({ alter: false }).then(() => {
  console.log('mcqtable table created.');
});


export { MCQ };
