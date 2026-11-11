require('dotenv').config();
const { Sequelize } = require('sequelize');

const opcionesTls = process.env.DB_SSL === 'true'
  ? { ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true } }
  : {};

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectOptions: opcionesTls,
    logging: false,
    define: { underscored: true, timestamps: true },
  }
);

module.exports = sequelize;
