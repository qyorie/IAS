import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LogOut, User, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios.js';
import PostCard from '../components/PostCard.jsx';

const Home = () => {
  const { user, logout, accessToken } = useAuth(); // Get user and logout from context
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Fetch posts from backend
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await api.get('http://localhost:5000/api/posts/');
      setPosts(data.data || data);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-CSRF-Token': localStorage.getItem('csrfToken')
        }
      });

      setPosts(posts.filter(p => p._id !== postId));
      alert('Post deleted successfully!');
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Error deleting post');
    }
  };

  const handleEdit = (post) => {
    alert(`Edit post: ${post.title}`);
    console.log('Edit post:', post);
  };

  const handleLike = async (postId) => {
    try {
      const csrf = await api.get('http://localhost:5000/api/csrf-token');

      await api.post(
        `/posts/${postId}/like`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrf.data.csrfToken
          }
        }
      );

      console.log('Post liked/unliked');
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleComment = (postId) => {
    alert(`Open comments for post: ${postId}`);
    console.log('Comment on post:', postId);
  };

  const handleLogout = async () => {
    await logout();
    // ProtectedRoute will automatically redirect to /login
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className='flex justify-between'>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Home Feed</h2>
            {user && (
              <button>
                <Link
                  to="/create"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Post
                </Link>
              </button>
            )}
          </div>
          <p className="text-gray-600">Latest posts from the community</p>
        </div>
        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading posts...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">Error: {error}</p>
            <button
              onClick={fetchPosts}
              className="mt-2 text-red-600 hover:text-red-800 font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Posts List */}
        {!loading && !error && (
          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUser={user}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onLike={handleLike}
                  onComment={handleComment}
                />
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;