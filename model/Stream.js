// model/streamModel.js

const mongoose = require('mongoose');

const streamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, lowercase: true },
    originalName: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Stream', streamSchema);
