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

// ===== DELETE USER =====
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // 1. PREVENT SELF-DELETION
    if (userId === req.user.id || userId === req.user.id) {
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
      id: user.id,
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
      Post.deleteMany({ author: user.id }),
      // Comment.deleteMany({ author: user.id }), // Uncomment if you have comments
      // Add other related data deletions here
    ]);

    // 6. DELETE USER
    await User.deleteOne({ id: user.id });

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
    const postCount = await Post.countDocuments({ author: user.id });

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
  try {
    const userId = req.params.id;
    console.log('Ban userId:', req.user.id);
    // Prevent self-ban
    if (userId === req.user.id || userId === req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You cannot ban yourself'
      });
    }

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

    // Ban user
    user.isActive = false;
    user.bannedAt = new Date();
    user.bannedBy = req.user.id;
    await user.save();

    console.log(`[ADMIN ACTION] ${req.user.email} banned user ${user.email}`);

    res.json({
      success: true,
      message: 'User banned successfully'
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to ban user'
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