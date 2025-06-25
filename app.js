const express = require('express')
const app = express()
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const collegeRoute = require('./routes/collegeModel')
const roomAllocationRoute = require('./routes/room-allocation')
const authRoute = require('./routes/auth');
const cors = require('cors');
require('dotenv').config();

app.use(cors());

// ✅ Connect to MongoDB using .env variable
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Connected to database"))
.catch(err => console.log("MongoDB connection error:", err));

app.use(bodyParser.json());
app.use('/collegeModel', collegeRoute);
app.use('/api/room-allocation', roomAllocationRoute);
app.use('/api/auth', authRoute);

app.use('*', (req, res) => {
    res.status(404).json({ msg: 'bad request' });
});

app.use(express.json());

module.exports = app;