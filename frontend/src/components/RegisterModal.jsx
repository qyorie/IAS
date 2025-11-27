import React, { useState } from 'react';
import Modal from './Modal.jsx';

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

  const handleChange = e => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      setStrength(getPasswordStrength(value));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      onClose();
      alert('Registration successful! Please log in.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal show={show} onClose={onClose} title="Create Account">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Name Field */}
        <div>
          <label className="text-sm text-gray-600">Name</label>
          <input
            name="name"
            type="text"
            placeholder="John Doe"
            className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-green-500 outline-none"
            onChange={handleChange}
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
            className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-green-500 outline-none"
            onChange={handleChange}
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
            className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-green-500 outline-none"
            onChange={handleChange}
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
