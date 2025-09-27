require('dotenv').config({ path: ['.env.local', '.env'], override: true });


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const usersRouter = require('./src/routes/users.routes');
const pollsRouter = require('./src/routes/polls.routes');
const authRouter = require('./src/routes/auth.routes');
const { notFound, errorHandler } = require('./src/middleware/error');


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/', (req, res) => {
  res.json("HI!");
})
// API
app.use('/api/users', usersRouter);
app.use('/api/polls', pollsRouter);
app.use('/api/auth', authRouter);

// 404 + error
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4040;
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) { console.error('❌ MONGO_URL is required'); process.exit(1); }

mongoose.connect(MONGO_URL).then(() => {
  console.log('✅ MongoDB connected');
  app.listen(PORT, () => {
    console.log(`🚀 API on ${PORT}`);
  });
}).catch((err) => {
  console.error('❌ Mongo connect error:', err.message);
  process.exit(1);
});
