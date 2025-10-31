const express = require('express')
const router = express.Router();
const RoomAllocation = require('../model/roomAllocation')
const mongoose = require('mongoose')
const checkAuth = require('../middleware/checkAuth')
const jwt = require('jsonwebtoken')

// POST: Add Room
router.post('/room-allocations', checkAuth, async (req, res) => {
  try {
    const {
      roomName,
      capacity,
      floorName,
      startRollNo,
      endRollNo,
      collegeName,
      collegeCode,
      examDate,
      timeSlot,
      stream,
      subject
    } = req.body;

    // ✅ Validate all required fields (including new ones)
    if (
      !roomName ||
      !capacity ||
      !floorName ||
      !startRollNo ||
      !endRollNo ||
      !collegeName ||
      !collegeCode ||
      !examDate ||
      !timeSlot ||
      !stream ||
      !subject
    ) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // ✅ Create new Room Allocation document
    const room = new RoomAllocation({
      _id: new mongoose.Types.ObjectId(),
      roomName: typeof roomName === 'string' ? roomName.trim() : '',
      capacity: capacity.toString().trim(),
      floorName: typeof floorName === 'string' ? floorName.trim() : '',
      startRollNo: typeof startRollNo === 'string' ? startRollNo.trim() : '',
      endRollNo: typeof endRollNo === 'string' ? endRollNo.trim() : '',
      collegeName: typeof collegeName === 'string' ? collegeName.trim() : '',
      collegeCode: typeof collegeCode === 'string' ? collegeCode.trim() : '',
      examDate: typeof examDate === 'string' ? examDate.trim() : '',
      timeSlot: typeof timeSlot === 'string' ? timeSlot.trim() : '',
      stream: typeof stream === 'string' ? stream.trim() : '',
      subject: typeof subject === 'string' ? subject.trim() : ''
    });

    const result = await room.save();
    res.status(200).json({
      message: 'Room added successfully',
      data: result
    });
  } catch (error) {
    console.error('Save error:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET: Fetch all rooms
router.get('/room-allocations', checkAuth, async (req, res) => {
  try {
    const { collegeName, collegeCode, examDate, timeSlot } = req.query;

    if (!collegeName || !collegeCode) {
      return res.status(400).json({ error: 'College name and code are required' });
    }

    // 🧠 Build dynamic query
    const query = {
      collegeName: collegeName.trim(),
      collegeCode: collegeCode.trim()
    };

    if (examDate) {
      query.examDate = new Date(examDate); // Format: YYYY-MM-DD
    }

    if (timeSlot) {
      query.timeSlot = timeSlot.trim();
    }

    const rooms = await RoomAllocation.find(query);
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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

    console.log(collegeName);
    console.log(collegeCode);

    if (!collegeCode || !collegeName) {
      return res.status(400).json({ error: 'collegeCode and collegeName are required' });
    }

    const rooms = await RoomAllocation.find({
      collegeCode: collegeCode,
      collegeName: collegeName,
    });

    console.log(rooms);
    
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/search-room', async (req, res) => {
  const { collegeCode, collegeName, roll } = req.query;
  const trimmedCollegeName = (collegeName || '').trim();
  const rollNumber = parseInt(roll);

  console.log("Incoming Params:");
  console.log("collegeCode:", collegeCode);
  console.log("collegeName (trimmed):", trimmedCollegeName);
  console.log("rollNumber:", rollNumber);

  if (!collegeCode || !trimmedCollegeName || isNaN(rollNumber)) {
    return res.status(400).json({ message: "Invalid query parameters" });
  }

  const extractNumber = (str) => parseInt(str.match(/\d+/)?.[0] || '0');

  try {
    const rooms = await RoomAllocation.find({ collegeCode, collegeName: trimmedCollegeName });
    console.log("Matched rooms from DB:", rooms.length);

    const found = rooms.find(room => {
      const start = extractNumber(room.startRollNo);
      const end = extractNumber(room.endRollNo);
      console.log(`Checking room ${room.roomName} -> start: ${start}, end: ${end}`);
      return rollNumber >= start && rollNumber <= end;
    });

    if (found) {
      console.log("Room found:", found.roomName);
      res.status(200).json({ ...found._doc, rollNumber });
    } else {
      console.log("No matching room found");
      res.status(404).json({ message: "Room not found" });
    }
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


module.exports = router;

