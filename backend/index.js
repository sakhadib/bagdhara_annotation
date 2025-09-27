// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const masterRoutes = require('./routes/master');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI is missing in .env');
  process.exit(1);
}

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => { console.error('Mongo connect error', err); process.exit(1); });

app.use('/api/auth', authRoutes);
app.use('/api/master', masterRoutes);

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server listening on ${PORT}`));


module.exports = app;