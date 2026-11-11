const express = require('express');
const { protect } = require('../middlewares/auth');
const { createPost, getUserPosts } = require('../controllers/postController');

const router = express.Router();

router.use(protect);

router.post('/', createPost);
router.get('/user/:id', getUserPosts);

module.exports = router;
