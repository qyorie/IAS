import React, { useState } from 'react';
import Modal from './Modal.jsx';
import api from '../api/axios';

const LoginModal = ({ show, onClose }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', formData);

      const { token, user } = res.data;

      // Save token and role to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', user?.role || 'user');
      
      onClose();
      window.location.reload();
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Modal show={show} onClose={onClose} title="Login">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full border rounded-lg p-2"
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full border rounded-lg p-2"
          onChange={handleChange}
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </Modal>
  );
};

export default LoginModal;
