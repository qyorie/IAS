import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, accessToken } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [originalPost, setOriginalPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    fetchPost();
  }, [id, isAuthenticated]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await api.get(`http://localhost:5000/api/posts/${id}`);
      const post = data.data || data;

      // Check if user is author
      if (post.author?._id !== user?._id && user?.role !== 'admin') {
        alert('You are not authorized to edit this post');
        navigate('/');
        return;
      }

      setOriginalPost(post);
      setFormData({
        title: post.title,
        content: post.content
      });
    } catch (err) {
      console.error('Error fetching post:', err);
      alert('Failed to load post');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }

    if (formData.title.length < 3) {
      setError('Title must be at least 3 characters');
      return false;
    }

    if (formData.title.length > 200) {
      setError('Title must be less than 200 characters');
      return false;
    }

    if (!formData.content.trim()) {
      setError('Content is required');
      return false;
    }

    if (formData.content.length < 10) {
      setError('Content must be at least 10 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    // Check if anything changed
    if (formData.title === originalPost.title && formData.content === originalPost.content) {
      alert('No changes were made');
      return;
    }

    setSaving(true);

    try {
      const csrf = await api.get('http://localhost:5000/api/csrf-token');
      await api.put(`http://localhost:5000/api/posts/edit/${id}`, {
        title: formData.title.trim(),
        content: formData.content.trim()
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-CSRF-Token': csrf.data.csrfToken
        }
      });

      alert('Post updated successfully!');
      navigate(`/post/${id}`);
    } catch (err) {
      console.error('Error updating post:', err);
      setError(err.response?.data?.message || 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (formData.title !== originalPost.title || formData.content !== originalPost.content) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate(`/post/${id}`);
      }
    } else {
      navigate(`/post/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleCancel}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Cancel</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Post Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={200}
                className="w-full px-4 py-3 text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your post title..."
              />
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>Make it catchy and descriptive</span>
                <span>{formData.title.length}/200</span>
              </div>
            </div>

            {/* Content Field */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Post Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={15}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Write your post content here..."
              />
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>Share your thoughts, stories, or knowledge</span>
                <span>{formData.content.length} characters</span>
              </div>
            </div>

            {/* Character Count Warning */}
            {formData.content.length > 5000 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Your post is quite long ({formData.content.length} characters). 
                  Consider breaking it into multiple posts for better readability.
                </p>
              </div>
            )}

            {/* Preview Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {formData.title || 'Your post title will appear here'}
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {formData.content || 'Your post content will appear here...'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X size={20} />
                <span>Cancel</span>
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">✏️ Writing Tips</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>• Make your title clear and engaging</li>
            <li>• Break long paragraphs into shorter ones for better readability</li>
            <li>• Use proper grammar and spelling</li>
            <li>• Preview your post before saving</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default EditPost;