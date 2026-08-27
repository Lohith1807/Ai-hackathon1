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
      pool: {
        min: 0,       // Serverless: don't keep idle connections
        max: 5,
        idle: 0,       // Release connections immediately when idle
        acquire: 30000,
        evict: 60000
      },
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        },
        connectTimeout: 10000 // 10s timeout to prevent hanging
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
        logging: false,
        pool: {
          min: 0,
          max: 5,
          idle: 0,
          acquire: 30000,
          evict: 60000
        }
      }
    );
  }

  // NOTE: authenticate() is called in bootstrap() inside index.js.
  // No fire-and-forget call here — it caused race conditions on Vercel.

} catch (err) {
  console.error('Sequelize Initialization Error:', err.message);
  // Provide a dummy sequelize object so the app boots up and shows a useful error
  sequelize = {
    define: () => ({ belongsTo: () => {}, hasMany: () => {} }),
    authenticate: async () => {},
    sync: async () => {},
    query: async () => [[]],
    __initError: err.message
  };
}

module.exports = sequelize;
