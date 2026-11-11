require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { seedSampleProperties } = require('./utils/seedProperties');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  if (
    process.env.NODE_ENV === 'development' &&
    process.env.SEED_SAMPLE_DATA === 'true'
  ) {
    await seedSampleProperties();
  }

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Server startup failed:', error.message);
  process.exit(1);
});
