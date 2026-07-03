const path = require('path');
const mongoose = require('mongoose');
// Load environment variables from backend/.env
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const runSeeder = require('./seederFunc');

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cloudpos';
    console.log(`[Seeder Script]: Connecting to database at: ${mongoUri.replace(/:([^:@]+)@/, ':****@')}`);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('[Seeder Script]: Connected to MongoDB.');

    await runSeeder();

    console.log('[Seeder Script]: Database successfully seeded with Sri Lankan defaults!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Script Failure]:', error);
    process.exit(1);
  }
};

seed();
