import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

export const addComment = async (req, res) => {
  const { content } = req.body;
  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  const comment = await Comment.create({ content, post: post._id, author: req.user._id });
  res.status(201).json(comment);
};

export const getComments = async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId }).populate('author', 'name email');
  res.json(comments);
};
