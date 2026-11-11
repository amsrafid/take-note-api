const express = require('express');
const rateLimit = require('express-rate-limit');
const { protect } = require('../middlewares/auth');
const { register, login, getMe } = require('../controllers/authController');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many attempts, try again later' }
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);

module.exports = router;
