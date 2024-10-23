
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Admin extends Model {
    public id!: number;
    public email!: string;
    public password!: string;
    public mobile!: number;
    public token!: string;
    public name!: string;
    public status!: boolean;
    public isDeleted!: boolean;
    public createdAt!: Date;
    public updatedAt!: Date;
}

Admin.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        mobile: {
            type: DataTypes.BIGINT,
            allowNull: true,
            validate: {
                isTenDigits(value: number) {
                    if (!/^[6-9]\d{9}$/.test(String(value))) {
                        throw new Error('Contact number must be a 10-digit number starting with a digit between 6 and 9.');
                    }
                }
            },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            // unique: true,
            validate: {
                isEmail: true,
            },
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        token: {
            type: DataTypes.STRING(250),
            allowNull: true,
        },
        status: {
            type: new DataTypes.BOOLEAN,
            defaultValue: true,
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
        tableName: 'admin',
        sequelize,
    }
);

sequelize.sync({ alter: false }).then(() => {
    console.log('Admin table created.');
});


export { Admin };