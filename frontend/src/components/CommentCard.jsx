import React, { useState, useEffect, use } from 'react';
import { Trash2, Edit, X, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CommentCard = ({ comment, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const isAuthor = user?._id === comment.author?._id;
  const isAdmin = user?.role === 'admin';
  const authorName = comment.author?.name || 'Anonymous';
  const authorInitial = authorName.charAt(0).toUpperCase();
  
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

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;

    try {
      const csrf = await api.get('/csrf-token');
      const response = await api.put(
        `/comments/${comment._id}`,
        { content: editText.trim() },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'X-CSRF-Token': csrf.data.csrfToken
          }
        }
      );
      onUpdate(response.data.data || response.data);
      setIsEditing(false);
      toast.success('Comment updated successfully');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const csrf = await api.get('/csrf-token');
      if (isAdmin){
        await api.delete(`/admin/users/delete/${comment._id}/comment`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'X-CSRF-Token': csrf.data.csrfToken
          }
        });
      }else {
        await api.delete(`/comments/${comment._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'X-CSRF-Token': csrf.data.csrfToken
          }
        });
      }
      onDelete(comment._id);
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {authorInitial}
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900">{authorName}</span>
              <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
              {comment.updatedAt !== comment.createdAt && (
                <span className="text-xs text-gray-400">(edited)</span>
              )}
            </div>

            {(isAuthor || isAdmin) && !isEditing && (
              <div className="flex items-center space-x-2">
                {isAdmin ? (
                  <button
                    onClick={handleDelete}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button><button
                      onClick={handleDelete}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                        <Trash2 size={16} />
                      </button>
                  </>
                )}
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={!editText.trim()}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  <Check size={14} />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => { setIsEditing(false); setEditText(comment.content); }}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                >
                  <X size={14} />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap break-words">{comment.content}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentCard;
