import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios.js';

const ManagePost = () => {
  const navigate = useNavigate();
  const { role, accessToken } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    // Filter posts based on search query
    if (searchQuery.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  }, [searchQuery, posts]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Fetch all posts or user's posts based on role
      const endpoint = role === 'admin' ? '/admin/posts' : '/posts/my-posts';
      const csrf = await api.get('http://localhost:5000/api/csrf-token');

      console.log('Fetching posts from endpoint:', endpoint);
      const res = await api.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-CSRF-Token': csrf.data.csrfToken
        },
      });
      
      setPosts(res.data.data);
      setFilteredPosts(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch posts', err);
      setError('Failed to load posts');
      setLoading(false);
    }
  };
  const handleTitleClick = (postId) => {
    navigate(`/posts/${postId}`);
  };
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleEdit = (postId) => {
    navigate(`/edit-post/${postId}`);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const csrf = await api.get('http://localhost:5000/api/csrf-token');
      console.log(csrf);
      await api.delete(`/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-CSRF-Token': csrf.data.csrfToken
        },
        withCredentials: true
      });
      
      // Remove deleted post from state
      setPosts(posts.filter(post => post._id !== postId));
      setFilteredPosts(filteredPosts.filter(post => post._id !== postId));
    } catch (err) {
      console.error('Failed to delete post', err);
      alert('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <ClipLoader size={50} color={'#123abc'} loading={loading} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {role === 'admin' ? 'Manage All Posts' : 'Manage My Posts'}
            </h1>
            <div className="text-sm text-gray-600">
              Total Posts: {filteredPosts.length}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search posts by title or content..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Posts Table */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No posts found matching your search.' : 'No posts available.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="p-3 border text-left">Title</th>
                    <th className="p-3 border text-left">Content Preview</th>
                    {role === 'admin' && (
                      <th className="p-3 border text-left">Author</th>
                    )}
                    <th className="p-3 border text-left">Date</th>
                    <th className="p-3 border text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => (
                    <tr key={post._id} className="text-gray-900 hover:bg-gray-100 cursor-pointer hover:text-blue-600" onClick={() => handleTitleClick(post._id)}>
                      <td className="p-3 border font-medium">
                        {post.title}
                      </td>
                      <td className="p-3 border text-gray-600">
                        {post.content.substring(0, 100)}
                        {post.content.length > 100 && '...'}
                      </td>
                      {role === 'admin' && (
                        <td className="p-3 border">
                          {post.author?.name || post.author?.email || 'Unknown'}
                        </td>
                      )}
                      <td className="p-3 border text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 border" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-center space-x-2">
                          {role !== 'admin' && (
                            <button
                              onClick={() => handleEdit(post._id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(post._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagePost;