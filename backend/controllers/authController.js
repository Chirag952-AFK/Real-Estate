const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isValidEmail = (email) =>
  typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const getPublicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const createToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const register = async (req, res) => {
  const { name, email, password, role, phone } = req.body || {};
  const normalizedName = typeof name === 'string' ? name.trim() : '';
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!normalizedName || !isValidEmail(normalizedEmail) || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: 'Valid name, email, and password (at least 6 characters) are required' });
  }

  if (role !== undefined && !['user', 'agent'].includes(role)) {
    return res.status(400).json({ message: 'Role must be user or agent' });
  }

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password,
      role: role || 'user',
      phone,
    });

    return res.status(201).json({
      token: createToken(user._id),
      user: getPublicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Unable to register user' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!isValidEmail(normalizedEmail) || typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Valid email and password are required' });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.status(200).json({
      token: createToken(user._id),
      user: getPublicUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to log in' });
  }
};

const getMe = (req, res) =>
  res.status(200).json({ user: getPublicUser(req.user) });

module.exports = {
  register,
  login,
  getMe,
};
