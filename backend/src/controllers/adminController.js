import User from '../models/User.js';
import Post from '../models/Post.js';

export const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  await Post.deleteMany({ author: user._id });
  await user.remove();
  res.json({ message: 'User and their posts deleted' });
};
