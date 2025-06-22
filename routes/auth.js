
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const CollegeModel = require('../model/collegeModel'); // Adjust path as needed

// In-memory OTP store
const otpStore = {};

// POST /api/auth/login — Step 1: Validate login & send OTP
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check College exists
    const collegeModel = await CollegeModel.findOne({ email });
    if (!collegeModel) return res.status(401).json({ msg: 'College not found' });

    // Validate password
    const isMatch = await bcrypt.compare(password, collegeModel.password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid password' });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:'+otp);

    otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };
    console.log('OTP Store in array after generated OTP: '+otpStore[email]);

    console.log("Email:", process.env.EMAIL_USER);
    console.log("Password:", process.env.EMAIL_PASS);

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

//POST /api/auth/verify-otp — Step 2: Verify OTP & generate token
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = otpStore[email];
    console.log({ email, otp, record });

    if (!record) return res.status(400).json({ msg: 'No OTP found for this email' });
    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ msg: 'OTP expired' });
    }
    if (record.otp !== otp) return res.status(401).json({ msg: 'Invalid OTP' });

    delete otpStore[email];
    const collegeModel = await CollegeModel.findOne({ email });
    if (!collegeModel) return res.status(401).json({ msg: 'College not found' });

    const token = jwt.sign(
      {
        collegeModelId: collegeModel._id,
        email: collegeModel.email,
        collegeName: collegeModel.collegeName,
        collegeCode: collegeModel.collegeCode,
      },
        
      process.env.JWT_SECRET,
      { 
        expiresIn: '365d'
      }
    )

    res.status(200).json({
      msg: 'OTP verified',
      token,
      collegeModel: {
        collegeModelId: collegeModel._id,
        email: collegeModel.email,
        collegeName: collegeModel.collegeName,
        collegeCode: collegeModel.collegeCode,
      },
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// router.post('/verify-otp', async (req, res) => {
//   const { email, otp } = req.body;

//   try {
//     const record = otpStore[email];
//     // if (!record) {
//     //   return res.status(400).json({ msg: 'No OTP found for this email' });
//     // }

//     // if (Date.now() > record.expiresAt) {
//     //   delete otpStore[email];
//     //   return res.status(400).json({ msg: 'OTP expired' });
//     // }

//     // if (record.otp !== otp) {
//     //   return res.status(401).json({ msg: 'Invalid OTP' });
//     // }

//     // OTP is valid, delete from store
//     delete otpStore[email];

//      const collegeModel = await CollegeModel.findOne({ email });
//     // if (!collegeModel) {
//     //   return res.status(404).json({ msg: 'College not found' });
//     // }

//     const token = jwt.sign(
//       {
//         collegeModelId: collegeModel._id,
//         email: collegeModel.email,
//         collegeName: collegeModel.collegeName,
//         collegeCode: collegeModel.collegeCode,
//       },
//       process.env.JWT_SECRET,
//       { 
//         expiresIn: "365d" 
//       },
//     )

//     return res.status(200).json({
//       msg: 'OTP verified',
//       token,
//       collegeModel: {
//         collegeModelId: collegeModel._id,
//         email: collegeModel.email,
//         collegeName: collegeModel.collegeName,
//         collegeCode: collegeModel.collegeCode,
//       },
//     });

//   } catch (err) {
//     console.error('OTP verification error:', err);
//     res.status(500).json({ msg: 'Server Error' });
//   }
// });


module.exports = router;
