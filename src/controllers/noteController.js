const Note = require('../models/Note');

const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'title and content required' });
    }
    const note = await Note.create({ title, content, owner: req.user._id });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const listMyNotes = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const [notes, total] = await Promise.all([
      Note.find({ owner: req.user._id }).sort({ _id: -1 }).skip(skip).limit(limit),
      Note.countDocuments({ owner: req.user._id })
    ]);

    res.json({ data: notes, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.findOne({ _id: req.params.id, owner: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    if (title) note.title = title;
    if (content) note.content = content;
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createNote, listMyNotes, getNoteById, updateNote, deleteNote };
