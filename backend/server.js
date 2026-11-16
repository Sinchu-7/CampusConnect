require('dotenv').config();
const createApp = require('./app');
const connectDatabase = require('./config/database');

async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  }
  await connectDatabase();
  const port = Number(process.env.PORT) || 3000;
  createApp().listen(port, () => console.log(`CampusConnect is running at http://localhost:${port}`));
}

if (require.main === module) {
  start().catch((error) => {
    console.error(`Startup failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = start;
