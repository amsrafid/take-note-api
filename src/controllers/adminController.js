const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Note = require('../models/Note');

const listUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().sort({ _id: -1 }).skip(skip).limit(limit),
      User.countDocuments()
    ]);

    res.json({ data: users, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addUser = async (req, res) => {
  try {
    const { name, email, password, role, interests } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, password required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role === 'admin' ? 'admin' : 'user',
      interests: interests || []
    });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, role, interests } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (name) user.name = name;
    if (role) user.role = role;
    if (interests) user.interests = interests;
    await user.save();
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const listAllNotes = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const [notes, total] = await Promise.all([
      Note.find().sort({ _id: -1 }).skip(skip).limit(limit).populate('owner', 'name email'),
      Note.countDocuments()
    ]);

    res.json({ data: notes, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const usersGroupedByInterests = async (req, res) => {
  try {
    const result = await User.aggregate([
      { $unwind: '$interests' },
      {
        $group: {
          _id: '$interests',
          count: { $sum: 1 },
          users: { $push: { id: '$_id', name: '$name', email: '$email' } }
        }
      },
      { $project: { _id: 0, interest: '$_id', count: 1, users: 1 } },
      { $sort: { count: -1 } }
    ]);
    res.json({ data: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  listUsers, addUser, updateUser, deleteUser, listAllNotes, usersGroupedByInterests
};
