import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    const accessToken = jwt.sign(
      {
        userInfo: {
          "user": user.email, 
          "role": user.role 
        }
      }, process.env.JWT_SECRET, 
      { expiresIn: '5' }
    );
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET);
  
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,      // set false if testing on localhost without HTTPS
      sameSite: 'None',  // set 'Lax' or 'Strict' if not cross-site
      maxAge: 10 * 1000 // 5 minutes in milliseconds
    });
    return res.json({ accessToken });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Server error' });
  }

};


export const refreshAccessToken = (req, res) => {
  const token = req.cookies.refreshToken; // httpOnly cookie

  if (!token) return res.status(401).json({ message: "No refresh token" });

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: "Refresh token expired" });

    const newAccessToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "5" } // short-lived access token
    );

    res.json({ accessToken: newAccessToken });
  });
};
export const logoutUser = (req, res) => {
  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
  return res.json({ message: "Logged out" });
};