const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');

const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'title and content required' });
    }
    const post = await Post.create({ title, content, author: req.user._id });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const result = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'author',
          as: 'posts'
        }
      },
      { $project: { _id: 0, name: 1, email: 1, posts: {
        $map: {
          input: '$posts',
          as: 'post',
          in: {
            title: '$$post.title',
            content: '$$post.content',
            author: '$$ROOT.name'
          }
        }
      }}}
    ]);

    if (!result.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createPost, getUserPosts };
