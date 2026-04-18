const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ── MongoDB Connect ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ── Schemas ──
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now }
});

const bmiSchema = new mongoose.Schema({
  userEmail: String,
  bmi: Number,
  category: String,
  weight: Number,
  height: Number,
  unit: String,
  date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const BMIRecord = mongoose.model('BMIRecord', bmiSchema);

// ── Routes ──

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const user = await User.create({ name, email, password });
    res.json({ success: true, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    res.json({ success: true, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Save BMI record
app.post('/api/bmi', async (req, res) => {
  try {
    const record = await BMIRecord.create(req.body);
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get BMI history by user email
app.get('/api/bmi/:email', async (req, res) => {
  try {
    const records = await BMIRecord.find({ userEmail: req.params.email }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete all history for a user
app.delete('/api/bmi/:email', async (req, res) => {
  try {
    await BMIRecord.deleteMany({ userEmail: req.params.email });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
