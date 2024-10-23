
import * as dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// Load environment variables from .env file
dotenv.config();

// Now you can access your environment variables
const port = process.env.PORT || 3000;
const dbUrl = process.env.DATABASE_URL;

// Example of using variables
console.log(`Server will run on port: ${port}`);
console.log(`Database URL: ${dbUrl}`);
console.log('dbname')

// Print out all environment variables to help with debugging
console.log('Environment Variables:');
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_DIALECT:', process.env.DB_DIALECT);





                               
const sequelize = new Sequelize(`${process.env.DB_NAME}`, `${process.env.DB_USER}`, `${process.env.DB_PASSWORD}`,{
  host: `${process.env.DB_HOST}`,
  dialect: `${process.env.DB_DIALECT}` as 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql',
});





export default sequelize;
//`${process.env.DB_PASSWORD}`
