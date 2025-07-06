const userModel = require('../models/user.model');
const userService = require('../services/user.service');
const { validationResult } = require('express-validator');
const blacklistTokenModel = require('../models/blacklistToken.model');

module.exports.registerUser = async (req, res, next) => {
  const {
    fullname: { firstname, lastname },
    email,
    password,
  } = req.body;

  const isAlreadyUser = await userModel.findOne({ email });
  if (isAlreadyUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await userModel.hashPassword(password);

  const user = await userService.createUser({
    firstname,
    lastname,
    email,
    password: hashedPassword,
  });

  const token = user.generateAuthToken();

  res.status(201).json({ token, user });
};

module.exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = user.generateAuthToken();

  res.cookie('token', token, {
    httpOnly: true, // Secure this in production
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.status(200).json({ token, user });
};

module.exports.getUserProfile = async (req, res, next) => {
  const userId = req.user._id; // Assuming user ID is set in req.user by authentication middleware

  const user = await userModel.findById(userId).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json({ user });
};

module.exports.logoutUser = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  res.clearCookie('token');
  await blacklistTokenModel.create({ token });
  res.status(200).json({ message: 'Logged out successfully' });
};
