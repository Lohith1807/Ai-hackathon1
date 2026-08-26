const { sequelize } = require('./models');

async function reset() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Dropping and recreating all tables (force: true)...');
    await sequelize.sync({ force: true });
    console.log('Successfully dropped and recreated all tables according to models.js!');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    process.exit(0);
  }
}

reset();
