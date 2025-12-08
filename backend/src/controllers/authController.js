import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
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
    
    if (!user.isActive) {
      return res.status(403).json({ 
        message: 'Your account has been banned. Please contact support.',
        banned: true
      });
    }
    
    const accessToken = jwt.sign(
      {
        userInfo: {
          id: user._id.toString(),
          "email": user.email, 
          "role": user.role 
        }
      }, process.env.JWT_SECRET, 
      { expiresIn: '5s' }
    );
    const refreshToken = jwt.sign(
      {
        userInfo: {
          id: user._id.toString(),
          "email": user.email, 
          "role": user.role 
        }
      }, process.env.JWT_REFRESH_SECRET
    );
      
        
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,      // set false if testing on localhost without HTTPS
      sameSite: 'none',  // set 'Lax' or 'Strict' if not cross-site
      partitioned: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    return res.json({ accessToken });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Server error' });
  }

};

export const getCurrentUser = async (req, res) => {
  
  if (!req.user || !req.user.id) {
    return res.status(401).json({ 
      message: 'Unauthorized - no user info in token',
    });
  }
  
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found in database' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const refreshAccessToken = (req, res) => {
  const token = req.cookies.refreshToken; // httpOnly cookie

  if (!token) return res.status(401).json({ message: "No refresh token" });

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decode) => {
    if (err) return res.status(401).json({ message: "Refresh token expired" });
    const user = decode.userInfo;

    const newAccessToken = jwt.sign(
      { 
        userInfo: {
          id: user.id,
          "email": user.email, 
          "role": user.role 
        }
      },
      process.env.JWT_SECRET,
      { expiresIn: "15s" } // short-lived access token
    );
    res.json({ accessToken: newAccessToken });
  });
};
export const logoutUser = (req, res) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,      // set false if testing on localhost without HTTPS
      sameSite: 'None'   // set 'Lax' or 'Strict' if not cross-site
    });
    res.json({ message: 'Logged out successfully' });

  } catch (error) {
    console.error('Error logging out user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

