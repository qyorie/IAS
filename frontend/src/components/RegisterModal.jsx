import { useState } from 'react';
import Modal from './Modal.jsx';
import api from '../api/axios.js';

// Utility to calculate password strength
const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score === 0) return { label: "", color: "" };
  if (score === 1) return { label: "Weak", color: "bg-red-500" };
  if (score === 2) return { label: "Fair", color: "bg-yellow-500" };
  if (score === 3) return { label: "Good", color: "bg-blue-500" };
  if (score === 4) return { label: "Strong", color: "bg-green-600" };
};

const RegisterModal = ({ show, onClose }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [strength, setStrength] = useState({ label: '', color: '' });
  const [touched, setTouched] = useState({ name: false, email: false, password: false });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      setStrength(getPasswordStrength(value));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };

  const isPasswordValid = () => strength.label !== 'Weak';

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!formData.name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!isPasswordValid()) {
      setError('Password is too weak.');
      return;
    }

    try {
      const res = await api.post('/auth/register', formData);

      if (res.data.success) {
        onClose();
        alert('Registration successful! Please log in.');
      } else {
        setError(res.data.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <Modal 
      show={show} 
      onClose={ () => {
        setFormData({ name: '', email: '', password: '' });
        setStrength({ label: '', color: '' });
        setError(''); 
        onClose();}
      } 
      title="Create Account"
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Name Field */}
        <div>
          <label className="text-sm text-gray-600">Name</label>
          <input
            name="name"
            type="text"
            placeholder="John Doe"
            className={`w-full border rounded-lg p-2 mt-1 focus:ring-2 outline-none
              ${touched.name && !formData.name.trim() ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}
            `}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
        </div>

        {/* Email Field */}
        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input
            name="email"
            type="email"
            placeholder="email@example.com"
            className={`w-full border rounded-lg p-2 mt-1 focus:ring-2 outline-none
              ${touched.email && !validateEmail(formData.email) ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}
            `}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
        </div>

        {/* Password Field */}
        <div>
          <label className="text-sm text-gray-600">Password</label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            className={`w-full border rounded-lg p-2 mt-1 focus:ring-2 outline-none
              ${touched.password && !isPasswordValid() ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}
            `}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />

          {/* Password Strength Indicator */}
          {formData.password.length > 0 && (
            <div className="mt-2">
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strength.color}`}
                  style={{
                    width:
                      strength.label === "Weak" ? "25%" :
                      strength.label === "Fair" ? "50%" :
                      strength.label === "Good" ? "75%" :
                      strength.label === "Strong" ? "100%" :
                      "0%"
                  }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Strength: <span className={`font-semibold ${strength.color.replace("bg-", "text-")}`}>{strength.label}</span>
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition shadow-sm"
        >
          Register
        </button>
      </form>
    </Modal>
  );
};

export default RegisterModal;
