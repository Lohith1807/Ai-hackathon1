const { Sequelize } = require('sequelize');
require('dotenv').config();

const dialect = process.env.DB_DIALECT || 'postgres';
const storage = dialect === 'sqlite' ? './medy.sqlite' : null;

let sequelize;

try {
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
    // If no URL is provided, try connecting with individual params
    sequelize = new Sequelize(
      process.env.DB_NAME || 'postgres', 
      process.env.DB_USER || 'postgres', 
      process.env.DB_PASS || '', 
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: dialect,
        storage: storage,
        logging: false
      }
    );
  }

  sequelize.authenticate()
    .then(() => console.log(`--- Database Linked (${process.env.DB_URL ? 'postgres' : dialect}) ---`))
    .catch(err => console.error('DB Connection Failed:', err.message));

} catch (err) {
  console.error('Sequelize Initialization Error:', err.message);
  // Provide a dummy sequelize object so the app boots up and shows a useful error
  sequelize = {
    define: () => ({ belongsTo: () => {}, hasMany: () => {} }),
    authenticate: async () => {},
    sync: async () => {}
  };
}

module.exports = sequelize;
