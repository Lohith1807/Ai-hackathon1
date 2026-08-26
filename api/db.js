const { Sequelize } = require('sequelize');
require('dotenv').config();

const dialect = process.env.DB_DIALECT || 'mysql';
const storage = dialect === 'sqlite' ? './medy.sqlite' : null;

let sequelize;

if (process.env.DB_URL) {
  sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  sequelize = new Sequelize(
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
}

sequelize.authenticate()
  .then(() => console.log(`--- Database Linked (${process.env.DB_URL ? 'postgres' : dialect}) ---`))
  .catch(err => console.error('DB Connection Failed:', err.message));

module.exports = sequelize;
