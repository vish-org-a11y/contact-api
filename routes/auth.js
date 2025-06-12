
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User'); // Adjust path as needed

// In-memory OTP store
const otpStore = {};

// POST /api/auth/login — Step 1: Validate login & send OTP
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ msg: 'User not found' });

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid password' });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Login',
      text: `Your OTP is: ${otp}. It expires in 5 minutes.`,
    });

    res.status(200).json({ msg: 'OTP sent to your email' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// POST /api/auth/verify-otp — Step 2: Verify OTP & generate token
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = otpStore[email];
    if (!record) return res.status(400).json({ msg: 'No OTP found for this email' });
    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ msg: 'OTP expired' });
    }
    if (record.otp !== otp) return res.status(401).json({ msg: 'Invalid OTP' });

    delete otpStore[email];

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ msg: 'User not found' });

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      process.env.JWT_SECRET,
      { expiresIn: '365d' }
    );

    res.status(200).json({
      msg: 'OTP verified',
      token,
      user: {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
