import { useState } from 'react';
import Modal from './Modal.jsx';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const LoginModal = ({ show, onClose }) => {
  const { setAccessToken, login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res =  await login(formData);
    if (!res.error) {
      onClose() 
      toast.success("Login successful!");
      return
    };
    setError(res.error);
  };

  return (
    <Modal show={show} onClose={onClose} title="Login">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full border rounded-lg p-2"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full border rounded-lg p-2"
          value={formData.password}
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
