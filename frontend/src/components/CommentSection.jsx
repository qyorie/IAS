import React, { useState, useEffect } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {toast} from 'react-hot-toast';
import api from '../api/axios';
import CommentCard from './CommentCard'; // ✅ Import the CommentCard

const CommentSection = ({ postId, inputRef}) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/comments/${postId}`);
      setComments(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please login to comment');
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const csrf = await api.get('/csrf-token');
      const response = await api.post(
        `/comments/${postId}`,
        { content: newComment.trim() },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'X-CSRF-Token': csrf.data.csrfToken
          }
        }
      );

      setComments([response.data.data || response.data, ...comments]);
      setNewComment('');
      toast.success('Comment posted successfully');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <MessageCircle size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Comments ({comments.length})
          </h3>
        </div>
      </div>

      {/* Comment Form */}
      <div className="px-6 py-4 border-b">
        {isAuthenticated ? (
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <textarea
              ref={inputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Post Comment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              Please <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">login</a> to comment
            </p>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="divide-y">
        {loading ? (
          <div className="px-6 py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading comments...</p>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <CommentCard
              key={comment._id}
              comment={comment}
              onUpdate={(updatedComment) =>
                setComments(comments.map(c => c._id === updatedComment._id ? updatedComment : c))
              }
              onDelete={(id) =>
                setComments(comments.filter(c => c._id !== id))
              }
            />
          ))
        ) : (
          <div className="px-6 py-12 text-center">
            <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default CommentSection;
