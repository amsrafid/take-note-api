const User = require('../models/User');

const listBasicUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email');
    res.json({ data: users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listBasicUsers };
