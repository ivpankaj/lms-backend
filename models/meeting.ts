
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Meeting extends Model {
    public id!: number;
    public title!: string;
    public description!: string;
    public link!: string;
    public courseId!: string;
    public isDeleted!: boolean;
    public createdAt!: Date;
    public updatedAt!: Date;
}

Meeting.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(),
            allowNull: false,
        },
        courseId: {
            type: new DataTypes.STRING(128),
            allowNull: false,
          },
        description: {
            type: DataTypes.TEXT(),
            allowNull: false,
        },
        link: {
            type: DataTypes.STRING(),
            allowNull: false,
        },
        isDeleted: {
            type: new DataTypes.BOOLEAN,
            defaultValue: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: 'meeting',
        sequelize,
    }
);

sequelize.sync({ alter: true }).then(() => {
    console.log('Meeting table created.');
});


export { Meeting };