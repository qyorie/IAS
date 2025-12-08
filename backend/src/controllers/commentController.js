import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

export const addComment = async (req, res) => {
  const { content } = req.body;
  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  const comment = await Comment.create({ content, post: post._id, author: req.user.id });
  res.status(201).json(comment);
};

export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name email')
      .sort({ createdAt: -1 }); // Changed from -1 to 1 for ascending
    console.log(comments);
    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comments'
    });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { commentId } = req.params;
    
    // 1. Find the comment
    const comment = await Comment.findById(commentId);
    console.log(comment, req.user.id, req.user);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // 2. Check if user is authorized (only author can update)
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed to edit this comment" });
    }

    // 3. Update the comment
    comment.content = content || comment.content;
    await comment.save();

    // 4. Populate author before returning
    await comment.populate("author");

    res.status(200).json(comment);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    // 1. Find the comment
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // 2. Ensure the logged-in user is the author
    if (comment.author.toString() !== req.user._id) {
      return res.status(403).json({ message: "You are not the author of this comment" });
    }

    // 3. Delete the comment
    await Comment.findByIdAndDelete(commentId);

    // 4. Optional: remove comment from Post.comments array
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: commentId }
    });

    res.status(200).json({ message: "Comment deleted successfully" });

  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
