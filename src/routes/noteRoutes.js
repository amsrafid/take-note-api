const express = require('express');
const { protect } = require('../middlewares/auth');
const {
  createNote, listMyNotes, getNoteById, updateNote, deleteNote
} = require('../controllers/noteController');

const router = express.Router();

router.use(protect);

router.post('/', createNote);
router.get('/', listMyNotes);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
