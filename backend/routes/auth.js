// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, designation, workplace, highestDegree, university } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email, password required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already used' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, designation, workplace, highestDegree, university });
    await user.save();

    const token = signToken(user);
    const { password: _p, ...publicUser } = user.toObject();
    res.json({ token, user: publicUser });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email & password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    const { password: _p, ...publicUser } = user.toObject();
    res.json({ token, user: publicUser });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

module.exports = router;
