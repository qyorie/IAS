import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js'; // Import if you have comments

// ===== GET ALL USERS =====
export const getAllUsers = async (req, res) => {
  try {
    // Add pagination to prevent memory issues
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Optional search functionality
    const search = req.query.search || '';
    const searchQuery = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};

    // Get users without password
    const users = await User.find(searchQuery)
      .select('-password -__v') // Also exclude version key
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Better performance

    // Get total count for pagination
    const total = await User.countDocuments(searchQuery);

    // Log admin action for audit trail
    console.log(`[ADMIN ACTION] ${req.user.email} accessed user list at ${new Date().toISOString()}`);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};

// ===== GET ALL POSTS (ADMIN) =====
export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Optional search functionality
    const search = req.query.search || '';
    const searchQuery = search ? {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const posts = await Post.find(searchQuery)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments(searchQuery);

    console.log(`[ADMIN ACTION] ${req.user.email} accessed all posts at ${new Date().toISOString()}`);

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch posts'
    });
  }
};

// ===== DELETE POST (ADMIN) =====
export const deletePostByAdmin = async (req, res) => {
  try {
    const postId = req.params.id;

    // Find the post
    const post = await Post.findById(postId).populate('author', 'name email');
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Store post info for logging
    const deletedPostInfo = {
      id: post._id,
      title: post.title,
      author: post.author?.email || 'Unknown',
      deletedBy: req.user.email,
      deletedAt: new Date().toISOString()
    };

    // Delete associated comments if you have them
    // await Comment.deleteMany({ post: postId });

    // Delete the post
    await Post.deleteOne({ _id: postId });

    // Log deletion
    console.log('='.repeat(50));
    console.log('[ADMIN ACTION] POST DELETION');
    console.log(deletedPostInfo);
    console.log('='.repeat(50));

    res.json({
      success: true,
      message: 'Post deleted successfully',
      deleted: {
        postId: postId,
        title: post.title
      }
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete post'
    });
  }
};
    
// ===== DELETE USER =====
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // 1. PREVENT SELF-DELETION
    if (userId === req.user.id || userId === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You cannot delete your own account'
      });
    }

    // 2. FIND USER
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // 3. PREVENT DELETING LAST ADMIN
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(403).json({
          success: false,
          error: 'Cannot delete the last admin. Promote another user to admin first.'
        });
      }
    }

    // 4. STORE USER INFO FOR LOGGING (before deletion)
    const deletedUserInfo = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      deletedBy: req.user.email,
      deletedAt: new Date().toISOString()
    };

    // 5. DELETE USER'S DATA (CASCADE DELETE)
    // Use Promise.all for better performance
    const [deletedPosts, deletedComments] = await Promise.all([
      Post.deleteMany({ author: user._id }),
      // Comment.deleteMany({ author: user._id }), // Uncomment if you have comments
      // Add other related data deletions here
    ]);

    // 6. DELETE USER
    await User.deleteOne({ _id: user._id });

    // 7. CRITICAL: LOG DELETION FOR AUDIT TRAIL
    console.log('='.repeat(50));
    console.log('[CRITICAL] USER DELETION');
    console.log(deletedUserInfo);
    console.log(`Posts deleted: ${deletedPosts.deletedCount}`);
    console.log(`Comments deleted: ${deletedComments?.deletedCount || 0}`);
    console.log('='.repeat(50));

    // 8. SEND RESPONSE
    res.json({
      success: true,
      message: 'User and all associated data deleted successfully',
      deleted: {
        user: deletedUserInfo.email,
        posts: deletedPosts.deletedCount,
        comments: deletedComments?.deletedCount || 0
      }
    });

  } catch (error) {
    console.error('Delete user error:', error);
    
    // Don't expose internal error details
    res.status(500).json({
      success: false,
      error: 'Failed to delete user. Please try again.'
    });
  }
};

// ===== GET SINGLE USER (Bonus) =====
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user's post count
    const postCount = await Post.countDocuments({ author: user._id });

    console.log(`[ADMIN ACTION] ${req.user.email} viewed user ${user.email}`);

    res.json({
      success: true,
      data: {
        ...user,
        stats: {
          totalPosts: postCount
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
};

// ===== BAN USER (Better than delete) =====
export const banUser = async (req, res) => {
  console.log(`Ban/Unban request by admin: ${req.user.email}`);
  try {
    const userId = req.params.id;
    
    // Prevent self-ban
    if (userId === req.user.id || userId === req.user._id) {
      return res.status(403).json({
        success: false,
        error: 'You cannot ban yourself'
      });
    }
    console.log(`Attempting to ban/unban user with ID: ${userId}`);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent banning admins
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Cannot ban admin users'
      });
    }

    // Toggle ban status
    user.isActive = !user.isActive;
    
    if (!user.isActive) {
      user.bannedAt = new Date();
      user.bannedBy = req.user._id;
      console.log(`[ADMIN ACTION] ${req.user.email} banned user ${user.email}`);
    } else {
      user.bannedAt = null;
      user.bannedBy = null;
      console.log(`[ADMIN ACTION] ${req.user.email} unbanned user ${user.email}`);
    }
    
    await user.save();

    res.json({
      success: true,
      message: user.isActive ? 'User unbanned successfully' : 'User banned successfully',
      data: {
        userId: user._id,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Ban/Unban user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user status'
    });
  }
};

// ===== UNBAN USER =====
export const unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.isActive = true;
    user.bannedAt = null;
    user.bannedBy = null;
    await user.save();

    console.log(`[ADMIN ACTION] ${req.user.email} unbanned user ${user.email}`);

    res.json({
      success: true,
      message: 'User unbanned successfully'
    });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unban user'
    });
  }
};