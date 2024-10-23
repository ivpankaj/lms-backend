import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class UserAnswer extends Model {
  public id!: number;
  public user_id!: number;
  public quiz_id!: string;
  public answers!: Record<number, number>; // { questionId: selectedOption }
  public score!: number;
  public created_at!: Date;
}

UserAnswer.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    quiz_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    answers: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'user_answers',
    sequelize,
  }
);

export { UserAnswer };