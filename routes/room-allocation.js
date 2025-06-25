const express = require('express')
const router = express.Router();
const RoomAllocation = require('../model/roomAllocation')
const mongoose = require('mongoose')
const checkAuth = require('../middleware/checkAuth')
const jwt = require('jsonwebtoken')

// POST: Add Room
router.post('/room-allocations', checkAuth, async (req, res) => {
  try {
    const room = new RoomAllocation({
      _id: new mongoose.Types.ObjectId(),
      roomName: req.body.roomName,
      capacity: req.body.capacity,
      floorName: req.body.floorName,
      startRollNo: req.body.startRollNo,
      endRollNo: req.body.endRollNo,
      collegeName:req.body.collegeName,
      collegeCode:req.body.collegeCode
    });

    const result = await room.save();
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET: Fetch all rooms
router.get('/room-allocations', checkAuth, async (req, res) => {
  try {
    const rooms = await RoomAllocation.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT: Update room
router.put('/room-allocations/:id', checkAuth, async (req, res) => {
  try {
    const updated = await RoomAllocation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Delete room
router.delete('/room-allocations/:id', checkAuth, async (req, res) => {
  try {
    await RoomAllocation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/room-allocations-all', async (req, res) => {
  try {
    const { collegeCode, collegeName } = req.query;

    if (!collegeCode || !collegeName) {
      return res.status(400).json({ error: 'collegeCode and collegeName are required' });
    }

    const rooms = await RoomAllocation.find({
      collegeCode: collegeCode,
      collegeName: collegeName,
    });

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

