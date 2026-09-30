const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Salt & Pepper Auth API Server is running' });
});

// Connect to MongoDB with graceful fallback to In-Memory MongoDB Server
async function connectDatabase() {
  const localMongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/salt_pepper_db';

  try {
    console.log(`Attempting to connect to local MongoDB at: ${localMongoUri}`);
    await mongoose.connect(localMongoUri, {
      serverSelectionTimeoutMS: 2000 // Quick timeout if local Mongo isn't running
    });
    console.log('Successfully connected to MongoDB!');
  } catch (err) {
    console.log('Local MongoDB not detected/running. Starting temporary In-Memory MongoDB Server for practical demonstration...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      
      await mongoose.connect(inMemoryUri);
      console.log(`Connected to In-Memory MongoDB at: ${inMemoryUri}`);
      console.log('Database ready! (Data will reset when server restarts)');
    } catch (memErr) {
      console.error('Failed to initialize In-Memory MongoDB:', memErr);
    }
  }
}

connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
