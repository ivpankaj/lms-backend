// import * as dotenv from 'dotenv';
// import { Sequelize } from 'sequelize';

// // Load environment variables from .env file
// dotenv.config();

// // Access environment variables
// const dbName = process.env.DB_NAME || 'lms';
// const dbUser = process.env.DB_USER;
// const dbPassword = process.env.DB_PASSWORD;
// const dbHost = process.env.DB_HOST;
// const dbDialect = process.env.DB_DIALECT as 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql';

// // Create a Sequelize instance for server-level operations
// const serverSequelize = new Sequelize({
//   dialect: dbDialect,
//   host: dbHost,
//   username: dbUser,
//   password: dbPassword,
// });

// async function initializeDatabase() {
//   try {
//     // Connect to the MySQL server to create the database
//     await serverSequelize.authenticate();
//     console.log('Connection to the MySQL server has been established successfully.');

//     // Check if the database exists
//     const [databases] = await serverSequelize.query('SHOW DATABASES LIKE ?', {
//       replacements: [dbName],
//     });
//     if ((databases as any).length === 0) {
//       // Create the database if it does not exist
//       await serverSequelize.query(`CREATE DATABASE ${dbName}`);
//       console.log(`Database ${dbName} created`);
//     }

//     // Close the connection to the server-level Sequelize instance
//     await serverSequelize.close();

//     // Connect to the application-level Sequelize instance
//     // const appSequelize = new Sequelize(dbName, dbUser, dbPassword, {
//     //   host: dbHost,
//     //   dialect: dbDialect,
//     // });

//     // Authenticate to the application-level database
//     // await appSequelize.authenticate();
//     // console.log('Connection to the database has been established successfully.');

//     // // Sync models (create tables if they don't exist)
//     // await appSequelize.sync({ force: false }); // Use `force: true` to drop and recreate tables
//     // console.log('Database synchronized');

//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//   } finally {
//     // Ensure all connections are closed properly
//     await serverSequelize.close();
//   }
// }

// initializeDatabase();
