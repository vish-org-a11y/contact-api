const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json()); // handles JSON requests
app.use(express.json()); // redundant but safe (still fine)

// ✅ Import Routes
const collegeRoute = require('./routes/collegeModel');
const roomAllocationRoute = require('./routes/room-allocation');
const authRoute = require('./routes/auth');
const streamRoute = require('./routes/streamRoutes');

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Register Routes
app.use('/collegeModel', collegeRoute);
app.use('/api/room-allocation', roomAllocationRoute);
app.use('/api/auth', authRoute);
app.use('/api/stream', streamRoute);

// ✅ Default route
app.get('/', (req, res) => {
  res.send('Server is running successfully!');
});

// ✅ 404 Handler (always last)
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Bad request or endpoint not found' });
});

module.exports = app;
