require('dotenv').config({
  // Load local first
  path: ['.env.local', '.env'],
  override: true, // let earlier files override later ones
});

const express = require('express');
const mongoose = require('mongoose')

const usersRouter = require('./src/routes/users.routes');
const pollsRouter = require('./src/routes/polls.routes');
const { notFound, errorHandler } = require('./src/middleware/error');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes
app.use('/api/users', usersRouter);
app.use('/api/polls', pollsRouter);
 
// 404 + error handler
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4044;
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  console.error('❌ MONGO_URL is required');
  process.exit(1);
}

mongoose.connect(MONGO_URL, {
  maxPoolSize: 20,
  serverSelectionTimeoutMS: 5000,
}).then(() => {
  console.log('✅ MongoDB connected');
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}).catch((err) => {
  console.error('❌ Mongo connect error:', err.message);
  process.exit(1);
});


