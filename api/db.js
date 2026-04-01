const { Sequelize } = require('sequelize');
require('dotenv').config();

const dialect = process.env.DB_DIALECT || 'mysql';
const storage = dialect === 'sqlite' ? './medy.sqlite' : null;

const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASS, 
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: dialect,
    storage: storage,
    logging: false
  }
);

sequelize.authenticate()
  .then(() => console.log(`--- Database Linked (${dialect}) ---`))
  .catch(err => console.error('DB Connection Failed:', err.message));

module.exports = sequelize;
