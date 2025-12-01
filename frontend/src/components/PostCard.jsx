import React, { useState } from 'react';
import { Heart, MessageCircle, MoreVertical, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PostCard = ({ post, currentUser, onDelete, onEdit, onLike, onComment }) => {
  const navigate = useNavigate();
  
  // Check if current user already liked this post
  const userLiked = post.likes?.includes(currentUser?._id) || false;
  const [isLiked, setIsLiked] = useState(userLiked);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [showMenu, setShowMenu] = useState(false);
  
  // Check if current user is the author
  const isAuthor = currentUser?._id === post.author?._id || currentUser?._id === post.author;
  const isAdmin = currentUser?.role === 'admin';

  // Content preview logic
  const MAX_LENGTH = 200; // Characters to show in preview
  const isLongContent = post.content.length > MAX_LENGTH;
  const previewContent = isLongContent 
    ? post.content.substring(0, MAX_LENGTH) + '...' 
    : post.content;

  const handleLike = (e) => {
    e.stopPropagation(); // Prevent card click
    console.log('Like button clicked for post:', post._id);
    // Check if user is logged in
    if (!currentUser) {
      e.preventDefault();
      return; // Don't execute like if no user
    }
    
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    if (onLike) onLike(post._id);
  };

  const handleCardClick = () => {
    navigate(`/posts/${post._id}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  // Get author name - handle both populated and unpopulated references
  const authorName = post.author?.name || 'Anonymous';
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden mb-4 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {authorInitial}
          </div>
          
          {/* Author Info */}
          <div>
            <h3 className="font-semibold text-gray-900">
              {authorName}
            </h3>
            <p className="text-xs text-gray-500">
              {formatDate(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Menu Button (only for author) */}
        {(isAuthor || isAdmin) &&(
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreVertical size={20} className="text-gray-600" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    if (onEdit) onEdit(post);
                  }}
                  className={`w-full px-4 py-2 text-left flex items-center space-x-2 
                  ${isAuthor ? 'hover:bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-600 cursor-not-allowed'}`}
                  disabled={isAdmin || !isAuthor}
                >
                  <Edit size={16} />
                  <span>Edit Post</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    if (onDelete) onDelete(post._id);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center space-x-2 text-red-600"
                >
                  <Trash2 size={16} />
                  <span>Delete Post</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="px-4 pb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600">
          {post.title}
        </h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {previewContent}
        </p>
        {isLongContent && (
          <span className="mt-2 text-blue-600 hover:text-blue-700 font-medium text-sm inline-block">
            Read more →
          </span>
        )}
      </div>

      {/* Actions Bar */}
      <div 
        className="px-4 py-3 border-t border-gray-100 flex items-center space-x-6"
        onClick={(e) => e.stopPropagation()} // Prevent card click
      >
        {/* Like Button */}
        <button
          onClick={handleLike}
          disabled={!currentUser}
          className={`flex items-center space-x-2 group ${!currentUser ? 'cursor-not-allowed opacity-60' : ''}`}
          title={!currentUser ? 'Login to like posts' : ''}
        >
          <Heart
            size={20}
            className={`transition-colors ${
              isLiked
                ? 'fill-red-500 text-red-500'
                : currentUser 
                  ? 'text-gray-600 group-hover:text-red-500'
                  : 'text-gray-400'
            }`}
          />
          <span className={`text-sm font-medium ${isLiked ? 'text-red-500' : 'text-gray-600'}`}>
            {likeCount > 0 ? likeCount : 'Like'}
          </span>
        </button>

        {/* Comment Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComment && onComment(post._id);
          }}
          disabled={!currentUser}
          className={`flex items-center space-x-2 group ${!currentUser ? 'cursor-not-allowed opacity-60' : ''}`}
          title={!currentUser ? 'Login to comment' : ''}
        >
          <MessageCircle
            size={20}
            className={`transition-colors ${
              currentUser 
                ? 'text-gray-600 group-hover:text-blue-500'
                : 'text-gray-400'
            }`}
          />
          <span className="text-sm font-medium text-gray-600">
            {post.comments && post.comments.length > 0 ? `${post.comments.length} Comments` : 'Comment'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;