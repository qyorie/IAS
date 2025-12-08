import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal.jsx';
import RegisterModal from '../components/RegisterModal.jsx';
import CommentSection from '../components/CommentSection.jsx';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import { comment } from 'postcss';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const commentBoxRef = useRef(null);
  const focusComment = location.state?.focusComment || false;

  useEffect(() => {
    fetchPost().then(() => {
      if (focusComment && commentBoxRef.current) {
        commentBoxRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        commentBoxRef.current.focus();
      }
    });
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/posts/${id}`);
      // console.log('Fetched post:', data);
      setPost(data.data || data);
    } catch (err) {
      console.error('Error fetching post:', err);
      alert('Failed to load post');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Please login to like posts');
      navigate('/login');
      return;
    }

    try {
      const csrf = await api.get('/csrf-token');

      await api.post(
        `/posts/${id}/like`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrf.data.csrfToken
          },
          withCredentials: true,
        }
      );

      // update the likes locally
      setPost((prev) => {
        if (!prev) return prev;

        const userLiked = prev.likes?.includes(user._id);
        const newLikes = userLiked
          ? prev.likes.filter(uid => uid !== user._id)
          : [...(prev.likes || []), user._id];

        return {
          ...prev,
          likes: newLikes
        };
      });

    } catch (err) {
      console.error('Error liking post:', err);
      toast.error('Failed to update like');
    }
  };


  const handleDelete = async () => {
    if (!isAuthenticated) {
      alert('Please login to delete posts');
      navigate('/');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const csrf = await api.get('/csrf-token');

      await api.delete(`/posts/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'X-CSRF-Token': csrf.data.csrfToken
        }
      });
      toast.success('Post deleted successfully');
      navigate('/');
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error('Failed deleting post');
    }
  };

  const handleEdit = () => {
    if (!isAuthenticated) {
      alert('Please login to edit posts');
      navigate('/');
      return;
    }
    navigate(`/post/${id}/edit`);
  };

  const handleComment = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    commentBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
    commentBoxRef.current?.focus();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const isAuthor = user?._id === post.author?._id || user?._id === post.author;
  const isAdmin = user?.role === 'admin';
  const userLiked = post.likes?.includes(user?._id) || false;
  const authorName = post.author?.name || 'Anonymous';
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className='bg-white shadow-sm border-b sticky top-0 z-50'>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Home</span>
          </button>
        </div>
      </header>

      {/* Post Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Login prompt for visitors */}
        {!isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-900">
              <span className="font-semibold">Want to interact?</span> 
              <button
                onClick={() => setShowLogin(true)}
                className="ml-2 text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Login
              </button>
              {' '}or{' '}
              <button
                onClick={() => setShowRegister(true)}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Sign up
              </button>
              {' '}to like and comment on posts.
            </p>
          </div>
        )}

        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Post Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                  {authorInitial}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {authorName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {isAuthenticated && (isAuthor || isAdmin) && (
                <div className="flex items-center space-x-2">
                  {!isAdmin && (
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
          </div>

          {/* Post Body */}
          <div className="p-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                {post.content}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t bg-gray-50 flex items-center space-x-6">
            <button
              onClick={handleLike}
              className="flex items-center space-x-2 group"
              disabled={!isAuthenticated}
            >
              <Heart
                size={24}
                className={`transition-colors ${
                  userLiked
                    ? 'fill-red-500 text-red-500'
                    : isAuthenticated 
                      ? 'text-gray-600 group-hover:text-red-500'
                      : 'text-gray-400'
                }`}
              />
              <span className={`font-medium ${userLiked ? 'text-red-500' : 'text-gray-600'}`}>
                {post.likes?.length || 0} {post.likes?.length === 1 ? 'Like' : 'Likes'}
              </span>
            </button>

            <button 
              onClick={handleComment}
              className="flex items-center space-x-2 group"
              disabled={!isAuthenticated}
            >
              <MessageCircle 
                size={24} 
                className={isAuthenticated 
                  ? 'text-gray-600 group-hover:text-blue-500 transition-colors'
                  : 'text-gray-400'
                } 
              />
              <span className="font-medium text-gray-600">Comment</span>
            </button>
          </div>
        </article>
        <CommentSection postId={post._id} inputRef={commentBoxRef}/>
      </main>
      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
      <RegisterModal show={showRegister} onClose={() => setShowRegister(false)} />
    </div>
  );
};

export default PostDetail;