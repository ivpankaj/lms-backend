// import { DataTypes, Model } from 'sequelize';
// import sequelize from '../config/database';

// class Activity extends Model {
//     public id!: number;
//     public userId!: number;
//     public activity!: Array<{
//         videoId: number;
//         isWatched: boolean;
//     }>;
//     public createdAt!: Date;
//     public updatedAt!: Date;
// }

// Activity.init(
//     {
//         id: {
//             type: DataTypes.INTEGER.UNSIGNED,
//             autoIncrement: true,
//             primaryKey: true,
//         },
//         userId: {
//             type: DataTypes.INTEGER.UNSIGNED,
//             allowNull: true,
//             references: {
//                 model: 'students',
//                 key: 'id',
//             },
//         },
//         activity: {
//             type: DataTypes.JSON,
//             allowNull: true,
//         },
//         createdAt: {
//             type: DataTypes.DATE,
//             allowNull: true,
//             defaultValue: DataTypes.NOW,
//         },
//         updatedAt: {
//             type: DataTypes.DATE,
//             allowNull: true,
//             defaultValue: DataTypes.NOW,
//         },
//     },
//     {
//         tableName: 'student_activity',
//         sequelize,
//     }
// );

// // Associations
// sequelize.sync({ alter: true }).then(() => {
//     console.log('Activity table created.');
// });

// export default Activity;





import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Activity extends Model {
    public id!: number;
    public userId!: number;
    public activity!: Array<{
        videoId: number;
        isWatched: boolean;
    }>;
    public createdAt!: Date;
    public updatedAt!: Date;

    // Getter to automatically parse JSON string into an array
    public get activityArray(): Array<{ videoId: number; isWatched: boolean }> {
        try {
            return JSON.parse(this.getDataValue('activity') || '[]');
        } catch (error) {
            console.error('Error parsing activity JSON:', error);
            return [];
        }
    }

    // Setter to convert array into JSON string before saving
    public set activityArray(activity: Array<{ videoId: number; isWatched: boolean }>) {
        this.setDataValue('activity', JSON.stringify(activity));
    }
}

Activity.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            references: {
                model: 'students',
                key: 'id',
            },
        },
        activity: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'student_activity',
        sequelize,
    }
);

// Associations
sequelize.sync({ alter: false }).then(() => {
    console.log('Activity table created.');
});

export default Activity;
