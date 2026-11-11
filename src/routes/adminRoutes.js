const express = require('express');
const { protect, authorize } = require('../middlewares/auth');
const {
  listUsers, addUser, updateUser, deleteUser, listAllNotes, usersGroupedByInterests
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', listUsers);
router.post('/users', addUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/users/grouped-by-interests', usersGroupedByInterests);
router.get('/notes', listAllNotes);

module.exports = router;
