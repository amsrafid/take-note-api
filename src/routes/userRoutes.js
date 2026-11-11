const express = require('express');
const { protect } = require('../middlewares/auth');
const { listBasicUsers } = require('../controllers/userController');

const router = express.Router();

router.use(protect);

router.get('/', listBasicUsers);

module.exports = router;
