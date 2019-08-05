const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_DATABASE || 'db',
  process.env.DB_USERNAME || 'user',
  process.env.DB_PASSWORD || 'pass',
  {
    host: process.env.DB_HOST || 'postgres',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  },
);

const authenticate = () => sequelize.authenticate();

authenticate();

module.exports = sequelize;
